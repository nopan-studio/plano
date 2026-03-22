// ══ API Modal ════════════════════════════════════════════════════════════════
async function showApiModal(){
  document.getElementById('api-modal').style.display='flex';
  const docs=await api.g('/api');
  const el=document.getElementById('api-content');
  const MT={'GET':['m-get','GET'],'POST':['m-post','POST'],'PUT':['m-put','PUT'],'DELETE':['m-del','DEL'],'PATCH':['m-put','PATCH']};
  el.innerHTML=`<div style="font-size:11px;color:var(--text-dim);margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--panel-border)">Base URL: <code style="color:var(--accent);font-size:11px">${window.location.origin}</code></div>`+
  Object.entries(docs.endpoints).map(([g,eps])=>`
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-dim);margin:12px 0 5px">${g}</div>
    ${Object.entries(eps).map(([route,desc])=>{
      const [m,...pp]=route.trim().split(/\s+/);
      const [cls,lbl]=(MT[m]||['m-get',m]);
      return `<div class="api-row"><span class="method-tag ${cls}">${lbl}</span><div><div class="api-path">${esc(pp.join(' '))}</div><div class="api-desc">${esc(String(desc))}</div></div></div>`;
    }).join('')}`).join('');
}

// ── REAL-TIME EVENTS ──────────────────────────────────────────
function initRealtimeEvents() {
  console.log('📡 Initializing Real-time Events (Editor)...');
  const source = new EventSource('/api/events');
  source.onmessage = (e) => {
    try {
      const { type, data } = JSON.parse(e.data);
      if (type === 'system_change') {
        // If it's a board update for THIS board, refresh
        if (S.cur && data.path.includes(`/boards/${S.cur.id}`)) {
          console.log('🔄 Remote board change detected, refreshing...', data.tool);
          refreshBoardData();
          if (data.tool) toast(`AI (${data.tool}) updated board`, 'ok');
        }
      } else if (type === 'mcp_tool_call') {
        showMcpIndicator(data.tool);
      }
    } catch(err) { console.error('SSE Error:', err); }
  };
}

async function refreshBoardData() {
  if (!S.cur) return;
  const board = await api.g(`/api/projects/${window._activePid}/boards/${S.cur.id}`);
  if (board.error) return;
  S.cur = board;
  renderCanvas();
  // Optional: only fit view if it's the first load or explicit
}

let _mcpIndicatorTimeout = null;
function showMcpIndicator(tool) {
  const container = document.getElementById('mcp-status-container');
  if (!container) return;
  container.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'mcp-indicator';
  el.innerHTML = `<div class="icon">🤖</div><div class="body"><div class="title">AI is thinking...</div><div class="tool">${tool}</div></div><div class="dots"><span></span><span></span><span></span></div>`;
  container.appendChild(el);
  clearTimeout(_mcpIndicatorTimeout);
  _mcpIndicatorTimeout = setTimeout(() => {
    el.style.transform = 'translateX(100%)'; el.style.opacity = '0'; el.style.transition = 'all .4s ease-in';
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

// ══ Init ═════════════════════════════════════════════════════════════════════
async function init() {
  // Resolve project context from URL path /project/:pid/editor/:did
  let pidFromUrl = null;
  let didFromUrl = null;
  const pathParts = window.location.pathname.match(/\/project\/(\d+)\/editor(?:\/(\d+))?/);
  if (pathParts) {
    pidFromUrl = pathParts[1];
    if (pathParts[2]) didFromUrl = pathParts[2];
  }
  
  let returnHash = '#/';
  try {
    const stored = JSON.parse(localStorage.getItem('fmc_editor_return') || 'null');
    if (stored && (pidFromUrl ? stored.pid == pidFromUrl : true)) {
      returnHash = stored.hash || '#/';
    } else if (pidFromUrl) {
      returnHash = `#/projects/${pidFromUrl}/boards`;
    }
  } catch {}
  // Update back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.href = '/' + returnHash;

  const activePid = pidFromUrl || (()=>{ try { return JSON.parse(localStorage.getItem('fmc_active_project'))?.id; } catch {} })();
  window._activePid = activePid ? +activePid : null;
  
  if (!window._activePid) {
    alert("Editor requires a valid project context.");
    window.location.href = '/';
    return;
  }

  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`);

  renderWfList(); renderPalette(); setupCanvas();

  if (didFromUrl) {
    await openWf(+didFromUrl);
  } else if (S.diagrams.length) {
    await openWf(S.diagrams[0].id);
  } else {
    const projectBody = {name:'My Board', type:'process_flow', description:''};
    const d = await api.p(`/api/projects/${window._activePid}/boards`, projectBody);
    S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`);
    await openWf(d.id);
  }
}

init();
initRealtimeEvents();
