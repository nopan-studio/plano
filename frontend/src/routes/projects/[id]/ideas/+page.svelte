<script>
  import { page } from '$app/state';
  import { md, esc } from '$lib/utils';

  let ideas = $state([]);
  let loading = $state(true);
  let showForm = $state(false);

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

  $effect(() => {
    if (pid) fetchData();
  });

  async function voteIdea(iid) {
    await fetch(`/api/ideas/${iid}/vote`, { method: 'POST' });
    fetchData();
  }

  let selectedIdea = $state(null);
</script>

<div class="page-hd">
  <div>
    <h1>Ideas</h1>
    <div class="sub">Store and vote on potential workspace features and future plans</div>
  </div>
  <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick={() => showForm = !showForm}>+ New Idea</button>
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
  {:else if ideas.length}
    <div class="idea-post-list">
      {#each ideas as i}
        <div class="idea-post" onclick={() => selectedIdea = { ...i }}>
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
      <p>No ideas yet</p>
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
          <div class="dm-section-label">Description</div>
          <div class="dm-desc">{@html md(selectedIdea.description || '*No description.*')}</div>
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-ghost btn-sm" style="color:var(--rose)">Delete</button>
        <button class="btn btn-out btn-sm" onclick={() => selectedIdea = null}>Close</button>
      </div>
    </div>
  </div>
{/if}
