async function renderProject(pid) {
  const [proj, dash, tasks, milestones] = await Promise.all([
    api('GET',`/api/projects/${pid}`),
    api('GET',`/api/projects/${pid}/dashboard`),
    api('GET',`/api/projects/${pid}/tasks`),
    api('GET',`/api/projects/${pid}/milestones`),
  ]);
  setActiveProject({id:pid, name:proj.name});
  window._pid = pid;
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name}]);

  const byStatus = dash.tasks_by_status || {};
  view(`
    <div class="page-hd">
      <div>
        <h1>${esc(proj.name)}</h1>
        <div class="sub">Project overview, metrics, and latest workspace activity</div>
      </div>
      <div style="display:flex;gap:8px;margin-left:auto;align-items:center">
        <span class="badge s-${proj.status}">${proj.status}</span>
        <span class="badge p-${proj.priority}">● ${proj.priority}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteProject(${pid})" title="Delete project"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
      </div>
    </div>

    <div class="section-hd">About Project</div>
    <div class="prose-wrap" style="margin-bottom:24px; font-size:15px; line-height:1.8; color:var(--text); opacity:0.85; max-width:100%">
      ${md(proj.description || '*No detailed description provided.*')}
    </div>

    <div class="stat-row">
      <div class="stat">
        <div style="color:var(--text-mid);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
        <div class="stat-v">${dash.tasks_total}</div>
        <div class="stat-l">Total Tasks</div>
      </div>
      <div class="stat">
        <div style="color:var(--green);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="stat-v">${byStatus.done||0}</div>
        <div class="stat-l">Completed</div>
      </div>
      <div class="stat">
        <div style="color:var(--blue);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="stat-v">${byStatus.in_progress||0}</div>
        <div class="stat-l">Active</div>
      </div>
      <div class="stat">
        <div style="color:var(--purple);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></div>
        <div class="stat-v">${dash.milestones_total}</div>
        <div class="stat-l">Milestones</div>
      </div>
      <div class="stat">
        <div style="color:var(--accent);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
        <div class="stat-v">${dash.boards_total}</div>
        <div class="stat-l">Boards</div>
      </div>
      <div class="stat">
        <div style="color:var(--amber);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div>
        <div class="stat-v">${dash.ideas_total||0}</div>
        <div class="stat-l">Ideas</div>
      </div>
      <div class="stat">
        <div style="color:var(--teal);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="stat-v">${proj.progress_pct||0}%</div>
        <div class="stat-l">Progress</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:24px">
      <div>
        <div class="section-hd">Workspace Metadata</div>
        <div class="form-card">
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Project Status</label>
              <select id="p-status" onchange="patchProject(${pid},{status:this.value})" class="full">${['planning','active','on_hold','completed','archived'].map(s=>`<option value="${s}"${proj.status===s?' selected':''}>${s}</option>`).join('')}</select>
            </div>
            <div class="dm-field">
              <label>Current Priority</label>
              <select id="p-priority" onchange="patchProject(${pid},{priority:this.value})" class="full">${['low','medium','high','critical'].map(p=>`<option value="${p}"${proj.priority===p?' selected':''}>${p}</option>`).join('')}</select>
            </div>
          </div>
          <div class="dm-field-row" style="margin-top:16px">
            <div class="dm-field">
              <label>Progress Completion (%)</label>
              <div style="display:flex;align-items:center;gap:12px">
                <input type="range" value="${proj.progress_pct||0}" min="0" max="100" style="flex:1;accent-color:var(--accent)" oninput="this.nextElementSibling.value = this.value + '%'" onchange="patchProject(${pid},{progress_pct:+this.value})">
                <output style="font-family:var(--mono);font-size:13px;width:40px;text-align:right">${proj.progress_pct||0}%</output>
              </div>
            </div>
          </div>
          <div class="dm-field-row" style="margin-top:16px">
            <div class="dm-field">
              <label>Target Launch Date</label>
              <input type="date" value="${proj.target_date||''}" onchange="patchProject(${pid},{target_date:this.value})" class="full">
            </div>
          </div>
          <div style="display:flex;gap:12px;margin-top:24px;border-top:1px solid var(--border);padding-top:20px">
            <button class="btn btn-out" style="flex:1" onclick="openProjectEditModal(${pid})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg> Edit Project</button>
            <button class="btn btn-out" style="flex:1" onclick="exportProject(${pid})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> Export</button>
          </div>
        </div>

        <div class="section-hd">Top Milestones</div>
        ${milestones.length ? milestones.slice(0,5).map(m=>`
          <div class="feed-item" style="cursor:pointer" onclick="openMilestoneDetail(${pid},${m.id})">
            <div class="feed-dot dot-${m.status==='completed'?'created':m.status==='missed'?'deleted':'updated'}"></div>
            <div class="feed-body">
              <div class="feed-text">${esc(m.name)}</div>
              <div class="feed-time"><span class="badge s-${m.status}">${m.status}</span> ${m.due_date?'· Due '+fmtDate(m.due_date):''}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>`).join('') : '<div class="empty" style="padding:20px"><p>No milestones listed</p></div>'}
        <a href="#/projects/${pid}/milestones" style="font-size:12px;color:var(--accent);font-weight:600;display:block;margin:12px 4px">Expand milestones & timeline →</a>
      </div>
      <div>
        <div class="section-hd">Recent Workspace Activity</div>
        <div class="feed">
          ${dash.recent_changes.slice(0,10).map(c=>`
            <div class="feed-item">
              <div class="feed-dot dot-${c.action}"></div>
              <div class="feed-body">
                <div class="feed-text"><strong>${c.action.toUpperCase()}</strong> ${c.entity_type}${c.field_changed?' · '+c.field_changed:''}</div>
                <div class="feed-time">${timeAgo(c.timestamp)}</div>
              </div>
            </div>`).join('') || '<div style="color:var(--dim);font-size:13px;padding:20px;text-align:center">No recent activity detected.</div>'}
        </div>
      </div>
    </div>
  `);
}
window.deleteProject = async function(pid) {
  if (!confirm('Delete this project and all its data?')) return;
  await api('DELETE',`/api/projects/${pid}`);
  setActiveProject(null);
  toast('Project deleted');
  await loadSidebar();
  location.hash = '#/';
}

window.patchProject = async function(pid, data) {
  const r = await api('PATCH', `/api/projects/${pid}`, data);
  if (r.error) return toast(r.error, 'err');
  toast('Project updated');
  renderProject(pid);
};

window.openProjectEditModal = async function(pid) {
  const p = await api('GET', `/api/projects/${pid}`);
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon">📁</div>
          <div class="dm-header-body">
            <h2>Edit Project</h2>
            <div class="dm-meta"><span class="badge s-${p.status}">${p.status}</span></div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <label class="dm-section-label">Project Name</label>
            <input type="text" id="pm-name" value="${esc(p.name)}">
          </div>
          <div class="dm-section">
            <label class="dm-section-label">Description</label>
            <textarea id="pm-desc">${esc(p.description||'')}</textarea>
          </div>
        </div>
        <div class="dm-footer">
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Cancel</button>
          <button class="btn btn-acc btn-sm" onclick="saveProjectDetail(${pid})">Save Changes</button>
        </div>
      </div>
    </div>`;
};

window.saveProjectDetail = async function(pid) {
  const body = {
    name: document.getElementById('pm-name').value.trim(),
    description: document.getElementById('pm-desc').value.trim()
  };
  const r = await api('PATCH', `/api/projects/${pid}`, body);
  if (r.error) return toast(r.error, 'err');
  toast('Project updated'); 
  const closeDetailBtn = document.querySelector('.dm-close');
  if (closeDetailBtn) closeDetailBtn.click();
  else {
    const root = document.getElementById('detail-modal-root');
    if (root) root.innerHTML = '';
  }
  renderProject(pid);
};

window.exportProject = async function(pid) {
  const data = await api('GET', `/api/projects/${pid}/export`);
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project_${pid}_export.json`;
  a.click();
  toast('Project exported');
};

window.importProject = async function(input) {
  const file = input.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    const r = await api('POST', '/api/projects/import', data);
    if (r.error) return toast(r.error, 'err');
    toast('Project imported successfully');
    await loadSidebar();
    location.hash = '#/projects/' + r.id;
  } catch(e) { toast('Invalid JSON file', 'err'); }
};
