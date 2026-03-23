<script>
  import { onMount } from 'svelte';
  import { esc, md } from '$lib/utils';
import { addRealtimeHandler } from '$lib/realtime.svelte';

  let ideas = $state([]);
  let loading = $state(true);
  let filter = $state('all'); // all, or null/none
  let statusTab = $state('active'); // active, archive, graveyard
  let selectedIdea = $state(null);
  let editDesc = $state(false);
  let milestones = $state([]);
  let projects = $state([]);
  let newIdea = $state({ title: '', description: '', project_id: null, milestone_id: null });

  let filteredIdeas = $derived(
    statusTab === 'archive' 
      ? ideas.filter(i => i.status === 'implemented')
      : statusTab === 'graveyard'
        ? ideas.filter(i => i.status === 'rejected')
        : ideas.filter(i => ['new', 'exploring', 'accepted'].includes(i.status) || !['implemented', 'rejected'].includes(i.status))
  );

  async function fetchMilestones() {
    try {
      const resp = await fetch('/api/milestones');
      milestones = await resp.json();
    } catch (e) { console.error(e); }
  }

  async function fetchProjects() {
    try {
      const resp = await fetch('/api/projects');
      projects = await resp.json();
    } catch (e) { console.error(e); }
  }

  async function fetchData() {
    loading = true;
    await Promise.all([fetchIdeas(), fetchMilestones(), fetchProjects()]);
    loading = false;
  }

  $effect(() => {
    filter;
    fetchIdeas();
  });

  onMount(() => {
    fetchData();
    return addRealtimeHandler((event) => {
      if (event.type?.startsWith('idea_')) {
        fetchIdeas(); // Just refresh the ideas list
      }
    });
  });

  function openIdeaDetail(idea) {
    selectedIdea = { ...idea };
    editDesc = false;
  }

  function closeDetailModal() {
    selectedIdea = null;
    showNewModal = false;
  }

  async function voteIdea(id) {
    try {
      await fetch(`/api/ideas/${id}/vote`, { method: 'POST' });
      const idx = ideas.findIndex(i => i.id === id);
      if (idx !== -1) ideas[idx].votes++;
      if (selectedIdea && selectedIdea.id === id) selectedIdea.votes++;
    } catch (e) {
      console.error(e);
    }
  }

  async function createIdea() {
    if (!newIdea.title.trim()) return;
    try {
      const resp = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      });
      const idea = await resp.json();
      ideas = [idea, ...ideas];
      closeDetailModal();
      newIdea = { title: '', description: '', project_id: null };
    } catch (e) {
      console.error(e);
    }
  }

  async function saveIdeaDetail() {
    if (!selectedIdea) return;
    try {
      const resp = await fetch(`/api/ideas/${selectedIdea.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: selectedIdea.description,
          status: selectedIdea.status,
          project_id: selectedIdea.project_id === -1 ? null : selectedIdea.project_id,
          milestone_id: selectedIdea.milestone_id === -1 ? null : selectedIdea.milestone_id
        })
      });
      const updated = await resp.json();
      const idx = ideas.findIndex(i => i.id === selectedIdea.id);
      if (idx !== -1) ideas[idx] = updated;
      closeDetailModal();
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteIdea(id) {
    if (!confirm("Delete this idea?")) return;
    try {
      await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
      ideas = ideas.filter(i => i.id !== id);
      closeDetailModal();
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="page-hd">
  <div>
    <h1>All Ideas</h1>
    <div class="sub">Store and vote on potential workspace features and future plans</div>
  </div>
  <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick={() => showNewModal = true}>+ New Idea</button>
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

  <div style="display:flex; gap:6px; font-size:11px; align-items:center">
    <span style="color:var(--mid); font-weight:600; text-transform:uppercase; letter-spacing:0.05em">Filter:</span>
    <button class="btn btn-ghost btn-xs {filter === 'all' ? 'act' : ''}" style="padding:2px 8px; border-radius:4px" onclick={() => filter = 'all'}>All</button>
    <button class="btn btn-ghost btn-xs {filter === 'global' ? 'act' : ''}" style="padding:2px 8px; border-radius:4px" onclick={() => filter = 'global'}>Global</button>
  </div>
</div>

<div class="prose-wrap">
  <div class="idea-post-list">
    {#each filteredIdeas as i (i.id)}
      <div class="idea-post" onclick={() => openIdeaDetail(i)} style="view-transition-name: idea-post-{i.id}">
        <div class="idea-post-header">
          <div class="idea-post-title">
            {i.title}
          </div>
          <div style="display:flex; gap:6px; align-items:center">
            {#if i.project_id}
              {@const p = projects.find(pr => pr.id === i.project_id)}
              {#if p}
                <span style="font-size:10px; padding:1px 6px; background:var(--surf2); border-radius:10px; color:var(--mid)">{p.name}</span>
              {/if}
            {/if}
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
        </div>
        {#if i.description}
          <div class="idea-post-desc">{@html md(i.description)}</div>
        {/if}
        <div class="idea-post-footer">
          <button class="vote-btn" onclick={(e) => { e.stopPropagation(); voteIdea(i.id); }}>▲ {i.votes} votes</button>
          {#if i.tags}
            {#each i.tags as t}
              <span class="chip" style="background:var(--surf2);color:var(--mid)">{t}</span>
            {/each}
          {/if}
        </div>
      </div>
    {/each}
    {#if filteredIdeas.length === 0 && !loading}
      <div class="empty">
        <div class="icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </div>
        <p>No {statusTab} ideas found</p>
      </div>
    {/if}
  </div>
</div>

{#if showNewModal}
  <div class="detail-overlay" onclick={(e) => e.target === e.currentTarget && closeDetailModal()}>
    <div class="detail-modal">
      <div class="dm-header">
        <div class="dm-header-icon">💡</div>
        <div class="dm-header-body">
          <h2>New Idea</h2>
          <div class="dm-meta">Share your thoughts for the project</div>
        </div>
        <button class="dm-close" onclick={closeDetailModal}>✕</button>
      </div>
      <div class="dm-body">
        <div class="dm-section">
          <label class="dm-section-label">Title</label>
          <input type="text" bind:value={newIdea.title} placeholder="Idea title">
        </div>
        <div class="dm-section">
          <label class="dm-section-label">Description</label>
          <textarea bind:value={newIdea.description} placeholder="Describe your idea..." style="min-height:120px"></textarea>
        </div>
        <div class="dm-field-row">
          <div class="dm-field">
            <label>Project</label>
            <select bind:value={newIdea.project_id} class="full">
              <option value={null}>Global (No Project)</option>
              {#each projects as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>
          {#if newIdea.project_id}
            <div class="dm-field">
              <label>Milestone</label>
              <select bind:value={newIdea.milestone_id} class="full">
                <option value={null}>No Milestone</option>
                {#each milestones.filter(m => m.project_id === newIdea.project_id) as m}
                  <option value={m.id}>{m.name}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-out btn-sm" onclick={closeDetailModal}>Cancel</button>
        <button class="btn btn-acc btn-sm" onclick={createIdea}>Submit Idea</button>
      </div>
    </div>
  </div>
{/if}

{#if selectedIdea}
  <div class="detail-overlay" onclick={(e) => e.target === e.currentTarget && closeDetailModal()}>
    <div class="detail-modal">
      <div class="dm-header">
        <div class="dm-header-icon">💡</div>
        <div class="dm-header-body">
          <h2>{selectedIdea.title}</h2>
          <div class="dm-meta">
            <span class="badge s-{selectedIdea.status}">{selectedIdea.status}</span>
            <button class="vote-btn" onclick={() => voteIdea(selectedIdea.id)}>▲ {selectedIdea.votes} votes</button>
          </div>
        </div>
        <button class="dm-close" onclick={closeDetailModal}>✕</button>
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
        </div>
        <div class="dm-field-row">
          <div class="dm-field">
            <label>Project</label>
            <select bind:value={selectedIdea.project_id} class="full">
              <option value={-1}>Global (No Project)</option>
              {#each projects as p}
                <option value={p.id}>{p.name}</option>
              {/each}
            </select>
          </div>
          {#if selectedIdea.project_id && selectedIdea.project_id !== -1}
            <div class="dm-field">
              <label>Milestone</label>
              <select bind:value={selectedIdea.milestone_id} class="full">
                <option value={-1}>No Milestone</option>
                {#each milestones.filter(m => m.project_id === selectedIdea.project_id) as m}
                  <option value={m.id}>{m.name}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick={() => deleteIdea(selectedIdea.id)}>Delete</button>
        <button class="btn btn-acc btn-sm" onclick={saveIdeaDetail}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}
