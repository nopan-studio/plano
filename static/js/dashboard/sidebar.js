function toggleWorkspaces() {
  document.getElementById('workspaces-list').classList.toggle('show');
}

// Close dropdown on click outside
window.addEventListener('click', e => {
  if (!e.target.closest('.workspaces-dropdown')) {
    const wl = document.getElementById('workspaces-list');
    if (wl) wl.classList.remove('show');
  }
});

async function loadSidebar() {
  _projects = await api('GET', '/api/projects');
  renderSidebar();
}

function renderSidebar() {
  const listEl = document.getElementById('workspaces-list');
  const activeNameEl = document.getElementById('active-workspace-name');
  if (!listEl) return;
  
  listEl.innerHTML = _projects.map(p =>
    `<a href="#/projects/${p.id}" data-pid="${p.id}" onclick="toggleWorkspaces()">${esc(p.name)}
      <span class="badge">${p.task_count||0}</span>
    </a>`
  ).join('');

  // Update active workspace name
  const pid = getActivePidFromUrl();
  const current = _projects.find(p => p.id === pid);
  if (current) {
    activeNameEl.textContent = current.name;
    renderSidebarSubnav(pid);
  } else {
    activeNameEl.textContent = 'Select Workspace';
    const subnav = document.getElementById('sidebar-subnav');
    if (subnav) subnav.style.display = 'none';
  }

  // Highlight active items
  const curHash = location.hash || '#/';
  document.querySelectorAll('.sidebar a, .nav-item, .subnav-item').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('act', href === curHash || (curHash==='' && href==='#/'));
  });
}

function getActivePidFromUrl() {
  const m = location.hash.match(/^#\/projects\/(\d+)/);
  return m ? +m[1] : null;
}

const sidebarIcons = {
  Overview: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM3 9h18M9 21V9"/></svg>`,
  Tasks: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
  Milestones: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  Boards: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  Updates: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  Ideas: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
  'Project Logs': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  Archive: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
};

function renderSidebarSubnav(pid) {
  const subnav = document.getElementById('sidebar-subnav');
  const curHash = location.hash;
  const tabs = ['Overview', 'Tasks', 'Milestones', 'Boards', 'Updates', 'Ideas', 'Archive', 'Project Logs'];
  
  subnav.innerHTML = `
    <div class="sidebar-hd">Navigation</div>
    ${tabs.map(t => {
      const slug = t.toLowerCase().replace(' ', '-');
      const href = slug === 'overview' ? `#/projects/${pid}` : `#/projects/${pid}/${slug}`;
      const isAct = curHash === href;
      return `<a href="${href}" class="subnav-item ${isAct ? 'act' : ''}">${sidebarIcons[t]||''} ${t}</a>`;
    }).join('')}
  `;
  subnav.style.display = 'block';
}

function setBreadcrumb(items) {
  const el = document.getElementById('breadcrumb');
  el.innerHTML = items.map((it,i) =>
    i < items.length-1
      ? `<a href="${it.href||'#/'}">${esc(it.label)}</a><span class="sep">›</span>`
      : `<span>${esc(it.label)}</span>`
  ).join('');
}
