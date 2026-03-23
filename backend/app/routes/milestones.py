"""Milestone CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
from app import db
from app.models import Milestone, Project, MILESTONE_STATUSES
from app.changelog import log_change, log_field_changes

milestones_bp = Blueprint('milestones', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@milestones_bp.route('/api/milestones', methods=['GET'])
def list_all_milestones():
    return ok([m.to_dict() for m in Milestone.query.order_by(Milestone.due_date.asc()).all()])


@milestones_bp.route('/api/projects/<int:pid>/milestones', methods=['GET'])
def list_milestones(pid):
    db.get_or_404(Project, pid)
    return ok([m.to_dict() for m in Milestone.query.filter_by(project_id=pid).order_by(Milestone.due_date.asc()).all()])


@milestones_bp.route('/api/projects/<int:pid>/milestones', methods=['POST'])
def create_milestone(pid):
    db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    name = (body.get('name') or '').strip()
    if not name:
        return err('name is required')
    status = body.get('status', 'pending')
    if status not in MILESTONE_STATUSES:
        return err(f'status must be one of: {", ".join(MILESTONE_STATUSES)}')

    m = Milestone(
        project_id=pid,
        name=name,
        description=body.get('description', ''),
        status=status,
    )
    if body.get('due_date'):
        try:
            m.due_date = datetime.fromisoformat(body['due_date']).date()
        except (ValueError, TypeError):
            return err('invalid due_date format, use YYYY-MM-DD')

    db.session.add(m)
    db.session.flush()
    log_change(pid, 'milestone', m.id, 'created')
    db.session.commit()
    return ok(m.to_dict(), 201)


@milestones_bp.route('/api/projects/<int:pid>/milestones/<int:mid>', methods=['GET'])
def get_milestone(pid, mid):
    db.get_or_404(Project, pid)
    m = Milestone.query.filter_by(id=mid, project_id=pid).first_or_404()
    return ok(m.to_dict())


@milestones_bp.route('/api/projects/<int:pid>/milestones/<int:mid>', methods=['PUT', 'PATCH'])
def update_milestone(pid, mid):
    db.get_or_404(Project, pid)
    m = Milestone.query.filter_by(id=mid, project_id=pid).first_or_404()
    body = request.get_json(silent=True) or {}
    old = m.to_dict()

    if 'name' in body and body['name'].strip():
        m.name = body['name'].strip()
    if 'description' in body:
        m.description = body['description']
    if 'status' in body:
        if body['status'] not in MILESTONE_STATUSES:
            return err(f'status must be one of: {", ".join(MILESTONE_STATUSES)}')
        m.status = body['status']
    if 'due_date' in body:
        if body['due_date']:
            try:
                m.due_date = datetime.fromisoformat(body['due_date']).date()
            except (ValueError, TypeError):
                return err('invalid due_date format, use YYYY-MM-DD')
        else:
            m.due_date = None

    m.updated_at = datetime.utcnow()
    new = m.to_dict()
    log_field_changes(pid, 'milestone', m.id, old, new)
    db.session.commit()
    return ok(m.to_dict())


@milestones_bp.route('/api/projects/<int:pid>/milestones/<int:mid>', methods=['DELETE'])
def delete_milestone(pid, mid):
    db.get_or_404(Project, pid)
    m = Milestone.query.filter_by(id=mid, project_id=pid).first_or_404()
    log_change(pid, 'milestone', mid, 'deleted')
    db.session.delete(m)
    db.session.commit()
    return ok({'deleted': True, 'id': mid})
