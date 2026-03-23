<script>
  import { page } from '$app/state';
  import { md, esc } from '$lib/utils';

  let ideas = $state([]);
  let loading = $state(true);
  let statusTab = $state('active'); // active, archive, graveyard
  let showForm = $state(false);
  let milestones = $state([]);
  let selectedIdea = $state(null);
  let editDesc = $state(false);

  let filteredIdeas = $derived(
    statusTab === 'archive' 
      ? ideas.filter(i => i.status === 'implemented')
      : statusTab === 'graveyard'
        ? ideas.filter(i => i.status === 'rejected')
        : ideas.filter(i => ['new', 'exploring', 'accepted'].includes(i.status) || !['implemented', 'rejected'].includes(i.status))
  );

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const resp = await fetch(`/api/ideas?project_id=${pid}`);
      ideas = await resp.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function fetchMilestones() {
    if (!pid) return;
    try {
      const resp = await fetch(`/api/projects/${pid}/milestones`);
      milestones = await resp.json();
    } catch(e) { console.error(e); }
  }

  $effect(() => {
    if (pid) {
      fetchData();
      fetchMilestones();
    }
  });

  async function voteIdea(iid) {
    await fetch(`/api/ideas/${iid}/vote`, { method: 'POST' });
    fetchData();
  }

  async function saveIdeaDetail() {
    if (!selectedIdea) return;
    try {
      const resp = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedIdea.status,
          description: selectedIdea.description,
          milestone_id: selectedIdea.milestone_id || -1
        })
      });
      const updated = await resp.json();
      const idx = ideas.findIndex(i => i.id === selectedIdea.id);
      if (idx !== -1) ideas[idx] = updated;
      selectedIdea = null;
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteIdea(id) {
    if (!confirm("Delete this idea?")) return;
    try {
      await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
      ideas = ideas.filter(i => i.id !== id);
      selectedIdea = null;
    } catch (e) {
      console.error(e);
    }
  }


</script>

<div class="page-hd">
  <div>
    <h1>Ideas</h1>
    <div class="sub">Store and vote on potential workspace features and future plans</div>
  </div>
  <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick={() => showForm = !showForm}>+ New Idea</button>
</div>

<div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; margin-top:24px; margin-bottom:16px">
  <div style="display:flex; gap:12px; font-size:12px">
    <button class="btn btn-out btn-xs {statusTab === 'active' ? 'act' : ''}" onclick={() => statusTab = 'active'}>
      Active Ideas
      <span style="opacity:0.6; margin-left:4px">({ideas.filter(i => !['implemented', 'rejected'].includes(i.status)).length})</span>
    </button>
    <button class="btn btn-out btn-xs {statusTab === 'archive' ? 'act' : ''}" onclick={() => statusTab = 'archive'}>
      Implemented
      <span style="opacity:0.6; margin-left:4px">({ideas.filter(i => i.status === 'implemented').length})</span>
    </button>
    <button class="btn btn-out btn-xs {statusTab === 'graveyard' ? 'act' : ''}" onclick={() => statusTab = 'graveyard'}>
      Graveyard
      <span style="opacity:0.6; margin-left:4px">({ideas.filter(i => i.status === 'rejected').length})</span>
    </button>
  </div>
</div>

{#if showForm}
  <div class="form-card animate-in">
    <h3>New Idea</h3>
    <div class="dm-section">
      <label class="dm-section-label">Title</label>
      <input type="text" placeholder="Idea title">
    </div>
    <div class="dm-section">
      <label class="dm-section-label">Description</label>
      <textarea placeholder="Describe your idea..." style="min-height:120px"></textarea>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-acc btn-sm">Submit Idea</button>
      <button class="btn btn-out btn-sm" onclick={() => showForm = false}>Cancel</button>
    </div>
  </div>
{/if}

<div class="prose-wrap">
  {#if loading}
    <div class="empty">Loading ideas...</div>
  {:else if filteredIdeas.length}
    <div class="idea-post-list">
      {#each filteredIdeas as i}
        <div class="idea-post" onclick={() => selectedIdea = { ...i }}>
          <div class="idea-post-header">
            <div class="idea-post-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              {i.title}
            </div>
            <span class="badge s-{i.status}">{i.status}</span>
            {#if i.milestone_id}
              {@const m = milestones.find(ms => ms.id === i.milestone_id)}
              {#if m}
                <span style="font-size:10px; opacity:0.6; display:flex; align-items:center; gap:3px">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  {m.name}
                </span>
              {/if}
            {/if}
          </div>
          {#if i.description}
            <div class="idea-post-desc">{@html md(i.description)}</div>
          {/if}
          <div class="idea-post-footer">
            <button class="vote-btn" onclick={(e) => { e.stopPropagation(); voteIdea(i.id); }}>▲ {i.votes} votes</button>
            {#each (i.tags || []) as t}
              <span class="chip" style="background:var(--surface2);color:var(--text-mid)">{t}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty">
      <div class="icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      </div>
      <p>No {statusTab} ideas yet</p>
    </div>
  {/if}
</div>

{#if selectedIdea}
  <div class="detail-overlay" onclick={e => e.target === e.currentTarget && (selectedIdea = null)}>
    <div class="detail-modal animate-in">
      <div class="dm-header">
        <div class="dm-header-icon">💡</div>
        <div class="dm-header-body">
          <h2>{selectedIdea.title}</h2>
          <div class="dm-meta">
            <span class="badge s-{selectedIdea.status}">{selectedIdea.status}</span>
          </div>
        </div>
        <button class="dm-close" onclick={() => selectedIdea = null}>✕</button>
      </div>
      <div class="dm-body">
        <div class="dm-section">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
            <div class="dm-section-label">Description</div>
            <button class="btn btn-out btn-xs dm-edit-btn" style="font-size:10px; padding:2px 8px; font-weight:700" onclick={() => editDesc = !editDesc}>EDIT</button>
          </div>
          {#if !editDesc}
            <div class="dm-desc" style="background:var(--surface); border:1px solid var(--border2); padding:12px; border-radius:var(--r); min-height:60px; cursor:pointer" onclick={() => editDesc = true}>
              {@html md(selectedIdea.description || 'No description.')}
            </div>
          {:else}
            <textarea class="dm-field" bind:value={selectedIdea.description} style="width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px" onblur={() => editDesc = false}></textarea>
          {/if}
        </div>
        <div class="dm-field-row">
          <div class="dm-field">
            <label>Status</label>
            <select bind:value={selectedIdea.status} class="full">
              {#each ['new','exploring','accepted','implemented','rejected'] as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
          <div class="dm-field">
            <label>Link to Milestone</label>
            <select bind:value={selectedIdea.milestone_id} class="full">
              <option value={-1}>No Milestone</option>
              {#each milestones as m}
                <option value={m.id}>{m.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick={() => deleteIdea(selectedIdea.id)}>Delete</button>
        <button class="btn btn-acc btn-sm" onclick={saveIdeaDetail}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}
