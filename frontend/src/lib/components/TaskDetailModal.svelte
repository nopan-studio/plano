<script>
  import { md, fmtDate } from '$lib/utils';
  
  let { task = $bindable(), milestones = [], onClose, onDelete, onArchive, onSave } = $props();
  
  let editDesc = $state(false);
  let textarea = $state();

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }

  $effect(() => {
    if (editDesc && textarea) {
      textarea.focus();
    }
  });

  const pColor = $derived({
    low: 'var(--text-dim)',
    medium: 'var(--blue)',
    high: 'var(--amber)',
    critical: 'var(--rose)'
  }[task.priority] || 'var(--text-dim)');

</script>

<svelte:window onkeydown={handleKeydown} />

<div class="detail-overlay" onclick={handleOverlayClick} aria-hidden="true">
  <div class="detail-modal animate-in">
    <div class="dm-header">
      <div class="dm-header-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--blue)">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="dm-header-body">
        <h2>{task.title}</h2>
        <div class="dm-meta">
          <span class="badge s-{task.status}">{task.status.replace('_', ' ')}</span>
          <span class="chip" style="color:{pColor}; background:var(--surface2)">● {task.priority}</span>
          {#if task.assignee}
            <span class="chip chip-assignee">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-1px">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg> 
              {task.assignee}
            </span>
          {/if}
        </div>
      </div>
      <button class="dm-close" onclick={onClose}>✕</button>
    </div>
    <div class="dm-body">
      <div class="dm-section">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
          <div class="dm-section-label">Description</div>
          <button class="btn btn-out btn-xs dm-edit-btn" style="font-size:10px; padding:2px 8px; font-weight:700" onclick={() => editDesc = !editDesc}>
            {editDesc ? 'PREVIEW' : 'EDIT'}
          </button>
        </div>
        {#if !editDesc}
          <div class="dm-desc" style="background:var(--surface); border:1px solid var(--border2); padding:12px; border-radius:var(--r); min-height:60px; cursor:pointer" onclick={() => editDesc = true} aria-hidden="true">
            {@html md(task.description) || '<span style="color:var(--text-dim); font-style:italic">No description.</span>'}
          </div>
        {:else}
          <textarea 
            bind:this={textarea}
            bind:value={task.description} 
            class="dm-field" 
            style="width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px"
            onblur={() => editDesc = false}
          ></textarea>
        {/if}
      </div>

      <div class="dm-field-row">
        <div class="dm-field">
          <label for="dm-status">Status</label>
          <select id="dm-status" bind:value={task.status} class="full">
            {#each ['todo', 'in_progress', 'review', 'done', 'bugs'] as s}
              <option value={s}>{s.replace('_', ' ')}</option>
            {/each}
          </select>
        </div>
        <div class="dm-field">
          <label for="dm-priority">Priority</label>
          <select id="dm-priority" bind:value={task.priority} class="full">
            {#each ['low', 'medium', 'high', 'critical'] as p}
              <option value={p}>{p}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="dm-field-row">
        <div class="dm-field">
          <label for="dm-assignee">Assignee</label>
          <input type="text" id="dm-assignee" bind:value={task.assignee} placeholder="Unassigned">
        </div>
        <div class="dm-field">
          <label for="dm-due">Due Date</label>
          <input type="date" id="dm-due" bind:value={task.due_date}>
        </div>
      </div>

      <div class="dm-field-row">
        <div class="dm-field">
          <label for="dm-milestone">Milestone</label>
          <select id="dm-milestone" bind:value={task.milestone_id} class="full">
            <option value={null}>None</option>
            {#each milestones as ms}
              <option value={ms.id}>{ms.name}</option>
            {/each}
          </select>
        </div>
        <div class="dm-field">
          <label for="dm-hours">Estimated Hours</label>
          <input type="number" id="dm-hours" bind:value={task.estimated_hours} placeholder="0">
        </div>
      </div>

      <div class="dm-section" style="padding:12px;background:var(--surface);border:1px solid var(--border2);border-radius:var(--r);display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <input type="checkbox" id="dm-ai" bind:checked={task.is_ai_working} style="width:18px;height:18px;accent-color:var(--accent)">
        <label for="dm-ai" style="display:block">
          <div style="font-size:13px;font-weight:600;color:var(--accent)">AI Agent is working on this task</div>
          <div style="font-size:11px;color:var(--text-dim)">Toggles the real-time heartbeat and UI animations</div>
        </label>
      </div>

      {#if task.files_meta}
        {@const files = typeof task.files_meta === 'string' ? JSON.parse(task.files_meta) : task.files_meta}
        {#if files && files.length > 0}
          <div class="dm-section">
            <div class="dm-section-label">Files Affected</div>
            <div class="file-list">
              {#each files as f}
                <div class="file-item">
                  <span class="file-action fa-{f.action}">{f.action}</span>
                  <span class="file-path">{f.path}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
    <div class="dm-footer">
      <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick={onDelete}>Delete</button>
      {#if ['done', 'review', 'bugs'].includes(task.status)}
        <button class="btn btn-ghost btn-sm" style="margin-right:auto" onclick={onArchive}>Archive</button>
      {:else}
        <button class="btn btn-ghost btn-sm" style="margin-right:auto;opacity:0.5" disabled title="Task must be Done, Review or Bug to archive">Archive</button>
      {/if}
      <button class="btn btn-acc btn-sm" onclick={onSave}>Save Changes</button>
    </div>
  </div>
</div>

<style>
  .detail-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .7);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px;
    overflow-y: auto;
  }
  .detail-modal {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 640px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, .9);
  }
  .animate-in {
    animation: modalIn .18s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: none; }
  }
  .dm-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 24px 14px;
    border-bottom: 1px solid var(--border);
  }
  .dm-header-icon {
    font-size: 22px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .dm-header-body {
    flex: 1;
    min-width: 0;
  }
  .dm-header-body h2 {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 4px;
    color: var(--text);
  }
  .dm-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: wrap;
  }
  .dm-close {
    width: 30px;
    height: 30px;
    border-radius: var(--r);
    border: none;
    background: var(--surface);
    color: var(--text-mid);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: .12s;
  }
  .dm-close:hover {
    background: var(--surface2);
    color: var(--text);
  }
  .dm-body {
    padding: 20px 24px;
  }
  .dm-section {
    margin-bottom: 18px;
  }
  .dm-section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: var(--text-dim);
    margin-bottom: 8px;
  }
  .dm-desc {
    font-size: 14px;
    line-height: 1.8;
    color: var(--text);
    word-break: break-word;
  }
  .dm-field-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .dm-field {
    flex: 1;
    min-width: 120px;
  }
  .dm-field label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--text-dim);
    margin-bottom: 4px;
  }
  .dm-field input, .dm-field select, select.full {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--r);
    color: var(--text);
    font-family: var(--sans);
    font-size: 13px;
    padding: 7px 10px;
    outline: none;
  }
  .dm-field input:focus, .dm-field select:focus {
    border-color: var(--accent);
  }
  .dm-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 14px 24px;
    border-top: 1px solid var(--border);
  }

  /* Files Affected */
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }
  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--r);
    font-size: 12px;
    font-family: var(--mono);
    cursor: default;
    transition: .12s;
  }
  .file-action {
    font-size: 10px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .fa-added { background: var(--green-dim); color: var(--green); }
  .fa-modified { background: var(--blue-dim); color: var(--blue); }
  .fa-deleted { background: var(--rose-dim); color: var(--rose); }
  .file-path {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap; color: var(--text-mid);
  }
  .badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: .04em;
    white-space: nowrap;
  }
  .s-todo { background: var(--surface); color: var(--text-mid); }
  .s-in_progress { background: var(--blue-dim); color: var(--blue); }
  .s-review { background: var(--amber-dim); color: var(--amber); }
  .s-done { background: var(--green-dim); color: var(--green); }
  .s-bugs { background: var(--rose-dim); color: var(--rose); }

  .chip {
    font-size: 10px; padding: 3px 9px; border-radius: 8px; font-weight: 600; font-family: var(--mono); white-space: nowrap;
  }
  .chip-assignee { background: var(--surface2); color: var(--text-mid); }
</style>
