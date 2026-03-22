<script>
  import { onMount } from 'svelte';
  import { esc, md } from '$lib/utils';

  let ideas = $state([]);
  let loading = $state(true);
  let filter = $state('all'); // all, or null/none
  let selectedIdea = $state(null);
  let editDesc = $state(false);
  let showNewModal = $state(false);
  let newIdea = $state({ title: '', description: '', project_id: null });

  async function fetchIdeas() {
    loading = true;
    try {
      const url = filter === 'global' ? '/api/ideas?project_id=null' : '/api/ideas';
      const resp = await fetch(url);
      ideas = await resp.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  // Effect to re-fetch when filter changes
  $effect(() => {
    filter;
    fetchIdeas();
  });

  onMount(fetchIdeas);

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
          project_id: selectedIdea.project_id
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

<div style="display:flex; gap:12px; margin-bottom:16px; font-size:12px">
  <button class="btn btn-out btn-xs {filter === 'all' ? 'act' : ''}" onclick={() => filter = 'all'}>All Ideas</button>
  <button class="btn btn-out btn-xs {filter === 'global' ? 'act' : ''}" onclick={() => filter = 'global'}>Global Only</button>
</div>

<div class="prose-wrap">
  <div class="idea-post-list">
    {#each ideas as i (i.id)}
      <div class="idea-post" onclick={() => openIdeaDetail(i)} style="view-transition-name: idea-post-{i.id}">
        <div class="idea-post-header">
          <div class="idea-post-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> 
            {i.title}
          </div>
          <span class="badge s-{i.status}">{i.status}</span>
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
    {#if ideas.length === 0 && !loading}
      <div class="empty">
        <div class="icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </div>
        <p>No ideas yet</p>
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
            <select bind:value={selectedIdea.status}>
              {#each ['new','exploring','accepted','rejected'] as s}
                <option value={s}>{s}</option>
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
