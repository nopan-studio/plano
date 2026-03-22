<script>
    import { getEditorState } from '../state.svelte';
    import { onMount } from 'svelte';

    let { edge } = $props();
    const S = getEditorState();

    let isSelected = $derived(S.selectedEdgeId === edge.id);
    let sourceNode = $derived(S.nodeMap.get(edge.source_id));
    let targetNode = $derived(S.nodeMap.get(edge.target_id));

    // Calculate coordinates reactively
    let sc = $derived(getPortCoords(sourceNode, edge.meta?.source_port?.side, edge.meta?.source_column || edge.meta?.source_port?.col));
    let tc = $derived(getPortCoords(targetNode, edge.meta?.target_port?.side, edge.meta?.target_column || edge.meta?.target_port?.col));

    let pathD = $derived.by(() => {
        if (!sc || !tc) return '';
        const ctrl = Math.max(Math.abs(tc.x - sc.x) * 0.5, 80);
        return `M ${sc.x} ${sc.y} C ${sc.x + ctrl} ${sc.y},${tc.x - ctrl} ${tc.y},${tc.x} ${tc.y}`;
    });

    function getPortCoords(n, side = 'l', colNameOrIdx) {
        if (!n) return { x: 0, y: 0 };
        const x = n.x;
        const y = n.y;
        const w = n.width || 220;
        const h = n.height || 60;

        if (colNameOrIdx !== undefined) {
            const isTab = n.node_type === 'db_table' || n.node_type === 'table' || n.node_type === 'view';
            if (isTab && n.meta?.columns) {
                let idx = -1;
                if (typeof colNameOrIdx === 'number') idx = colNameOrIdx;
                else idx = n.meta.columns.findIndex(c => c.name === colNameOrIdx);
                
                if (idx !== -1) {
                    // Approximate height for columns: header (~40px) + each row (30px)
                    const headerHeight = 35; 
                    const rowHeight = 30;
                    return {
                        x: x + (side === 'r' ? w : 0),
                        y: y + headerHeight + (idx * rowHeight) + (rowHeight / 2)
                    };
                }
            }
        }

        if (side === 't') return { x: x + w / 2, y: y };
        if (side === 'b') return { x: x + w / 2, y: y + h };
        if (side === 'r') return { x: x + w, y: y + h / 2 };
        return { x: x, y: y + h / 2 };
    }

    function getMarker(type, selected) {
        if (selected) return 'url(#m-acc)';
        if (type === 'success') return 'url(#m-grn)';
        if (type === 'one_to_many' || type === 'many_to_many') return 'url(#m-pur)';
        return 'url(#m-def)';
    }

    function onEdgeClick(e) {
        e.stopPropagation();
        S.selectEdge(edge.id);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<g class="eg" onclick={onEdgeClick} role="button" tabindex="0">
    <path class="ehit" d={pathD}></path>
    <path 
        class="epath {isSelected ? 'sel' : ''} et-{edge.edge_type}" 
        d={pathD}
        marker-end={getMarker(edge.edge_type, isSelected)}
    ></path>
    {#if edge.label}
        <text 
            class="elabel" 
            x={(sc.x + tc.x) / 2} 
            y={(sc.y + tc.y) / 2 - 7} 
            text-anchor="middle"
        >
            {edge.label}
        </text>
    {/if}
</g>

<style>
    .eg { cursor: pointer; }
    .epath {
        fill: none;
        stroke: var(--text-dim);
        stroke-width: 2px;
        transition: stroke 0.2s, stroke-width 0.2s;
        pointer-events: none;
    }
    .ehit {
        fill: none;
        stroke: transparent;
        stroke-width: 16px;
        pointer-events: stroke;
    }
    .eg:hover .epath {
        stroke: var(--text-mid);
        stroke-width: 3px;
    }
    .epath.sel {
        stroke: var(--accent);
        stroke-width: 4px;
        stroke-dasharray: 8;
        animation: dash 0.8s linear infinite;
    }
    @keyframes dash {
        to { stroke-dashoffset: -12; }
    }
    .et-success { stroke: var(--green); }
    .et-one_to_many { stroke: var(--purple); }
    .elabel {
      font-size: 10px;
      fill: var(--text-dim);
      font-weight: 600;
      pointer-events: none;
    }
</style>
