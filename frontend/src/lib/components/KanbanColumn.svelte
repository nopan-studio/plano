<script>
  import { flip } from 'svelte/animate';
  import KanbanCard from './KanbanCard.svelte';
  let { 
    col, tasks = [], milestones = [], 
    dropIndex = -1, dropStatus = null, draggingTaskId = null, draggingTaskHeight = 0,
    ontaskdrop, ondragover, ontaskclick, onaddtask, onarchiveall, 
    handleDragStart, handleDragEnd 
  } = $props();

  const augmentedTasks = $derived.by(() => {
    if (dropStatus !== col.id) return tasks;
    const res = [...tasks];
    const idx = Math.min(dropIndex, res.length);
    res.splice(idx, 0, { id: 'drop-placeholder', isPlaceholder: true });
    return res;
  });
</script>

<div class="kanban-col col-{col.id === 'in_progress' ? 'progress' : col.id}">
  <div class="kanban-col-hd">
    <h3><span class="status-circle"></span> {col.label} <span class="cnt">{tasks.length}</span></h3>
    <div class="kanban-col-hd-right">
      {#if col.id === 'done' && tasks.length > 0}
        <button class="btn btn-ghost btn-xs archive-all-btn" onclick={onarchiveall} title="Archive all Done tasks">Archive All</button>
      {/if}
      <button class="add-task-col-btn" onclick={() => onaddtask(col.id)} title="Add task to {col.label}">+</button>
    </div>
  </div>
  <div class="kanban-col-sub">{col.sub}</div>
  <div 
    class="kanban-col-body" 
    data-status={col.id}
    role="region"
    aria-label="Tasks column for {col.label}"
    ondragover={e => ondragover(e, col.id)} 
    ondrop={e => ontaskdrop(e, col.id)}
  >
    {#each augmentedTasks as task (task.id)}
      <div animate:flip={{ duration: 250 }}>
        {#if task.isPlaceholder}
          <div class="drop-placeholder" style="height: {draggingTaskHeight}px"></div>
        {:else}
          <KanbanCard 
            {task} 
            {milestones}
            isDragging={task.id === draggingTaskId}
            ondragstart={e => handleDragStart(e, task)} 
            {handleDragEnd}
            onclick={() => ontaskclick(task)}
          />
        {/if}
      </div>
    {:else}
      <div class="empty-col">No {col.id === 'bugs' ? 'bugs recorded' : 'tasks'}</div>
    {/each}
  </div>
</div>

<style>
  .kanban-col {
    flex: 0 0 320px;
    width: 320px;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
  .kanban-col-hd {
    padding: 12px 0 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    position: sticky;
    top: -24px; /* Offset for .main padding */
    background: var(--bg);
    z-index: 20;
    margin-bottom: 12px;
  }
  .kanban-col-hd h3 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
  }
  .status-circle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim);
  }
  .cnt {
    font-size: 10px;
    color: var(--text-dim);
    background: var(--surface2);
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 4px;
    font-weight: 500;
  }
  .kanban-col-hd-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .add-task-col-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    font-size: 18px;
    cursor: pointer;
    padding: 0 8px;
    line-height: 1;
    border-radius: 4px;
    transition: background 0.15s, color 0.15s;
  }
  .add-task-col-btn:hover {
    background: var(--surface2);
    color: var(--accent);
  }
  .kanban-col-sub {
    font-size: 11px;
    color: var(--text-dim);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-dim);
    opacity: 0.8;
  }
  .kanban-col-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
    min-height: 80px;
    border-radius: var(--r);
    transition: background 0.2s;
    overflow: visible;
  }
  
  :global(.kanban-col-body.drag-over) {
    background: rgba(255,255,255,0.02);
  }

  .col-todo .status-circle { background: var(--text-dim); }
  .col-progress .status-circle { background: var(--blue); box-shadow: 0 0 8px var(--blue-glow); }
  .col-review .status-circle { background: var(--purple); }
  .col-done .status-circle { background: var(--green); }
  .col-bugs .status-circle { background: var(--rose); }

  .empty-col {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
    font-size: 12px;
    border: 1px dashed var(--border);
    border-radius: var(--r);
  }
  .drop-placeholder {
    background: var(--surface2);
    border: 2px dashed var(--border);
    border-radius: var(--r);
    margin: 8px 0;
    opacity: 0.6;
    transition: height 0.2s;
  }
</style>
