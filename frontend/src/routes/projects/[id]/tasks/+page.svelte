<script>
  import { onMount, tick } from 'svelte';
  import { page } from '$app/state';
  import { md, esc, fmtDate } from '$lib/utils';
  import { initRealtime, addRealtimeHandler } from '$lib/realtime.svelte.js';
  import KanbanColumn from '$lib/components/KanbanColumn.svelte';
  import TaskDetailModal from '$lib/components/TaskDetailModal.svelte';

  const pid = $derived(page.params.id);
  
  let project = $state({});
  let tasks = $state([]);
  let milestones = $state([]);
  let loading = $state(true);
  let selectedTask = $state(null);
  let draggingTask = $state(null);
  let showForm = $state(false);
  let newTask = $state({ title: '', assignee: '', status: 'todo', priority: 'medium', milestone_id: null, due_date: '', description: '' });

  const columns = [
    { id: 'todo', label: 'To Do', sub: 'Tasks ready to be started' },
    { id: 'in_progress', label: 'In Progress', sub: 'Work currently being tackled' },
    { id: 'bugs', label: 'Bugs', sub: 'Issues needing attention' },
    { id: 'review', label: 'Review', sub: 'Pending peer approval' },
    { id: 'done', label: 'Done', sub: 'Completed successfully' }
  ];

  // Kanban Order Persistence
  function getKanbanOrder() {
    try { return JSON.parse(localStorage.getItem(`fmc_kanban_order_${pid}`)) || {}; } catch { return {}; }
  }
  function saveKanbanOrder(order) {
    localStorage.setItem(`fmc_kanban_order_${pid}`, JSON.stringify(order));
  }

  function sortByOrder(arr, status) {
    const order = getKanbanOrder()[status] || [];
    if (!order.length) return arr;
    return arr.slice().sort((a,b) => {
      const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const [p, t, m] = await Promise.all([
        fetch(`/api/projects/${pid}`).then(r => r.json()),
        fetch(`/api/projects/${pid}/tasks`).then(r => r.json()),
        fetch(`/api/projects/${pid}/milestones`).then(r => r.json())
      ]);
      project = p;
      tasks = t.filter(x => x.status !== 'archived');
      milestones = m;
    } catch (e) {
      console.error('Failed to fetch data:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    fetchData();
    initRealtime();
    initPanning();
    return addRealtimeHandler((event) => {
      if (event.type === 'task_updated') {
        const idx = tasks.findIndex(t => t.id === event.data.id);
        if (event.data.status === 'archived') {
           if (idx !== -1) tasks.splice(idx, 1);
        } else if (idx !== -1) {
          tasks[idx] = { ...tasks[idx], ...event.data };
        } else if (event.data.project_id == pid) {
           tasks = [...tasks, event.data];
        }
      } else if (event.type === 'task_created') {
        if (event.data.project_id == pid) {
          tasks = [...tasks, event.data];
        }
      } else if (event.type === 'task_deleted') {
        tasks = tasks.filter(t => t.id !== event.data.id);
      }
    });
  });

  function getTasksByStatus(status) {
    return sortByOrder(tasks.filter(t => t.status === status), status);
  }

  function toggleForm(status) {
    if (status) newTask.status = status;
    showForm = !showForm;
  }

  async function createTask() {
    if (!newTask.title.trim()) return;
    try {
      const resp = await fetch(`/api/projects/${pid}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const t = await resp.json();
      tasks = [...tasks, t];
      showForm = false;
      newTask = { title: '', assignee: '', status: 'todo', priority: 'medium', milestone_id: null, due_date: '', description: '' };
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTaskSave() {
    if (!selectedTask) return;
    try {
      const resp = await fetch(`/api/projects/${pid}/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTask)
      });
      const updated = await resp.json();
      const idx = tasks.findIndex(t => t.id === updated.id);
      if (idx !== -1) tasks[idx] = updated;
      selectedTask = null;
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTaskDelete() {
    if (!selectedTask || !confirm('Delete this task?')) return;
    try {
      await fetch(`/api/projects/${pid}/tasks/${selectedTask.id}`, { method: 'DELETE' });
      tasks = tasks.filter(t => t.id !== selectedTask.id);
      selectedTask = null;
    } catch (e) {
      console.error(e);
    }
  }

  async function handleTaskArchive() {
    if (!selectedTask) return;
    try {
      await fetch(`/api/projects/${pid}/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived', meta: { original_status: selectedTask.status } })
      });
      tasks = tasks.filter(t => t.id !== selectedTask.id);
      selectedTask = null;
    } catch (e) {
      console.error(e);
    }
  }

  async function archiveAllDone() {
    if (!confirm('Archive all tasks in the Done column?')) return;
    try {
      const resp = await fetch(`/api/projects/${pid}/tasks/archive-done`, { method: 'POST' });
      const res = await resp.json();
      tasks = tasks.filter(t => t.status !== 'done');
      alert(`${res.archived_count} tasks archived`);
    } catch (e) {
      console.error(e);
    }
  }

  let draggingTaskId = $state(null);
  let draggingTaskHeight = $state(0);
  let dropIndex = $state(-1);
  let dropStatus = $state(null);

  // DRAG AND DROP
  function handleDragStart(e, task) {
    draggingTask = task;
    draggingTaskId = task.id;
    draggingTaskHeight = e.target.offsetHeight;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragEnd(e) {
    draggingTask = null;
    draggingTaskId = null;
    draggingTaskHeight = 0;
    dropIndex = -1;
    dropStatus = null;
  }

  function handleDragOver(e, status) {
    e.preventDefault();
    dropStatus = status;
    const colBody = e.currentTarget;
    const cards = Array.from(colBody.querySelectorAll('.k-card:not(.dragging)'));
    let insertIdx = cards.length;
    for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
            insertIdx = i;
            break;
        }
    }
    dropIndex = insertIdx;
  }

  async function handleDrop(e, status) {
    e.preventDefault();
    if (!draggingTask) return;
    
    const oldStatus = draggingTask.status;
    const targetIdx = dropIndex;
    
    // Update status 
    if (oldStatus !== status) {
       draggingTask.status = status;
       fetch(`/api/projects/${pid}/tasks/${draggingTask.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status })
       });
    }

    // Recalculate order for this column
    const colTasks = tasks.filter(t => t.status === status && t.id !== draggingTask.id);
    colTasks.splice(targetIdx, 0, draggingTask);
    
    const order = getKanbanOrder();
    order[status] = colTasks.map(t => t.id);
    saveKanbanOrder(order);

    draggingTask = null;
    draggingTaskId = null;
    draggingTaskHeight = 0;
    dropIndex = -1;
    dropStatus = null;
    tasks = [...tasks];
  }

  // PANNING logic
  let isPanning = false;
  let startX, scrollLeft;
  function initPanning() {
    const board = document.querySelector('.kanban');
    if (!board) return;
    board.addEventListener('mousedown', e => {
      if (e.target.closest('.k-card') || e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return;
      isPanning = true;
      board.classList.add('panning');
      startX = e.pageX - board.offsetLeft;
      scrollLeft = board.scrollLeft;
    });
    window.addEventListener('mouseup', () => {
      if (!isPanning) return;
      isPanning = false;
      const board = document.querySelector('.kanban');
      if (board) board.classList.remove('panning');
    });
    window.addEventListener('mousemove', e => {
      if (!isPanning) return;
      const board = document.querySelector('.kanban');
      if (!board) return;
      e.preventDefault();
      const x = e.pageX - board.offsetLeft;
      const walk = (x - startX) * 1.5;
      board.scrollLeft = scrollLeft - walk;
    });
  }

</script>

<div class="page-hd">
  <div>
    <h1>Tasks</h1>
    <div class="sub">Track progress and manage team workflows through columns · {project.name}</div>
  </div>
</div>

{#if showForm}
  <div class="form-card animate-in">
    <h3>New Task</h3>
    <div class="form-row">
      <input type="text" bind:value={newTask.title} placeholder="Task title" style="flex:3">
      <input type="text" bind:value={newTask.assignee} placeholder="Assignee" style="flex:1">
    </div>
    <div class="form-row">
      <select bind:value={newTask.status} class="full" style="flex:1">
        {#each columns as c}
          <option value={c.id}>{c.label}</option>
        {/each}
      </select>
      <select bind:value={newTask.priority} class="full" style="flex:1">
        {#each ['low', 'medium', 'high', 'critical'] as p}
          <option value={p}>{p}</option>
        {/each}
      </select>
      <select bind:value={newTask.milestone_id} class="full" style="flex:1">
        <option value={null}>No milestone</option>
        {#each milestones as m}
          <option value={m.id}>{m.name}</option>
        {/each}
      </select>
      <input type="date" bind:value={newTask.due_date} style="flex:1">
    </div>
    <div class="form-row">
      <input type="text" bind:value={newTask.description} placeholder="Description">
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-acc btn-sm" onclick={createTask}>Create</button>
      <button class="btn btn-out btn-sm" onclick={() => showForm = false}>Cancel</button>
    </div>
  </div>
{/if}

<div class="kanban" role="main">
  {#each columns as col}
    <KanbanColumn 
      {col} 
      tasks={getTasksByStatus(col.id)} 
      {milestones}
      ontaskdrop={handleDrop}
      ondragover={handleDragOver}
      {dropIndex}
      {dropStatus}
      {draggingTaskId}
      {draggingTaskHeight}
      ontaskclick={t => selectedTask = { ...t }}
      onaddtask={toggleForm}
      onarchiveall={archiveAllDone}
      {handleDragStart}
      {handleDragEnd}
    />
  {/each}
</div>

{#if selectedTask}
  <TaskDetailModal 
    bind:task={selectedTask} 
    {milestones}
    onClose={() => selectedTask = null}
    onSave={handleTaskSave}
    onDelete={handleTaskDelete}
    onArchive={handleTaskArchive}
  />
{/if}

<style>
  .kanban {
    display: flex;
    gap: 24px;
    margin-inline: -24px;
    padding-inline: 24px;
    padding-bottom: 60px;
    width: calc(100% + 48px);
    align-items: flex-start;
    user-select: none;
  }
  :global(.kanban.panning) {
    cursor: grabbing !important;
  }
  :global(.kanban.panning .k-card) {
    pointer-events: none;
  }

  :global(.main) {
    scrollbar-width: none; /* Firefox */
    overflow-x: auto;
  }
  :global(.main::-webkit-scrollbar) {
    display: none; /* Chrome, Safari */
  }

  .form-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  }
  .form-card h3 {
    font-size: 14px;
    margin-bottom: 16px;
    color: var(--text-mid);
    text-transform: uppercase;
    letter-spacing: .05em;
  }
  .form-row {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
  .animate-in {
    animation: slideIn .2s ease-out;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: none; }
  }
</style>
