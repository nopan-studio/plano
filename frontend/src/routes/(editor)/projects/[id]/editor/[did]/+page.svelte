<script>
    import { page } from '$app/state';
    import { onMount, setContext } from 'svelte';
    import { setEditorState, EditorState, EDITOR_KEY } from '$lib/editor/state.svelte.js';
    import '$lib/editor/styles/editor.css';
    import Toolbar from '$lib/editor/components/Toolbar.svelte';
    import EditorSidebar from '$lib/editor/components/EditorSidebar.svelte';
    import Canvas from '$lib/editor/components/Canvas.svelte';
    import Properties from '$lib/editor/components/Properties.svelte';

    // Get reactive params from $app/state
    const pid = $derived(page.params.id);
    const did = $derived(page.params.did);

    // Initial state setup at the top level
    const S = setEditorState(page.params.id, page.params.did);

    let canvasWrap = $state(null);

    $effect(() => {
       if (pid && did) {
           S.pid = pid;
           S.did = did;
       }
    });

    function fitView() {
        if (!S || !S.diagram.nodes || !S.diagram.nodes.length || !canvasWrap) return;
        const w = canvasWrap.offsetWidth || 1200;
        const h = canvasWrap.offsetHeight || 800;
        const xs = S.diagram.nodes.map(n => n.x);
        const ys = S.diagram.nodes.map(n => n.y);
        const pad = 100;
        const minX = Math.min(...xs) - pad;
        const minY = Math.min(...ys) - pad;
        const maxX = Math.max(...xs) + 280;
        const maxY = Math.max(...ys) + 150;

        const scale = Math.min(w / (maxX - minX), h / (maxY - minY), 1.2) * 0.85;
        S.scale = scale;
        S.ox = -minX * scale + (w - (maxX - minX) * scale) / 2;
        S.oy = -minY * scale + (h - (maxY - minY) * scale) / 2;
    }

    onMount(() => {
        setTimeout(fitView, 600);
    });
</script>

<div class="editor-container">
    <div class="canvas-wrap">
        <Canvas bind:canvasWrap />
    </div>
    
    <Toolbar />
    <EditorSidebar />
    <Properties />
</div>

<style>
    .editor-container {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background: var(--bg);
        overflow: hidden;
        z-index: 9000;
    }
    .canvas-wrap {
      position: absolute;
      inset: 0;
      background: var(--bg);
      z-index: 1;
    }
</style>
