<script>
  import { page } from '$app/state';
  import { md, esc, fmtDate } from '$lib/utils';

  let tasks = $state([]);
  let loading = $state(true);
  let statusFilter = $state('all');
  let dateFrom = $state('');
  let dateTo = $state('');

  const pid = $derived(page.params.id);

  async function fetchData() {
    if (!pid) return;
    loading = true;
    try {
      const resp = await fetch(`/api/projects/${pid}/tasks?include_archived=true`);
      const all = await resp.json();
      tasks = (all || []).filter(t => t.status === 'archived');
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (pid) fetchData();
  });

  const filtered = $derived(tasks.filter(t => {
    const meta = t.meta || {};
    const orig = meta.original_status || 'todo';
    if (statusFilter !== 'all' && orig !== statusFilter) return false;
    if (dateFrom && new Date(t.updated_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.updated_at) > new Date(dateTo)) return false;
    return true;
  }));

  async function restoreTask(tid, orig) {
    await fetch(`/api/projects/${pid}/tasks/${tid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: orig || 'todo' })
    });
    fetchData();
  }
</script>

<div class="page-hd">
  <div>
    <h1>Archived Tasks</h1>
    <div class="sub">Manage and restore archive tasks. Filter by original status or date.</div>
  </div>
</div>

<div class="form-card" style="margin-bottom:16px;display:flex;gap:12px;align-items:flex-end">
  <div class="dm-field">
    <label>Original Status</label>
    <select bind:value={statusFilter}>
      <option value="all">All statuses</option>
      {#each ['todo','in_progress', 'review', 'done', 'bugs'] as s}
        <option value={s}>{s}</option>
      {/each}
    </select>
  </div>
  <div class="dm-field">
    <label>From Date</label>
    <input type="date" bind:value={dateFrom}>
  </div>
  <div class="dm-field">
    <label>To Date</label>
    <input type="date" bind:value={dateTo}>
  </div>
  <button class="btn btn-ghost btn-sm" onclick={() => { statusFilter='all'; dateFrom=''; dateTo=''; }}>Clear</button>
</div>

<div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.15)">
  <table class="tbl">
    <thead>
      <tr>
        <th>Task Name</th>
        <th style="width:140px">Previous Status</th>
        <th style="width:140px">Archived On</th>
        <th style="text-align:right;width:100px">Action</th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <tr><td colspan="4" style="text-align:center;padding:40px">Loading...</td></tr>
      {:else if filtered.length}
        {#each filtered as t}
          {@const orig = t.meta?.original_status || 'todo'}
          <tr class="t-row">
            <td>
              <div class="k-card-id">#{t.id}</div>
              <div style="font-weight:600;color:var(--text)">{t.title}</div>
              <div style="font-size:11px;color:var(--text-mid);margin-top:2px">{@html md(t.description || '')}</div>
            </td>
            <td><span class="badge s-{orig}">{orig}</span></td>
            <td style="font-family:var(--mono);font-size:11px;color:var(--text-mid)">{fmtDate(t.updated_at)}</td>
            <td style="text-align:right">
              <button class="btn btn-out btn-sm" onclick={(e) => { e.stopPropagation(); restoreTask(t.id, orig); }}>Restore</button>
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="4" style="text-align:center;padding:60px 20px;color:var(--text-mid)">
            <div style="font-size:24px;margin-bottom:12px;opacity:0.3">◈</div>
            No archived tasks found
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
