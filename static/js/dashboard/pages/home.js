async function renderHome() {
  setBreadcrumb([{label:'Dashboard'}]);
  setPageTitle('Dashboard');
  await loadSidebar();
  const projects = _projects;

  const totalTasks = projects.reduce((s,p)=>s+(p.task_count||0),0);
  const totalActive = projects.filter(p=>p.status==='active').length;
  const totalDone = projects.filter(p=>p.status==='completed').length;

  view(`
    <div class="page-hd">
      <div>
        <h1>Dashboard</h1>
        <div class="sub">Comprehensive view of all active workspaces and team velocity</div>
      </div>
      <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick="openProjectCreateModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M12 5v14M5 12h14"/></svg> New Project</button>
    </div>

    <div class="stat-row">
      <div class="stat">
        <div style="color:var(--text-mid);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg></div>
        <div class="stat-v">${projects.length}</div>
        <div class="stat-l">Workspaces</div>
      </div>
      <div class="stat">
        <div style="color:var(--blue);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
        <div class="stat-v">${totalActive}</div>
        <div class="stat-l">Active</div>
      </div>
      <div class="stat">
        <div style="color:var(--green);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <div class="stat-v">${totalDone}</div>
        <div class="stat-l">Completed</div>
      </div>
      <div class="stat">
        <div style="color:var(--accent);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
        <div class="stat-v">${totalTasks}</div>
        <div class="stat-l">Total Tasks</div>
      </div>
    </div>

    <div class="cards" id="project-cards" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
      ${projects.length ? projects.map(p => {
        const byStatus = p.tasks_by_status || {};
        const done = byStatus.done || 0;
        const total = p.task_count || 0;
        const pct = total ? Math.round((done/total)*100) : 0;
        
        return `
        <div class="card" onclick="location.hash='#/projects/${p.id}'" style="display:flex; flex-direction:column; min-height:200px; padding:24px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div class="card-title" style="font-size:16px; margin-bottom:0">${esc(p.name)}</div>
            <span class="badge s-${p.status}">${p.status}</span>
          </div>
          <div class="card-desc" style="max-height: 40px; margin-bottom:16px;">${esc(p.description||'No description provided.')}</div>
          
          <div style="margin-top:auto">
            <div style="display:flex; gap:16px; margin-bottom:16px;">
               <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                 <span>${p.task_count||0}</span>
               </div>
               <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                 <span>${p.milestone_count||0}</span>
               </div>
               <div style="display:flex; align-items:center; gap:6px; color:var(--text-mid); font-size:12px;">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                 <span>${p.board_count||0}</span>
               </div>
               <div style="margin-left:auto; display:flex; align-items:center; gap:4px;">
                 <span class="badge p-${p.priority}" style="font-size:9px">● ${p.priority}</span>
               </div>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-bottom:6px; font-family:var(--mono);">
              <span>PROG: ${p.progress_pct||0}%</span>
              <span>DONE PROJECTS: ${pct}%</span>
            </div>
            <div class="prog" style="height:6px; border-radius:3px; background:var(--surface2)">
              <div class="prog-bar" style="width:${p.progress_pct||0}%; background:var(--accent); box-shadow:0 0 8px var(--accent-glow)"></div>
            </div>
          </div>
        </div>
      `}).join('') : '<div class="empty" style="grid-column: 1/-1;"><div class="icon">📁</div><p>No projects yet. Create one above.</p></div>'}
    </div>
  `);
}

window.openProjectCreateModal = function() {
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon">📁</div>
          <div class="dm-header-body">
            <h2>Create New Project</h2>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <label class="dm-section-label">Project Name</label>
            <input type="text" id="np-name" placeholder="Enter project name">
          </div>
          <div class="dm-section">
            <label class="dm-section-label">Priority</label>
            <select id="np-priority" class="full">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="dm-section">
            <label class="dm-section-label">Description</label>
            <textarea id="np-desc" placeholder="A brief overview of the project"></textarea>
          </div>
        </div>
        <div class="dm-footer">
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Cancel</button>
          <button class="btn btn-acc btn-sm" onclick="saveNewProject()">Create Project</button>
        </div>
      </div>
    </div>`;
};

window.saveNewProject = async function() {
  const name = document.getElementById('np-name').value.trim();
  if (!name) return toast('Name required', 'err');
  const d = await api('POST', '/api/projects', {
    name, 
    priority: document.getElementById('np-priority').value,
    description: document.getElementById('np-desc').value.trim(),
    status: 'planning'
  });
  if (d.error) return toast(d.error, 'err');
  toast('Project created!');
  const closeDetailBtn = document.querySelector('.dm-close');
  if (closeDetailBtn) closeDetailBtn.click();
  else {
    const root = document.getElementById('detail-modal-root');
    if (root) root.innerHTML = '';
  }
  await loadSidebar();
  location.hash = '#/projects/' + d.id;
};
