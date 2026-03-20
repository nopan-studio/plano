"""Node CRUD routes."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Diagram, Node, Edge

nodes_bp = Blueprint('nodes', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


@nodes_bp.route('/api/projects/<int:pid>/boards/<int:did>/nodes', methods=['GET'])
def list_nodes(pid, did):
    db.get_or_404(Diagram, did)
    return ok([n.to_dict() for n in Node.query.filter_by(diagram_id=did).all()])


@nodes_bp.route('/api/projects/<int:pid>/boards/<int:did>/nodes', methods=['POST'])
def create_node(pid, did):
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    label = (body.get('label') or '').strip() or 'Untitled'
    
    x = float(body.get('x', -1))
    y = float(body.get('y', -1))
    
    # Auto-position if no coordinates provided or explicitly set to -1
    if x < 0 or y < 0:
        NODE_H_SPACING = 300
        NODE_V_SPACING = 120
        NODES_PER_ROW = 4
        existing_count = Node.query.filter_by(diagram_id=did).count()
        col = existing_count % NODES_PER_ROW
        row = existing_count // NODES_PER_ROW
        x = 100 + col * NODE_H_SPACING
        y = 100 + row * NODE_V_SPACING

    n = Node(
        diagram_id=did,
        label=label,
        node_type=body.get('node_type', 'default'),
        x=x,
        y=y,
        width=float(body.get('width', 160)),
        height=float(body.get('height', 60)),
        meta=json.dumps(body.get('meta', {})),
    )
    db.session.add(n)
    n.updated_at = datetime.utcnow()
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(n.to_dict(), 201)


@nodes_bp.route('/api/projects/<int:pid>/boards/<int:did>/nodes/<int:nid>', methods=['GET'])
def get_node(pid, did, nid):
    n = Node.query.filter_by(id=nid, diagram_id=did).first_or_404()
    return ok(n.to_dict())


@nodes_bp.route('/api/projects/<int:pid>/boards/<int:did>/nodes/<int:nid>', methods=['PUT', 'PATCH'])
def update_node(pid, did, nid):
    d = db.get_or_404(Diagram, did)
    n = Node.query.filter_by(id=nid, diagram_id=did).first_or_404()
    body = request.get_json(silent=True) or {}
    for field in ('label', 'node_type'):
        if field in body:
            setattr(n, field, body[field])
    for field in ('x', 'y', 'width', 'height'):
        if field in body:
            setattr(n, field, float(body[field]))
    if 'meta' in body:
        n.meta = json.dumps(body['meta'])
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(n.to_dict())


@nodes_bp.route('/api/projects/<int:pid>/boards/<int:did>/nodes/<int:nid>', methods=['DELETE'])
def delete_node(pid, did, nid):
    d = db.get_or_404(Diagram, did)
    n = Node.query.filter_by(id=nid, diagram_id=did).first_or_404()
    Edge.query.filter(
        (Edge.source_id == nid) | (Edge.target_id == nid)
    ).delete()
    db.session.delete(n)
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok({'deleted': True, 'id': nid})
