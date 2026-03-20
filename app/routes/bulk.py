"""Bulk operations endpoint."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Diagram, Node, Edge

bulk_bp = Blueprint('bulk', __name__)


def ok(data, code=200):
    return jsonify(data), code


@bulk_bp.route('/api/projects/<int:pid>/boards/<int:did>/bulk', methods=['POST'])
def bulk_ops(pid, did):
    from app.models import Project
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    ops = body.get('ops', [])
    results = []

    # Temporary reference map: allows create_edge to reference nodes created
    # in the same bulk call by a string _ref instead of a real database ID.
    # Usage: include "_ref": "my_label" in a create_node op, then use
    # "source_id": "my_label" or "target_id": "my_label" in create_edge ops.
    ref_map = {}

    def _resolve_id(val):
        """Resolve a node reference: if it's a string, look it up in ref_map;
        if it's an int, return it directly."""
        if isinstance(val, str):
            resolved = ref_map.get(val)
            if resolved is None:
                raise ValueError(f'unknown node reference: "{val}"')
            return resolved
        return int(val)

    for op in ops:
        action = op.get('action', '')
        try:
            if action == 'create_node':
                x = op.get('x')
                y = op.get('y')
                if x is None or y is None:
                    # Auto-position in a grid
                    NODE_H_SPACING = 300
                    NODE_V_SPACING = 120
                    NODES_PER_ROW = 4
                    existing_count = Node.query.filter_by(diagram_id=did).count()
                    # Add internal count of nodes created in THIS bulk call
                    # (this is an optimization, otherwise they all go to same spot)
                    internal_offset = len([r for r in results if r['action'] == 'create_node'])
                    total_count = existing_count + internal_offset
                    
                    x = float(x) if x is not None else 100 + (total_count % NODES_PER_ROW) * NODE_H_SPACING
                    y = float(y) if y is not None else 100 + (total_count // NODES_PER_ROW) * NODE_V_SPACING

                n = Node(
                    diagram_id=did,
                    label=op.get('label', 'Node'),
                    node_type=op.get('node_type', 'default'),
                    x=x, y=y,
                    width=float(op.get('width', 160)), height=float(op.get('height', 60)),
                    meta=json.dumps(op.get('meta', {})),
                )
                db.session.add(n)
                db.session.flush()
                # Register temporary reference if provided
                if '_ref' in op:
                    ref_map[op['_ref']] = n.id
                results.append({'action': action, 'status': 'ok', 'data': n.to_dict()})

            elif action == 'update_node':
                n = Node.query.filter_by(id=op['id'], diagram_id=did).first_or_404()
                for f in ('label', 'node_type', 'x', 'y', 'width', 'height'):
                    if f in op:
                        setattr(n, f, float(op[f]) if f in ('x', 'y', 'width', 'height') else op[f])
                if 'meta' in op:
                    n.meta = json.dumps(op['meta'])
                results.append({'action': action, 'status': 'ok', 'data': n.to_dict()})

            elif action == 'delete_node':
                n = Node.query.filter_by(id=op['id'], diagram_id=did).first_or_404()
                Edge.query.filter((Edge.source_id == op['id']) | (Edge.target_id == op['id'])).delete()
                db.session.delete(n)
                results.append({'action': action, 'status': 'ok', 'id': op['id']})

            elif action == 'create_edge':
                src = _resolve_id(op['source_id'])
                tgt = _resolve_id(op['target_id'])
                e = Edge(
                    diagram_id=did,
                    source_id=src, target_id=tgt,
                    label=op.get('label', ''), edge_type=op.get('edge_type', 'default'),
                    meta=json.dumps(op.get('meta', {})),
                )
                db.session.add(e)
                db.session.flush()
                results.append({'action': action, 'status': 'ok', 'data': e.to_dict()})

            elif action == 'update_edge':
                e = Edge.query.filter_by(id=op['id'], diagram_id=did).first_or_404()
                for f in ('label', 'edge_type'):
                    if f in op:
                        setattr(e, f, op[f])
                if 'meta' in op:
                    e.meta = json.dumps(op['meta'])
                results.append({'action': action, 'status': 'ok', 'data': e.to_dict()})

            elif action == 'delete_edge':
                e = Edge.query.filter_by(id=op['id'], diagram_id=did).first_or_404()
                db.session.delete(e)
                results.append({'action': action, 'status': 'ok', 'id': op['id']})

            elif action == 'update_diagram':
                for f in ('name', 'description', 'type'):
                    if f in op:
                        setattr(d, f, op[f])
                results.append({'action': action, 'status': 'ok'})

            else:
                results.append({'action': action, 'status': 'error', 'error': 'unknown action'})

        except Exception as ex:
            results.append({'action': action, 'status': 'error', 'error': str(ex)})

    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok({'results': results, 'diagram': d.to_dict(full=True)})
