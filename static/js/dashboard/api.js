const B = window.location.origin;
let _projects = [];
let _activeProject = null; // {id, name}

// ── API ───────────────────────────────────────────────────────
async function api(method, path, body=null) {
  const opts = {method, headers:{'Content-Type':'application/json'}};
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(B + path, opts);
  return r.json();
}

function toast(msg, cls='ok') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = cls+' show';
  setTimeout(()=>t.className='', 2600);
}

// ── localStorage active project ───────────────────────────────
function setActiveProject(p) {
  _activeProject = p;
  if (p) localStorage.setItem('fmc_active_project', JSON.stringify(p));
  else localStorage.removeItem('fmc_active_project');
}
function getActiveProject() {
  try { return JSON.parse(localStorage.getItem('fmc_active_project')); } catch { return null; }
}

// ── Helpers ───────────────────────────────────────────────────
function view(html) {
  document.getElementById('main-view').innerHTML = html;
  return Promise.resolve();
}
