"""Board (Diagram) CRUD routes with schema import and relation validation."""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from app import db
from app.models import Diagram, Node, Edge, Project, DIAGRAM_TYPES, NODE_TYPES, EDGE_TYPES

boards_bp = Blueprint('boards', __name__)


def err(msg, code=400):
    return jsonify({'error': msg}), code


def ok(data, code=200):
    return jsonify(data), code


# ─── Diagram routes (legacy /api/diagrams + project-scoped /api/projects/:pid/boards) ──

@boards_bp.route('/api/projects/<int:pid>/boards', methods=['GET'])
def list_diagrams(pid):
    q = Diagram.query
    q = q.filter_by(project_id=pid)
    dtype = request.args.get('type')
    if dtype:
        q = q.filter_by(type=dtype)
    return ok([d.to_dict() for d in q.order_by(Diagram.updated_at.desc()).all()])


@boards_bp.route('/api/projects/<int:pid>/boards', methods=['POST'])
def create_diagram(pid):
    db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    name = (body.get('name') or '').strip()
    dtype = body.get('type', 'process_flow')
    if not name:
        return err('name is required')
    if dtype not in DIAGRAM_TYPES:
        return err(f'type must be one of: {", ".join(DIAGRAM_TYPES)}')
    d = Diagram(
        name=name,
        type=dtype,
        description=body.get('description', ''),
        project_id=pid or body.get('project_id'),
    )
    db.session.add(d)
    db.session.commit()
    return ok(d.to_dict(full=True), 201)


@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>', methods=['GET'])
def get_diagram(pid, did):
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    return ok(d.to_dict(full=True))


@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>', methods=['PUT', 'PATCH'])
def update_diagram(pid, did):
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    if 'name' in body and body['name'].strip():
        d.name = body['name'].strip()
    if 'description' in body:
        d.description = body['description']
    if 'type' in body:
        if body['type'] not in DIAGRAM_TYPES:
            return err(f'type must be one of: {", ".join(DIAGRAM_TYPES)}')
        d.type = body['type']
    if 'project_id' in body:
        d.project_id = body['project_id']
    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(d.to_dict(full=True))


@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>', methods=['DELETE'])
def delete_diagram(pid, did):
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    db.session.delete(d)
    db.session.commit()
    return ok({'deleted': True, 'id': did})


@boards_bp.route('/api/resolve-board/<int:did>', methods=['GET'])
def resolve_board(did):
    d = Diagram.query.filter_by(id=did).first_or_404()
    return ok({'id': d.id, 'project_id': d.project_id})


@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>/duplicate', methods=['POST'])
def duplicate_diagram(pid, did):
    db.get_or_404(Project, pid)
    src = db.get_or_404(Diagram, did)
    d = Diagram(
        name=f"{src.name} (Copy)",
        type=src.type,
        description=src.description,
        project_id=src.project_id,
    )
    db.session.add(d)
    db.session.flush()

    id_map = {}
    for n_src in src.nodes:
        n = Node(
            diagram_id=d.id, label=n_src.label, node_type=n_src.node_type,
            x=n_src.x, y=n_src.y, width=n_src.width, height=n_src.height,
            meta=n_src.meta,
        )
        db.session.add(n)
        db.session.flush()
        id_map[n_src.id] = n.id

    for e_src in src.edges:
        e = Edge(
            diagram_id=d.id,
            source_id=id_map.get(e_src.source_id, e_src.source_id),
            target_id=id_map.get(e_src.target_id, e_src.target_id),
            label=e_src.label, edge_type=e_src.edge_type, meta=e_src.meta,
        )
        db.session.add(e)

    db.session.commit()
    return ok(d.to_dict(full=True), 201)


# ─── Phase 2: Schema Import ──────────────────────────────────────────────────

@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>/import-schema', methods=['POST'])
def import_schema(pid, did):
    """Import a JSON schema definition and auto-create nodes + edges."""
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    tables = body.get('tables', [])
    if not tables:
        return err('tables array is required')

    node_map = {}
    for i, tbl in enumerate(tables):
        n = Node(
            diagram_id=did,
            label=tbl.get('name', f'Table_{i}'),
            node_type='table',
            x=float(tbl.get('x', 100 + i * 300)),
            y=float(tbl.get('y', 100)),
            width=float(tbl.get('width', 240)),
            height=float(tbl.get('height', 60)),
            meta=json.dumps({'columns': tbl.get('columns', [])}),
        )
        db.session.add(n)
        db.session.flush()
        node_map[tbl.get('name', f'Table_{i}')] = n.id

    # Create edges from relations
    for rel in body.get('relations', []):
        src_name = rel.get('from')
        tgt_name = rel.get('to')
        if src_name in node_map and tgt_name in node_map:
            e = Edge(
                diagram_id=did,
                source_id=node_map[src_name],
                target_id=node_map[tgt_name],
                label=rel.get('label', ''),
                edge_type=rel.get('type', 'one_to_many'),
                meta=json.dumps(rel.get('meta', {})),
            )
            db.session.add(e)

    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(d.to_dict(full=True), 201)


# ─── Phase 2: Relation Validation ────────────────────────────────────────────

def validate_edge_type(diagram, edge_type):
    """Check if edge_type is valid for the diagram's type."""
    valid_types = EDGE_TYPES.get(diagram.type, [])
    if not valid_types:
        return True  # no restrictions
    return edge_type in valid_types or edge_type == 'default'


# ─── Phase 5: Template-based board creation ──────────────────────────────────

@boards_bp.route('/api/projects/<int:pid>/boards/from-template', methods=['POST'])
def create_from_template(pid):
    """Create a board from a pre-built template."""
    db.get_or_404(Project, pid)
    body = request.get_json(silent=True) or {}
    template_name = body.get('template', '').strip()
    if not template_name:
        return err('template name is required')

    from app.templates_data import TEMPLATES
    tmpl = TEMPLATES.get(template_name)
    if not tmpl:
        available = ', '.join(TEMPLATES.keys())
        return err(f'unknown template "{template_name}". Available: {available}')

    d = Diagram(
        name=body.get('name', tmpl['name']),
        type=tmpl.get('type', 'process_flow'),
        description=tmpl.get('description', ''),
        project_id=pid,
    )
    db.session.add(d)
    db.session.flush()

    node_map = {}
    for i, nd in enumerate(tmpl.get('nodes', [])):
        n = Node(
            diagram_id=d.id,
            label=nd['label'],
            node_type=nd.get('node_type', 'process'),
            x=float(nd.get('x', 100 + i * 280)),
            y=float(nd.get('y', 200)),
            width=float(nd.get('width', 160)),
            height=float(nd.get('height', 60)),
            meta=json.dumps(nd.get('meta', {})),
        )
        db.session.add(n)
        db.session.flush()
        node_map[i] = n.id

    for ed in tmpl.get('edges', []):
        src_idx = ed.get('from_index')
        tgt_idx = ed.get('to_index')
        if src_idx in node_map and tgt_idx in node_map:
            e = Edge(
                diagram_id=d.id,
                source_id=node_map[src_idx],
                target_id=node_map[tgt_idx],
                label=ed.get('label', ''),
                edge_type=ed.get('edge_type', 'default'),
                meta=json.dumps(ed.get('meta', {})),
            )
            db.session.add(e)

    db.session.commit()
    return ok(d.to_dict(full=True), 201)


# ─── Phase 6: Auto-layout ────────────────────────────────────────────────────

@boards_bp.route('/api/projects/<int:pid>/boards/<int:did>/auto-layout', methods=['POST'])
def auto_layout(pid, did):
    """Hierarchical layout for clear node/edge organization."""
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    body = request.get_json(silent=True) or {}
    direction = body.get('direction', 'LR') # LR or TB
    node_spacing = float(body.get('node_spacing', 80))
    rank_spacing = float(body.get('rank_spacing', 280))

    nodes = d.nodes
    edges = d.edges
    if not nodes:
        return ok(d.to_dict(full=True))

    # 1. Build adjacency list and in-degrees
    adj = {n.id: [] for n in nodes}
    in_degree = {n.id: 0 for n in nodes}
    for e in edges:
        if e.source_id in adj and e.target_id in adj:
            adj[e.source_id].append(e.target_id)
            in_degree[e.target_id] += 1

    # 2. Assign ranks using BFS-based topological approach (handles DAGs)
    ranks = {n.id: 0 for n in nodes}
    queue = [n.id for n in nodes if in_degree[n.id] == 0]
    
    # If there are cycles, pick the first node as a starting point.
    if not queue and nodes:
        queue = [nodes[0].id]

    visited = set()
    while queue:
        curr = queue.pop(0)
        if curr in visited: continue
        visited.add(curr)
        for neighbor in adj.get(curr, []):
            ranks[neighbor] = max(ranks[neighbor], ranks[curr] + 1)
            queue.append(neighbor)

    # 3. Group nodes by rank
    by_rank = {}
    for node_id, rank in ranks.items():
        if rank not in by_rank: by_rank[rank] = []
        by_rank[rank].append(node_id)

    # 4. Apply coordinates
    START_X, START_Y = 100, 100
    for rank_idx, node_ids in sorted(by_rank.items()):
        for i, node_id in enumerate(node_ids):
            node = next(n for n in nodes if n.id == node_id)
            if direction == 'LR':
                node.x = START_X + rank_idx * rank_spacing
                node.y = START_Y + i * (node.height + node_spacing)
            else: # TB
                node.x = START_X + i * (node.width + node_spacing)
                node.y = START_Y + rank_idx * rank_spacing

    d.updated_at = datetime.utcnow()
    db.session.commit()
    return ok(d.to_dict(full=True))
