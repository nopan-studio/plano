async function renderMilestones(pid) {
  const [proj, ms] = await Promise.all([api('GET',`/api/projects/${pid}`), api('GET',`/api/projects/${pid}/milestones`)]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Milestones'}]);
  setPageTitle('Milestones • ' + proj.name);
  window._milestones_data = ms;

  const pending = ms.filter(m=>m.status==='pending');
  const active = ms.filter(m=>m.status==='in_progress');
  const closed = ms.filter(m=>m.status==='completed'||m.status==='missed');

  function mCard(m) {
    const dotClass = 'ms-dot-'+m.status;
    return `<div class="k-card" onclick="openMilestoneDetail(${pid},${m.id})">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <div class="ms-dot ${dotClass}" style="width:10px;height:10px;flex-shrink:0"></div>
        <div class="k-card-title" style="margin:0">${esc(m.name)}</div>
      </div>
      ${m.description?`<div class="k-card-sub">${md(m.description)}</div>`:``}
      <div class="k-card-chips">
        ${m.due_date?`<span class="chip chip-due"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> ${fmtDate(m.due_date)}</span>`:``}
        ${m.task_count?`<span class="chip" style="background:var(--surf2);color:var(--mid)"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><polyline points="20 6 9 17 4 12"/></svg> ${m.task_count}</span>`:``}
      </div>
    </div>`;
  }

  await view(`
    <div class="page-hd">
      <div>
        <h1>Milestones</h1>
        <div class="sub">Track high-level achievements and key project markers</div>
      </div>
      <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick="document.getElementById('ms-form').style.display=''">+ Milestone</button>
    </div>
    <div id="ms-form" class="form-card" style="display:none;margin-bottom:14px">
      <h3>New Milestone</h3>
      <div class="form-row">
        <input id="mf-name" type="text" placeholder="Milestone name" style="flex:2">
        <input id="mf-due" type="date" style="flex:1">
      </div>
      <div class="form-row"><input id="mf-desc" type="text" placeholder="Description"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-acc btn-sm" onclick="createMilestone(${pid})">Create</button>
        <button class="btn btn-out btn-sm" onclick="document.getElementById('ms-form').style.display='none'">Cancel</button>
      </div>
    </div>
    <div class="kanban">
      <div class="kanban-col col-todo">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> Pending <span class="cnt">${pending.length}</span></h3>
        </div>
        <div class="kanban-col-sub">Upcoming project goals</div>
        <div class="kanban-col-body">${pending.map(mCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">None</div>'}</div>
      </div>
      <div class="kanban-col col-progress">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> In Progress <span class="cnt">${active.length}</span></h3>
        </div>
        <div class="kanban-col-sub">Currently tracking</div>
        <div class="kanban-col-body">${active.map(mCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">None</div>'}</div>
      </div>
      <div class="kanban-col col-done">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> Completed <span class="cnt">${closed.length}</span></h3>
        </div>
        <div class="kanban-col-sub">Achieved targets</div>
        <div class="kanban-col-body">${closed.map(mCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">None</div>'}</div>
      </div>
    </div>
  `);
  if(typeof initKanbanPanning === 'function') initKanbanPanning();
}
window.updateMilestone = async function(pid,mid,status){ await api('PATCH',`/api/projects/${pid}/milestones/${mid}`,{status}); renderMilestones(pid); };
window.deleteMilestone = async function(pid,mid){ await api('DELETE',`/api/projects/${pid}/milestones/${mid}`); toast('Deleted'); closeDetailModal(); renderMilestones(pid); };
window.createMilestone = async function(pid){
  const name=document.getElementById('mf-name').value.trim(); if(!name) return toast('Name required','err');
  const due=document.getElementById('mf-due').value, desc=document.getElementById('mf-desc').value.trim();
  const body={name,description:desc}; if(due) body.due_date=due;
  const r=await api('POST',`/api/projects/${pid}/milestones`,body); if(r.error) return toast(r.error,'err');
  toast('Milestone created'); renderMilestones(pid);
};

window.openMilestoneDetail = async function(pid, mid) {
  const m = (window._milestones_data||[]).find(x=>x.id===mid) || await api('GET',`/api/projects/${pid}/milestones/${mid}`);
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--purple)"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg></div>
          <div class="dm-header-body">
            <h2>${esc(m.name)}</h2>
            <div class="dm-meta-row" style="display:flex;gap:12px">
              <span class="badge s-${m.status}">${m.status.replace('_',' ')}</span>
              ${m.due_date?`<span class="chip chip-due"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> ${fmtDate(m.due_date)}</span>`:``}
              ${m.task_count?`<div class="dm-stat"><label>Tasks</label><span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1.5px"><polyline points="20 6 9 17 4 12"/></svg> ${m.task_count}</span></div>`:``}
            </div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
              <div class="dm-section-label">Description</div>
              <button class="btn btn-out btn-xs dm-edit-btn" style="font-size:10px; padding:2px 8px; font-weight:700" onclick="toggleMdEdit(this)">EDIT</button>
            </div>
            <div class="dm-desc" style="background:var(--surface); border:1px solid var(--border2); padding:12px; border-radius:var(--r); min-height:60px; cursor:pointer" onclick="toggleMdEdit(this)">${md(m.description)}</div>
            <textarea class="dm-field" id="dm-ms-desc" style="display:none; width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px" onblur="if(this.style.display!=='none') toggleMdEdit(this)">${esc(m.description||'')}</textarea>
          </div>
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Status</label>
              <select id="dm-ms-status">${['pending','in_progress','completed','missed'].map(s=>`<option value="${s}"${m.status===s?' selected':''}>${s.replace('_',' ')}</option>`).join('')}</select>
            </div>
            <div class="dm-field">
              <label>Due Date</label>
              <input type="date" id="dm-ms-due" value="${m.due_date||''}">
            </div>
          </div>
        </div>
        <div class="dm-footer">
          <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="deleteMilestone(${pid},${mid})">Delete</button>
          <button class="btn btn-acc btn-sm" onclick="saveMilestoneDetail(${pid},${mid})">Save Changes</button>
        </div>
      </div>
    </div>`;
};

window.saveMilestoneDetail = async function(pid, mid) {
  const body = {
    description: document.getElementById('dm-ms-desc').value,
    status: document.getElementById('dm-ms-status').value,
    due_date: document.getElementById('dm-ms-due').value || '',
  };
  const r = await api('PATCH',`/api/projects/${pid}/milestones/${mid}`, body);
  if (r.error) return toast(r.error,'err');
  toast('Milestone updated'); closeDetailModal(); renderMilestones(pid);
};
