<script>
    import { getEditorState } from '../state.svelte';
    import { getDef, TYPE_ICONS } from '../config';
    import { md } from '$lib/utils';
    import Icon from '$lib/components/Icon.svelte';

    const S = getEditorState();

    const node = $derived(S.selectedNodes[0]);
    const edge = $derived(S.selectedEdge);
    const def = $derived(node ? getDef(node.node_type, S.diagram.type) : null);

    let activeTab = $state('general'); 

    function updateMeta(path, val) {
        if (!node) return;
        const meta = JSON.parse(JSON.stringify(node.meta || {})); // Deep clone
        const parts = path.split('.');
        let curr = meta;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!curr[parts[i]]) curr[parts[i]] = {};
            curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = val;
        S.updateNode(node.id, { meta });
    }

    function addColumn() {
        if (!node) return;
        const columns = [...(node.meta?.columns || [])];
        columns.push({ name: 'new_col', type: 'VARCHAR', pk: false, fk: false });
        updateMeta('columns', columns);
    }

    function removeColumn(idx) {
        if (!node) return;
        const columns = [...(node.meta?.columns || [])];
        columns.splice(idx, 1);
        updateMeta('columns', columns);
    }

    function updateColumn(idx, field, val) {
        if (!node) return;
        const columns = [...(node.meta?.columns || [])];
        columns[idx] = { ...columns[idx], [field]: val };
        updateMeta('columns', columns);
    }
</script>

<div class="properties {node || edge ? 'open' : ''}">
    {#if node}
        <div class="prop-header">
            <div class="ph-top">
              <div class="ph-icon" style="background: {def.b}; color: {def.c}">
                  <Icon name={def.i} size={18} stroke={2} />
              </div>
              <div class="ph-title">
                  <input 
                      class="ghost-input"
                      value={node.label} 
                      onchange={(e) => S.updateNode(node.id, { label: e.target.value })}
                  />
                  <div class="ph-type">{node.node_type} • ID {node.id}</div>
              </div>
              <button class="btn-close" onclick={() => S.deselectAll()}><Icon name="chevron-right" size={16} /></button>
            </div>
            
            <div class="ph-tabs">
              <button class="tab {activeTab === 'general' ? 'active' : ''}" onclick={() => activeTab = 'general'}>General</button>
              {#if node.node_type.includes('table')}
                <button class="tab {activeTab === 'data' ? 'active' : ''}" onclick={() => activeTab = 'data'}>Schema</button>
              {/if}
              <button class="tab {activeTab === 'style' ? 'active' : ''}" onclick={() => activeTab = 'style'}>Style</button>
            </div>
        </div>

        <div class="prop-content">
            {#if activeTab === 'general'}
                <div class="p-section">
                    <label class="p-label">Label & Branding</label>
                    <input 
                        class="p-input"
                        value={node.label}
                        onchange={(e) => S.updateNode(node.id, { label: e.target.value })}
                    />
                </div>

                <div class="p-section">
                    <label class="p-label">Description / Documentation</label>
                    <textarea 
                        class="p-input p-area"
                        placeholder="Add notes, docs, or implementation details..."
                        value={node.meta?.description || ''}
                        onchange={(e) => updateMeta('description', e.target.value)}
                    ></textarea>
                </div>
                
                {#if node.node_type === 'external_table'}
                <div class="p-section">
                  <label class="p-label">Target Board ID</label>
                  <input 
                      type="number" 
                      class="p-input"
                      value={node.meta?.ref_diagram_id || ''}
                      onchange={(e) => updateMeta('ref_diagram_id', parseInt(e.target.value))}
                  />
                </div>
                {/if}
            {/if}

            {#if activeTab === 'data'}
                <div class="p-section">
                    <div class="ps-header">
                        <label class="p-label">Columns</label>
                        <button class="btn-xs-acc" onclick={addColumn}>+ Add</button>
                    </div>
                    <div class="col-list">
                        {#each node.meta?.columns || [] as col, i}
                            <div class="col-row">
                                <input 
                                    class="col-input name" 
                                    value={col.name} 
                                    onchange={(e) => updateColumn(i, 'name', e.target.value)} 
                                />
                                <input 
                                    class="col-input type" 
                                    value={col.type} 
                                    onchange={(e) => updateColumn(i, 'type', e.target.value)} 
                                />
                                <div class="col-actions">
                                  <button 
                                      class="btn-flag {col.pk ? 'active-pk' : ''}" 
                                      onclick={() => updateColumn(i, 'pk', !col.pk)}
                                      title="Primary Key"
                                  >PK</button>
                                  <button 
                                      class="btn-flag {col.fk ? 'active-fk' : ''}" 
                                      onclick={() => updateColumn(i, 'fk', !col.fk)}
                                      title="Foreign Key"
                                  >FK</button>
                                  <button class="btn-del" onclick={() => removeColumn(i)}>×</button>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
            
            {#if activeTab === 'style'}
              <div class="p-section">
                <label class="p-label">Dimensions</label>
                <div class="p-row">
                  <div class="p-col">
                    <span class="p-sublabel">Width</span>
                    <input type="number" class="p-input" value={node.width} onchange={(e) => S.updateNode(node.id, {width: parseInt(e.target.value)})} />
                  </div>
                  <div class="p-col">
                    <span class="p-sublabel">Height</span>
                    <input type="number" class="p-input" value={node.height} onchange={(e) => S.updateNode(node.id, {height: parseInt(e.target.value)})} />
                  </div>
                </div>
              </div>
            {/if}

            <div class="p-footer">
              <button class="btn-danger-ghost" onclick={() => S.deleteSelected()}>
                <Icon name="delete" size={14} />
                <span>Delete Node</span>
              </button>
            </div>
        </div>
    {:else if edge}
        <div class="prop-header">
          <div class="ph-top">
            <div class="ph-icon" style="background: var(--surface2); color: var(--text-mid)">
                <Icon name="process" size={18} />
            </div>
            <div class="ph-title">
                <input 
                    class="ghost-input"
                    value={edge.label || 'Connection'} 
                    onchange={(e) => S.updateEdge(edge.id, { label: e.target.value })}
                />
                <div class="ph-type">Edge • ID {edge.id}</div>
            </div>
            <button class="btn-close" onclick={() => S.deselectAll()}><Icon name="chevron-right" size={16} /></button>
          </div>
        </div>
        
        <div class="prop-content">
          <div class="p-section">
            <label class="p-label">Relationship Type</label>
            <select 
              class="p-input"
              value={edge.edge_type}
              onchange={(e) => S.updateEdge(edge.id, { edge_type: e.target.value })}
            >
              <option value="default">Default / Association</option>
              <option value="one_to_many">One to Many</option>
              <option value="one_to_one">One to One</option>
              <option value="many_to_many">Many to Many</option>
            </select>
          </div>
          
          <div class="p-footer">
              <button class="btn-danger-ghost" onclick={() => S.deleteSelected()}>
                <Icon name="delete" size={14} />
                <span>Delete Edge</span>
              </button>
            </div>
        </div>
    {:else}
        <div class="no-selection">
            <div class="ns-icon"><Icon name="start" size={32} color="var(--border)" stroke={1} /></div>
            <p>Select an element to edit properties</p>
        </div>
    {/if}
</div>

<style>
    .properties {
        position: fixed;
        right: 20px;
        top: 84px;
        bottom: 20px;
        width: 340px;
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        z-index: 50;
        transform: translateX(calc(100% + 40px));
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
    }
    .properties.open {
        transform: translateX(0);
    }
    .prop-header {
        padding: 24px;
        border-bottom: 1px solid var(--glass-border);
        background: rgba(255, 255, 255, 0.02);
    }
    .ph-top {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
    }
    .ph-icon {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .ph-title {
        flex: 1;
        min-width: 0;
    }
    .ghost-input {
        background: transparent;
        border: none;
        color: var(--text);
        font-size: 18px;
        font-weight: 700;
        width: 100%;
        outline: none;
        padding: 0;
        margin-bottom: 2px;
    }
    .ph-type {
        font-size: 10px;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
        opacity: 0.6;
    }
    .btn-close {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.05);
        color: var(--text-dim);
        cursor: pointer;
        padding: 6px;
        border-radius: 10px;
        transition: all 0.2s;
    }
    .btn-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text);
    }
    .ph-tabs {
        display: flex;
        gap: 4px;
        background: rgba(0, 0, 0, 0.2);
        padding: 4px;
        border-radius: 12px;
    }
    .tab {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-size: 12px;
        font-weight: 600;
        padding: 8px 4px;
        cursor: pointer;
        border-radius: 9px;
        transition: all 0.2s;
    }
    .tab:hover {
        color: var(--text-mid);
    }
    .tab.active {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .prop-content {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 28px;
    }
    .p-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .ps-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    .p-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--text-dim);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    .p-sublabel {
        font-size: 9px;
        font-weight: 700;
        color: var(--text-dim);
        text-transform: uppercase;
        margin-bottom: 4px;
        display: block;
        opacity: 0.6;
    }
    .p-input {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px 14px;
        color: var(--text);
        font-size: 14px;
        outline: none;
        width: 100%;
        transition: all 0.2s;
    }
    .p-input:focus {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent);
        box-shadow: 0 0 0 4px var(--accent-glow);
    }
    .p-area {
        min-height: 120px;
        resize: vertical;
        line-height: 1.6;
    }
    .p-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .p-col {
        display: flex;
        flex-direction: column;
    }
    .col-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .col-row {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color 0.2s;
    }
    .col-row:focus-within {
        border-color: rgba(255,255,255,0.15);
    }
    .col-input {
        background: rgba(0,0,0,0.2);
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 6px 10px;
        color: var(--text);
        font-size: 12px;
        outline: none;
    }
    .col-input:focus {
        border-color: var(--accent);
    }
    .col-actions {
        display: flex;
        gap: 6px;
        align-items: center;
    }
    .btn-flag {
        padding: 3px 8px;
        font-size: 9px;
        font-weight: 800;
        border-radius: 6px;
        border: 1px solid rgba(255,255,255,0.1);
        background: transparent;
        color: var(--text-dim);
        cursor: pointer;
        transition: all 0.2s;
    }
    .active-pk { background: var(--amber-dim); color: var(--amber); border-color: var(--amber); }
    .active-fk { background: var(--teal-dim); color: var(--teal); border-color: var(--teal); }
    
    .btn-xs-acc {
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 4px 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s;
    }
    .btn-xs-acc:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px var(--accent-glow);
    }
    .btn-del {
        margin-left: auto;
        background: transparent;
        border: none;
        color: var(--text-dim);
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    .btn-del:hover {
        opacity: 1;
        color: var(--rose);
    }
    .p-footer {
        margin-top: auto;
        padding: 24px;
    }
    .btn-danger-ghost {
        background: transparent;
        border: 1px dashed rgba(244, 63, 94, 0.2);
        color: var(--rose);
        padding: 12px;
        border-radius: 12px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
    }
    .btn-danger-ghost:hover {
        background: var(--rose-dim);
        border-color: var(--rose);
        transform: translateY(-2px);
    }
    .no-selection {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        text-align: center;
        color: var(--text-dim);
        opacity: 0.6;
    }
    .ns-icon {
        margin-bottom: 24px;
        background: rgba(255,255,255,0.03);
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 24px;
        border: 2px dashed var(--glass-border);
    }
</style>
