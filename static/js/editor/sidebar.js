// ══ Sidebar ══════════════════════════════════════════════════════════════════
function sbTab(t) {
  ['nodes','wf'].forEach(k=>{
    document.getElementById('t-'+k).classList.toggle('active',k===t);
    document.getElementById('p-'+k).classList.toggle('active',k===t);
  });
}

function renderPalette(q='') {
  const lq=q.toLowerCase();
  document.getElementById('palette').innerHTML = getCat().map(g=>{
    const items=g.nodes.filter(n=>!lq||n.n.toLowerCase().includes(lq)||n.s.toLowerCase().includes(lq));
    if(!items.length) return '';
    return `
      <div>
        <div class="sb-cat-header" onclick="toggleCat(this)">
          <span style="color:${g.col}">●</span>${g.cat}<span class="arr">▾</span>
        </div>
        <div class="sb-cat-items">
          ${items.map(n=>`
            <div class="npi" draggable="true" ondragstart="pdrag(event,'${n.t}')" ondblclick="addNodeMid('${n.t}')">
              <div class="npi-icon" style="background:${n.b};color:${n.c}">${n.i}</div>
              <div><div class="npi-label">${n.n}</div><div class="npi-sub">${n.s}</div></div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function toggleCat(h) { h.classList.toggle('closed'); h.nextElementSibling.classList.toggle('hidden') }

function renderWfList() {
  document.getElementById('wf-list').innerHTML = S.diagrams.map(d=>`
    <div class="di ${S.cur?.id===d.id?'active':''}" onclick="openWf(${d.id})">
      <div class="di-ico pf">${TYPE_ICONS[d.type]||'⬡'}</div>
      <div class="di-body">
        <div class="di-name">${esc(d.name)}</div>
        <div class="di-type">${TYPE_LABELS[d.type]||d.type}</div>
        <div class="di-stats"><span class="di-stat">${d.node_count} nodes</span><span class="di-stat">${d.edge_count} edges</span></div>
      </div>
      <div class="di-actions">
        <button class="di-act" title="Duplicate" onclick="ev=arguments[0];ev.stopPropagation();duplicateWf(${d.id})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5h5v5h-5v-5zM4.5 2.5h5v5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="di-act del" title="Delete" onclick="ev=arguments[0];ev.stopPropagation();deleteWf(${d.id})">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 3.5h7M4 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M4 5.5v3.5M6 5.5v3.5M8 5.5v3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        </button>
      </div>
    </div>`).join('');
}
