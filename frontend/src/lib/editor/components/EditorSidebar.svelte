<script>
    import { getEditorState } from '../state.svelte';
    import { getCat, TYPE_LABELS, TYPE_ICONS } from '../config';
    import Icon from '$lib/components/Icon.svelte';

    const S = getEditorState();

    let boards = $state([]);

    $effect(() => {
        if (S.pid) fetchBoards();
    });

    async function fetchBoards() {
        try {
            const resp = await fetch(`/api/projects/${S.pid}/boards`);
            boards = await resp.json();
        } catch (e) {}
    }

    function onDragStart(e, type) {
        e.dataTransfer.setData('nt', type);
        e.dataTransfer.dropEffect = 'copy';
    }

    const categories = $derived(getCat(S.diagram.type));
</script>

<div class="sidebar">
    <div class="sb-content">
        {#each categories as cat}
            {#each cat.nodes as node}
                <button 
                    class="p-item" 
                    style="--c:{node.c}"
                    draggable="true"
                    ondragstart={(e) => onDragStart(e, node.t)}
                    onclick={() => S.addNode(node.t, -1, -1)}
                    title={node.n}
                >
                    <div class="pi">
                      <Icon name={node.i} color={node.c} size={18} stroke={2} />
                    </div>
                </button>
            {/each}
        {/each}
    </div>
</div>

<style>
    .sidebar {
        position: fixed;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 56px;
        height: auto;
        max-height: calc(100vh - 120px);
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 50;
        box-shadow: var(--shadow-lg);
        padding: 8px 0;
    }
    .sb-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        overflow-y: auto;
        padding: 4px;
        scrollbar-width: none;
        width: 100%;
    }
    .sb-content::-webkit-scrollbar { display: none; }
    
    .p-item {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.04);
        border-radius: 12px;
        width: 40px;
        height: 40px;
        cursor: grab;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }
    .p-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--c);
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .p-item .pi {
        transition: transform 0.2s;
    }
    .p-item:active {
        transform: scale(0.95);
    }
</style>
