<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { md, esc, fmtDate } from '$lib/utils';
import { addRealtimeHandler } from '$lib/realtime.svelte';

  let project = $state({});
  let milestones = $state([]);
  let loading = $state(true);
  let showForm = $state(false);

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const [p, m] = await Promise.all([
        fetch(`/api/projects/${pid}`).then(r => r.json()),
        fetch(`/api/projects/${pid}/milestones`).then(r => r.json())
      ]);
      project = p;
      milestones = m;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (pid) fetchData();
  });

  onMount(() => {
    return addRealtimeHandler((event) => {
      if (event.type?.startsWith('milestone_')) {
        fetchData();
      }
    });
  });

  const pending = $derived(milestones.filter(m => m.status === 'pending'));
  const active = $derived(milestones.filter(m => m.status === 'in_progress'));
  const closed = $derived(milestones.filter(m => m.status === 'completed' || m.status === 'missed'));

  let selectedMilestone = $state(null);
  let editDesc = $state(false);

  async function saveMilestone() {
    if (!selectedMilestone) return;
    await fetch(`/api/projects/${pid}/milestones/${selectedMilestone.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedMilestone)
    });
    await fetchData();
    selectedMilestone = null;
  }
</script>

{#if loading}
  <div class="empty">Loading milestones...</div>
{:else}
  <div class="page-hd">
    <div>
      <h1>Milestones</h1>
      <div class="sub">Track high-level achievements and key project markers</div>
    </div>
    <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick={() => showForm = !showForm}>+ Milestone</button>
  </div>

  {#if showForm}
    <div class="form-card animate-in" style="margin-bottom:14px">
      <h3>New Milestone</h3>
      <div class="form-row">
        <input type="text" placeholder="Milestone name" style="flex:2">
        <input type="date" style="flex:1">
      </div>
      <div class="form-row"><input type="text" placeholder="Description"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-acc btn-sm">Create</button>
        <button class="btn btn-out btn-sm" onclick={() => showForm = false}>Cancel</button>
      </div>
    </div>
  {/if}

  <div class="kanban">
    <!-- Pending -->
    <div class="kanban-col col-todo">
      <div class="kanban-col-hd">
        <h3><span class="status-circle"></span> Pending <span class="cnt">{pending.length}</span></h3>
      </div>
      <div class="kanban-col-sub">Upcoming project goals</div>
      <div class="kanban-col-body">
        {#each pending as m}
          <div class="k-card" onclick={() => selectedMilestone = { ...m }}>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div class="ms-dot ms-dot-{m.status}" style="width:10px;height:10px;flex-shrink:0"></div>
              <div class="k-card-title" style="margin:0">{m.name}</div>
            </div>
            {#if m.description}<div class="k-card-sub">{@html md(m.description)}</div>{/if}
            <div class="k-card-chips">
              {#if m.due_date}
                <span class="chip chip-due">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {fmtDate(m.due_date)}
                </span>
              {/if}
              {#if m.task_count}
                <span class="chip" style="background:var(--surface2);color:var(--text-mid)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><polyline points="20 6 9 17 4 12"/></svg>
                  {m.task_count}
                </span>
              {/if}
            </div>
          </div>
        {/each}
        {#if !pending.length}<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:12px">None</div>{/if}
      </div>
    </div>

    <!-- In Progress -->
    <div class="kanban-col col-progress">
      <div class="kanban-col-hd">
        <h3><span class="status-circle"></span> In Progress <span class="cnt">{active.length}</span></h3>
      </div>
      <div class="kanban-col-sub">Currently tracking</div>
      <div class="kanban-col-body">
        {#each active as m}
          <div class="k-card" onclick={() => selectedMilestone = { ...m }}>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div class="ms-dot ms-dot-{m.status}" style="width:10px;height:10px;flex-shrink:0"></div>
              <div class="k-card-title" style="margin:0">{m.name}</div>
            </div>
            {#if m.description}<div class="k-card-sub">{@html md(m.description)}</div>{/if}
            <div class="k-card-chips">
              {#if m.due_date}
                <span class="chip chip-due">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {fmtDate(m.due_date)}
                </span>
              {/if}
              {#if m.task_count}
                <span class="chip" style="background:var(--surface2);color:var(--text-mid)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><polyline points="20 6 9 17 4 12"/></svg>
                  {m.task_count}
                </span>
              {/if}
            </div>
          </div>
        {/each}
        {#if !active.length}<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:12px">None</div>{/if}
      </div>
    </div>

    <!-- Completed -->
    <div class="kanban-col col-done">
      <div class="kanban-col-hd">
        <h3><span class="status-circle"></span> Completed <span class="cnt">{closed.length}</span></h3>
      </div>
      <div class="kanban-col-sub">Achieved targets</div>
      <div class="kanban-col-body">
        {#each closed as m}
          <div class="k-card" onclick={() => selectedMilestone = { ...m }}>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div class="ms-dot ms-dot-{m.status}" style="width:10px;height:10px;flex-shrink:0"></div>
              <div class="k-card-title" style="margin:0">{m.name}</div>
            </div>
            {#if m.description}<div class="k-card-sub">{@html md(m.description)}</div>{/if}
            <div class="k-card-chips">
              {#if m.due_date}
                <span class="chip chip-due">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  {fmtDate(m.due_date)}
                </span>
              {/if}
              {#if m.task_count}
                <span class="chip" style="background:var(--surface2);color:var(--text-mid)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><polyline points="20 6 9 17 4 12"/></svg>
                  {m.task_count}
                </span>
              {/if}
            </div>
          </div>
        {/each}
        {#if !closed.length}<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:12px">None</div>{/if}
      </div>
    </div>
  </div>
{/if}

{#if selectedMilestone}
  <div class="detail-overlay" onclick={e => e.target === e.currentTarget && (selectedMilestone = null)}>
    <div class="detail-modal animate-in">
      <div class="dm-header">
        <div class="dm-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--purple)"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
        </div>
        <div class="dm-header-body">
          <h2>{selectedMilestone.name}</h2>
          <div class="dm-meta-row" style="display:flex;gap:12px">
            <span class="badge s-{selectedMilestone.status}">{selectedMilestone.status.replace('_',' ')}</span>
            {#if selectedMilestone.due_date}
              <span class="chip chip-due">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                {fmtDate(selectedMilestone.due_date)}
              </span>
            {/if}
          </div>
        </div>
        <button class="dm-close" onclick={() => selectedMilestone = null}>✕</button>
      </div>
      <div class="dm-body">
        <div class="dm-section">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
            <div class="dm-section-label">Description</div>
            <button class="btn btn-out btn-xs" onclick={() => editDesc = !editDesc}>EDIT</button>
          </div>
          {#if !editDesc}
             <div class="dm-desc" onclick={() => editDesc = true}>{@html md(selectedMilestone.description || '*No description.*')}</div>
          {:else}
             <textarea bind:value={selectedMilestone.description} onblur={() => editDesc = false} style="width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px"></textarea>
          {/if}
        </div>
        <div class="dm-field-row">
          <div class="dm-field">
            <label>Status</label>
            <select bind:value={selectedMilestone.status}>
              {#each ['pending','in_progress','completed','missed'] as s}
                <option value={s}>{s.replace('_',' ')}</option>
              {/each}
            </select>
          </div>
          <div class="dm-field">
            <label>Due Date</label>
            <input type="date" bind:value={selectedMilestone.due_date}>
          </div>
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-ghost btn-sm" style="color:var(--rose)">Delete</button>
        <button class="btn btn-acc btn-sm" onclick={saveMilestone}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}
