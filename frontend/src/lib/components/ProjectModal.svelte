<script>
  import { onMount } from 'svelte';
  import { toast } from '$lib/toast.svelte';

  let { project = $bindable({ name: '', description: '', status: 'planning', priority: 'medium' }), onClose, onSave, isNew = true } = $props();

  let fileInput = $state();
  let importing = $state(false);

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    importing = true;
    try {
      const text = await file.text();
      const blob = JSON.parse(text);

      const resp = await fetch('/api/projects/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blob)
      });

      if (resp.ok) {
        const result = await resp.json();
        const p = result.project;
        toast.success(`Imported "${p.name}" with ${p.task_count||0} tasks, ${p.milestone_count||0} milestones, and ${p.board_count||0} boards.`);
        onSave(result); // Refresh list with result context
        onClose();
      } else {
        const err = await resp.json();
        toast.error(err.error || "Failed to import project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid JSON file");
    } finally {
      importing = false;
    }
  }

  function triggerImport() {
    fileInput.click();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="detail-overlay" onclick={handleOverlayClick} aria-hidden="true">
  <div class="detail-modal animate-in">
    <div class="dm-header">
      <div class="dm-header-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent)">
          <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
        </svg>
      </div>
      <div class="dm-header-body">
        <h2>{isNew ? 'Create New Project' : 'Project Settings'}</h2>
        <div class="dm-meta">
          <span class="badge" style="background:var(--surface2); color:var(--text-mid)">WORKSPACE</span>
        </div>
      </div>
      <button class="dm-close" onclick={onClose}>✕</button>
    </div>

    <div class="dm-body">
      <div class="dm-field">
        <label for="p-name">Project Name</label>
        <input type="text" id="p-name" bind:value={project.name} placeholder="e.g. My Awesome App" class="full">
      </div>

      <div class="dm-field" style="margin-top:16px">
        <label for="p-desc">Description</label>
        <textarea id="p-desc" bind:value={project.description} placeholder="What is this project about?" style="width:100%; min-height:80px" class="dm-field-input"></textarea>
      </div>

      <div class="dm-field-row" style="margin-top:16px">
        <div class="dm-field">
          <label for="p-status">Status</label>
          <select id="p-status" bind:value={project.status} class="full">
            {#each ['planning', 'active', 'on_hold', 'completed', 'archived'] as s}
              <option value={s}>{s.replace('_', ' ')}</option>
            {/each}
          </select>
        </div>
        <div class="dm-field">
          <label for="p-priority">Priority</label>
          <select id="p-priority" bind:value={project.priority} class="full">
            {#each ['low', 'medium', 'high', 'critical'] as p}
              <option value={p}>{p}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if isNew}
        <div class="import-section" style="margin-top:24px; padding-top:20px; border-top:1px dashed var(--border2)">
          <div style="font-size:12px; font-weight:600; color:var(--text-mid); margin-bottom:12px">OR IMPORT FROM FILE</div>
          <button class="btn btn-ghost btn-sm" onclick={triggerImport} disabled={importing}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {importing ? 'Importing...' : 'Upload .json export'}
          </button>
          <input type="file" bind:this={fileInput} accept=".json" onchange={handleImport} style="display:none">
        </div>
      {/if}
    </div>

    <div class="dm-footer">
      <button class="btn btn-ghost btn-sm" onclick={onClose}>Cancel</button>
      <button class="btn btn-acc btn-sm" onclick={onSave} disabled={!project.name}>
        {isNew ? 'Create Project' : 'Save Changes'}
      </button>
    </div>
  </div>
</div>

<style>
  .detail-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .7);
    z-index: 2000000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .detail-modal {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, .9);
  }
  .animate-in {
    animation: modalIn .18s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
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
  }
  .dm-body {
    padding: 24px;
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
  .dm-field input, .dm-field select, .dm-field-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--r);
    color: var(--text);
    font-family: var(--sans);
    font-size: 13px;
    padding: 8px 12px;
    outline: none;
  }
  .dm-field input:focus, .dm-field select:focus, .dm-field-input:focus {
    border-color: var(--accent);
  }
  .dm-field-row {
    display: flex;
    gap: 12px;
  }
  .dm-field-row .dm-field {
    flex: 1;
  }
  .dm-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid var(--border);
  }
  .badge {
    font-size: 9px;
    font-weight: 800;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }
</style>
