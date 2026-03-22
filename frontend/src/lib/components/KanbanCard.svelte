<script>
  import { md, fmtDate } from '$lib/utils';
  let { task, milestones = [], isDragging = false, ondragstart, ondragend, onclick } = $props();
  const pColor = $derived({
    low: 'var(--text-dim)',
    medium: 'var(--blue)',
    high: 'var(--amber)',
    critical: 'var(--rose)'
  }[task.priority] || 'var(--text-dim)');

  const ms = $derived(milestones?.find(m => String(m.id) === String(task.milestone_id)));
</script>

<div 
  class="k-card" 
  draggable="true" 
  role="button"
  tabindex="0"
  class:ai-active={task.is_ai_working}
  class:dragging={isDragging}
  {ondragstart}
  {ondragend}
  {onclick}
  onkeydown={e => (e.key === 'Enter' || e.key === ' ') && onclick()}
  style="view-transition-name: task-card-{task.id}"
  data-task-id={task.id}
  data-status={task.status}
>
  {#if task.is_ai_working}
    <svg class="ai-border-svg" preserveAspectRatio="none">
      <rect x="0" y="0" width="100%" height="100%" rx="var(--r)" ry="var(--r)" />
    </svg>
  {/if}
  <div class="k-card-id">#{task.id}</div>
  {#if task.is_ai_working}
    <div class="ai-badge">
      <div class="bot-icon">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 11V9a4 4 0 1 1 8 0v2M9 15h.01M15 15h.01"/>
        </svg>
      </div>
      AI Working
    </div>
  {/if}
  <div class="k-card-title">{task.title}</div>
  {#if task.description}
     <div class="k-card-sub">{@html md(task.description.substring(0, 100))}</div>
  {/if}
  <div class="k-card-chips">
    <span class="chip" style="color:{pColor}; background:var(--surface2)">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg> 
      {task.priority}
    </span>
    {#if task.assignee}
      <span class="chip chip-assignee">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg> 
        {task.assignee}
      </span>
    {/if}
    {#if task.due_date}
      <span class="chip chip-due" style="color: {new Date(task.due_date) < new Date() ? 'var(--rose)' : 'var(--text-mid)'}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
        </svg> 
        {fmtDate(task.due_date)}
      </span>
    {/if}
    {#if task.milestone_id && task.milestone_id != -1}
      {@const msObj = milestones?.find(m => String(m.id) === String(task.milestone_id))}
      <span class="chip chip-ms" title="Milestone ID: {task.milestone_id}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
        </svg> 
        {msObj ? msObj.name : `Milestone #${task.milestone_id}`}
      </span>
    {/if}
  </div>
</div>

<style>
  .k-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 16px;
    cursor: grab;
    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    position: relative;
    user-select: none;
    overflow: visible; /* Prevent AI badge clipping */
  }
  .k-card:hover {
    border-color: var(--accent);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  }
  :global(.k-card.dragging) {
    opacity: 0.3 !important;
    transform: scale(0.96);
    box-shadow: none !important;
  }
  .k-card-id {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-dim);
    margin-bottom: 6px;
  }
  .k-card-title {
    font-weight: 600;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 8px;
    word-break: break-word;
  }
  .k-card-sub {
    font-size: 12px;
    color: var(--text-mid);
    margin-bottom: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
  .k-card-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    font-size: 10px;
    background: var(--surface2);
    padding: 3px 8px;
    border-radius: 6px;
    color: var(--text-mid);
    font-weight: 600;
    font-family: var(--mono);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chip svg {
    flex-shrink: 0;
  }
  .chip-ms {
    background: var(--purple-dim);
    border: 1px solid rgba(167, 139, 250, 0.1);
    color: var(--purple);
  }
  .ai-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--accent);
    color: #fff;
    font-size: 9.5px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(220, 50, 0, 0.5);
    display: flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: .06em;
    border: 1px solid rgba(255,255,255,.2);
    z-index: 10;
  }
  .ai-badge .bot-icon {
    display: flex;
    align-items: center;
    animation: ai-float 1s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
  }
  .ai-badge .bot-icon svg {
    width: 12px;
    height: 12px;
  }
  @keyframes ai-float {
    from { transform: translateY(0); }
    to { transform: translateY(-1px); }
  }
  
  .ai-border-svg {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    pointer-events: none;
    z-index: 1;
    fill: none;
    stroke: var(--accent);
    stroke-width: 1.5;
    stroke-dasharray: 6 4;
    stroke-linecap: round;
    animation: marching-ants 0.6s linear infinite;
  }
  @keyframes marching-ants {
    from { stroke-dashoffset: 10; }
    to { stroke-dashoffset: 0; }
  }

  :global(.k-card.ai-active) {
    border-color: transparent !important;
    animation: k-cyber-breath 3s infinite ease-in-out;
    position: relative;
    z-index: 5;
  }
  @keyframes k-cyber-breath {
    0%   { box-shadow: 0 0 4px var(--accent-dim); }
    50%  { box-shadow: 0 0 15px var(--accent-glow); }
    100% { box-shadow: 0 0 4px var(--accent-dim); }
  }
</style>
