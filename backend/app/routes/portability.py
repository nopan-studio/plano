"""Project Export & Import routes."""
import json
from flask import Blueprint, jsonify, request
from datetime import datetime
from app import db
from app.models import (
    Project, Milestone, Task, Diagram, Node, Edge,
    Idea, Update, ChangeLog
)

portability_bp = Blueprint('portability', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


# ── Export ────────────────────────────────────────────────────────────────────

@portability_bp.route('/api/projects/<int:pid>/export', methods=['GET'])
def export_project(pid):
    """Export an entire project as a high-fidelity JSON blob.

    Captures: project metadata, milestones, tasks, diagrams (with nodes & edges),
    ideas, updates, and changelog entries.
    """
    p = db.get_or_404(Project, pid)
    blob = {
        '_plano_export': True,
        '_version': '2.0',
        '_exported_at': datetime.utcnow().isoformat(),
        'project': p.to_dict(),
        'milestones': [m.to_dict() for m in p.milestones],
        'tasks': [t.to_dict() for t in p.tasks],
        'diagrams': [],
        'ideas': [],
        'updates': [u.to_dict() for u in p.updates],
        'changelog': [c.to_dict() for c in p.changelogs],
    }

    # Full diagram export with nodes and edges
    for d in p.boards:
        diagram_data = d.to_dict(full=True)
        blob['diagrams'].append(diagram_data)

    # Ideas linked to this project
    ideas = Idea.query.filter_by(project_id=pid).all()
    blob['ideas'] = [i.to_dict() for i in ideas]

    return ok(blob)


# ── Import ────────────────────────────────────────────────────────────────────

@portability_bp.route('/api/projects/import', methods=['POST'])
def import_project():
    """Import a project from a previously exported JSON blob.

    Recreates the full project structure: project, milestones, tasks,
    diagrams (with nodes & edges), ideas, and updates.
    Returns the new project with ID mappings.
    """
    blob = request.get_json(silent=True) or {}

    if not blob.get('_plano_export'):
        return err('Invalid export blob: missing _plano_export marker')

    proj_data = blob.get('project', {})
    if not proj_data.get('name'):
        return err('Invalid export blob: project name missing')

    # ── 1. Create Project ─────────────────────────────────────────────────
    p = Project(
        name=proj_data['name'],
        description=proj_data.get('description', ''),
        status=proj_data.get('status', 'planning'),
        priority=proj_data.get('priority', 'medium'),
        progress_pct=proj_data.get('progress_pct', 0),
    )
    if proj_data.get('start_date'):
        try:
            p.start_date = datetime.fromisoformat(proj_data['start_date']).date()
        except (ValueError, TypeError):
            pass
    if proj_data.get('target_date'):
        try:
            p.target_date = datetime.fromisoformat(proj_data['target_date']).date()
        except (ValueError, TypeError):
            pass

    db.session.add(p)
    db.session.flush()  # get p.id

    # ── 2. Milestones (old_id -> new_id mapping) ─────────────────────────
    milestone_map = {}  # old_id -> new_id
    for m_data in blob.get('milestones', []):
        m = Milestone(
            project_id=p.id,
            name=m_data['name'],
            description=m_data.get('description', ''),
            status=m_data.get('status', 'pending'),
        )
        if m_data.get('due_date'):
            try:
                m.due_date = datetime.fromisoformat(m_data['due_date']).date()
            except (ValueError, TypeError):
                pass
        db.session.add(m)
        db.session.flush()
        old_id = m_data.get('id')
        if old_id:
            milestone_map[old_id] = m.id

    # ── 3. Tasks ──────────────────────────────────────────────────────────
    for t_data in blob.get('tasks', []):
        milestone_id = None
        old_ms_id = t_data.get('milestone_id')
        if old_ms_id and old_ms_id in milestone_map:
            milestone_id = milestone_map[old_ms_id]

        t = Task(
            project_id=p.id,
            milestone_id=milestone_id,
            title=t_data['title'],
            description=t_data.get('description', ''),
            assignee=t_data.get('assignee', ''),
            status=t_data.get('status', 'todo'),
            priority=t_data.get('priority', 'medium'),
            tags=json.dumps(t_data.get('tags', [])),
            files_meta=json.dumps(t_data.get('files_meta', [])),
        )
        if t_data.get('estimated_hours'):
            t.estimated_hours = t_data['estimated_hours']
        if t_data.get('actual_hours'):
            t.actual_hours = t_data['actual_hours']
        if t_data.get('due_date'):
            try:
                t.due_date = datetime.fromisoformat(t_data['due_date']).date()
            except (ValueError, TypeError):
                pass
        db.session.add(t)

    # ── 4. Diagrams with Nodes & Edges ────────────────────────────────────
    for d_data in blob.get('diagrams', []):
        d = Diagram(
            project_id=p.id,
            name=d_data['name'],
            type=d_data.get('type', 'process_flow'),
            description=d_data.get('description', ''),
        )
        db.session.add(d)
        db.session.flush()  # get d.id

        # Node mapping for edge references
        node_map = {}  # old_node_id -> new_node_id
        for n_data in d_data.get('nodes', []):
            n = Node(
                diagram_id=d.id,
                label=n_data['label'],
                node_type=n_data.get('node_type', 'default'),
                x=n_data.get('x', 100),
                y=n_data.get('y', 100),
                width=n_data.get('width', 160),
                height=n_data.get('height', 60),
                meta=json.dumps(n_data.get('meta', {})),
            )
            db.session.add(n)
            db.session.flush()
            old_node_id = n_data.get('id')
            if old_node_id:
                node_map[old_node_id] = n.id

        # Edges
        for e_data in d_data.get('edges', []):
            src = node_map.get(e_data.get('source_id'))
            tgt = node_map.get(e_data.get('target_id'))
            if src and tgt:
                e = Edge(
                    diagram_id=d.id,
                    source_id=src,
                    target_id=tgt,
                    label=e_data.get('label', ''),
                    edge_type=e_data.get('edge_type', 'default'),
                    meta=json.dumps(e_data.get('meta', {})),
                )
                db.session.add(e)

    # ── 5. Ideas ──────────────────────────────────────────────────────────
    for i_data in blob.get('ideas', []):
        idea = Idea(
            project_id=p.id,
            title=i_data['title'],
            description=i_data.get('description', ''),
            status=i_data.get('status', 'new'),
            votes=i_data.get('votes', 0),
            tags=json.dumps(i_data.get('tags', [])),
        )
        db.session.add(idea)

    # ── 6. Updates ────────────────────────────────────────────────────────
    for u_data in blob.get('updates', []):
        u = Update(
            project_id=p.id,
            content=u_data['content'],
            update_type=u_data.get('update_type', 'progress'),
            files_meta=json.dumps(u_data.get('files_meta', [])),
        )
        db.session.add(u)

    db.session.commit()

    return ok({
        'imported': True,
        'project': p.to_dict(summary=True),
        'milestone_map': milestone_map,
    }, 201)
