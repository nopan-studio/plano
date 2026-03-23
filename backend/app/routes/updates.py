"""Progress Updates routes."""
from flask import Blueprint, jsonify, request
import json
from app import db
from app.models import Update, Project, UPDATE_TYPES
from app.events import event_bus

updates_bp = Blueprint('updates', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@updates_bp.route('/api/projects/<int:pid>/updates', methods=['GET'])
def list_updates(pid):
    db.get_or_404(Project, pid)
    q = Update.query.filter_by(project_id=pid)
    update_type = request.args.get('type')
    if update_type:
        q = q.filter_by(update_type=update_type)
    return ok([u.to_dict() for u in q.order_by(Update.created_at.desc()).all()])


@updates_bp.route('/api/projects/<int:pid>/updates', methods=['POST'])
def create_update(pid):
    db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    content = (body.get('content') or '').strip()
    if not content:
        return err('content is required')
    update_type = body.get('update_type', 'progress')
    if update_type not in UPDATE_TYPES:
        return err(f'update_type must be one of: {", ".join(UPDATE_TYPES)}')

    u = Update(
        project_id=pid,
        task_id=body.get('task_id'),
        content=content,
        update_type=update_type,
        files_meta=json.dumps(body.get('files_meta', [])),
    )
    db.session.add(u)
    db.session.commit()
    
    # Broadcast creation for real-time updates
    event_bus.broadcast('update_created', u.to_dict())
    
    return ok(u.to_dict(), 201)


@updates_bp.route('/api/projects/<int:pid>/updates/<int:uid>', methods=['GET'])
def get_update(pid, uid):
    db.get_or_404(Project, pid)
    u = Update.query.filter_by(id=uid, project_id=pid).first_or_404()
    return ok(u.to_dict())


@updates_bp.route('/api/projects/<int:pid>/updates/<int:uid>', methods=['DELETE'])
def delete_update(pid, uid):
    db.get_or_404(Project, pid)
    u = Update.query.filter_by(id=uid, project_id=pid).first_or_404()
    db.session.delete(u)
    db.session.commit()
    
    # Broadcast deletion for real-time updates
    event_bus.broadcast('update_deleted', {'id': uid, 'project_id': pid})
    
    return ok({'deleted': True, 'id': uid})
