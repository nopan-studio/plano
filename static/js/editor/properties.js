// ══ Properties ════════════════════════════════════════════════════════════════
function openProps(id,kind){document.getElementById('props').classList.add('open');kind==='node'?renderNodeProps(id):renderEdgeProps(id); if(window.syncSel) syncSel()}
function closeProps(){document.getElementById('props').classList.remove('open'); if(window.syncSel) syncSel()}

function renderNodeProps(id) {
  const n=S.cur.nodes.find(x=>x.id===id); if(!n)return;
  const def=getDef(n.node_type);
  const pi=document.getElementById('pi'); pi.style.background=def.b; pi.style.color=def.c; pi.textContent=def.i;
  document.getElementById('pt').textContent=n.label;
  const all=getCat().flatMap(g=>g.nodes);
  const topts=all.map(nd=>`<option value="${nd.t}" ${n.node_type===nd.t?'selected':''}>${nd.i} ${nd.n}</option>`).join('');
  const isTab=n.node_type==='db_table'||n.node_type==='table'||n.node_type==='view', isNote=n.node_type==='annotation'||n.node_type==='note';
  const cols=n.meta?.columns||[];
  document.getElementById('pb').innerHTML=`
    <div class="pg"><div class="plabel">Label</div><input class="pinput" id="pp-l" value="${esc(n.label)}" oninput="up_label(this.value)"></div>
    <div class="pg"><div class="plabel">Type</div><select class="pselect" onchange="up_type(this.value)">${topts}</select></div>
    ${isNote?`<div class="pg"><div class="plabel">Note Text</div><textarea class="pinput" rows="3" style="resize:vertical" oninput="up_desc(this.value)">${esc(n.meta?.description||'')}</textarea></div>`:``}
    ${isTab?`
    <div class="pg">
      <div class="plabel">Columns <button class="btn btn-ghost" style="padding:2px 7px;font-size:10px" onclick="addCol(${n.id})">+ Column</button></div>
      <div id="cols-ed">${cols.map((c,i)=>`
        <div class="col-row2">
          <input class="pinput" value="${esc(c.name||'')}" placeholder="col" oninput="editCol(${n.id},${i},'name',this.value)">
          <input class="pinput t" value="${esc(c.type||'')}" placeholder="type" oninput="editCol(${n.id},${i},'type',this.value)">
          <label class="flag"><input type="checkbox" ${c.pk?'checked':''} onchange="editCol(${n.id},${i},'pk',this.checked)">PK</label>
          <label class="flag"><input type="checkbox" ${c.fk?'checked':''} onchange="editCol(${n.id},${i},'fk',this.checked)">FK</label>
          <button class="x-btn" onclick="rmCol(${n.id},${i})">×</button>
        </div>`).join('')}
      </div>
      <button class="add-col" onclick="addCol(${n.id})">+ Add Column</button>
    </div>`:``}
    ${n.node_type==='external_table'?`
    <div class="pg">
      <div class="plabel">Reference Board</div>
      <select class="pselect" onchange="up_meta(${n.id},'ref_diagram_id',+this.value); S.tables=null; renderNodeProps(${n.id})">
        <option value="">(Select Board)</option>
        ${S.diagrams.filter(d=>d.id!==S.cur.id).map(d=>`<option value="${d.id}" ${n.meta?.ref_diagram_id===d.id?'selected':''}>${esc(d.name)}</option>`).join('')}
      </select>
    </div>
    ${n.meta?.ref_diagram_id?`
    <div class="pg">
      <div class="plabel">Reference Table</div>
      <div id="ext-tab-wrap">
        <select class="pselect" onchange="up_meta(${n.id},'ref_node_id',+this.value); syncExtTable(${n.id}, +this.value)">
          <option value="">(Loading...)</option>
        </select>
      </div>
    </div>`:``}
    `:``}
    <div class="pg"><div class="plabel">Position</div><div class="prow"><input class="pinput" type="number" id="pp-x" value="${Math.round(n.x)}" placeholder="X" oninput="up_pos()"><input class="pinput" type="number" id="pp-y" value="${Math.round(n.y)}" placeholder="Y" oninput="up_pos()"></div></div>
    <div class="psep"></div>
    <div class="dz"><button class="btn btn-danger-soft" style="width:100%;justify-content:center" onclick="delNode()">× Delete Node</button></div>`;
    
    // External table async loading
    if(n.node_type==='external_table' && n.meta?.ref_diagram_id){
      (async()=>{
        const tables = await api.g(`/api/projects/${window._activePid}/all-tables`);
        const filtered = tables.filter(t=>t.diagram_id===n.meta.ref_diagram_id);
        const wrap=document.getElementById('ext-tab-wrap');
        if(wrap){
          wrap.innerHTML=`<select class="pselect" onchange="up_meta(${n.id},'ref_node_id',+this.value); syncExtTable(${n.id}, +this.value)">
            <option value="">(Select Table)</option>
            ${filtered.map(t=>`<option value="${t.id}" ${n.meta?.ref_node_id===t.id?'selected':''}>${esc(t.label)}</option>`).join('')}
          </select>`;
        }
      })();
    }
}

function renderEdgeProps(id) {
  const e=S.cur.edges.find(x=>x.id===id); if(!e)return;
  const pi=document.getElementById('pi'); pi.style.background='var(--surface)'; pi.style.color='var(--text-dim)'; pi.textContent='⟶';
  document.getElementById('pt').textContent='Connection';
  const sn=S.cur.nodes.find(n=>n.id===e.source_id)?.label||'?', tn=S.cur.nodes.find(n=>n.id===e.target_id)?.label||'?';
  const ets=S.cur.type==='db_diagram'?['one_to_one','one_to_many','many_to_many','belongs_to']:['default','success','failure','conditional'];
  document.getElementById('pb').innerHTML=`
    <div class="pg"><div class="plabel">Label</div><input class="pinput" value="${esc(e.label||'')}" oninput="up_elabel(this.value)"></div>
    <div class="pg"><div class="plabel">Type</div><select class="pselect" onchange="up_etype(this.value)">${ets.map(t=>`<option value="${t}" ${e.edge_type===t?'selected':''}>${t}</option>`).join('')}</select></div>
    <div class="pg"><div class="plabel">Connection</div>
      <div style="display:flex;align-items:center;gap:6px;padding:8px 10px;background:var(--surface);border-radius:var(--r);border:1px solid var(--panel-border)">
        <span style="font-size:11px">${esc(sn)}</span><span style="color:var(--accent)">→</span><span style="font-size:11px">${esc(tn)}</span>
      </div>
    </div>
    <div class="psep"></div>
    <div class="dz"><button class="btn btn-danger-soft" style="width:100%;justify-content:center" onclick="delEdge()">× Delete Connection</button></div>`;
}

async function up_label(v){const n=S.cur.nodes.find(x=>x.id===S.selNs?.[0]);if(!n)return;n.label=v;document.getElementById('pt').textContent=v;refreshNode(n);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${n.id}`,{label:v})}
async function up_type(v){const n=S.cur.nodes.find(x=>x.id===S.selNs?.[0]);if(!n)return;n.node_type=v;const def=getDef(v);const pi=document.getElementById('pi');pi.style.background=def.b;pi.style.color=def.c;pi.textContent=def.i;refreshNode(n);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${n.id}`,{node_type:v});renderNodeProps(n.id)}
async function up_desc(v){const n=S.cur.nodes.find(x=>x.id===S.selNs?.[0]);if(!n)return;n.meta={...n.meta,description:v};refreshNode(n);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${n.id}`,{meta:n.meta})}
async function up_meta(nid,k,v){
  const n=S.cur.nodes.find(x=>x.id===nid); if(!n)return;
  n.meta=n.meta||{}; n.meta[k]=v;
  if(k==='ref_diagram_id'){ delete n.meta.ref_node_id; delete n.meta.columns; n.label='External Table' }
  refreshNode(n); await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${nid}`,{meta:n.meta, label:n.label});
  renderNodeProps(nid);
}
async function syncExtTable(nid, refNid){
  const n=S.cur.nodes.find(x=>x.id===nid); if(!n) return;
  const tables = await api.g(`/api/projects/${window._activePid}/all-tables`);
  const t = tables.find(x=>x.id===refNid);
  if(t){
    n.label = t.label;
    n.meta.columns = t.meta?.columns || [];
    refreshNode(n);
    await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${nid}`,{meta:n.meta, label:n.label});
  }
}
async function up_pos(){const n=S.cur.nodes.find(x=>x.id===S.selNs?.[0]);if(!n)return;const x=+document.getElementById('pp-x').value,y=+document.getElementById('pp-y').value;n.x=x;n.y=y;const el=document.getElementById(`n-${n.id}`);el.style.left=x+'px';el.style.top=y+'px';posAll();await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${n.id}`,{x,y})}
async function addCol(nid){const n=S.cur.nodes.find(x=>x.id===nid);if(!n)return;n.meta=n.meta||{};n.meta.columns=n.meta.columns||[];n.meta.columns.push({name:'new_col',type:'VARCHAR',pk:false,fk:false});await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${nid}`,{meta:n.meta});refreshNode(n);renderNodeProps(nid)}
async function editCol(nid,i,f,v){const n=S.cur.nodes.find(x=>x.id===nid);if(!n||!n.meta?.columns)return;n.meta.columns[i][f]=v;refreshNode(n);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${nid}`,{meta:n.meta})}
async function rmCol(nid,i){const n=S.cur.nodes.find(x=>x.id===nid);if(!n||!n.meta?.columns)return;n.meta.columns.splice(i,1);await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${nid}`,{meta:n.meta});refreshNode(n);renderNodeProps(nid)}
async function up_elabel(v){const e=S.cur.edges.find(x=>x.id===S.selE);if(!e)return;e.label=v;await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges/${e.id}`,{label:v});posEdge(e)}
async function up_etype(v){const e=S.cur.edges.find(x=>x.id===S.selE);if(!e)return;e.edge_type=v;await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges/${e.id}`,{edge_type:v});const p=document.querySelector(`.eg[data-id="${e.id}"] .epath`);if(p){p.className=`epath sel et-${v}`;p.setAttribute('marker-end','url(#m-acc)')}}
