<script>
  import { getDef } from '$lib/editor/config';
  import { md } from '$lib/utils';
  import { getEditorState } from '$lib/editor/state.svelte.js';
  import Icon from '$lib/components/Icon.svelte';

  let { node } = $props();
  const S = getEditorState();

  const def = $derived(getDef(node.node_type, S.diagram?.type));
  const isSelected = $derived(S.selectedNodeIds.includes(node.id));
  const isNote = $derived(node.node_type === 'annotation' || node.node_type === 'note');
  const isTab = $derived(node.node_type === 'db_table' || node.node_type === 'table' || node.node_type === 'view' || node.node_type === 'external_table' || node.node_type === 'datastore');
  const isCheck = $derived(node.node_type === 'todo');
  const isImage = $derived(node.node_type === 'image');
  const isText = $derived(node.node_type === 'text');
  const isYoutube = $derived(node.node_type === 'youtube');
  
  const ytId = $derived.by(() => {
    if (!node.meta?.url) return null;
    const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = node.meta.url.match(reg);
    return match ? match[1] : null;
  });

  const columns = $derived(node.meta?.columns || []);

  function onMouseDown(e) {
    if (e.target.closest('.port, .port-row, .node-resizer, button')) return;
    S.onNodeDown(node.id, e);
  }

  function onPortDown(side, colIndex, e) {
    e.stopPropagation();
    S.onPortDown(node.id, side, colIndex);
  }

  function updateImageUrl() {
    const url = prompt('Enter image URL:', node.meta?.url || '');
    if (url !== null) {
      S.updateNode(node.id, { meta: { ...node.meta, url } });
    }
  }

  function onResizeDown(e) {
    e.stopPropagation();
    S.onResizeDown(node.id, e);
  }

  const subtitles = { 
    start: 'Trigger', end: 'End', process: 'Operation', decision: 'Condition', 
    io: 'Data Transfer', connector: 'Bridge', annotation: 'Context', db_table: 'Entity', 
    enum: 'Enum Def', note: 'Abstract', external_table: 'Remote',
    todo: 'Checklist', image: 'Visual', link: 'Resource',
    text: 'Floating Tag', youtube: 'Video Player'
  };

  function openExternal() {
    if (node.meta?.ref_diagram_id) {
      window.location.href = `/projects/${S.pid}/editor/${node.meta.ref_diagram_id}`;
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div 
  class="n8n-node {isSelected ? 'selected' : ''} {isNote ? 'is-note' : ''} {isText ? 'is-text' : ''} {S.isDragging && isSelected ? 'dragging' : ''}"
  style="--x: {node.x}px; --y: {node.y}px; width: {node.width || 240}px; {isTab ? 'height: auto' : `height: ${node.height || 120}px`}; --node-color: {def.c}"
  onmousedown={onMouseDown}
  onclick={(e) => { e.stopPropagation(); S.selectNode(node.id, e.shiftKey); }}
>
  <div class="node-inner">
    {#if isText}
      <div class="text-node-content" style="padding: 8px 12px; font-size: 18px; font-weight: 700; color: var(--text-mid); text-align: center;">
        {node.label}
      </div>
    {:else if isNote}
      <div class="note-header">
        <Icon name={def.i} color={def.c} size={14} stroke={2.5}/>
        <span class="node-title" style="margin-left: 8px;">{node.label}</span>
      </div>
      <div class="note-body">{@html md(node.meta?.description || 'Click to edit note content...') }</div>
    {:else}
      <div class="node-row" style="background: {def.b}; min-height: 64px;">
        <div class="node-icon-cell" style="width: 52px; background: rgba(0,0,0,0.1)">
          <Icon name={def.i} color={def.c} size={22} stroke={1.5} />
        </div>
        <div class="node-text-cell" style="padding: 12px 14px;">
          <div class="node-title" style="font-size: 14px; letter-spacing: -0.01em;">{node.label}</div>
          <div class="node-subtitle" style="font-size: 9px; opacity: 0.8;">{subtitles[node.node_type] || node.node_type}</div>
        </div>
        {#if node.node_type === 'external_table' && node.meta?.ref_diagram_id}
          <button class="btn btn-ghost btn-xs" style="margin: 10px; padding: 4px; background: rgba(255,255,255,0.1)" onclick={openExternal} title="Open reference board">
            ➔
          </button>
        {/if}
      </div>

      {#if isImage}
        <div class="node-img-wrap" style="height: 140px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative" onclick={updateImageUrl}>
          {#if node.meta?.url}
            <img src={node.meta.url} alt={node.label} style="width: 100%; height: 100%; object-fit: cover;" />
          {:else}
            <div style="text-align:center">
              <Icon name="process" size={32} color="rgba(255,255,255,0.2)" />
              <div style="font-size: 8px; color: var(--text-dim); margin-top: 8px;">Click to set image</div>
            </div>
          {/if}
        </div>
      {/if}

      {#if isYoutube}
        <div class="node-yt-wrap" style="height: 180px; background: #000; overflow: hidden; position: relative" onclick={updateImageUrl}>
          {#if ytId}
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/{ytId}" title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="pointer-events: auto;"></iframe>
          {:else}
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; opacity: 0.5;">
               <Icon name="process" size={32} />
               <div style="font-size: 8px;">Click to set YouTube URL</div>
            </div>
          {/if}
        </div>
      {/if}

      {#if isCheck && node.meta?.items}
        <div class="node-checklist" style="padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.05);">
          {#each node.meta.items as item}
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 4px;">
              <input type="checkbox" checked={item.done} disabled style="width: 12px; height: 12px; accent-color: var(--blue);" />
              <span style={item.done ? 'text-decoration: line-through; opacity: 0.5' : ''}>{item.text}</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if isTab && columns.length}
        <div class="node-cols">
          {#each columns as c, i}
            <div class="ncol">
              <div class="port-row l {S.isConnecting?.source_id === node.id ? 'pinned' : ''}" onmousedown={(e) => onPortDown('l', i, e)}></div>
              
              {#if c.pk}<span class="badge-pk" style="font-size:8px; padding:0 3px; border-radius:3px; margin-right:4px">PK</span>{/if}
              {#if c.fk}<span class="badge-fk" style="font-size:8px; padding:0 3px; border-radius:3px; margin-right:4px">FK</span>{/if}
              
              <span class="col-n">{c.name}</span>
              <span class="col-t">{c.type || ''}</span>
              
              <div class="port-row r {S.isConnecting?.source_id === node.id ? 'pinned' : ''}" onmousedown={(e) => onPortDown('r', i, e)}></div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>

  {#if !isNote}
    {#each ['l', 'r', 't', 'b'] as side}
      <div 
        class="port port-{side} {S.isConnecting?.source_id === node.id ? 'pinned' : ''}" 
        onmousedown={(e) => onPortDown(side, undefined, e)}
      ></div>
    {/each}
  {/if}
  <div class="node-resizer" onmousedown={onResizeDown}></div>
</div>

<style>
  .ncol {
    min-height: 28px;
    position: relative;
  }
</style>
