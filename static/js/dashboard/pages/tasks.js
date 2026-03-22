async function renderTasks(pid) {
  const [proj, tasks, milestones] = await Promise.all([
    api('GET',`/api/projects/${pid}`),
    api('GET',`/api/projects/${pid}/tasks`),
    api('GET',`/api/projects/${pid}/milestones`),
  ]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Tasks'}]);
  setPageTitle('Tasks • ' + proj.name);
  const msOpts = milestones.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('');
  const activeTasks = (tasks||[]).filter(t => t.status !== 'archived');
  window._tasks = activeTasks; window._milestones = milestones;

  const savedOrder = getKanbanOrder(pid);
  function sortByOrder(arr, status) {
    const order = savedOrder[status] || [];
    if (!order.length) return arr;
    return arr.slice().sort((a,b) => {
      const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }
  const todo = sortByOrder(activeTasks.filter(t=>t.status==='todo'), 'todo');
  const progress = sortByOrder(activeTasks.filter(t=>t.status==='in_progress'), 'in_progress');
  const review = sortByOrder(activeTasks.filter(t=>t.status==='review'), 'review');
  const done = sortByOrder(activeTasks.filter(t=>t.status==='done'), 'done');
  const bugs = sortByOrder(activeTasks.filter(t=>t.status==='bugs'), 'bugs');

  function kCard(t) {
    const pColor = {low:'var(--dim)',medium:'var(--blue)',high:'var(--amber)',critical:'var(--rose)'}[t.priority]||'var(--dim)';
    const ms = (milestones||[]).find(m=>m.id===t.milestone_id);
    const aiActive = t.is_ai_working ? ' ai-active' : '';
    const aiBadge = t.is_ai_working ? '<div class="ai-badge"><span></span> AI Working</div>' : '';
    return `<div class="k-card${aiActive}" id="task-${t.id}" style="view-transition-name: task-card-${t.id}" draggable="true" data-task-id="${t.id}" data-status="${t.status}" onclick="openTaskDetail(${pid},${t.id})">
      <div class="k-card-id">#${t.id}</div>
      ${aiBadge}
      <div class="k-card-title">${esc(t.title)}</div>
      ${t.description?`<div class="k-card-sub">${md(t.description)}</div>`:``}
      <div class="k-card-chips">
        <span class="chip" style="color:${pColor};background:var(--surf2)">● ${t.priority}</span>
        ${t.assignee?`<span class="chip chip-assignee"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${esc(t.assignee)}</span>`:``}
        ${t.due_date?`<span class="chip chip-due"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> ${fmtDate(t.due_date)}</span>`:``}
        ${ms?`<span class="chip chip-ms"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg> ${esc(ms.name)}</span>`:``}
      </div>
    </div>`;
  }

  await view(`
    <div class="page-hd">
      <div>
        <h1>Tasks</h1>
        <div class="sub">Track progress and manage team workflows through columns</div>
      </div>
    </div>
    <div id="task-form" class="form-card" style="display:none;margin-bottom:14px">
      <h3>New Task</h3>
      <div class="form-row">
        <input id="tf-title" type="text" placeholder="Task title" style="flex:3">
        <input id="tf-assignee" type="text" placeholder="Assignee" style="flex:1">
      </div>
      <div class="form-row">
        <select id="tf-status" style="flex:1;background:var(--surf);border:1px solid var(--b2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:7px 10px">
          <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="bugs">Bugs</option><option value="review">Review</option><option value="done">Done</option>
        </select>
        <select id="tf-priority" style="flex:1;background:var(--surf);border:1px solid var(--b2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:7px 10px">
          <option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="critical">Critical</option>
        </select>
        <select id="tf-milestone" style="flex:1;background:var(--surf);border:1px solid var(--b2);border-radius:var(--r);color:var(--text);font-family:var(--sans);font-size:13px;padding:7px 10px">
          <option value="">No milestone</option>${msOpts}
        </select>
        <input id="tf-due" type="date" style="flex:1">
      </div>
      <div class="form-row"><input id="tf-desc" type="text" placeholder="Description"></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-acc btn-sm" onclick="createTask(${pid})">Create</button>
        <button class="btn btn-out btn-sm" onclick="toggleTaskForm(${pid})">Cancel</button>
      </div>
    </div>
    <div class="kanban">
      <div class="kanban-col col-todo">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> To Do <span class="cnt">${todo.length}</span></h3>
          <div class="kanban-col-hd-right">
            <button class="add-task-col-btn" onclick="toggleTaskForm(${pid}, 'todo')" title="Add task to To Do">+</button>
          </div>
        </div>
        <div class="kanban-col-sub">Tasks ready to be started</div>
        <div class="kanban-col-body" data-status="todo">${todo.map(kCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">No tasks</div>'}</div>
      </div>
      <div class="kanban-col col-progress">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> In Progress <span class="cnt">${progress.length}</span></h3>
          <div class="kanban-col-hd-right">
            <button class="add-task-col-btn" onclick="toggleTaskForm(${pid}, 'in_progress')" title="Add task to In Progress">+</button>
          </div>
        </div>
        <div class="kanban-col-sub">Work currently being tackled</div>
        <div class="kanban-col-body" data-status="in_progress">${progress.map(kCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">No tasks</div>'}</div>
      </div>
      <div class="kanban-col col-bugs">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> Bugs <span class="cnt">${bugs.length}</span></h3>
          <div class="kanban-col-hd-right">
            <button class="add-task-col-btn" onclick="toggleTaskForm(${pid}, 'bugs')" title="Add task to Bugs">+</button>
          </div>
        </div>
        <div class="kanban-col-sub">Issues needing attention</div>
        <div class="kanban-col-body" data-status="bugs">${bugs.map(kCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">No bugs recorded</div>'}</div>
      </div>
      <div class="kanban-col col-review">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> Review <span class="cnt">${review.length}</span></h3>
          <div class="kanban-col-hd-right">
            <button class="add-task-col-btn" onclick="toggleTaskForm(${pid}, 'review')" title="Add task to Review">+</button>
          </div>
        </div>
        <div class="kanban-col-sub">Pending peer approval</div>
        <div class="kanban-col-body" data-status="review">${review.map(kCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">No reviews</div>'}</div>
      </div>
      <div class="kanban-col col-done">
        <div class="kanban-col-hd">
          <h3><span class="status-circle"></span> Done <span class="cnt">${done.length}</span></h3>
          <div class="kanban-col-hd-right">
            ${done.length > 0 ? `<button class="btn btn-ghost btn-xs" onclick="archiveAllDoneTasksUI(${pid})" title="Archive all Done tasks" style="margin-right:4px;padding:2px 6px;font-size:10px;text-transform:uppercase;font-weight:700;color:var(--mid)">Archive All</button>` : ''}
            <button class="add-task-col-btn" onclick="toggleTaskForm(${pid}, 'done')" title="Add task to Done">+</button>
          </div>
        </div>
        <div class="kanban-col-sub">Completed successfully</div>
        <div class="kanban-col-body" data-status="done">${done.map(kCard).join('')||'<div style="text-align:center;padding:20px;color:var(--dim);font-size:12px">No completed tasks</div>'}</div>
      </div>
    </div>
  `);
  window._pid = pid;
  if(typeof initKanbanDragDrop === 'function') initKanbanDragDrop(pid);
  if(typeof initKanbanPanning === 'function') initKanbanPanning();
}
function taskCard() {} // kept for compat
function toggleTaskForm(pid, status) {
  const f = document.getElementById('task-form');
  if (f) {
    if (f.style.display === 'none') {
      f.style.display = '';
      if (status) document.getElementById('tf-status').value = status;
    } else {
      f.style.display = 'none';
    }
  }
}

window.updateTaskStatus = async function(pid, tid, status) {
  const r = await api('PATCH',`/api/projects/${pid}/tasks/${tid}`,{status});
  if (r.error) toast(r.error,'err'); else renderTasks(pid);
};
window.deleteTask = async function(pid, tid) {
  await api('DELETE',`/api/projects/${pid}/tasks/${tid}`);
  toast('Task deleted'); closeDetailModal(); renderTasks(pid);
};
window.createTask = async function(pid) {
  const title = document.getElementById('tf-title').value.trim();
  if (!title) return toast('Title required','err');
  const mid = document.getElementById('tf-milestone').value;
  const body = {
    title, assignee:document.getElementById('tf-assignee').value.trim(),
    priority:document.getElementById('tf-priority').value,
    description:document.getElementById('tf-desc').value.trim(),
  };
  if (mid) body.milestone_id = +mid;
  const due = document.getElementById('tf-due').value;
  if (due) body.due_date = due;
  const r = await api('POST',`/api/projects/${pid}/tasks`, {
    ...body, status: document.getElementById('tf-status').value
  });

  if (r.error) return toast(r.error,'err');
  toast('Task created'); renderTasks(pid);
};

// ── DETAIL MODAL SYSTEM ──────────────────────────────────────
function closeDetailModal() {
  const root = document.getElementById('detail-modal-root');
  if (root) root.innerHTML = '';
}
document.addEventListener('keydown', e => { if (e.key==='Escape') closeDetailModal(); });

window.openTaskDetail = async function(pid, tid) {
  const t = (window._tasks||[]).find(x=>x.id===tid) || await api('GET',`/api/projects/${pid}/tasks/${tid}`);
  const ms = (window._milestones||[]);
  const msOpts = ms.map(m=>`<option value="${m.id}" ${t.milestone_id===m.id?'selected':''}>${esc(m.name)}</option>`).join('');
  const pColor = {low:'var(--dim)',medium:'var(--blue)',high:'var(--amber)',critical:'var(--rose)'}[t.priority]||'var(--dim)';
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div class="dm-header-body">
            <h2>${esc(t.title)}</h2>
            <div class="dm-meta">
              <span class="badge s-${t.status}">${t.status.replace('_',' ')}</span>
              <span class="chip" style="color:${pColor};background:var(--surf2)">● ${t.priority}</span>
              ${t.assignee?`<span class="chip chip-assignee"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${esc(t.assignee)}</span>`:``}
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
            <div class="dm-desc" style="background:var(--surface); border:1px solid var(--border2); padding:12px; border-radius:var(--r); min-height:60px; cursor:pointer" onclick="toggleMdEdit(this)">${md(t.description)}</div>
            <textarea class="dm-field" id="dm-desc" style="display:none; width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px" onblur="if(this.style.display!=='none') toggleMdEdit(this)">${esc(t.description||'')}</textarea>
          </div>
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Status</label>
              <select id="dm-status">${['todo','in_progress', 'review', 'done', 'bugs'].map(s=>`<option value="${s}"${t.status===s?' selected':''}>${s.replace('_',' ')}</option>`).join('')}</select>
            </div>
            <div class="dm-field">
              <label>Priority</label>
              <select id="dm-priority">${['low','medium','high','critical'].map(p=>`<option value="${p}"${t.priority===p?' selected':''}>${p}</option>`).join('')}</select>
            </div>
          </div>
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Assignee</label>
              <input type="text" id="dm-assignee" value="${esc(t.assignee||'')}">
            </div>
            <div class="dm-field">
              <label>Due Date</label>
              <input type="date" id="dm-due" value="${t.due_date||''}">
            </div>
          </div>
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Milestone</label>
              <select id="dm-milestone"><option value="">None</option>${msOpts}</select>
            </div>
            <div class="dm-field">
              <label>Estimated Hours</label>
              <input type="number" id="dm-hours" value="${t.estimated_hours>0?t.estimated_hours:''}" placeholder="0">
            </div>
          </div>
          <div class="dm-section" style="padding:12px;background:var(--surf);border:1px solid var(--b2);border-radius:var(--r);display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <input type="checkbox" id="dm-ai" ${t.is_ai_working?'checked':''} style="width:18px;height:18px;accent-color:var(--acc)">
            <div>
              <div style="font-size:13px;font-weight:600;color:var(--acc)">AI Agent is working on this task</div>
              <div style="font-size:11px;color:var(--mid)">Toggles the real-time heartbeat and UI animations</div>
            </div>
          </div>
          ${renderFilesMeta(t.files_meta, pid, tid)}
        </div>
        <div class="dm-footer">
          <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="deleteTask(${pid},${tid})">Delete</button>
          ${(t.status === 'done' || t.status === 'review' || t.status === 'bugs') 
            ? `<button class="btn btn-ghost btn-sm" id="dm-archive-btn" style="margin-right:auto" onclick="archiveTask(${pid},${tid})">Archive</button>` 
            : `<button class="btn btn-ghost btn-sm" style="margin-right:auto;opacity:0.5" disabled title="Task must be Done, Review or Bug to archive">Archive</button>`
          }
          <button class="btn btn-acc btn-sm" onclick="saveTaskDetail(${pid},${tid})">Save Changes</button>
        </div>
      </div>
    </div>`;
};

window.saveTaskDetail = async function(pid, tid) {
  const body = {
    description: document.getElementById('dm-desc').value,
    status: document.getElementById('dm-status').value,
    priority: document.getElementById('dm-priority').value,
    assignee: document.getElementById('dm-assignee').value.trim(),
    due_date: document.getElementById('dm-due').value || '',
    is_ai_working: document.getElementById('dm-ai').checked
  };
  const mid = document.getElementById('dm-milestone').value;
  if (mid) body.milestone_id = +mid;
  const hrs = document.getElementById('dm-hours').value;
  if (hrs) body.estimated_hours = +hrs;
  const r = await api('PATCH',`/api/projects/${pid}/tasks/${tid}`, body);
  if (r.error) return toast(r.error,'err');
  toast('Task updated'); closeDetailModal(); renderTasks(pid);
};

window.archiveTask = async function(pid, tid) {
  let t = (window._tasks||[]).find(x=>x.id===tid);
  if (!t) {
    t = await api('GET', `/api/projects/${pid}/tasks/${tid}`);
  }
  if (!t) return toast('Task not found','err');
  if (t.status === 'archived') return toast('Task is already archived');
  
  const orgStatus = t.status;
  const r = await api('PATCH', `/api/projects/${pid}/tasks/${tid}`, {
    status: 'archived',
    meta: { ...(t.meta||{}), original_status: orgStatus }
  });
  if (r.error) return toast(r.error,'err');
  toast('Task archived'); closeDetailModal(); renderTasks(pid);
};

window.archiveAllDoneTasksUI = async function(pid) {
  if (!confirm('Archive all tasks in the Done column?')) return;
  const r = await api('POST', `/api/projects/${pid}/tasks/archive-done`);
  if (r.error) return toast(r.error, 'err');
  toast(`${r.count} tasks archived`);
  renderTasks(pid);
};
