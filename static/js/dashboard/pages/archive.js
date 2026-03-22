window.renderArchive = async function(pid) {
  const [proj, tasks] = await Promise.all([api('GET', `/api/projects/${pid}`), api('GET', `/api/projects/${pid}/tasks?include_archived=true`)]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Archive'}]);
  setPageTitle('Archive • ' + proj.name);
  
  const archived = (tasks||[]).filter(t => t.status === 'archived');
  
  const sF = document.getElementById('af-status')?.value || 'all';
  const dF = document.getElementById('af-df')?.value || '';
  const dT = document.getElementById('af-dt')?.value || '';
  
  let filtered = archived;
  if (sF !== 'all') filtered = filtered.filter(t => ((t.meta||{}).original_status === sF));
  if (dF) filtered = filtered.filter(t => t.updated_at.split('T')[0] >= dF);
  if (dT) filtered = filtered.filter(t => t.updated_at.split('T')[0] <= dT);

  const rows = filtered.map(t => {
    const meta = t.meta || {};
    const orig = meta.original_status || 'todo';
    return `<tr class="t-row">
      <td>
        <div class="k-card-id">#${t.id}</div>
        <div style="font-weight:600;color:var(--text)">${esc(t.title)}</div>
        <div style="font-size:11px;color:var(--mid);margin-top:2px">${md(t.description)}</div>
      </td>
      <td><span class="badge s-${orig}">${orig}</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--mid)">${fmtDate(t.updated_at)}</td>
      <td style="text-align:right"><button class="btn btn-out btn-sm" onclick="event.stopPropagation();restoreTask(${pid},${t.id},'${orig}')">Restore</button></td>
    </tr>`;
  }).join('');

  await view(`
    <div class="page-hd">
      <div>
        <h1>Archived Tasks</h1>
        <div class="sub">Manage and restore archive tasks. Filter by original status or date.</div>
      </div>
    </div>
    <div class="form-card" style="margin-bottom:16px;display:flex;gap:12px;align-items:flex-end">
      <div class="dm-field"><label>Original Status</label><select id="af-status" onchange="renderArchive(${pid})">
        <option value="all" ${sF==='all'?'selected':''}>All statuses</option>
        ${['todo','in_progress','review','done','bugs'].map(s=>`<option value="${s}" ${sF===s?'selected':''}>${s}</option>`).join('')}
      </select></div>
      <div class="dm-field"><label>From Date</label><input type="date" id="af-df" value="${dF}" onchange="renderArchive(${pid})"></div>
      <div class="dm-field"><label>To Date</label><input type="date" id="af-dt" value="${dT}" onchange="renderArchive(${pid})"></div>
      <button class="btn btn-ghost btn-sm" onclick="document.getElementById('af-status').value='all';document.getElementById('af-df').value='';document.getElementById('af-dt').value='';renderArchive(${pid})">Clear</button>
    </div>
    <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.15)">
      <table class="tbl">
        <thead><tr><th>Task Name</th><th style="width:140px">Previous Status</th><th style="width:140px">Archived On</th><th style="text-align:right;width:100px">Action</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:60px 20px;color:var(--mid)"><div style="font-size:24px;margin-bottom:12px;opacity:0.3">◈</div>No archived tasks found</td></tr>'}</tbody>
      </table>
    </div>
  `);
};

window.restoreTask = async function(pid, tid, orig) {
  const r = await api('PATCH', `/api/projects/${pid}/tasks/${tid}`, { status: orig || 'todo' });
  if (r.error) return toast(r.error,'err');
  toast('Task restored'); renderArchive(pid);
};
