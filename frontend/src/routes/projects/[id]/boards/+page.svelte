<script>
  import { page } from '$app/state';
  import { esc } from '$lib/utils';

  let boards = $state([]);
  let loading = $state(true);
  let showForm = $state(false);

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const resp = await fetch(`/api/projects/${pid}/diagrams`);
      boards = await resp.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (pid) fetchData();
  });

  const icons = {
    process_flow: '⚡',
    db_diagram: '🗄️',
    flowchart: '📊',
    idea_map: '💡',
    function_flow: '⚙️'
  };

  async function deleteBoard(did) {
    if(!confirm('Delete this board?')) return;
    await fetch(`/api/projects/${pid}/diagrams/${did}`, { method: 'DELETE' });
    await fetchData();
  }
</script>

<div class="page-hd">
  <div>
    <h1>Boards</h1>
    <div class="sub">Visual process flows and diagrams for system architecture</div>
  </div>
  <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick={() => showForm = !showForm}>+ New Board</button>
</div>

{#if showForm}
  <div class="form-card animate-in">
    <h3>New Board</h3>
    <div class="form-row">
      <input type="text" placeholder="Board name" style="flex:2">
      <select style="flex:1">
        <option value="process_flow">Process Flow</option>
        <option value="db_diagram">DB Diagram</option>
        <option value="flowchart">Flowchart</option>
        <option value="idea_map">Idea Map</option>
        <option value="function_flow">Function Flow</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn btn-acc btn-sm">Create</button>
      <button class="btn btn-out btn-sm" onclick={() => showForm = false}>Cancel</button>
    </div>
    <div style="font-size:12px;color:var(--text-mid);margin-bottom:6px">Or use a template:</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      {#each ['sprint_planning','release_pipeline','bug_triage','feature_request','onboarding'] as t}
        <button class="btn btn-out btn-sm">{t.replace(/_/g,' ')}</button>
      {/each}
    </div>
  </div>
{/if}

{#if loading}
  <div class="empty">Loading...</div>
{:else if boards.length}
  <div class="board-tiles">
    {#each boards as b}
      <div class="board-tile" onclick={() => location.href = `/project/${pid}/editor/${b.id}`}>
        <div class="t-actions">
          <button class="btn btn-ghost btn-xs" onclick={(e) => { e.stopPropagation(); deleteBoard(b.id); }}>✕</button>
        </div>
        <div class="t-icon">{icons[b.diagram_type] || '📋'}</div>
        <div class="t-name">{b.name}</div>
        <div class="t-meta">{b.diagram_type.replace(/_/g,' ')} · {b.node_count || 0} nodes</div>
        <div class="t-open">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg> 
          OPEN
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="empty" style="grid-column:1/-1">
    <div class="icon">📋</div>
    <p>No boards yet</p>
  </div>
{/if}
