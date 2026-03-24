<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { md, esc, timeAgo } from '$lib/utils';
import { addRealtimeHandler } from '$lib/realtime.svelte';

  let project = $state({});
  let updates = $state([]);
  let tasks = $state([]);
  let loading = $state(true);
  let filter = $state('all');
  let showForm = $state(false);

  const pid = $derived(page.params.id);

  async function fetchData(silent = false) {
    if (!pid) return;
    if (!silent) loading = true;
    try {
      const [p, u, t] = await Promise.all([
        fetch(`/api/projects/${pid}`).then(r => r.json()),
        fetch(`/api/projects/${pid}/updates`).then(r => r.json()),
        fetch(`/api/projects/${pid}/tasks`).then(r => r.json())
      ]);
      project = p;
      updates = u;
      tasks = t;
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) loading = false;
    }
  }

  $effect(() => {
    if (pid) fetchData();
  });

  onMount(() => {
    return addRealtimeHandler((event) => {
      if (event.type?.startsWith('update_') || event.type?.startsWith('task_')) {
        fetchData(true);
      }
    });
  });

  const filteredUpdates = $derived(updates.filter(u => filter === 'all' || u.update_type === filter));

  function getTask(tid) {
    return tasks.find(x => x.id === tid);
  }

  async function deleteUpdate(uid) {
    if(!confirm('Delete this update?')) return;
    await fetch(`/api/projects/${pid}/updates/${uid}`, { method: 'DELETE' });
    await fetchData(true);
  }
</script>

<div class="page-hd">
  <div>
    <h1>Updates</h1>
    <div class="sub"> workspace progress and important team decisions</div>
  </div>
  <div style="margin-left:auto; display:flex; gap:8px; align-items:center">
    <select class="btn btn-out btn-sm" bind:value={filter} style="width:auto; padding:4px 8px">
      <option value="all">All Types</option>
      <option value="progress">Progress</option>
      <option value="bug_fix">Bug Fixes</option>
      <option value="blocker">Blockers</option>
      <option value="decision">Decisions</option>
      <option value="note">Notes</option>
    </select>
    <button class="btn btn-acc btn-sm" onclick={() => showForm = !showForm}>+ Update</button>
  </div>
</div>

{#if showForm}
  <div class="form-card animate-in">
    <h3>Post Update</h3>
    <div class="form-row">
      <div class="dm-field">
         <label>Update Type</label>
         <select class="full">
            <option value="progress">Progress</option>
            <option value="bug_fix">Bug Fix</option>
            <option value="blocker">Blocker</option>
            <option value="decision">Decision</option>
            <option value="note">Note</option>
         </select>
      </div>
      <div class="dm-field">
         <label>Link to Task (Optional)</label>
         <select class="full">
            <option value="">None</option>
            {#each tasks as t}
              <option value={t.id}>{t.title}</option>
            {/each}
         </select>
      </div>
    </div>
    <div class="dm-section">
      <label class="dm-section-label">Content</label>
      <textarea placeholder="What's happening? Supports **bold**, *italic*, \`code\`." style="min-height:120px"></textarea>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-acc btn-sm">Post Update</button>
      <button class="btn btn-out btn-sm" onclick={() => showForm = false}>Cancel</button>
    </div>
  </div>
{/if}

<div class="prose-wrap">
  <div id="updates-feed">
    {#if loading}
      <div class="empty">Loading updates...</div>
    {:else if filteredUpdates.length}
      {#each filteredUpdates as u}
        {@const t = getTask(u.task_id)}
        <div class="update-post">
          <div class="update-post-header">
            <span class="update-type-pill up-{u.update_type}">{u.update_type}</span>
            <span class="update-meta">{timeAgo(u.created_at)} · {new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
            <button class="up-del-btn" onclick={() => deleteUpdate(u.id)} title="Delete Update">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
          <div class="update-body">{@html md(u.content)}</div>
          <div class="update-post-footer" style="margin-top:12px; display:flex; gap:12px; border-top:1px solid var(--border); padding-top:10px; font-size:11px; color:var(--text-mid); flex-wrap:wrap">
            {#if t}
              <span title="Linked Task" style="display:flex;align-items:center;gap:4px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {t.title}
              </span>
              {#each (t.tags || []) as tag}
                <span class="md-tag">#{tag}</span>
              {/each}
            {/if}

          </div>
        </div>
      {/each}
    {:else}
      <div class="empty">
        <div class="icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <p>No updates posted yet</p>
      </div>
    {/if}
  </div>
</div>
