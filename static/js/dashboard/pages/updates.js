async function renderUpdates(pid) {
  const [proj, updates, tasks] = await Promise.all([
    api('GET',`/api/projects/${pid}`),
    api('GET',`/api/projects/${pid}/updates`),
    api('GET',`/api/projects/${pid}/tasks`)
  ]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Updates'}]);
  
  window._project_tasks = tasks;
  window._all_updates = updates;
  const filter = window._update_filter || 'all';

  view(`
    <div class="page-hd">
      <div>
        <h1>Updates</h1>
        <div class="sub"> workspace progress and important team decisions</div>
      </div>
      <div style="margin-left:auto; display:flex; gap:8px; align-items:center">
        <select class="btn btn-out btn-sm" onchange="setUpdateFilter(this.value)" style="width:auto; padding:4px 8px">
          <option value="all" ${filter==='all'?'selected':''}>All Types</option>
          <option value="progress" ${filter==='progress'?'selected':''}>Progress</option>
          <option value="bug_fix" ${filter==='bug_fix'?'selected':''}>Bug Fixes</option>
          <option value="blocker" ${filter==='blocker'?'selected':''}>Blockers</option>
          <option value="decision" ${filter==='decision'?'selected':''}>Decisions</option>
          <option value="note" ${filter==='note'?'selected':''}>Notes</option>
        </select>
        <button class="btn btn-acc btn-sm" onclick="openPostUpdateModal(${pid})">+ Update</button>
      </div>
    </div>
    <div class="prose-wrap">
      <div id="updates-feed">
        ${updates.filter(u => filter === 'all' || u.update_type === filter).length ? updates.filter(u => filter === 'all' || u.update_type === filter).map(u=>{
          const t = tasks.find(x=>x.id===u.task_id);
          const fileCount = u.files_meta ? u.files_meta.length : 0;
          return `
          <div class="update-post">
            <div class="update-post-header">
              <span class="update-type-pill up-${u.update_type}">${u.update_type}</span>
              <span class="update-meta">${timeAgo(u.created_at)} · ${new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
              <button class="up-del-btn" onclick="deleteUpdate(${pid},${u.id})" title="Delete Update"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
            </div>
            <div class="update-body">${md(u.content)}</div>
            <div class="update-post-footer" style="margin-top:12px; display:flex; gap:12px; border-top:1px solid var(--border); padding-top:10px; font-size:11px; color:var(--mid); flex-wrap:wrap">
               ${t ? `<span title="Linked Task" style="display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(t.title)}</span>` : ''}
               ${(t && t.tags && t.tags.length) ? t.tags.map(tag => `<span class="md-tag">#${tag}</span>`).join('') : ''}
               ${fileCount > 0 ? `<span title="Files Affected" style="display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> ${fileCount} files</span>` : ''}
            </div>
          </div>`;
        }).join('') : '<div class="empty"><div class="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><p>No updates posted yet</p></div>'}
      </div>
    </div>
  `);
}

window.openPostUpdateModal = function(pid) {
  const tasks = window._project_tasks || [];
  const taskOpts = tasks.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('');
  
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--green)"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg></div>
          <div class="dm-header-body">
            <h2>Post Update</h2>
            <div class="dm-meta">Add a progress update for the team</div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Update Type</label>
              <select id="uf-type">
                <option value="progress">Progress</option>
                <option value="bug_fix">Bug Fix</option>
                <option value="blocker">Blocker</option>
                <option value="decision">Decision</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div class="dm-field">
              <label>Link to Task (Optional)</label>
              <select id="uf-task"><option value="">None</option>${taskOpts}</select>
            </div>
          </div>
          <div class="dm-section">
            <label class="dm-section-label">Content</label>
            <textarea id="uf-content" placeholder="What's happening? Supports **bold**, *italic*, \`code\`." style="min-height:120px"></textarea>
          </div>
        </div>
        <div class="dm-footer">
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Cancel</button>
          <button class="btn btn-acc btn-sm" onclick="submitUpdate(${pid})">Post Update</button>
        </div>
      </div>
    </div>`;
};

window.submitUpdate = async function(pid) {
  const content = document.getElementById('uf-content').value.trim();
  if (!content) return toast('Content required', 'err');
  
  const body = {
    content,
    update_type: document.getElementById('uf-type').value,
  };
  
  const tid = document.getElementById('uf-task').value;
  if (tid) body.task_id = +tid;

  const r = await api('POST', `/api/projects/${pid}/updates`, body);
  if (r.error) return toast(r.error, 'err');
  
  toast('Posted');
  closeDetailModal();
  renderUpdates(pid);
};
window.deleteUpdate = async function(pid,uid){ 
  if(!confirm('Delete this update?')) return;
  await api('DELETE',`/api/projects/${pid}/updates/${uid}`); 
  toast('Deleted'); 
  closeDetailModal(); 
  renderUpdates(pid); 
};

window.setUpdateFilter = function(val) {
  window._update_filter = val;
  const pid = window._pid;
  if(pid) renderUpdates(pid);
};

// SSE hooks
window.refreshUpdatesIfActive = function(pid) {
  if (window._pid === pid && location.hash.includes('/updates')) {
    renderUpdates(pid);
  }
};

window.openUpdateDetail = async function(pid, uid) {
  const [updates, tasks] = await Promise.all([
    api('GET',`/api/projects/${pid}/updates`),
    window._project_tasks ? Promise.resolve(window._project_tasks) : api('GET',`/api/projects/${pid}/tasks`)
  ]);
  const u = updates.find(x=>x.id===uid);
  if (!u) return;
  const t = tasks.find(x=>x.id===u.task_id);

  const iconMap = {progress:'🟢',bug_fix:'🐛',blocker:'🔴',decision:'🟣',note:'⚪'};
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon">${iconMap[u.update_type]||'📝'}</div>
          <div class="dm-header-body">
            <h2>${u.update_type.replace('_',' ').charAt(0).toUpperCase()+u.update_type.replace('_',' ').slice(1)} Update</h2>
            <div class="dm-meta">
              <span class="update-type-pill up-${u.update_type}">${u.update_type}</span>
              <span class="update-meta">${new Date(u.created_at).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
            </div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <div class="dm-section-label">Content</div>
            <div class="dm-desc" style="font-size:15px;line-height:1.7">${md(u.content)}</div>
          </div>
          ${t ? `<div class="dm-section-label">Linked Task</div>
                 <div style="font-size:14px;color:var(--text);margin-bottom:6px;display:flex;align-items:center;gap:6px">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${esc(t.title)}
                 </div>
                 ${(t.tags && t.tags.length) ? `<div style="display:flex;gap:4px;margin-bottom:16px">${t.tags.map(tag => `<span class="md-tag">#${tag}</span>`).join('')}</div>` : '<div style="margin-bottom:16px"></div>'}` : ''}
          ${renderFilesMeta(u.files_meta, pid, u.task_id || -1)}
        </div>
        <div class="dm-footer">
          <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="deleteUpdate(${pid},${uid})">Delete</button>
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Close</button>
        </div>
      </div>
    </div>`;
};
