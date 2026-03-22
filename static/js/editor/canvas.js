// ══ Canvas render ════════════════════════════════════════════════════════════
function renderCanvas() {
  document.getElementById('canvas').querySelectorAll('.n8n-node').forEach(n=>n.remove());
  document.getElementById('svg-layer').querySelectorAll('.eg').forEach(e=>e.remove());
  if(!S.cur) return;
  S.cur.nodes.forEach(makeNode);
  S.cur.edges.forEach(makeEdge);
}

function makeNode(n) {
  const def=getDef(n.node_type);
  const isNote=n.node_type==='annotation'||n.node_type==='note';
  const isTab=n.node_type==='db_table';
  const el=document.createElement('div');
  el.className='n8n-node'+(isNote?' is-note':''); el.id=`n-${n.id}`; el.dataset.id=n.id;
  el.style.left=n.x+'px'; el.style.top=n.y+'px'; el.style.width=(n.width||220)+'px';
  el.innerHTML=nodeHTML(n,def,isNote,isTab);
  
  // Header ports
  for(const s of['l','r','t','b']){
    const p=document.createElement('div');
    p.className=`port port-${s}`; p.dataset.s=s; p.dataset.ni=n.id;
    p.addEventListener('mousedown',portDown); el.appendChild(p);
  }
  
  // Column ports
  if(isTab){
    const rows = el.querySelectorAll('.ncol');
    rows.forEach((row, i) => {
      ['l', 'r'].forEach(s => {
        const p = document.createElement('div');
        p.className = `port-row ${s}`;
        p.dataset.s = s; p.dataset.ni = n.id; p.dataset.ci = i; // Column index
        p.addEventListener('mousedown', portDown);
        row.appendChild(p);
      });
    });
  }

  el.addEventListener('mousedown',nodeDown);
  el.addEventListener('click',ev=>{ if(!S.drag?.moved){ev.stopPropagation();selNode(n.id)} });
  document.getElementById('canvas').appendChild(el);
}

function nodeHTML(n,def,isNote,isTab) {
  const cols=n.meta?.columns||[];
  const subtitles={start:'Trigger',end:'End',process:'Action',decision:'Decision',io:'I / O',connector:'Connector',annotation:'Note',db_table:'Table',enum:'Enum',note:'Note',external_table:'External Table'};
  if(isNote) return `
    <div class="note-header" style="background:transparent">
      <span style="color:${def.c}">${def.i}</span>
      <span class="node-title">${esc(n.label)}</span>
    </div>
    <div class="note-body">${esc(n.meta?.description||'Click to add note…')}</div>`;
  return `
    <div class="node-row" style="background:${def.b}; border-bottom:1px solid rgba(255,255,255,.05)">
      <div class="node-icon-cell" style="color:${def.c}">${def.i}</div>
      <div class="node-text-cell">
        <div class="node-title">${esc(n.label)}</div>
        <div class="node-subtitle">${subtitles[n.node_type]||n.node_type}</div>
      </div>
      ${n.node_type==='external_table'&&n.meta?.ref_diagram_id?`
      <div style="display:flex;align-items:center;padding-right:10px" title="Jump to Board" onclick="ev=arguments[0];ev.stopPropagation();openWf(${n.meta.ref_diagram_id})">
        <div style="width:24px;height:24px;border-radius:4px;background:rgba(255,255,255,.1);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer">➔</div>
      </div>`:``}
    </div>
    ${isTab&&cols.length?`<div class="node-cols">${cols.map((c,i)=>`
      <div class="ncol" data-name="${esc(c.name||'')}">
        <div class="port-row l" data-s="l" data-ni="${n.id}" data-col="${i}"></div>
        ${c.pk?`<span class="badge badge-pk" title="Primary Key">PK</span>`:``}
        ${c.fk?`<span class="badge badge-fk" title="Foreign Key">FK</span>`:``}
        <span class="col-n">${esc(c.name||'')}</span>
        <span class="col-t">${esc(c.type||'')}</span>
        <div class="port-row r" data-s="r" data-ni="${n.id}" data-col="${i}"></div>
      </div>`).join('')}</div>`:``}`;
}

function refreshNode(n) {
  const el=document.getElementById(`n-${n.id}`); if(!el) return;
  const def=getDef(n.node_type);
  const isNote=n.node_type==='annotation'||n.node_type==='note';
  const isTab=n.node_type==='table'||n.node_type==='view';
  const ports=Array.from(el.querySelectorAll('.port'));
  el.innerHTML=nodeHTML(n,def,isNote,isTab);
  ports.forEach(p=>el.appendChild(p));
}

function makeEdge(e) {
  const svg=document.getElementById('svg-layer');
  const g=document.createElementNS('http://www.w3.org/2000/svg','g');
  g.classList.add('eg'); g.dataset.id=e.id;
  const hit=document.createElementNS('http://www.w3.org/2000/svg','path');
  hit.classList.add('ehit'); hit.addEventListener('click',ev=>{ev.stopPropagation();selEdge(e.id)});
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.classList.add('epath',`et-${e.edge_type}`); if(S.selE===e.id) p.classList.add('sel');
  p.setAttribute('marker-end',eMark(e.edge_type,S.selE===e.id));
  p.addEventListener('click',ev=>{ev.stopPropagation();selEdge(e.id)});
  const lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
  lbl.classList.add('elabel');
  g.appendChild(hit); g.appendChild(p); g.appendChild(lbl);
  svg.appendChild(g); posEdge(e);
}

function eMark(type,sel) {
  if(sel) return 'url(#m-acc)';
  if(type==='success') return 'url(#m-grn)';
  if(type==='one_to_many'||type==='many_to_many') return 'url(#m-pur)';
  return 'url(#m-def)';
}

function posEdge(e) {
  const g=document.querySelector(`.eg[data-id="${e.id}"]`); if(!g) return;
  const se=document.getElementById(`n-${e.source_id}`), te=document.getElementById(`n-${e.target_id}`);
  if(!se||!te) return;
  
  const sc = getPortCoords(se, e.meta?.source_port, e.meta?.source_column);
  const tc = getPortCoords(te, e.meta?.target_port, e.meta?.target_column);
  
  const ctrl=Math.max(Math.abs(tc.x-sc.x)*0.5,80);
  const d=`M ${sc.x} ${sc.y} C ${sc.x+ctrl} ${sc.y},${tc.x-ctrl} ${tc.y},${tc.x} ${tc.y}`;
  g.querySelectorAll('path').forEach(p=>p.setAttribute('d',d));
  const lbl=g.querySelector('text');
  if(lbl){ lbl.setAttribute('x',(sc.x+tc.x)/2); lbl.setAttribute('y',(sc.y+tc.y)/2-7); lbl.setAttribute('text-anchor','middle'); lbl.textContent=e.label||'' }
}

function getPortCoords(el, portMeta, colName) {
  // portMeta format: {side: 'l'|'r', col: index}
  let side = portMeta?.side || (el.style.left < 500 ? 'r' : 'l'); // Default based on position if no meta
  let rowIdx = portMeta?.col;

  // If we have a column name, resolve it to an index
  if (colName) {
    const rows = el.querySelectorAll('.ncol');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].dataset.name === colName) {
            rowIdx = i;
            break;
        }
    }
  }

  if (rowIdx !== undefined) {
    const rows = el.querySelectorAll('.ncol');
    if (rows[rowIdx]) {
      const row = rows[rowIdx];
      const p = row.querySelector(`.port-row.${side === 'l' ? 'l' : 'r'}`);
      if (p) {
        const r = p.getBoundingClientRect();
        const cr = document.getElementById('canvas').getBoundingClientRect();
        return {
          x: (r.left + r.width/2 - cr.left) / S.scale,
          y: (r.top + r.height/2 - cr.top) / S.scale
        };
      }
    }
  }

  // Fallback to standard side ports
  const p = el.querySelector(`.port-${side}`);
  if (p) {
    const r = p.getBoundingClientRect();
    const cr = document.getElementById('canvas').getBoundingClientRect();
    return {
      x: (r.left + r.width/2 - cr.left) / S.scale,
      y: (r.top + r.height/2 - cr.top) / S.scale
    };
  }

  return nc(el);
}

function nc(el){return{x:parseFloat(el.style.left)+el.offsetWidth/2,y:parseFloat(el.style.top)+el.offsetHeight/2}}
function posAll(){if(S.cur) S.cur.edges.forEach(e=>posEdge(e))}

// ══ Selection ════════════════════════════════════════════════════════════════
function selNode(id) {
  S.selN=id; S.selE=null;
  document.querySelectorAll('.n8n-node').forEach(n=>n.classList.toggle('selected',+n.dataset.id===id));
  document.querySelectorAll('.epath').forEach(p=>{p.classList.remove('sel');p.setAttribute('marker-end',eMark(p.className.baseVal.match(/et-(\S+)/)?.[1]||''))});
  if (window.openProps) openProps(id,'node');
}
function selEdge(id) {
  S.selE=id; S.selN=null;
  document.querySelectorAll('.n8n-node').forEach(n=>n.classList.remove('selected'));
  document.querySelectorAll('.eg').forEach(g=>{
    const p=g.querySelector('.epath'); const sel=+g.dataset.id===id;
    if(p){p.classList.toggle('sel',sel);p.setAttribute('marker-end',eMark(p.className.baseVal.match(/et-(\S+)/)?.[1]||'',sel))}
  });
  if (window.openProps) openProps(id,'edge');
}
function deselAll(){S.selN=null;S.selE=null;document.querySelectorAll('.n8n-node').forEach(n=>n.classList.remove('selected'));document.querySelectorAll('.epath').forEach(p=>{p.classList.remove('sel')});if(window.closeProps)closeProps()}

// ══ Canvas interaction ════════════════════════════════════════════════════════
function setupCanvas() {
  const w=document.getElementById('canvas-wrap');
  w.addEventListener('mousedown',ev=>{
    const onBg=ev.target===w||ev.target===document.getElementById('canvas')||ev.target.tagName==='svg'||ev.target.tagName==='SVG';
    if(ev.button===0&&onBg&&!S.drag){deselAll(); S.pan=true; S.panO={x:ev.clientX-S.ox,y:ev.clientY-S.oy}; w.style.cursor='grabbing'; ev.preventDefault()}
    else if(ev.button===1||(ev.button===0&&ev.altKey)){S.pan=true;S.panO={x:ev.clientX-S.ox,y:ev.clientY-S.oy};w.style.cursor='grabbing';ev.preventDefault()}
  });
  w.addEventListener('mousemove',ev=>{
    const r=w.getBoundingClientRect();
    const cx=(ev.clientX-r.left-S.ox)/S.scale, cy=(ev.clientY-r.top-S.oy)/S.scale;
    if(S.pan){S.ox=ev.clientX-S.panO.x;S.oy=ev.clientY-S.panO.y;applyXf();return}
    if(S.drag){const dx=(ev.clientX-S.drag.mx)/S.scale,dy=(ev.clientY-S.drag.my)/S.scale;if(Math.abs(dx)>2||Math.abs(dy)>2)S.drag.moved=true;if(S.drag.moved){S.drag.el.style.left=(S.drag.ox+dx)+'px';S.drag.el.style.top=(S.drag.oy+dy)+'px';posAll()}return}
    if(S.conn){const ln=document.getElementById('conn-line');const nc2=nc(document.getElementById(`n-${S.conn.id}`));const ctrl=Math.max(Math.abs(cx-nc2.x)*0.5,80);ln.setAttribute('d',`M ${nc2.x} ${nc2.y} C ${nc2.x+ctrl} ${nc2.y},${cx-ctrl} ${cy},${cx} ${cy}`);ln.setAttribute('visibility','visible')}
  });
  w.addEventListener('mouseup',async ev=>{
    w.style.cursor='';
    if(S.pan){S.pan=false;return}
    if(S.drag?.moved){const x=parseFloat(S.drag.el.style.left),y=parseFloat(S.drag.el.style.top);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${S.drag.id}`,{x,y});const nd=S.cur.nodes.find(n=>n.id===S.drag.id);if(nd){nd.x=x;nd.y=y}}
    S.drag=null;
    if(S.conn){
      document.getElementById('conn-line').setAttribute('visibility', 'hidden');
      const tgtPort = ev.target.closest?.('.port, .port-row');
      const tgtNode = ev.target.closest?.('.n8n-node');
      if(tgtNode && +tgtNode.dataset.id !== S.conn.id) {
        const source_port = { side: S.conn.side, col: S.conn.col };
        const target_port = tgtPort ? { side: tgtPort.dataset.s, col: tgtPort.dataset.ci !== undefined ? +tgtPort.dataset.ci : undefined } : { side: 'l' };
        await addEdge(S.conn.id, +tgtNode.dataset.id, source_port, target_port);
      }
      document.querySelectorAll('.port, .port-row').forEach(p => p.classList.remove('pinned'));
      S.conn = null;
    }
  });
  w.addEventListener('wheel',ev=>{ev.preventDefault();zoom(ev.deltaY>0?-0.08:0.08)},{passive:false});
  // dragover must be prevented on the wrap AND every child so the browser
  // shows the copy cursor and fires 'drop'. Using capture so it catches SVG too.
  w.addEventListener('dragover', ev=>{ ev.preventDefault(); ev.dataTransfer.dropEffect='copy'; }, true);
  w.addEventListener('drop', ev=>{
    ev.preventDefault();
    const t = ev.dataTransfer.getData('nt');
    if (!t) return;
    if (!S.cur) { toast('Create or open a board first','err'); return; }
    const r = w.getBoundingClientRect();
    const x = (ev.clientX - r.left - S.ox) / S.scale;
    const y = (ev.clientY - r.top  - S.oy) / S.scale;
    addNode(t, x, y);
  });
  document.addEventListener('keydown',ev=>{
    if(ev.target.tagName==='INPUT'||ev.target.tagName==='SELECT'||ev.target.tagName==='TEXTAREA') return;
    if(ev.key==='Delete'||ev.key==='Backspace'){if(S.selN)delNode();else if(S.selE)delEdge()}
    if((ev.ctrlKey||ev.metaKey)&&ev.key==='s'){ev.preventDefault();saveDiagram()}
  });
}

function nodeDown(ev){if(ev.target.classList.contains('port')) return;if(ev.button!==0)return;const el=ev.currentTarget;S.drag={el,id:+el.dataset.id,mx:ev.clientX,my:ev.clientY,ox:parseFloat(el.style.left),oy:parseFloat(el.style.top),moved:false};ev.stopPropagation()}
function portDown(ev){
  ev.stopPropagation();
  const p = ev.currentTarget;
  S.conn = {
    id: +p.dataset.ni,
    side: p.dataset.s,
    col: p.dataset.ci !== undefined ? +p.dataset.ci : undefined
  };
  document.querySelectorAll('.port, .port-row').forEach(el=>el.classList.add('pinned'));
}
function pdrag(ev,t){ev.dataTransfer.setData('nt',t)}

function zoom(d){S.scale=Math.max(0.15,Math.min(3,S.scale+d));applyXf();document.getElementById('zoom-val').textContent=Math.round(S.scale*100)+'%'}
function applyXf(){document.getElementById('canvas').style.transform=`translate(${S.ox}px,${S.oy}px) scale(${S.scale})`}
function fitView(){if(!S.cur?.nodes.length)return;const w=document.getElementById('canvas-wrap');const xs=S.cur.nodes.map(n=>n.x),ys=S.cur.nodes.map(n=>n.y);const pad=80,minX=Math.min(...xs)-pad,minY=Math.min(...ys)-pad,maxX=Math.max(...xs)+280,maxY=Math.max(...ys)+150;const s=Math.min(w.offsetWidth/(maxX-minX),w.offsetHeight/(maxY-minY),1.2)*.85;S.scale=s;S.ox=-minX*s+pad/2;S.oy=-minY*s+pad/2;applyXf();document.getElementById('zoom-val').textContent=Math.round(s*100)+'%'}
function emptyHint(v){document.getElementById('empty-hint').classList.toggle('show',v)}

// ══ Node and Edge creation ═════════════════════════════════════════════════════
const defaultLabels={start:'Start',end:'End',process:'New Step',decision:'Condition',io:'I/O',connector:'Connector',annotation:'Note',table:'new_table',view:'new_view',enum:'NewEnum',note:'Note',subprocess:'Sub-process',delay:'Delay',manual:'Manual Step',datastore:'Data Store',document:'Document',predefined:'Predefined',central:'Central Topic',branch:'Main Branch',subbranch:'Sub-branch',idea:'New Idea',resource:'Resource',module:'Module',method:'Method'};
async function addNode(type,x=300,y=240){
  if(!S.cur){ toast('No board open','err'); return; }
  const meta=(type==='table'||type==='view')?{columns:[{name:'id',type:'INT',pk:true,fk:false}]}:{};
  const n=await api.p(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes`,{label:defaultLabels[type]||type,node_type:type,x,y,width:220,height:60,meta});
  if(n.error){toast('Error: '+n.error,'err');return}
  S.cur.nodes.push(n); makeNode(n); selNode(n.id); emptyHint(false);
  S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`); renderWfList();
}
function addNodeMid(t){
  if(!S.cur){ toast('No board open','err'); return; }
  // Using -1, -1 triggers backend auto-positioning
  addNode(t, -1, -1);
}

async function delNode(){
  const id=S.selN; if(!id)return;
  await api.d(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${id}`);
  S.cur.nodes=S.cur.nodes.filter(n=>n.id!==id);
  S.cur.edges=S.cur.edges.filter(e=>e.source_id!==id&&e.target_id!==id);
  document.getElementById(`n-${id}`)?.remove();
  document.querySelectorAll('.eg').forEach(g=>{if(!S.cur.edges.find(e=>e.id===+g.dataset.id))g.remove()});
  S.selN=null; if(window.closeProps) closeProps(); emptyHint(!S.cur.nodes.length);
  S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`); renderWfList(); toast('Node removed');
}

async function addEdge(src,tgt,sourcePort,targetPort){
  const et=S.cur.type==='db_diagram'?'one_to_many':'default';
  const meta = { source_port: sourcePort, target_port: targetPort };
  const e=await api.p(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges`,{source_id:src,target_id:tgt,edge_type:et,meta});
  if(e.error){toast('Error: '+e.error,'err');return}
  S.cur.edges.push(e); makeEdge(e);
  S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`); renderWfList();
}

async function delEdge(){
  const id=S.selE; if(!id)return;
  await api.d(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges/${id}`);
  S.cur.edges=S.cur.edges.filter(e=>e.id!==id);
  document.querySelector(`.eg[data-id="${id}"]`)?.remove();
  S.selE=null; if(window.closeProps) closeProps();
  S.diagrams=await api.g(`/api/projects/${window._activePid}/boards`); renderWfList(); toast('Connection removed');
}
