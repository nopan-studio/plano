<script>
    import { getEditorState } from '../state.svelte';
    import Node from './Node.svelte';
    import Edge from './Edge.svelte';
    import Icon from '$lib/components/Icon.svelte';

    let { canvasWrap = $bindable() } = $props();
    const S = getEditorState();

    let marq = $state(null);
    let mx = $state(0);
    let my = $state(0);

    function onMouseDown(e) {
        if (e.target.closest('.n8n-node, .eg, .toolbar, .props, .sidebar')) return;
        
        const br = canvasWrap.getBoundingClientRect();
        const startX = (e.clientX - br.left - S.ox) / S.scale;
        const startY = (e.clientY - br.top - S.oy) / S.scale;

        if (e.button === 0 && (e.shiftKey || S.selMode)) {
            marq = { x1: startX, y1: startY, x2: startX, y2: startY };
            
            function onMouseMove(moveEvent) {
                if (!marq) return;
                marq.x2 = (moveEvent.clientX - br.left - S.ox) / S.scale;
                marq.y2 = (moveEvent.clientY - br.top - S.oy) / S.scale;
            }

            function onMouseUp() {
                if (!marq) return;
                const x1 = Math.min(marq.x1, marq.x2);
                const y1 = Math.min(marq.y1, marq.y2);
                const x2 = Math.max(marq.x1, marq.x2);
                const y2 = Math.max(marq.y1, marq.y2);

                const hits = S.diagram.nodes.filter(n => 
                    n.x + (n.width || 220) > x1 && n.x < x2 && 
                    n.y + (n.height || 60) > y1 && n.y < y2
                );
                
                hits.forEach(n => S.selectNode(n.id, true));
                if (!hits.length && !e.shiftKey) S.deselectAll();
                
                marq = null;
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            }

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);

        } else {
            S.startPanning(e);
        }
    }

    function onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        const newScale = Math.max(0.15, Math.min(3, S.scale + delta));
        
        const br = canvasWrap.getBoundingClientRect();
        const cursorX = e.clientX - br.left;
        const cursorY = e.clientY - br.top;
        
        const sx = (cursorX - S.ox) / S.scale;
        const sy = (cursorY - S.oy) / S.scale;
        
        S.scale = newScale;
        S.ox = cursorX - sx * S.scale;
        S.oy = cursorY - sy * S.scale;
    }

    function onDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('nt');
        if (!type || !canvasWrap) return;

        const br = canvasWrap.getBoundingClientRect();
        const x = (e.clientX - br.left - S.ox) / S.scale;
        const y = (e.clientY - br.top - S.oy) / S.scale;
        
        S.addNode(type, Math.round(x), Math.round(y));
    }

    function onMouseMove(e) {
        if (!canvasWrap) return;
        const br = canvasWrap.getBoundingClientRect();
        mx = (e.clientX - br.left - S.ox) / S.scale;
        my = (e.clientY - br.top - S.oy) / S.scale;
    }

    function getPortCoordsForPreview(n, side = 'l', colIdx) {
        if (!n) return { x: 0, y: 0 };
        const x = n.x;
        const y = n.y;
        const w = n.width || 220;
        const h = n.height || 60;
        const isTab = n.node_type === 'db_table' || n.node_type === 'table' || n.node_type === 'view';
        
        if (colIdx !== undefined && isTab) {
            const headerHeight = 64; 
            const rowHeight = 32;
            return {
                x: x + (side === 'r' ? w : 0),
                y: y + headerHeight + (colIdx * rowHeight) + (rowHeight / 2)
            };
        }
        if (side === 't') return { x: x + w / 2, y: y };
        if (side === 'b') return { x: x + w / 2, y: y + h };
        if (side === 'r') return { x: x + w, y: y + h / 2 };
        return { x: x, y: y + h / 2 };
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div 
    class="canvas-container" 
    bind:this={canvasWrap}
    onmousedown={onMouseDown}
    onwheel={onWheel}
    ondragover={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
    ondrop={onDrop}
    onmousemove={onMouseMove}
    role="presentation"
>
    {#if !S.diagram.nodes}
      <div class="canvas-loading">Loading board...</div>
    {:else if S.diagram.nodes.length === 0}
      <div class="canvas-empty">
        <Icon name="process" size={48} stroke={1} color="var(--border)" />
        <p>This board is empty. Drag components from the sidebar to get started.</p>
      </div>
    {/if}

    <!-- Multi-node selection badge -->
    {#if S.selectedNodeIds.length > 1}
      <div class="sel-badge">
        {S.selectedNodeIds.length} nodes selected
      </div>
    {/if}

    <div 
        id="canvas"
        style="transform: translate({S.ox}px, {S.oy}px) scale({S.scale})"
    >
        <svg id="svg-layer">
            <defs>
                <marker id="m-def" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="var(--text-dim)"></path>
                </marker>
                <marker id="m-acc" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="var(--accent)"></path>
                </marker>
                <marker id="m-grn" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="var(--green)"></path>
                </marker>
                 <marker id="m-pur" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                    <path d="M0,0 L0,10 L10,5 Z" fill="var(--purple)"></path>
                </marker>
            </defs>

            {#each S.diagram.edges as edge (edge.id)}
                <Edge {edge} />
            {/each}

            {#if S.isConnecting && S.drag?.cx}
                {@const br = canvasWrap.getBoundingClientRect()}
                {@const sn = S.nodeMap.get(S.isConnecting.source_id)}
                {@const sp = getPortCoordsForPreview(sn, S.isConnecting.side, S.isConnecting.col)}
                {@const tx = (S.drag.cx - br.left - S.ox) / S.scale}
                {@const ty = (S.drag.cy - br.top - S.oy) / S.scale}
                {@const ctrl = Math.max(Math.abs(tx - sp.x) * 0.5, 80)}
                <path 
                  class="epath preview" 
                  d="M {sp.x} {sp.y} C {sp.x + (S.isConnecting.side==='r'?ctrl:(S.isConnecting.side==='l'?-ctrl:0))} {sp.y}, {tx - 50} {ty}, {tx} {ty}" 
                  stroke-dasharray="4"
                />
            {/if}
        </svg>

        {#if marq}
            <div 
                class="marquee" 
                style="
                    left: {Math.min(marq.x1, marq.x2)}px; 
                    top: {Math.min(marq.y1, marq.y2)}px; 
                    width: {Math.abs(marq.x2 - marq.x1)}px; 
                    height: {Math.abs(marq.y2 - marq.y1)}px;
                "
            ></div>
        {/if}

        <div id="nodes-layer">
            {#each S.diagram.nodes as node (node.id)}
                <Node {node} />
            {/each}
        </div>
    </div>
</div>

<style>
  /* All logic moved to editor.css */
</style>
