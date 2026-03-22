// ── EVENT HANDLERS AND GLOBAL UI ────────────────────────────────

function initRealtimeEvents() {
  if (window._sse_init) return;
  window._sse_init = true;
  console.log('📡 Initializing Real-time Events...');
  const source = new EventSource('/api/events');
  source.onmessage = (e) => {
    try {
      const { type, data } = JSON.parse(e.data);
      console.log('🔗 Event Received:', type, data);
      
      if (type === 'task_updated') {
        if (window._pid === data.project_id) {
          updateTaskCardInUI(data);
          // If we also have a changelog feed on screen, we might want to refresh it or wait for changelog event
        }
      } else if (type === 'task_created' || type === 'task_deleted') {
        if (window._pid === data.project_id) {
          if (location.hash.includes('/tasks')) renderTasks(window._pid);
          else loadSidebar(); // just update sidebar counts
        }
      } else if (type === 'changelog_created') {
        if (window._pid === data.project_id || !window._pid) {
          handleRealtimeChangelog(data);
        }
      } else if (type === 'system_change') {
        console.log('🔄 System Change Detect:', data);
        // Toast for visibility
        if (data.tool) toast(`AI via ${data.tool} modified ${data.path}`, 'ok');
        // Refresh sidebar counts
        loadSidebar();
        // If it's the current project, refresh current view
        if (data.path.includes(`/projects/${window._pid}`)) {
          // If we're on a specific page, we might want more targeted refresh
          // But for now, generic route() might be overkill. 
          // Let's just refresh the dashboard part if relevant.
        }
      } else if (type === 'mcp_tool_call') {
        console.log('🤖 MCP Tool Call:', data);
        showMcpIndicator(data.tool, data.method, data.path);
      }
    } catch(err) { console.error('SSE Error:', err); }
  };
  source.onerror = () => {
    console.warn('SSE Connection lost. Reconnecting...');
  };
}

function updateTaskCardInUI(task) {
  const card = document.getElementById(`task-${task.id}`);
  if (!card) {
    // If we're on the tasks page, we might need to add it if it's new
    if (location.hash.includes(`/projects/${task.project_id}/tasks`)) renderTasks(task.project_id);
    return;
  }
  
  // If status changed, we must move it (full re-render is easiest for now to keep order)
  if (card.dataset.status !== task.status) {
    renderTasks(task.project_id);
    return;
  }

  // Update AI status
  const isAiWorking = !!task.is_ai_working;
  const wasAiWorking = card.classList.contains('ai-active');
  
  if (isAiWorking !== wasAiWorking) {
    card.classList.toggle('ai-active', isAiWorking);
    let badge = card.querySelector('.ai-badge');
    if (isAiWorking && !badge) {
      card.insertAdjacentHTML('afterbegin', '<div class="ai-badge"><span></span> AI Working</div>');
    } else if (!isAiWorking && badge) {
      badge.remove();
    }
    // Update the task in memory too
    if (window._tasks) {
      const idx = window._tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) window._tasks[idx] = task;
    }
  }
}

window.toggleFileDiff = async function(el, pid, tid, path) {
  const wrap = el.parentElement;
  const view = wrap.querySelector('.file-diff-view');
  if (view.style.display === '') {
    view.style.display = 'none';
    el.querySelector('span:last-child').style.transform = '';
    return;
  }
  
  if (!view.dataset.loaded) {
    view.innerHTML = '<div style="padding:12px;color:var(--mid);font-size:11px;font-family:var(--mono)">Loading diff...</div>';
    view.style.display = '';
    el.querySelector('span:last-child').style.transform = 'rotate(180deg)';
    
    try {
      const diffs = await api('GET', `/api/projects/${pid}/tasks/${tid}/diff`);
      const item = diffs.find(d => d.path === path);
      if (item && item.diff && item.diff.trim()) {
        const lines = item.diff.split('\n');
        view.innerHTML = `
          <pre style="margin:0;padding:12px;font-size:11px;font-family:var(--mono);line-height:1.6;color:var(--text);white-space:pre-wrap;max-height:400px;overflow-y:auto">` + 
          lines.map(l => {
            if (l.startsWith('+') && !l.startsWith('+++')) return `<div style="color:var(--green);background:rgba(74,222,128,.1);margin:0 -12px;padding:0 12px">${esc(l)}</div>`;
            if (l.startsWith('-') && !l.startsWith('---')) return `<div style="color:var(--rose);background:rgba(251,113,133,.1);margin:0 -12px;padding:0 12px">${esc(l)}</div>`;
            if (l.startsWith('@@')) return `<div style="color:var(--purple);font-weight:700;opacity:.7;margin:0 -12px;padding:0 12px;background:rgba(167,139,250,.05)">${esc(l)}</div>`;
            if (l.startsWith('diff') || l.startsWith('index') || l.startsWith('---') || l.startsWith('+++')) return `<div style="color:var(--dim);margin:0 -12px;padding:0 12px">${esc(l)}</div>`;
            return `<div style="padding:0 12px;margin:0 -12px">${esc(l)}</div>`;
          }).join('') + `</pre>`;
        view.dataset.loaded = 'true';
      } else {
        view.innerHTML = '<div style="padding:12px;color:var(--dim);font-size:11px;font-family:var(--mono)">No changes detected in working tree.</div>';
      }
    } catch(e) {
      view.innerHTML = `<div style="padding:12px;color:var(--rose);font-size:11px;font-family:var(--mono)">Error: ${esc(e.message)}</div>`;
    }
  } else {
    view.style.display = '';
    el.querySelector('span:last-child').style.transform = 'rotate(180deg)';
  }
};

function handleRealtimeChangelog(c) {
  console.log('📜 Real-time Changelog:', c);
  
  // 1. Update Recent Activity feed if it exists
  const feed = document.querySelector('.feed');
  if (feed) {
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.style.animation = 'modalIn .3s ease';
    
    // We need logic to generate the text. We can reuse or simplified.
    const entityIcons = {project:'📁',task:'✅',milestone:'🏁',board:'📋',update:'💬',idea:'💡'};
    const icon = entityIcons[c.entity_type]||'◈';
    
    let summary = `${c.action} ${c.entity_type}`;
    if (c.field_changed) summary += ` — ${c.field_changed}`;
    
    item.innerHTML = `
      <div class="feed-dot dot-${c.action}"></div>
      <div class="feed-body">
        <div class="feed-text"><strong>${c.action}</strong> ${c.entity_type}${c.field_changed?' — '+c.field_changed:''}</div>
        <div class="feed-time">just now</div>
      </div>
    `;
    feed.prepend(item);
    // Remove last if too many
    if (feed.children.length > 15) feed.lastElementChild.remove();
  }

  // 2. Update stats on overview if they are visible
  if (location.hash === `#/projects/${c.project_id}`) {
    // Optionally trigger a full re-render of stats, but let's keep it simple for now
  }
}

let _mcpIndicatorTimeout = null;
function showMcpIndicator(tool, method, path) {
  const container = document.getElementById('mcp-status-container');
  if (!container) return;
  
  // Remove existing if any
  container.innerHTML = '';
  
  const el = document.createElement('div');
  el.className = 'mcp-indicator';
  el.innerHTML = `
    <div class="icon">🤖</div>
    <div class="body">
      <div class="title">AI is thinking...</div>
      <div class="tool">${tool}</div>
    </div>
    <div class="dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(el);
  
  clearTimeout(_mcpIndicatorTimeout);
  _mcpIndicatorTimeout = setTimeout(() => {
    el.style.transform = 'translateX(100%)';
    el.style.opacity = '0';
    el.style.transition = 'all .4s ease-in';
    setTimeout(() => el.remove(), 400);
  }, 4000);
}
 
window.toggleMdEdit = function(el) {
  const section = el.closest('.dm-section');
  const btn = section.querySelector('.dm-edit-btn');
  const view = section.querySelector('.dm-desc');
  const field = section.querySelector('textarea');
  if (field.style.display === 'none') {
    field.style.display = 'block';
    view.style.display = 'none';
    if(btn) btn.textContent = 'VIEW';
    field.focus();
  } else {
    field.style.display = 'none';
    view.style.display = 'block';
    if(btn) btn.textContent = 'EDIT';
    view.innerHTML = md(field.value) || '<em style="color:var(--mid)">No description yet.</em>';
  }
};

// ── BOOT ─────────────────────────────────────────────────────
(async () => {
  window._pid = null;
  await loadSidebar();
  initRealtimeEvents();
  // If URL is /project/:pid, redirect to hash route
  const m = location.pathname.match(/\/project\/(\d+)/);
  if (m && !location.hash) { location.hash = `#/projects/${m[1]}`; return; }
  // If no hash, default to stored active project or home
  if (!location.hash || location.hash === '#') {
    const ap = getActiveProject();
    location.hash = ap ? `#/projects/${ap.id}` : '#/';
    return;
  }
  route();
})();
