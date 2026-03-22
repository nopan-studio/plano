<script>
    import { getEditorState } from '../state.svelte';
    import { TYPE_LABELS, TYPE_ICONS } from '../config';
    import Icon from '$lib/components/Icon.svelte';
    import { goto } from '$app/navigation';

    const S = getEditorState();

    function zoom(d) {
        S.scale = Math.max(0.15, Math.min(3, S.scale + d));
    }

    async function autoLayout() {
        try {
            const resp = await fetch(`/api/projects/${S.pid}/boards/${S.did}/auto-layout`, { method: 'POST' });
            const data = await resp.json();
            if (data.status === 'ok') await S.load();
        } catch (e) {}
    }

    async function duplicateBoard() {
        try {
            const resp = await fetch(`/api/projects/${S.pid}/boards/${S.did}/duplicate`, { method: 'POST' });
            const data = await resp.json();
            if (data.id) goto(`/projects/${S.pid}/editor/${data.id}`);
        } catch (e) {}
    }
</script>

<div class="toolbar-wrap">
  <div class="toolbar">
    <div class="tb-left">
        <a href="/projects/{S.pid}/boards" class="btn-tb" title="Back to Boards">
            <Icon name="back" size={20} />
        </a>
        <div class="sep"></div>
        <div class="board-info">
            <div class="bi-icon" style="background: var(--accent-dim); color: var(--accent)">
              <Icon name={TYPE_ICONS[S.diagram.type] || 'process'} size={14} stroke={2.5} />
            </div>
            <div class="bi-text">
              <span class="bn">{S.diagram.name}</span>
              <span class="bt">{TYPE_LABELS[S.diagram.type] || S.diagram.type}</span>
            </div>
        </div>
    </div>

    <div class="tb-mid">
        <div class="tb-group">
          <button 
              class="btn-tb {S.selMode ? 'active' : ''}" 
              onclick={() => S.selMode = !S.selMode} 
              title="Selection Mode (Shift+Drag)"
          >
              <Icon name="fit-view" size={18} />
          </button>
          <div class="sep"></div>
          <button class="btn-tb" onclick={() => zoom(-0.1)} title="Zoom Out"><Icon name="zoom-out" size={18} /></button>
          <div class="zoom-val">{Math.round(S.scale * 100)}%</div>
          <button class="btn-tb" onclick={() => zoom(0.1)} title="Zoom In"><Icon name="zoom-in" size={18} /></button>
        </div>
        
        <div class="sep"></div>
        
        <button class="btn-tb-pill" onclick={autoLayout} title="Auto-layout Nodes">
          <Icon name="layout" size={16} />
          <span>Auto-layout</span>
        </button>
    </div>

    <div class="tb-right">
        <button class="btn-tb" onclick={duplicateBoard} title="Duplicate Board"><Icon name="duplicate" size={18} /></button>
        <button class="btn-tb primary" onclick={() => S.load()} title="Refresh Data"><Icon name="refresh" size={18} /></button>
    </div>
  </div>
</div>

<style>
    .toolbar-wrap {
        padding: 12px 20px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        pointer-events: none;
        z-index: 1000;
        display: flex;
        justify-content: center;
    }
    .toolbar {
        height: 52px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        width: 100%;
        max-width: 1400px;
        pointer-events: auto;
        box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
    }
    .tb-left, .tb-mid, .tb-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .sep {
        width: 1px;
        height: 18px;
        background: rgba(255,255,255,0.1);
        margin: 0 4px;
    }
    .board-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 8px;
    }
    .bi-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .bi-text {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }
    .bn {
        font-size: 13px;
        font-weight: 600;
        color: var(--text);
    }
    .bt {
        font-size: 10px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .tb-group {
        display: flex;
        align-items: center;
        background: rgba(0,0,0,0.2);
        padding: 4px;
        border-radius: 10px;
        gap: 2px;
    }
    .btn-tb {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-mid);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        background: transparent;
        cursor: pointer;
    }
    .btn-tb:hover {
        background: rgba(255,255,255,0.08);
        color: var(--text);
    }
    .btn-tb.active {
        background: var(--accent-dim);
        color: var(--accent);
    }
    .btn-tb.primary {
        background: var(--accent);
        color: white;
    }
    .btn-tb.primary:hover {
        filter: brightness(1.1);
    }
    .btn-tb-pill {
        height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-mid);
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-tb-pill:hover {
        background: rgba(255,255,255,0.1);
        color: var(--text);
    }
    .zoom-val {
        font-size: 12px;
        font-family: var(--mono);
        color: var(--text-mid);
        min-width: 40px;
        text-align: center;
    }
</style>
