<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { md, esc, fmtDate, timeAgo } from '$lib/utils';
import { addRealtimeHandler } from '$lib/realtime.svelte';

  let project = $state({});
  let stats = $state({});
  let milestones = $state([]);
  let loading = $state(true);

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const [p, s, m] = await Promise.all([
        fetch(`/api/projects/${pid}`).then(r => r.json()),
        fetch(`/api/projects/${pid}/dashboard`).then(r => r.json()),
        fetch(`/api/projects/${pid}/milestones`).then(r => r.json())
      ]);
      project = p;
      stats = s;
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
      // Refresh dashboard on any system change or task/milestone update for this project
      if (event.type === 'system_change' || event.type === 'project_updated' || 
          event.type?.includes('task_') || event.type?.includes('milestone_')) {
        fetchData();
      }
    });
  });

  async function patchProject(data) {
    await fetch(`/api/projects/${pid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await fetchData();
  }

  async function deleteProject() {
    if (!confirm('Delete this project and all its data?')) return;
    await fetch(`/api/projects/${pid}`, { method: 'DELETE' });
    location.href = '/';
  }

  async function exportProject() {
    const data = await fetch(`/api/projects/${pid}/export`).then(r => r.json());
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${pid}_export.json`;
    a.click();
  }

  let showEditModal = $state(false);
  let editData = $state({});

  function openEdit() {
    editData = { name: project.name, description: project.description, progress_pct: project.progress_pct };
    showEditModal = true;
  }

  async function saveEdit() {
    await patchProject(editData);
    showEditModal = false;
  }
</script>

{#if loading}
  <div class="empty">Loading project context...</div>
{:else}
  <div class="page-hd">
    <div>
      <h1>{project.name}</h1>
      <div class="sub">Project overview, metrics, and latest workspace activity</div>
    </div>
    <div style="display:flex;gap:8px;margin-left:auto;align-items:center">
      <span class="badge s-{project.status}">{project.status}</span>
      <span class="badge p-{project.priority}">● {project.priority}</span>
      <button class="btn btn-ghost btn-sm" title="Delete project" onclick={deleteProject}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  </div>

  <div class="section-hd">About Project</div>
  <div class="prose-wrap" style="margin-bottom:24px; font-size:15px; line-height:1.8; color:var(--text); opacity:0.85; max-width:100%">
    {@html md(project.description || '*No detailed description provided.*')}
  </div>

  <div class="stat-row">
    <div class="stat">
      <div style="color:var(--text-mid);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
      <div class="stat-v">{stats.tasks_total || 0}</div>
      <div class="stat-l">Total Tasks</div>
    </div>
    <div class="stat">
      <div style="color:var(--green);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div class="stat-v" style="color:var(--green); text-shadow: 0 0 15px var(--green-dim)">{stats.tasks_by_status?.done || 0}</div>
      <div class="stat-l">Completed</div>
    </div>
    <div class="stat">
      <div style="color:var(--blue);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
      <div class="stat-v" style="color:var(--blue); text-shadow: 0 0 15px var(--blue-dim)">{stats.tasks_by_status?.in_progress || 0}</div>
      <div class="stat-l">Active</div>
    </div>
    <div class="stat">
      <div style="color:var(--purple);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg></div>
      <div class="stat-v">{stats.milestones_total || 0}</div>
      <div class="stat-l">Milestones</div>
    </div>
    <div class="stat">
      <div style="color:var(--accent);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
      <div class="stat-v">{stats.boards_total || 0}</div>
      <div class="stat-l">Boards</div>
    </div>
    <div class="stat">
      <div style="color:var(--amber);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div>
      <div class="stat-v">{stats.ideas_total || 0}</div>
      <div class="stat-l">Ideas</div>
    </div>
    <div class="stat">
      <div style="color:var(--teal);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
      <div class="stat-v">{project.progress_pct || 0}%</div>
      <div class="stat-l">Progress</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:24px">
    <div>
      <div class="section-hd">Workspace Metadata</div>
      <div class="form-card">
        <div class="dm-field-row">
          <div class="dm-field">
            <label for="project-status-select">Project Status</label>
            <select id="project-status-select" bind:value={project.status} onchange={() => patchProject({status: project.status})} class="full">
              {#each ['planning','active','on_hold','completed','archived'] as s}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </div>
          <div class="dm-field">
            <label for="project-priority-select">Current Priority</label>
            <select id="project-priority-select" bind:value={project.priority} onchange={() => patchProject({priority: project.priority})} class="full">
              {#each ['low','medium','high','critical'] as p}
                <option value={p}>{p}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="dm-field-row" style="margin-top:16px">
          <div class="dm-field">
            <label for="project-progress-range">Progress Completion (%)</label>
            <div style="display:flex;align-items:center;gap:12px">
              <input id="project-progress-range" type="range" bind:value={project.progress_pct} min="0" max="100" style="flex:1;accent-color:var(--accent)" 
                onchange={() => patchProject({progress_pct: +project.progress_pct})}>
              <input type="number" bind:value={project.progress_pct} min="0" max="100" class="p-val" 
                aria-label="Progress percentage"
                style="width:50px; background:var(--surface2); border:1px solid var(--border); border-radius:4px; color:var(--text); font-family:var(--mono); font-size:12px; padding:2px 4px; text-align:center"
                onchange={() => patchProject({progress_pct: +project.progress_pct})}>
              <span style="font-size:12px; color:var(--text-dim)">%</span>
            </div>
          </div>
        </div>
        <div class="dm-field-row" style="margin-top:16px">
          <div class="dm-field">
            <label for="project-target-date">Target Launch Date</label>
            <input id="project-target-date" type="date" bind:value={project.target_date} onchange={() => patchProject({target_date: project.target_date})} class="full">
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-top:24px;border-top:1px solid var(--border);padding-top:20px">
          <button class="btn btn-out" style="flex:1" onclick={openEdit}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg> 
            Edit Project
          </button>
          <button class="btn btn-out" style="flex:1" onclick={exportProject}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> 
            Export
          </button>
        </div>
      </div>

      <div class="section-hd">Top Milestones</div>
      {#if milestones.length}
        {#each milestones.slice(0,5) as m}
          <a href="/projects/{pid}/milestones" class="feed-item" style="cursor:pointer">
            <div class="feed-dot dot-{m.status === 'completed' ? 'created' : m.status === 'missed' ? 'deleted' : 'updated'}"></div>
            <div class="feed-body">
              <div class="feed-text">{m.name}</div>
              <div class="feed-time">
                <span class="badge s-{m.status}">{m.status}</span> 
                {m.due_date ? '· Due ' + fmtDate(m.due_date) : ''}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        {/each}
      {:else}
        <div class="empty" style="padding:20px"><p>No milestones listed</p></div>
      {/if}
      <a href="/projects/{pid}/milestones" style="font-size:12px;color:var(--accent);font-weight:600;display:block;margin:12px 4px">Expand milestones & timeline →</a>
    </div>

    <div>
      <div class="section-hd">Recent Workspace Activity</div>
      <div class="feed">
        {#if stats.recent_changes?.length}
          {#each stats.recent_changes.slice(0, 10) as c}
            <div class="feed-item">
              <div class="feed-dot dot-{c.action}"></div>
              <div class="feed-body">
                <div class="feed-text"><strong>{c.action.toUpperCase()}</strong> {c.entity_type}{c.field_changed ? ' · ' + c.field_changed : ''}</div>
                <div class="feed-time">{timeAgo(c.timestamp)}</div>
              </div>
            </div>
          {/each}
        {:else}
          <div style="color:var(--text-dim);font-size:13px;padding:20px;text-align:center">No recent activity detected.</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showEditModal}
  <div class="detail-overlay" role="button" tabindex="-1" onclick={e => e.target === e.currentTarget && (showEditModal = false)} onkeydown={e => e.key === 'Escape' && (showEditModal = false)}>
    <div class="detail-modal animate-in">
      <div class="dm-header">
        <div class="dm-header-icon">📁</div>
        <div class="dm-header-body">
          <h2>Edit Project</h2>
          <div class="dm-meta"><span class="badge s-{project.status}">{project.status}</span></div>
        </div>
        <button class="dm-close" onclick={() => showEditModal = false}>✕</button>
      </div>
      <div class="dm-body">
        <div class="dm-field-row">
          <div class="dm-field">
            <label for="edit-project-name" class="dm-section-label">Project Name</label>
            <input id="edit-project-name" type="text" bind:value={editData.name}>
          </div>
          <div class="dm-field">
            <label for="edit-project-progress" class="dm-section-label">Progress (%)</label>
            <input id="edit-project-progress" type="number" bind:value={editData.progress_pct} min="0" max="100" class="full">
          </div>
        </div>
        <div class="dm-section">
          <label for="edit-project-desc" class="dm-section-label">Description</label>
          <textarea id="edit-project-desc" bind:value={editData.description} style="min-height:120px"></textarea>
        </div>
      </div>
      <div class="dm-footer">
        <button class="btn btn-out btn-sm" onclick={() => showEditModal = false}>Cancel</button>
        <button class="btn btn-acc btn-sm" onclick={saveEdit}>Save Changes</button>
      </div>
    </div>
  </div>
{/if}
