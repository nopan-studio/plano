async function renderBoards(pid) {
  const [proj, boards] = await Promise.all([api('GET',`/api/projects/${pid}`), api('GET',`/api/projects/${pid}/boards`)]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Boards'}]);
  setPageTitle('Boards • ' + proj.name);
  view(`
    <div class="page-hd">
      <div>
        <h1>Boards</h1>
        <div class="sub">Visual process flows and diagrams for system architecture</div>
      </div>
      <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick="document.getElementById('bf-form').style.display=''">+ New Board</button>
    </div>
    <div id="bf-form" class="form-card" style="display:none">
      <h3>New Board</h3>
      <div class="form-row">
        <input id="bf-name" type="text" placeholder="Board name" style="flex:2">
        <select id="bf-type" style="flex:1;background:var(--surf);border:1px solid var(--b2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:7px 10px">
          <option value="process_flow">Process Flow</option><option value="db_diagram">DB Diagram</option>
          <option value="flowchart">Flowchart</option><option value="idea_map">Idea Map</option>
          <option value="function_flow">Function Flow</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <button class="btn btn-acc btn-sm" onclick="createBoard(${pid})">Create</button>
        <button class="btn btn-out btn-sm" onclick="document.getElementById('bf-form').style.display='none'">Cancel</button>
      </div>
      <div style="font-size:12px;color:var(--mid);margin-bottom:6px">Or use a template:</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${['sprint_planning','release_pipeline','bug_triage','feature_request','onboarding'].map(t=>
          `<button class="btn btn-out btn-sm" onclick="createFromTemplate(${pid},'${t}')">${t.replace(/_/g,' ')}</button>`
        ).join('')}
      </div>
    </div>
    <div class="board-tiles">
      ${boards.map(b=>{
        const icons = {
          process_flow: '⚡',
          db_diagram: '🗄️',
          flowchart: '🗺️',
          idea_map: '💡',
          function_flow: '⚙️'
        };
        const icon = icons[b.type] || '📋';
        return `
        <div class="board-tile" onclick="openEditor(${b.id},${pid})">
          <div class="t-actions">
            <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();deleteBoard(${b.id},${pid})">✕</button>
          </div>
          <div class="t-icon">${icon}</div>
          <div class="t-name">${esc(b.name)}</div>
          <div class="t-meta">${b.type.replace(/_/g,' ')} · ${b.node_count} nodes</div>
          <div class="t-open"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg> OPEN</div>
        </div>`;
      }).join('') || '<div class="empty" style="grid-column:1/-1"><div class="icon">📋</div><p>No boards yet</p></div>'}
    </div>
  `);
}
window.openEditor = function(did, pid) {
  setActiveProject(null);
  localStorage.setItem('fmc_editor_return', JSON.stringify({pid, hash:`#/projects/${pid}/boards`}));
  location.href = `/project/${pid}/editor/${did}`;
};
window.createBoard = async function(pid){
  const name=document.getElementById('bf-name').value.trim(); if(!name) return toast('Name required','err');
  const r=await api('POST',`/api/projects/${pid}/boards`,{name,type:document.getElementById('bf-type').value});
  if(r.error) return toast(r.error,'err'); toast('Board created'); renderBoards(pid);
};
window.createFromTemplate = async function(pid,tmpl){
  const r=await api('POST',`/api/projects/${pid}/boards/from-template`,{template:tmpl});
  if(r.error) return toast(r.error,'err'); toast('Board created from template'); renderBoards(pid);
};
window.deleteBoard = async function(did,pid){ await api('DELETE',`/api/projects/${pid}/boards/${did}`); toast('Deleted'); renderBoards(pid); };

window.openChangelogDetail = function(c) {
  const entityIcons = {project:'📁',task:'✅',milestone:'🏁',board:'📋',update:'💬',idea:'💡'};
  const actionColors = {created:'var(--green)',updated:'var(--blue)',deleted:'var(--rose)'};
  // Try to resolve a human-readable name for the entity
  const _nm = window._cl_name_map || {};
  const eName = (_nm[c.entity_type] && _nm[c.entity_type][c.entity_id]) || `${c.entity_type} #${c.entity_id}`;
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon">${entityIcons[c.entity_type]||'📋'}</div>
          <div class="dm-header-body">
            <h2>${esc(eName)}</h2>
            <div class="dm-meta">
              <span class="cl-action cl-action-${c.action}">${c.action}</span>
              <span class="update-meta">${new Date(c.timestamp).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            </div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          ${c.field_changed?`
          <div class="dm-section">
            <div class="dm-section-label">Change Details</div>
            <div style="font-size:13px;margin-bottom:8px"><strong>Field:</strong> ${esc(c.field_changed)}</div>
            <div class="cl-diff" style="font-size:13px;padding:12px 14px">
              <div style="margin-bottom:6px"><span class="cl-field">Before:</span> <span class="old">${esc(c.old_value||'—')}</span></div>
              <div><span class="cl-field">After:</span> <span class="new">${esc(c.new_value||'—')}</span></div>
            </div>
          </div>`:`
          <div class="dm-section">
            <div class="dm-section-label">Action</div>
            <div class="dm-desc">${esc(eName)} was <strong style="color:${actionColors[c.action]||'var(--text)'}">${c.action}</strong></div>
          </div>`}
          ${renderFilesMeta(c.files_meta, c.project_id, c.entity_type === 'task' ? c.entity_id : -1)}
        </div>
        <div class="dm-footer">
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Close</button>
        </div>
      </div>
    </div>`;
};
