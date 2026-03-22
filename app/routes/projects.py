"""Project CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
from app import db
from app.models import Project, PROJECT_STATUSES, PRIORITIES
from app.changelog import log_change, log_field_changes

projects_bp = Blueprint('projects', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


# ── List Projects ─────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects', methods=['GET'])
def list_projects():
    q = Project.query
    status = request.args.get('status')
    priority = request.args.get('priority')
    if status:
        q = q.filter_by(status=status)
    if priority:
        q = q.filter_by(priority=priority)
    return ok([p.to_dict(summary=True) for p in q.order_by(Project.updated_at.desc()).all()])


# ── Create Project ────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects', methods=['POST'])
def create_project():
    body = request.get_json(silent=True) or {}
    name = (body.get('name') or '').strip()
    if not name:
        return err('name is required')
    status = body.get('status', 'planning')
    if status not in PROJECT_STATUSES:
        return err(f'status must be one of: {", ".join(PROJECT_STATUSES)}')
    priority = body.get('priority', 'medium')
    if priority not in PRIORITIES:
        return err(f'priority must be one of: {", ".join(PRIORITIES)}')

    p = Project(
        name=name,
        description=body.get('description', ''),
        status=status,
        priority=priority,
        progress_pct=int(body.get('progress_pct', 0)),
    )
    # Parse dates
    for df in ('start_date', 'target_date'):
        if body.get(df):
            try:
                setattr(p, df, datetime.fromisoformat(body[df]).date())
            except (ValueError, TypeError):
                return err(f'invalid {df} format, use YYYY-MM-DD')

    db.session.add(p)
    db.session.commit()
    log_change(p.id, 'project', p.id, 'created')
    db.session.commit()
    return ok(p.to_dict(summary=True), 201)


# ── Get Project ───────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects/<int:pid>', methods=['GET'])
def get_project(pid):
    p = db.get_or_404(Project, pid)
    return ok(p.to_dict(summary=True))


# ── Update Project ────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects/<int:pid>', methods=['PUT', 'PATCH'])
def update_project(pid):
    p = db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    old = p.to_dict()

    if 'name' in body and body['name'].strip():
        p.name = body['name'].strip()
    if 'description' in body:
        p.description = body['description']
    if 'status' in body:
        if body['status'] not in PROJECT_STATUSES:
            return err(f'status must be one of: {", ".join(PROJECT_STATUSES)}')
        p.status = body['status']
    if 'priority' in body:
        if body['priority'] not in PRIORITIES:
            return err(f'priority must be one of: {", ".join(PRIORITIES)}')
        p.priority = body['priority']
    if 'progress_pct' in body:
        p.progress_pct = int(body['progress_pct'])
    for df in ('start_date', 'target_date'):
        if df in body:
            if body[df]:
                try:
                    setattr(p, df, datetime.fromisoformat(body[df]).date())
                except (ValueError, TypeError):
                    return err(f'invalid {df} format, use YYYY-MM-DD')
            else:
                setattr(p, df, None)

    p.updated_at = datetime.utcnow()
    new = p.to_dict()
    log_field_changes(p.id, 'project', p.id, old, new)
    db.session.commit()
    return ok(p.to_dict(summary=True))


# ── Delete Project ────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects/<int:pid>', methods=['DELETE'])
def delete_project(pid):
    p = db.get_or_404(Project, pid)
    db.session.delete(p)
    db.session.commit()
    return ok({'deleted': True, 'id': pid})


# ── Dashboard ─────────────────────────────────────────────────────────────────

@projects_bp.route('/api/projects/<int:pid>/dashboard', methods=['GET'])
def project_dashboard(pid):
    p = db.get_or_404(Project, pid)
    from app.models import ChangeLog
    recent_changes = ChangeLog.query.filter_by(project_id=pid)\
        .order_by(ChangeLog.timestamp.desc()).limit(20).all()

    # Use the summary stats from the model (which handles archived tasks)
    summary_data = p.to_dict(summary=True)
    tasks_by_status = summary_data.get('tasks_by_status', {})

    milestones_by_status = {}
    for m in p.milestones:
        milestones_by_status[m.status] = milestones_by_status.get(m.status, 0) + 1

    return ok({
        'project': p.to_dict(),
        'tasks_total': len(p.tasks),
        'tasks_by_status': tasks_by_status,
        'milestones_total': len(p.milestones),
        'milestones_by_status': milestones_by_status,
        'boards_total': len(p.boards),
        'ideas_total': len(p.ideas),
        'recent_changes': [c.to_dict() for c in recent_changes],
    })
