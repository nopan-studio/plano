"""ChangeLog read-only routes."""
from flask import Blueprint, jsonify, request
from app import db
from app.models import ChangeLog, Project

changelog_bp = Blueprint('changelog', __name__)


def ok(data, code=200):
    return jsonify(data), code


@changelog_bp.route('/api/projects/<int:pid>/changelog', methods=['GET'])
def list_changelog(pid):
    db.get_or_404(Project, pid)
    q = ChangeLog.query.filter_by(project_id=pid)

    # Filters
    entity_type = request.args.get('entity_type')
    action = request.args.get('action')
    if entity_type:
        q = q.filter_by(entity_type=entity_type)
    if action:
        q = q.filter_by(action=action)

    # Pagination
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 50)), 100)
    q = q.order_by(ChangeLog.timestamp.desc())
    total = q.count()
    entries = q.offset((page - 1) * per_page).limit(per_page).all()

    return ok({
        'entries': [e.to_dict() for e in entries],
        'total': total,
        'page': page,
        'per_page': per_page,
        'pages': (total + per_page - 1) // per_page,
    })
