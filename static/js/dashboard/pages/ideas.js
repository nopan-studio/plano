async function renderIdeas(pid) {
  const [proj, ideas] = await Promise.all([api('GET',`/api/projects/${pid}`),api('GET',`/api/ideas?project_id=${pid}`)]);
  setActiveProject({id:pid,name:proj.name});
  setBreadcrumb([{label:'Overview',href:'#/'},{label:proj.name,href:`#/projects/${pid}`},{label:'Ideas'}]);
  renderIdeasView(pid, ideas, true);
}
async function renderAllIdeas() {
  const ideas = await api('GET','/api/ideas');
  setBreadcrumb([{label:'Overview',href:'#/'},{label:'All Ideas'}]);
  renderIdeasView(null, ideas, false);
}
function renderIdeasView(pid, ideas, showTabs) {
  const hdr = `<div class="page-hd">
    <div>
      <h1>${pid?'Ideas':'All Ideas'}</h1>
      <div class="sub">Store and vote on potential workspace features and future plans</div>
    </div>
    <button class="btn btn-acc btn-sm" style="margin-left:auto" onclick="openNewIdeaModal(${pid||'null'})">+ New Idea</button>
  </div>`;
  view(`
    ${hdr}
    <div class="prose-wrap">
      ${ideas.length ? `<div class="idea-post-list">${ideas.map(i=>`
        <div class="idea-post" style="cursor:pointer" onclick="openIdeaDetail(${i.id},${pid||'null'})">
          <div class="idea-post-header">
            <div class="idea-post-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> ${esc(i.title)}</div>
            <span class="badge s-${i.status}">${i.status}</span>
          </div>
          ${i.description?`<div class="idea-post-desc">${md(i.description)}</div>`:``}
          <div class="idea-post-footer">
            <button class="vote-btn" onclick="event.stopPropagation();voteIdea(${i.id})">▲ ${i.votes} votes</button>
            ${i.tags&&i.tags.length?i.tags.map(t=>`<span class="chip" style="background:var(--surf2);color:var(--mid)">${esc(t)}</span>`).join('') : ''}
          </div>
        </div>`).join('')}</div>` : '<div class="empty"><div class="icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.3;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div><p>No ideas yet</p></div>'}
    </div>
  `);
}
window.openNewIdeaModal = function(pid) {
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></div>
          <div class="dm-header-body">
            <h2>New Idea</h2>
            <div class="dm-meta">Share your thoughts for the project</div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <label class="dm-section-label">Title</label>
            <input type="text" id="if-title" placeholder="Idea title">
          </div>
          <div class="dm-section">
            <label class="dm-section-label">Description</label>
            <textarea id="if-desc" placeholder="Describe your idea..." style="min-height:120px"></textarea>
          </div>
        </div>
        <div class="dm-footer">
          <button class="btn btn-out btn-sm" onclick="closeDetailModal()">Cancel</button>
          <button class="btn btn-acc btn-sm" onclick="createIdea(${pid})">Submit Idea</button>
        </div>
      </div>
    </div>`;
};
window.createIdea = async function(pid){
  const title=document.getElementById('if-title').value.trim(); if(!title) return toast('Title required','err');
  const body={title,description:document.getElementById('if-desc').value.trim()};
  if(pid && pid!=='null') body.project_id=pid;
  const r=await api('POST','/api/ideas',body); if(r.error) return toast(r.error,'err');
  toast('Idea submitted');
  if(pid && pid!=='null') renderIdeas(pid); else renderAllIdeas();
  closeDetailModal();
};
window.voteIdea = async function(iid){ await api('POST',`/api/ideas/${iid}/vote`,{}); toast('Voted! ▲'); const h=location.hash; route(); };
window.deleteIdea = async function(iid,pid){ await api('DELETE',`/api/ideas/${iid}`); toast('Deleted'); closeDetailModal(); if(pid && pid!=='null') renderIdeas(pid); else renderAllIdeas(); };

window.openIdeaDetail = async function(iid, pid) {
  const ideas = await api('GET', pid && pid!=='null' ? `/api/ideas?project_id=${pid}` : '/api/ideas');
  const i = ideas.find(x=>x.id===iid);
  if (!i) return;
  document.getElementById('detail-modal-root').innerHTML = `
    <div class="detail-overlay" onclick="if(event.target===this)closeDetailModal()">
      <div class="detail-modal">
        <div class="dm-header">
          <div class="dm-header-icon">💡</div>
          <div class="dm-header-body">
            <h2>${esc(i.title)}</h2>
            <div class="dm-meta">
              <span class="badge s-${i.status}">${i.status}</span>
              <button class="vote-btn" onclick="voteIdea(${i.id});closeDetailModal()">▲ ${i.votes} votes</button>
            </div>
          </div>
          <button class="dm-close" onclick="closeDetailModal()">✕</button>
        </div>
        <div class="dm-body">
          <div class="dm-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">
              <div class="dm-section-label">Description</div>
              <button class="btn btn-out btn-xs dm-edit-btn" style="font-size:10px; padding:2px 8px; font-weight:700" onclick="toggleMdEdit(this)">EDIT</button>
            </div>
            <div class="dm-desc" style="background:var(--surface); border:1px solid var(--border2); padding:12px; border-radius:var(--r); min-height:60px; cursor:pointer" onclick="toggleMdEdit(this)">${md(i.description)}</div>
            <textarea class="dm-field" id="dm-idea-desc" style="display:none; width:100%; min-height:120px; background:var(--surface); border:1px solid var(--accent); color:var(--text); padding:12px; border-radius:var(--r); font-family:var(--sans); font-size:13px" onblur="if(this.style.display!=='none') toggleMdEdit(this)">${esc(i.description||'')}</textarea>
          </div>
          <div class="dm-field-row">
            <div class="dm-field">
              <label>Status</label>
              <select id="dm-idea-status">${['new','exploring','accepted','rejected'].map(s=>`<option value="${s}"${i.status===s?' selected':''}>${s}</option>`).join('')}</select>
            </div>
          </div>
          ${i.tags&&i.tags.length?`<div class="dm-section" style="margin-top:12px">
            <div class="dm-section-label">Tags</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">${i.tags.map(t=>`<span class="chip" style="background:var(--surf2);color:var(--mid)">${esc(t)}</span>`).join('')}</div>
          </div>`:``}
        </div>
        <div class="dm-footer">
          <button class="btn btn-ghost btn-sm" style="color:var(--rose)" onclick="deleteIdea(${iid},${pid||'null'})">Delete</button>
          <button class="btn btn-acc btn-sm" onclick="saveIdeaDetail(${pid||'null'},${iid})">Save Changes</button>
        </div>
      </div>
    </div>`;
};

window.saveIdeaDetail = async function(pid, iid) {
  const body = {
    description: document.getElementById('dm-idea-desc').value,
    status: document.getElementById('dm-idea-status').value
  };
  const r = await api('PATCH',`/api/ideas/${iid}`, body);
  if (r.error) return toast(r.error,'err');
  toast('Idea updated'); closeDetailModal(); 
  if(pid && pid!=='null') renderIdeas(pid); else renderAllIdeas();
};
