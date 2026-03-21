"""Task CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Task, Project, TASK_STATUSES, PRIORITIES
from app.changelog import log_change, log_field_changes
from app.events import event_bus

tasks_bp = Blueprint('tasks', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@tasks_bp.route('/api/projects/<int:pid>/tasks', methods=['GET'])
def list_tasks(pid):
    db.get_or_404(Project, pid)
    q = Task.query.filter_by(project_id=pid)
    status = request.args.get('status')
    assignee = request.args.get('assignee')
    milestone_id = request.args.get('milestone_id')
    if status:
        q = q.filter_by(status=status)
    if assignee:
        q = q.filter_by(assignee=assignee)
    if milestone_id:
        q = q.filter_by(milestone_id=int(milestone_id))
    return ok([t.to_dict() for t in q.order_by(Task.created_at.desc()).all()])


@tasks_bp.route('/api/projects/<int:pid>/tasks', methods=['POST'])
def create_task(pid):
    db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    title = (body.get('title') or '').strip()
    if not title:
        return err('title is required')
    status = body.get('status', 'todo')
    if status not in TASK_STATUSES:
        return err(f'status must be one of: {", ".join(TASK_STATUSES)}')
    priority = body.get('priority', 'medium')
    if priority not in PRIORITIES:
        return err(f'priority must be one of: {", ".join(PRIORITIES)}')

    t = Task(
        project_id=pid,
        title=title,
        description=body.get('description', ''),
        assignee=body.get('assignee', ''),
        status=status,
        priority=priority,
        milestone_id=body.get('milestone_id'),
        estimated_hours=body.get('estimated_hours'),
        actual_hours=body.get('actual_hours'),
        tags=json.dumps(body.get('tags', [])),
        files_meta=json.dumps(body.get('files_meta', [])),
        meta=json.dumps(body.get('meta', {})),
        is_ai_working=bool(body.get('is_ai_working', False)),
    )
    if body.get('due_date'):
        try:
            t.due_date = datetime.fromisoformat(body['due_date']).date()
        except (ValueError, TypeError):
            return err('invalid due_date format, use YYYY-MM-DD')

    db.session.add(t)
    db.session.flush()
    log_change(pid, 'task', t.id, 'created')
    db.session.commit()
    
    # Broadcast creation
    event_bus.broadcast('task_created', t.to_dict())
    
    return ok(t.to_dict(), 201)


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>', methods=['GET'])
def get_task(pid, tid):
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    return ok(t.to_dict())


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>', methods=['PUT', 'PATCH'])
def update_task(pid, tid):
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    body = request.get_json(silent=True) or {}
    old = t.to_dict()

    if 'title' in body and body['title'].strip():
        t.title = body['title'].strip()
    if 'description' in body:
        t.description = body['description']
    if 'assignee' in body:
        t.assignee = body['assignee']
    if 'status' in body:
        if body['status'] not in TASK_STATUSES:
            return err(f'status must be one of: {", ".join(TASK_STATUSES)}')
        t.status = body['status']
    if 'priority' in body:
        if body['priority'] not in PRIORITIES:
            return err(f'priority must be one of: {", ".join(PRIORITIES)}')
        t.priority = body['priority']
    if 'milestone_id' in body:
        t.milestone_id = body['milestone_id']
    if 'estimated_hours' in body:
        t.estimated_hours = body['estimated_hours']
    if 'actual_hours' in body:
        t.actual_hours = body['actual_hours']
    if 'tags' in body:
        t.tags = json.dumps(body['tags'])
    if 'files_meta' in body:
        t.files_meta = json.dumps(body['files_meta'])
    if 'meta' in body:
        t.meta = json.dumps(body['meta'])
    if 'is_ai_working' in body:
        t.is_ai_working = bool(body['is_ai_working'])
    if 'due_date' in body:
        if body['due_date']:
            try:
                t.due_date = datetime.fromisoformat(body['due_date']).date()
            except (ValueError, TypeError):
                return err('invalid due_date format, use YYYY-MM-DD')
        else:
            t.due_date = None

    t.updated_at = datetime.utcnow()
    new = t.to_dict()
    log_field_changes(pid, 'task', t.id, old, new)
    db.session.commit()
    
    # Broadcast update
    event_bus.broadcast('task_updated', t.to_dict())
    
    return ok(t.to_dict())


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>', methods=['DELETE'])
def delete_task(pid, tid):
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    log_change(pid, 'task', tid, 'deleted')
    db.session.delete(t)
    db.session.commit()
    
    # Broadcast deletion
    event_bus.broadcast('task_deleted', {'id': tid, 'project_id': pid})
    
    return ok({'deleted': True, 'id': tid})


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>/ai-status', methods=['POST'])
def ai_status(pid, tid):
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    body = request.get_json(silent=True) or {}
    
    if 'is_ai_working' in body:
        t.is_ai_working = bool(body['is_ai_working'])
        t.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Trigger real-time event
        event_bus.broadcast('task_updated', t.to_dict())
        
        return ok(t.to_dict())
    
    return err('is_ai_working is required')


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>/diff', methods=['GET'])
def get_task_diff(pid, tid):
    import subprocess
    import os
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    files = json.loads(t.files_meta or '[]')
    
    diffs = []
    project_root = os.getcwd() # Assumes we're running from the root

    for f in files:
        path = f.get('path')
        action = f.get('action')
        if not path:
            continue
            
        diff_content = ""
        try:
            if action == 'added':
                # For added files, show as additions. Use /dev/null as source.
                res = subprocess.run(['git', 'diff', '--no-index', '/dev/null', path], 
                                     capture_output=True, text=True, cwd=project_root)
                diff_content = res.stdout
            elif action == 'modified':
                # Modified: current changes in working tree
                res = subprocess.run(['git', 'diff', path], 
                                     capture_output=True, text=True, cwd=project_root)
                diff_content = res.stdout
                # If no unstaged changes, try staged
                if not diff_content.strip():
                    res = subprocess.run(['git', 'diff', '--cached', path], 
                                         capture_output=True, text=True, cwd=project_root)
                    diff_content = res.stdout
            elif action == 'deleted':
                # Deleted: what was removed vs HEAD
                res = subprocess.run(['git', 'diff', 'HEAD', '--', path], 
                                     capture_output=True, text=True, cwd=project_root)
                diff_content = res.stdout
        except Exception as e:
            diff_content = f"Error fetching diff: {str(e)}"
            
        diffs.append({
            'path': path,
            'action': action,
            'diff': diff_content
        })
        
    return ok(diffs)

@tasks_bp.route('/api/projects/<int:pid>/tasks/archive-done', methods=['POST'])
def archive_done_tasks(pid):
    db.get_or_404(Project, pid)
    done_tasks = Task.query.filter_by(project_id=pid, status='done').all()
    
    count = 0
    for t in done_tasks:
        old = t.to_dict()
        
        # Save original status in meta
        meta = json.loads(t.meta or '{}')
        meta['original_status'] = t.status
        t.meta = json.dumps(meta)
        
        t.status = 'archived'
        t.updated_at = datetime.utcnow()
        new = t.to_dict()
        log_field_changes(pid, 'task', t.id, old, new)
        count += 1
    
    db.session.commit()
    
    # Broadcast update
    event_bus.broadcast('tasks_archived', {'project_id': pid, 'count': count})
    
    return ok({'archived_count': count})
