// ══ Open / Create ═════════════════════════════════════════════════════════════
async function openWf(id) {
  S.cur=await api.g(`/api/projects/${window._activePid}/boards/${id}`);
  S.selNs=[]; S.selE=null;
  document.getElementById('wf-name').value=S.cur.name;
  
  // Update document title
  document.title = `${S.cur.name} • Board • Plano`;
  
  const pill=document.getElementById('type-pill');
  pill.className=`type-pill ${S.cur.type}`;
  pill.textContent=`● ${TYPE_LABELS[S.cur.type]||S.cur.type}`;
  renderPalette(); renderWfList(); renderCanvas(); closeProps();
  emptyHint(!S.cur.nodes.length);
}

function showNewModal() { document.getElementById('nm-n').value=''; document.getElementById('nm-d').value=''; document.getElementById('new-modal').style.display='flex' }
function closeModal(id) { document.getElementById(id).style.display='none' }

async function createWorkflow() {
  const name=document.getElementById('nm-n').value.trim()||'New Board';
  const type=document.getElementById('nm-t').value;
  const desc=document.getElementById('nm-d').value;
  const body = {name, type, description:desc};
  const d=await api.p(`/api/projects/${window._activePid}/boards`, body);
  S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`);
  closeModal('new-modal'); await openWf(d.id); toast('Board created','ok');
}

async function saveDiagram() {
  if(!S.cur) return;
  const name=document.getElementById('wf-name').value.trim()||S.cur.name;
  await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}`,{name});
  S.cur.name=name; S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`); renderWfList(); toast('Saved ✓','ok');
}

async function deleteWf(id) {
  if(!confirm('Delete this board permanently?')) return;
  await api.d(`/api/projects/${window._activePid}/boards/${id}`);
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`);
  if(S.cur?.id === id) {
    if(S.diagrams.length) await openWf(S.diagrams[0].id);
    else { S.cur = null; renderCanvas(); renderPalette(); document.getElementById('wf-name').value='No Board'; }
  }
  renderWfList(); toast('Board deleted');
}

async function duplicateWf(id) {
  const d = await api.p(`/api/projects/${window._activePid}/boards/${id}/duplicate`, {});
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`);
  renderWfList();
  await openWf(d.id);
  toast('Board duplicated','ok');
}

async function autoLayoutNodes() {
  if(!S.cur) return;
  toast('Arranging nodes...');
  const res = await api.p(`/api/projects/${window._activePid}/boards/${S.cur.id}/auto-layout`, {
    direction: 'LR',
    node_spacing: 80,
    rank_spacing: 300
  });
  if(res.error) { toast('Layout error: ' + res.error, 'err'); return; }
  S.cur = res;
  renderCanvas();
  fitView();
  toast('Layout complete', 'ok');
}
