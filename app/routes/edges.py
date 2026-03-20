"""Edge CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Diagram, Node, Edge

edges_bp = Blueprint('edges', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@edges_bp.route('/api/projects/<int:pid>/boards/<int:did>/edges', methods=['GET'])
def list_edges(pid, did):
    db.get_or_404(Diagram, did)
    return ok([e.to_dict() for e in Edge.query.filter_by(diagram_id=did).all()])


@edges_bp.route('/api/projects/<int:pid>/boards/<int:did>/edges', methods=['POST'])
def create_edge(pid, did):
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    src = body.get('source_id')
    tgt = body.get('target_id')
    if not src or not tgt:
        return err('source_id and target_id required')
    if not Node.query.filter_by(id=src, diagram_id=did).first():
        return err('source node not found', 404)
    if not Node.query.filter_by(id=tgt, diagram_id=did).first():
        return err('target node not found', 404)

    # Phase 2: validate edge type
    edge_type = body.get('edge_type', 'default')
    from app.routes.boards import validate_edge_type
    if not validate_edge_type(d, edge_type):
        from app.models import EDGE_TYPES
        valid = EDGE_TYPES.get(d.type, [])
        return err(f'invalid edge_type "{edge_type}" for {d.type} boards. Valid: {", ".join(valid)}')

    e = Edge(
        diagram_id=did,
        source_id=src,
        target_id=tgt,
        label=body.get('label', ''),
        edge_type=edge_type,
        meta=json.dumps(body.get('meta', {})),
    )
    db.session.add(e)
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(e.to_dict(), 201)


@edges_bp.route('/api/projects/<int:pid>/boards/<int:did>/edges/<int:eid>', methods=['GET'])
def get_edge(pid, did, eid):
    e = Edge.query.filter_by(id=eid, diagram_id=did).first_or_404()
    return ok(e.to_dict())


@edges_bp.route('/api/projects/<int:pid>/boards/<int:did>/edges/<int:eid>', methods=['PUT', 'PATCH'])
def update_edge(pid, did, eid):
    d = db.get_or_404(Diagram, did)
    e = Edge.query.filter_by(id=eid, diagram_id=did).first_or_404()
    body = request.get_json(silent=True) or {}
    for field in ('label', 'edge_type'):
        if field in body:
            setattr(e, field, body[field])
    if 'meta' in body:
        e.meta = json.dumps(body['meta'])
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(e.to_dict())


@edges_bp.route('/api/projects/<int:pid>/boards/<int:did>/edges/<int:eid>', methods=['DELETE'])
def delete_edge(pid, did, eid):
    d = db.get_or_404(Diagram, did)
    e = Edge.query.filter_by(id=eid, diagram_id=did).first_or_404()
    db.session.delete(e)
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok({'deleted': True, 'id': eid})
