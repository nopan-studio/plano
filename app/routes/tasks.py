"""Task CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Task, Project, TASK_STATUSES, PRIORITIES
from app.changelog import log_change, log_field_changes

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
    return ok(t.to_dict())


@tasks_bp.route('/api/projects/<int:pid>/tasks/<int:tid>', methods=['DELETE'])
def delete_task(pid, tid):
    db.get_or_404(Project, pid)
    t = Task.query.filter_by(id=tid, project_id=pid).first_or_404()
    log_change(pid, 'task', tid, 'deleted')
    db.session.delete(t)
    db.session.commit()
    return ok({'deleted': True, 'id': tid})
