"""Idea tracking routes."""
from flask import Blueprint, jsonify, request
import json
from app import db
from app.models import Idea, IDEA_STATUSES

ideas_bp = Blueprint('ideas', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@ideas_bp.route('/api/ideas', methods=['GET'])
def list_ideas():
    q = Idea.query
    project_id = request.args.get('project_id')
    status = request.args.get('status')
    if project_id:
        q = q.filter_by(project_id=int(project_id))
    if status:
        q = q.filter_by(status=status)
    return ok([i.to_dict() for i in q.order_by(Idea.votes.desc(), Idea.created_at.desc()).all()])


@ideas_bp.route('/api/ideas', methods=['POST'])
def create_idea():
    body = request.get_json(silent=True) or {}
    title = (body.get('title') or '').strip()
    if not title:
        return err('title is required')
    status = body.get('status', 'new')
    if status not in IDEA_STATUSES:
        return err(f'status must be one of: {", ".join(IDEA_STATUSES)}')

    idea = Idea(
        project_id=body.get('project_id'),
        title=title,
        description=body.get('description', ''),
        status=status,
        tags=json.dumps(body.get('tags', [])),
    )
    db.session.add(idea)
    db.session.commit()
    return ok(idea.to_dict(), 201)


@ideas_bp.route('/api/ideas/<int:iid>', methods=['GET'])
def get_idea(iid):
    idea = db.get_or_404(Idea, iid)
    return ok(idea.to_dict())


@ideas_bp.route('/api/ideas/<int:iid>', methods=['PUT', 'PATCH'])
def update_idea(iid):
    idea = db.get_or_404(Idea, iid)
    body = request.get_json(silent=True) or {}

    if 'title' in body and body['title'].strip():
        idea.title = body['title'].strip()
    if 'description' in body:
        idea.description = body['description']
    if 'status' in body:
        if body['status'] not in IDEA_STATUSES:
            return err(f'status must be one of: {", ".join(IDEA_STATUSES)}')
        idea.status = body['status']
    if 'project_id' in body:
        idea.project_id = body['project_id']
    if 'tags' in body:
        idea.tags = json.dumps(body['tags'])

    from datetime import datetime
    idea.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(idea.to_dict())


@ideas_bp.route('/api/ideas/<int:iid>', methods=['DELETE'])
def delete_idea(iid):
    idea = db.get_or_404(Idea, iid)
    db.session.delete(idea)
    db.session.commit()
    return ok({'deleted': True, 'id': iid})


@ideas_bp.route('/api/ideas/<int:iid>/vote', methods=['POST'])
def vote_idea(iid):
    idea = db.get_or_404(Idea, iid)
    idea.votes += 1
    db.session.commit()
    return ok(idea.to_dict())
