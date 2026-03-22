async function renderChangelog(pid) {
  const [proj, cl, tasks, milestones, boards] = await Promise.all([
    api('GET',`/api/projects/${pid}`),
    api('GET',`/api/projects/${pid}/changelog?per_page=100`),
    api('GET',`/api/projects/${pid}/tasks`),
    api('GET',`/api/projects/${pid}/milestones`),
    api('GET',`/api/projects/${pid}/boards`),
  ]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Project Logs'}]);
  window._recent_changelog = cl.entries;

  // Build name lookup maps
  const nameMap = {project:{}, task:{}, milestone:{}, board:{}, update:{}, idea:{}};
  nameMap.project[pid] = proj.name;
  (tasks||[]).forEach(t => nameMap.task[t.id] = t.title);
  (milestones||[]).forEach(m => nameMap.milestone[m.id] = m.name);
  (boards||[]).forEach(b => nameMap.board[b.id] = b.name);
  window._cl_name_map = nameMap;
  function entityName(type, id) {
    return (nameMap[type] && nameMap[type][id]) || `${type} #${id}`;
  }

  // Group by calendar day
  const grouped = {};
  cl.entries.forEach(c => {
    const day = new Date(c.timestamp).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    (grouped[day] = grouped[day]||[]).push(c);
  });
  const entityIcons = {
    project: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
    task: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><polyline points="20 6 9 17 4 12"/></svg>`,
    milestone: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    board: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    update: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`,
    idea: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`
  };

  function clSummary(c) {
    const name = entityName(c.entity_type, c.entity_id);
    if (c.action === 'created') return `Created <strong>${esc(c.entity_type)}</strong>: ${esc(name)}`;
    if (c.action === 'deleted') return `Deleted <strong>${esc(c.entity_type)}</strong>: ${esc(name)}`;
    if (c.field_changed === 'updated_at') return `Updated <strong>${esc(name)}</strong>`;
    if (c.field_changed) return `Changed <strong>${esc(c.field_changed)}</strong> on ${esc(name)}`;
    return `${c.action} ${esc(c.entity_type)}: ${esc(name)}`;
  }

  view(`
    <div class="page-hd">
      <div>
        <h1>Project Logs</h1>
        <div class="sub">A chronological audit trail of all manual and AI modifications</div>
      </div>
      <span style="font-size:12px;color:var(--mid);margin-left:auto;font-family:var(--mono)">${cl.total} entries</span>
    </div>
    <div class="prose-wrap">
      ${Object.keys(grouped).length ? Object.entries(grouped).map(([day,entries])=>`
        <div class="cl-day">
          <div class="cl-day-label"><span>${day}</span></div>
          ${entries.map(c=>`
            <div class="cl-entry act-${c.action}" style="cursor:pointer" onclick="openChangelogDetail(window._recent_changelog.find(x=>x.id===${c.id}))">
              <div class="cl-entry-main">
                <div class="cl-entry-header">
                  <span class="cl-action cl-action-${c.action}">${c.action}</span>
                  <span class="cl-entity">${entityIcons[c.entity_type]||'◈'} ${clSummary(c)}</span>
                </div>
                ${c.field_changed && c.field_changed !== 'updated_at' ?`<div class="cl-diff"><span class="cl-field">${esc(c.field_changed)}:</span><span class="old">${esc(c.old_value||'—')}</span> <span class="arrow">→</span> <span class="new">${esc(c.new_value||'—')}</span></div>`:``}
              </div>
              <div class="cl-time">${timeAgo(c.timestamp)}<br>${new Date(c.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            </div>`).join('')}
        </div>`).join('') : '<div class="empty"><div class="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg></div><p>No changes logged yet</p></div>'}
    </div>
  `);
}
