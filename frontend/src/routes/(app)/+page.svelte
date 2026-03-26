<script>
  import { onMount } from 'svelte';
  import { toast } from '$lib/toast.svelte';
  import ProjectModal from '$lib/components/ProjectModal.svelte';

  let projects = $state([]);
  let loading = $state(true);
  let showModal = $state(false);
  let newProject = $state({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium'
  });
  let systemHealth = $state(null);

  let totalTasks = $derived(projects.reduce((s, p) => s + (p.task_count || 0), 0));
  let totalActive = $derived(projects.filter(p => p.status === 'active').length);
  let totalDone = $derived(projects.filter(p => p.status === 'completed').length);

  async function fetchData() {
    try {
      const resp = await fetch('/api/projects');
      projects = await resp.json();
    } catch (e) {
      console.error("Failed to fetch projects", e);
    } finally {
      loading = false;
    }
  }

  async function fetchHealth() {
    try {
      const resp = await fetch('/health');
      if (resp.ok) {
        systemHealth = await resp.json();
      }
    } catch (e) {
      console.error("Failed to fetch health info", e);
    }
  }

  async function handleCreate(result) {
    if (result && result.project) {
      // Direct update from import
      projects = [result.project, ...projects];
      showModal = false;
      return;
    }

    try {
      const resp = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      });
      
      if (resp.ok) {
        const res = await resp.json();
        toast.success(`Project "${newProject.name}" created!`);
        showModal = false;
        newProject = { name: '', description: '', status: 'planning', priority: 'medium' };
        projects = [res, ...projects];
      } else {
        const err = await resp.json();
        toast.error(err.error || "Failed to create project");
      }
    } catch (e) {
      toast.error("Network error creating project");
    }
  }

  onMount(() => {
    fetchData();
    fetchHealth();
  });
</script>

<div class="page-hd">
  <div>
    <h1>Dashboard</h1>
    <div class="sub">Comprehensive view of all active workspaces and team velocity</div>
  </div>
  <div style="display:flex; gap:8px; margin-left:auto">
    <button class="btn btn-out btn-sm" onclick={() => { showModal = true; /* the modal has the import button inside */ }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Import
    </button>
    <button class="btn btn-acc btn-sm" onclick={() => showModal = true}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M12 5v14M5 12h14"/></svg> 
      New Project
    </button>
  </div>
</div>

{#if showModal}
  <ProjectModal 
    bind:project={newProject} 
    onClose={() => showModal = false} 
    onSave={handleCreate} 
  />
{/if}

<div class="stat-row">
  <div class="stat">
    <div style="color:var(--text-mid);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg></div>
    <div class="stat-v">{projects.length}</div>
    <div class="stat-l">Workspaces</div>
  </div>
  <div class="stat">
    <div style="color:var(--blue);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
    <div class="stat-v" style="color:var(--blue); text-shadow:0 0 15px var(--blue-dim)">{totalActive}</div>
    <div class="stat-l">Active</div>
  </div>
  <div class="stat">
    <div style="color:var(--green);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
    <div class="stat-v" style="color:var(--green); text-shadow:0 0 15px var(--green-dim)">{totalDone}</div>
    <div class="stat-l">Completed</div>
  </div>
  <div class="stat">
    <div style="color:var(--accent);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
    <div class="stat-v">{totalTasks}</div>
    <div class="stat-l">Total Tasks</div>
  </div>
  <div class="stat">
    <div style="color:var(--amber);margin-bottom:8px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
        <path d="M3 12A9 3 0 0 0 21 12"></path>
      </svg>
    </div>
    <div class="stat-v" style="color:var(--amber); text-shadow:0 0 15px var(--amber-dim); font-size: 18px; margin-top: 10px;">
      {systemHealth ? (systemHealth.engine === 'postgresql' ? 'PostgreSQL' : 'SQLite') : '...'}
    </div>
    <div class="stat-l">Database</div>
  </div>
</div>

<div class="cards" id="project-cards" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
  {#if loading}
    <div class="empty" style="grid-column: 1/-1;">Loading projects...</div>
  {:else if projects.length > 0}
    {#each projects as p}
      {@const byStatus = p.tasks_by_status || {}}
      {@const done = byStatus.done || 0}
      {@const total = p.task_count || 0}
      {@const pct = total ? Math.round((done/total)*100) : 0}
      
      <a href="/projects/{p.id}" class="card" style="display:flex; flex-direction:column; min-height:200px; padding:24px; text-decoration:none; color:inherit; height:100%">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div class="card-title" style="font-size:16px; margin-bottom:0">{p.name}</div>
          <span class="badge s-{p.status}">{p.status}</span>
        </div>
        <div class="card-desc" style="max-height: 40px; margin-bottom:16px;">{p.description||'No description provided.'}</div>
        
        <div style="margin-top:auto">
          <div style="display:flex; gap:16px; margin-bottom:16px;">
             <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
               <span>{p.task_count||0}</span>
             </div>
             <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
               <span>{p.milestone_count||0}</span>
             </div>
             <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
               <span>{p.board_count||0}</span>
             </div>
             <div style="margin-left:auto; display:flex; align-items:center; gap:4px;">
               <span class="badge p-{p.priority}" style="font-size:9px">● {p.priority}</span>
             </div>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-bottom:6px; font-family:var(--mono);">
            <span>PROG: {p.progress_pct||0}%</span>
            <span>TASK VELO: {pct}%</span>
          </div>
          <div class="prog" style="height:6px; border-radius:3px; background:var(--surface2)">
            <div class="prog-bar" style="width:{p.progress_pct||0}%; background:var(--accent); box-shadow:0 0 8px var(--accent-glow)"></div>
          </div>
        </div>
      </a>
    {/each}
  {:else}
    <div class="empty" style="grid-column: 1/-1;">
      <div class="icon">📁</div>
      <p>No projects yet. Create one above.</p>
    </div>
  {/if}
</div>

<style>
  /* Use global dashboard.css */
</style>
