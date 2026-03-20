"""Auto-layout endpoint for diagram nodes.

Provides intelligent node positioning using a hierarchical/topological layout
algorithm that considers edges to arrange nodes in clear, readable layouts.
"""
from flask import Blueprint, jsonify, request
from datetime import datetime
import json
from collections import defaultdict, deque
from app import db
from app.models import Diagram, Node, Edge

layout_bp = Blueprint('layout', __name__)


def ok(data, code=200):
    return jsonify(data), code


def _compute_layout(nodes, edges, direction='LR', node_spacing=80, rank_spacing=280):
    """Compute hierarchical layout positions for nodes based on edge relationships.
    
    Uses a simplified Sugiyama-style algorithm:
    1. Build adjacency from edges
    2. Assign ranks via topological sort (longest-path ranking)
    3. Order nodes within each rank to minimize crossings
    4. Assign final x,y coordinates with proper spacing
    
    Args:
        nodes: list of node dicts with 'id', 'width', 'height'
        edges: list of edge dicts with 'source_id', 'target_id'
        direction: 'LR' (left-to-right) or 'TB' (top-to-bottom)
        node_spacing: vertical spacing between nodes in same rank
        rank_spacing: horizontal spacing between ranks
    
    Returns:
        dict mapping node_id -> (x, y)
    """
    if not nodes:
        return {}
    
    node_map = {n['id']: n for n in nodes}
    node_ids = set(node_map.keys())
    
    # Build adjacency lists
    children = defaultdict(list)   # parent -> [child]
    parents = defaultdict(list)    # child -> [parent]
    
    for e in edges:
        src, tgt = e['source_id'], e['target_id']
        if src in node_ids and tgt in node_ids:
            children[src].append(tgt)
            parents[tgt].append(src)
    
    # --- Step 1: Assign ranks using longest-path from root nodes ---
    # Root nodes have no incoming edges
    roots = [nid for nid in node_ids if not parents[nid]]
    
    # If no roots (cycle), pick node with fewest parents
    if not roots:
        roots = [min(node_ids, key=lambda nid: len(parents[nid]))]
    
    ranks = {}
    
    # BFS from roots to assign ranks
    queue = deque()
    for r in roots:
        ranks[r] = 0
        queue.append(r)
    
    while queue:
        nid = queue.popleft()
        for child in children[nid]:
            new_rank = ranks[nid] + 1
            if child not in ranks or new_rank > ranks[child]:
                ranks[child] = new_rank
                queue.append(child)
    
    # Assign disconnected nodes (not reachable from roots)
    max_rank = max(ranks.values()) if ranks else 0
    for nid in node_ids:
        if nid not in ranks:
            max_rank += 1
            ranks[nid] = max_rank
    
    # --- Step 2: Group nodes by rank ---
    rank_groups = defaultdict(list)
    for nid, rank in ranks.items():
        rank_groups[rank].append(nid)
    
    # --- Step 3: Order within ranks to reduce crossings ---
    # Use barycenter heuristic: order each rank's nodes by the average
    # position of their connected nodes in the previous rank
    sorted_ranks = sorted(rank_groups.keys())
    
    # Initial ordering: sort by number of connections (more connected = center)
    for rank in sorted_ranks:
        group = rank_groups[rank]
        group.sort(key=lambda nid: -(len(children[nid]) + len(parents[nid])))
    
    # Barycenter refinement (2 passes)
    for _ in range(2):
        for i, rank in enumerate(sorted_ranks):
            if i == 0:
                continue
            prev_rank = sorted_ranks[i - 1]
            prev_order = {nid: idx for idx, nid in enumerate(rank_groups[prev_rank])}
            
            def barycenter(nid):
                connected = [p for p in parents[nid] if p in prev_order]
                if not connected:
                    return float('inf')
                return sum(prev_order[p] for p in connected) / len(connected)
            
            rank_groups[rank].sort(key=barycenter)
    
    # --- Step 4: Assign coordinates ---
    positions = {}
    
    # Calculate max node dimensions per rank for spacing
    for rank in sorted_ranks:
        group = rank_groups[rank]
        
        # Calculate total height of this rank's nodes
        node_heights = []
        for nid in group:
            n = node_map[nid]
            h = max(n.get('height', 60), 60)
            w = max(n.get('width', 220), 160)
            node_heights.append((nid, w, h))
        
        total_height = sum(h for _, _, h in node_heights) + node_spacing * (len(group) - 1)
        
        # Center the group vertically
        start_y = -total_height / 2
        
        current_y = start_y
        for nid, w, h in node_heights:
            if direction == 'LR':
                x = rank * rank_spacing + 100
                y = current_y + 200  # offset so nothing is at negative coords
            else:  # TB
                x = current_y + 600  # center horizontally with offset
                y = rank * rank_spacing + 100
            
            positions[nid] = (round(x, 1), round(y, 1))
            current_y += h + node_spacing
    
    # --- Step 5: Shift all positions so minimum is at a reasonable origin ---
    if positions:
        min_x = min(p[0] for p in positions.values())
        min_y = min(p[1] for p in positions.values())
        offset_x = 80 - min_x if min_x < 80 else 0
        offset_y = 80 - min_y if min_y < 80 else 0
        
        if offset_x != 0 or offset_y != 0:
            positions = {
                nid: (x + offset_x, y + offset_y)
                for nid, (x, y) in positions.items()
            }
    
    return positions


@layout_bp.route('/api/projects/<int:pid>/boards/<int:did>/auto-layout', methods=['POST'])
def auto_layout(pid, did):
    """Auto-layout all nodes in a diagram with proper spacing.
    
    Request body (all optional):
        direction: 'LR' (left-to-right, default) or 'TB' (top-to-bottom)
        node_spacing: Vertical gap between nodes in same column (default: 80)
        rank_spacing: Horizontal gap between columns/ranks (default: 280)
    """
    from app.models import Project
    db.get_or_404(Project, pid)
    d = db.get_or_404(Diagram, did)
    
    body = request.get_json(silent=True) or {}
    direction = body.get('direction', 'LR')
    node_spacing = int(body.get('node_spacing', 80))
    rank_spacing = int(body.get('rank_spacing', 280))
    
    nodes_list = Node.query.filter_by(diagram_id=did).all()
    edges_list = Edge.query.filter_by(diagram_id=did).all()
    
    nodes_data = [n.to_dict() for n in nodes_list]
    edges_data = [e.to_dict() for e in edges_list]
    
    positions = _compute_layout(
        nodes_data, edges_data,
        direction=direction,
        node_spacing=node_spacing,
        rank_spacing=rank_spacing,
    )
    
    # Apply positions to nodes
    for n in nodes_list:
        if n.id in positions:
            n.x, n.y = positions[n.id]
    
    d.updated_at = datetime.utcnow()
    db.session.commit()
    
    return ok(d.to_dict(full=True))
