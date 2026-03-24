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
    
    # BFS from roots to assign ranks, with cycle protection
    # Special: if there are many roots, distribute them into multiple ranks to avoid giant columns
    ranks = {}
    queue = deque()
    for i, r in enumerate(roots):
        rank = i // 8 # 8 nodes per column for roots
        ranks[r] = rank
        queue.append((r, rank))
    
    visited_count = {r: 1 for r in roots}
    max_nodes = len(node_ids)
    
    while queue:
        nid, d = queue.popleft()
        if d > max_nodes: continue # cycle protection
        
        for child in children[nid]:
            new_rank = ranks[nid] + 1
            if child not in ranks or new_rank > ranks[child]:
                # Limit visits to prevent infinite cycles
                if visited_count.get(child, 0) < max_nodes:
                    ranks[child] = new_rank
                    visited_count[child] = visited_count.get(child, 0) + 1
                    queue.append((child, new_rank))
    
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
    
    # Track occupied offsets per rank/axis
    rank_axis_offsets = {} # rank -> starting x/y for this column/row
    
    if direction == 'LR':
        current_rank_offset = 100
        for rank in sorted_ranks:
            group = rank_groups[rank]
            rank_axis_offsets[rank] = current_rank_offset
            
            # Find max width in this rank and add to offset for next rank
            max_w = 0
            node_dims = []
            for nid in group:
                n = node_map[nid]
                # Estimation for DB Tables or other auto-sizing nodes
                w = n.get('width', 240) or 240
                h = n.get('height', 120) or 120
                
                if n.get('node_type') == 'db_table' or n.get('node_type') == 'table':
                    meta = n.get('meta', {})
                    cols = meta.get('columns', []) if isinstance(meta, dict) else []
                    estimated_h = 64 + (len(cols) * 32) + 20
                    h = max(h, estimated_h)
                
                w = max(w, 160)
                h = max(h, 60)
                max_w = max(max_w, w)
                node_dims.append((nid, w, h))
            
            # Center vertically
            # Use larger spacing for deep columns
            effective_node_spacing = max(node_spacing, 180) 
            total_h = sum(h for _, _, h in node_dims) + effective_node_spacing * (len(group) - 1)
            current_v = 0 
            
            for nid, w, h in node_dims:
                positions[nid] = (float(current_rank_offset), float(current_v))
                current_v += h + effective_node_spacing
            
            current_rank_offset += max_w + max(rank_spacing, 350)
    else: # TB
        current_rank_offset = 100
        for rank in sorted_ranks:
            group = rank_groups[rank]
            rank_axis_offsets[rank] = current_rank_offset
            
            # Find max height in this rank
            max_h = 0
            node_dims = []
            for nid in group:
                n = node_map[nid]
                w = n.get('width', 240) or 240
                h = n.get('height', 120) or 120
                
                if n.get('node_type') == 'db_table' or n.get('node_type') == 'table':
                    meta = n.get('meta', {})
                    cols = meta.get('columns', []) if isinstance(meta, dict) else []
                    estimated_h = 64 + (len(cols) * 32) + 20
                    h = max(h, estimated_h)
                
                max_h = max(max_h, h)
                node_dims.append((nid, w, h))
            
            # Center horizontally
            effective_node_spacing = max(node_spacing, 250)
            total_w = sum(w for _, _, w in node_dims) + effective_node_spacing * (len(group) - 1)
            current_v = 0
            
            for nid, w, h in node_dims:
                positions[nid] = (float(current_v), float(current_rank_offset))
                current_v += w + effective_node_spacing
            
            current_rank_offset += max_h + max(rank_spacing, 400)

    # --- Step 5: Final origin shift and normalization ---
    if positions:
        min_x = min(p[0] for p in positions.values())
        min_y = min(p[1] for p in positions.values())
        
        # Ensure at least 100 padding
        shift_x = 100 - min_x
        shift_y = 100 - min_y
        
        for nid in positions:
            x, y = positions[nid]
            positions[nid] = (round(x + shift_x, 1), round(y + shift_y, 1))
    
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
    node_spacing = int(body.get('node_spacing', 100))
    rank_spacing = int(body.get('rank_spacing', 150))
    
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
