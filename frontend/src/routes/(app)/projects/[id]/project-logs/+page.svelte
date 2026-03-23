<script>
  import { page } from '$app/state';
  import { md, esc, timeAgo } from '$lib/utils';

  let logs = $state([]);
  let loading = $state(true);
  let totalLogs = $state(0);

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const resp = await fetch(`/api/projects/${pid}/changelog?per_page=100`);
      const data = await resp.json();
      logs = data.entries || [];
      totalLogs = data.total || 0;
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (pid) fetchData();
  });

  const grouped = $derived(logs.reduce((acc, c) => {
    const day = new Date(c.timestamp).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    (acc[day] = acc[day] || []).push(c);
    return acc;
  }, {}));

  const icons = {
    project: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`,
    task: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><polyline points="20 6 9 17 4 12"/></svg>`,
    milestone: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    board: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    update: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:-2.5px"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>`
  };

  let selectedLog = $state(null);
</script>

<div class="page-hd">
  <div>
    <h1>Project Logs</h1>
    <div class="sub">A chronological audit trail of all manual and AI modifications</div>
  </div>
  <span style="font-size:12px;color:var(--text-mid);margin-left:auto;font-family:var(--mono)">{totalLogs} entries</span>
</div>

<div class="prose-wrap">
  {#if loading}
    <div class="empty">Reading audit logs...</div>
  {:else if Object.keys(grouped).length}
    {#each Object.entries(grouped) as [day, entries]}
      <div class="cl-day">
        <div class="cl-day-label"><span>{day}</span></div>
        {#each entries as c}
          <div class="cl-entry act-{c.action}" onclick={() => selectedLog = c}>
            <div class="cl-entry-main">
              <div class="cl-entry-header">
                <span class="cl-action cl-action-{c.action}">{c.action}</span>
                <span class="cl-entity">
                  {@html icons[c.entity_type] || '◈'}
                  <strong>{c.entity_type}</strong>: #{c.entity_id}
                </span>
              </div>
              {#if c.field_changed && c.field_changed !== 'updated_at'}
                <div class="cl-diff">
                   <span class="cl-field">{c.field_changed}:</span>
                   <span class="old">{c.old_value || '—'}</span> <span class="arrow">→</span> <span class="new">{c.new_value || '—'}</span>
                </div>
              {/if}
            </div>
            <div class="cl-time">{timeAgo(c.timestamp)}<br>{new Date(c.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        {/each}
      </div>
    {/each}
  {:else}
    <div class="empty">
      <div class="icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
      </div>
      <p>No changes logged yet</p>
    </div>
  {/if}
</div>

{#if selectedLog}
  <div class="detail-overlay" onclick={e => e.target === e.currentTarget && (selectedLog = null)}>
    <div class="detail-modal animate-in">
      <div class="dm-header">
        <div class="dm-header-icon">📜</div>
        <div class="dm-header-body">
          <h2>Log Entry #{selectedLog.id}</h2>
          <div class="dm-meta">
            <span class="cl-action cl-action-{selectedLog.action}">{selectedLog.action}</span>
            <span class="update-meta">{new Date(selectedLog.timestamp).toLocaleString()}</span>
          </div>
        </div>
        <button class="dm-close" onclick={() => selectedLog = null}>✕</button>
      </div>
      <div class="dm-body">
        <div class="dm-section">
           <div class="dm-section-label">Source</div>
           <p style="font-size:13px">{selectedLog.entity_type} #{selectedLog.entity_id}</p>
        </div>
        {#if selectedLog.field_changed}
          <div class="dm-section">
            <div class="dm-section-label">Field: {selectedLog.field_changed}</div>
            <div class="cl-diff" style="padding:12px">
              <div><span class="cl-field">Before:</span> <span class="old">{selectedLog.old_value || '—'}</span></div>
              <div><span class="cl-field">After:</span> <span class="new">{selectedLog.new_value || '—'}</span></div>
            </div>
          </div>
        {/if}
      </div>
      <div class="dm-footer">
        <button class="btn btn-out btn-sm" onclick={() => selectedLog = null}>Close</button>
      </div>
    </div>
  </div>
{/if}
