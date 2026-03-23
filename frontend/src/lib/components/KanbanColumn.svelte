<script>
  import { flip } from 'svelte/animate';
  import { cubicOut } from 'svelte/easing';
  import KanbanCard from './KanbanCard.svelte';
  let { 
    col, tasks = [], milestones = [], 
    dropIndex = -1, dropStatus = null, dropTargetId = null, draggingTaskId = null, draggingTaskHeight = 0,
    ontaskdrop, ondragover, ontaskclick, onaddtask, onarchiveall, 
    handleDragStart, handleDragEnd
  } = $props();

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
    class:drag-over={dropStatus === col.id}
    data-status={col.id}
    role="region"
    aria-label="Tasks column for {col.label}"
    ondragover={e => ondragover(e, col.id)} 
    ondrop={e => ontaskdrop(e, col.id)}
  >
    {#each tasks as task, i (task.id)}
      <div animate:flip={{ duration: 150, easing: cubicOut }}>
        <KanbanCard 
          {task} 
          {milestones}
          isDragging={task.id === draggingTaskId}
          isDropTarget={dropStatus === col.id && String(dropTargetId) === String(task.id) && task.id !== draggingTaskId}
          isLastDropTarget={dropStatus === col.id && dropTargetId === 'bottom' && i === tasks.length - 1 && task.id !== draggingTaskId}
          {dropStatus}
          ondragstart={e => handleDragStart(e, task)} 
          ondragend={handleDragEnd}
          onclick={() => ontaskclick(task)}
        />
      </div>
    {:else}
      <div 
        class="empty-col"
        class:drop-target={dropStatus === col.id}
      >
        No {col.id === 'bugs' ? 'bugs recorded' : 'tasks'}
      </div>
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
    z-index: 500;
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
  
/* Empty ruleset removed */

  .col-todo .status-circle { background: var(--text-dim); }
  .col-todo .cnt { color: var(--text-mid); background: var(--surface2); }
  
  .col-progress .status-circle { background: var(--blue); box-shadow: 0 0 8px var(--blue-glow); }
  .col-progress .cnt { color: var(--blue); background: var(--blue-dim); }
  
  .col-review .status-circle { background: var(--purple); }
  .col-review .cnt { color: var(--purple); background: var(--purple-dim); }
  
  .col-done .status-circle { background: var(--green); }
  .col-done .cnt { color: var(--green); background: var(--green-dim); }
  
  .col-bugs .status-circle { background: var(--rose); }
  .col-bugs .cnt { color: var(--rose); background: var(--rose-dim); }

  .empty-col {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-dim);
    font-size: 12px;
    border: 1px dashed var(--border);
    border-radius: var(--r);
    transition: background 0.2s, border-color 0.2s;
  }
  .empty-col.drop-target {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
