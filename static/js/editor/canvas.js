// ══ Canvas render ════════════════════════════════════════════════════════════
function renderCanvas() {
  document.getElementById('canvas').querySelectorAll('.n8n-node').forEach(n => n.remove());
  document.getElementById('svg-layer').querySelectorAll('.eg').forEach(e => e.remove());
  if (!S.cur) return;
  S.cur.nodes.forEach(makeNode);
  S.cur.edges.forEach(makeEdge);
}

function makeNode(n) {
  const def = getDef(n.node_type);
  const isNote = n.node_type === 'annotation' || n.node_type === 'note';
  const isTab = n.node_type === 'db_table' || n.node_type === 'table' || n.node_type === 'view';
  const el = document.createElement('div');
  el.className = `n8n-node nt-${n.node_type}` + (isNote ? ' is-note' : '');
  if (n.node_type === 'idea') el.classList.add('is-idea');
  el.id = `n-${n.id}`; el.dataset.id = n.id;
  el.style.left = n.x + 'px'; el.style.top = n.y + 'px';
  el.style.width = (n.width || 220) + 'px';
  if (n.height && !isTab) el.style.height = n.height + 'px';
  else if (isTab) el.style.height = 'auto';
  el.innerHTML = nodeHTML(n, def, isNote, isTab);

  // Header ports
  for (const s of ['l', 'r', 't', 'b']) {
    const p = document.createElement('div');
    p.className = `port port-${s}`; p.dataset.s = s; p.dataset.ni = n.id;
    p.addEventListener('mousedown', portDown); el.appendChild(p);
  }

  // Column ports
  if (isTab) {
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

  if (isNote) {
    const resizer = document.createElement('div');
    resizer.className = 'node-resizer';
    resizer.addEventListener('mousedown', e => {
      e.stopPropagation();
      S.drag = {
        el,
        id: +el.dataset.id,
        mx: e.clientX,
        my: e.clientY,
        ow: el.offsetWidth,
        oh: el.offsetHeight,
        isResizing: true
      };
    });
    el.appendChild(resizer);
  }

  el.addEventListener('mousedown', nodeDown);
  el.addEventListener('click', ev => {
    if (!S.dragMovedLast) {
      ev.stopPropagation();
      // If we clicked a node that was part of a selection BUT didn't move it, 
      // we now want to focus only on that node (standard click behavior).
      if (!ev.shiftKey && S.selNs?.length > 1) selNode(n.id, false);
      if (!ev.shiftKey && window.openProps) openProps(n.id, 'node');
    }
  });
  document.getElementById('canvas').appendChild(el);
}

function nodeHTML(n, def, isNote, isTab) {
  const cols = n.meta?.columns || [];
  const subtitles = { start: 'Trigger', end: 'End', process: 'Action', decision: 'Decision', io: 'I / O', connector: 'Connector', annotation: 'Note', db_table: 'Table', enum: 'Enum', note: 'Note', external_table: 'External Table' };
  if (isNote) return `
    <div class="note-header" style="background:transparent">
      <span style="color:${def.c}">${def.i}</span>
      <span class="node-title">${md(n.label)}</span>
    </div>
    <div class="note-body">${md(n.meta?.description || 'Click to add note…')}</div>`;
  return `
    <div class="node-row" style="background:${def.b}; border-bottom:1px solid rgba(255,255,255,.05)">
      <div class="node-icon-cell" style="color:${def.c}">${def.i}</div>
      <div class="node-text-cell">
        <div class="node-title">${md(n.label)}</div>
        <div class="node-subtitle">${subtitles[n.node_type] || n.node_type}</div>
      </div>
      ${n.node_type === 'external_table' && n.meta?.ref_diagram_id ? `
      <div style="display:flex;align-items:center;padding-right:10px" title="Jump to Board" onclick="ev=arguments[0];ev.stopPropagation();openWf(${n.meta.ref_diagram_id})">
        <div style="width:24px;height:24px;border-radius:4px;background:rgba(255,255,255,.1);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer">➔</div>
      </div>`: ``}
    </div>
    ${isTab && cols.length ? `<div class="node-cols">${cols.map((c, i) => `
      <div class="ncol" data-name="${esc(c.name || '')}">
        <div class="port-row l" data-s="l" data-ni="${n.id}" data-col="${i}"></div>
        ${c.pk ? `<span class="badge badge-pk" title="Primary Key">PK</span>` : ``}
        ${c.fk ? `<span class="badge badge-fk" title="Foreign Key">FK</span>` : ``}
        <span class="col-n">${esc(c.name || '')}</span>
        <span class="col-t">${esc(c.type || '')}</span>
        <div class="port-row r" data-s="r" data-ni="${n.id}" data-col="${i}"></div>
      </div>`).join('')}</div>` : ``}`;
}

function refreshNode(n) {
  const el = document.getElementById(`n-${n.id}`); if (!el) return;
  const def = getDef(n.node_type);
  const isNote = n.node_type === 'annotation' || n.node_type === 'note';
  const isTab = n.node_type === 'db_table' || n.node_type === 'table' || n.node_type === 'view';
  const ports = Array.from(el.querySelectorAll('.port'));
  el.innerHTML = nodeHTML(n, def, isNote, isTab);
  ports.forEach(p => el.appendChild(p));
  syncSel();
}

function makeEdge(e) {
  const svg = document.getElementById('svg-layer');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.classList.add('eg'); g.dataset.id = e.id;
  const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  hit.classList.add('ehit'); hit.addEventListener('click', ev => { ev.stopPropagation(); selEdge(e.id) });
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.classList.add('epath', `et-${e.edge_type}`); if (S.selE === e.id) p.classList.add('sel');
  p.setAttribute('marker-end', eMark(e.edge_type, S.selE === e.id));
  p.addEventListener('click', ev => { ev.stopPropagation(); selEdge(e.id) });
  const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lbl.classList.add('elabel');
  g.appendChild(hit); g.appendChild(p); g.appendChild(lbl);
  svg.appendChild(g); posEdge(e);
}

function eMark(type, sel) {
  if (sel) return 'url(#m-acc)';
  if (type === 'success') return 'url(#m-grn)';
  if (type === 'one_to_many' || type === 'many_to_many') return 'url(#m-pur)';
  return 'url(#m-def)';
}

function posEdge(e, sdx = 0, sdy = 0, tdx = 0, tdy = 0) {
  const g = document.querySelector(`.eg[data-id="${e.id}"]`); if (!g) return;
  const se = document.getElementById(`n-${e.source_id}`), te = document.getElementById(`n-${e.target_id}`);
  if (!se || !te) return;

  const sc = getPortCoords(se, e.meta?.source_port?.side, e.meta?.source_column || e.meta?.source_port?.col, S.drag?.nodeCache?.[e.source_id]);
  const tc = getPortCoords(te, e.meta?.target_port?.side, e.meta?.target_column || e.meta?.target_port?.col, S.drag?.nodeCache?.[e.target_id]);

  sc.x += sdx; sc.y += sdy;
  tc.x += tdx; tc.y += tdy;

  const ctrl = Math.max(Math.abs(tc.x - sc.x) * 0.5, 80);
  const d = `M ${sc.x} ${sc.y} C ${sc.x + ctrl} ${sc.y},${tc.x - ctrl} ${tc.y},${tc.x} ${tc.y}`;
  g.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
  const lbl = g.querySelector('text');
  if (lbl) { lbl.setAttribute('x', (sc.x + tc.x) / 2); lbl.setAttribute('y', (sc.y + tc.y) / 2 - 7); lbl.setAttribute('text-anchor', 'middle'); lbl.textContent = e.label || '' }
}

function getPortCoords(el, side = 'l', colName, cache) {
  const x = cache?.x ?? parseFloat(el.style.left);
  const y = cache?.y ?? parseFloat(el.style.top);
  const w = cache?.w ?? el.offsetWidth;
  const h = cache?.h ?? el.offsetHeight;

  if (colName !== undefined) {
    const rows = el.querySelectorAll('.ncol');
    // For colName calculation, we still read the DOM if not cached, 
    // but column offsetTop is less likely to trigger a full reflow.
    if (typeof colName === 'number') {
      if (rows[colName]) {
        return {
          x: x + (side === 'r' ? w : 0),
          y: y + rows[colName].offsetTop + rows[colName].offsetHeight / 2
        };
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].dataset.name === colName) {
          return {
            x: x + (side === 'r' ? w : 0),
            y: y + rows[i].offsetTop + rows[i].offsetHeight / 2
          };
        }
      }
    }
  }

  if (side === 't') return { x: x + w / 2, y: y };
  if (side === 'b') return { x: x + w / 2, y: y + h };
  if (side === 'r') return { x: x + w, y: y + h / 2 };
  return { x: x, y: y + h / 2 };
}

function nc(el) { return { x: parseFloat(el.style.left) + el.offsetWidth / 2, y: parseFloat(el.style.top) + el.offsetHeight / 2 } }
function posAll() {
  if (!S.cur) return;
  const dx = S.drag?.dx || 0, dy = S.drag?.dy || 0;
  const movedIds = S.drag?.nodeOrigins?.map(o => o.id) || (S.drag?.id ? [S.drag.id] : []);

  S.cur.edges.forEach(e => {
    const isSrcMoved = movedIds.includes(e.source_id);
    const isTgtMoved = movedIds.includes(e.target_id);
    if (!movedIds.length || isSrcMoved || isTgtMoved) {
      posEdge(e, isSrcMoved ? dx : 0, isSrcMoved ? dy : 0, isTgtMoved ? dx : 0, isTgtMoved ? dy : 0);
    }
  });
}

// ══ Selection ════════════════════════════════════════════════════════════════
function syncSel() {
  const count = S.selNs?.length || 0;
  const propsOpen = document.getElementById('props')?.classList.contains('open');
  const badge = document.getElementById('sel-badge') || (() => {
    const b = document.createElement('div'); b.id = 'sel-badge';
    Object.assign(b.style, { position: 'fixed', top: '70px', right: '20px', background: 'rgba(50,50,50,0.85)', color: '#ccc', padding: '6px 14px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', pointerEvents: 'none', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', transition: 'transform 0.1s, opacity 0.1s' });
    document.body.appendChild(b); return b;
  })();

  if (count > 1 && !propsOpen) {
    badge.textContent = `${count} selected`;
    badge.style.opacity = '1';
    badge.style.transform = 'translateY(0)';
  } else {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(10px)';
  }

  document.querySelectorAll('.n8n-node').forEach(n => {
    n.classList.toggle('selected', S.selNs?.includes(+n.dataset.id));
  });
}

function selNode(id, toggle, keepCurrent) {
  if (!S.selNs) S.selNs = [];
  if (toggle) {
    if (S.selNs.includes(id)) S.selNs = S.selNs.filter(x => x !== id);
    else S.selNs.push(id);
  } else {
    if (!keepCurrent || !S.selNs.includes(id)) S.selNs = [id];
  }
  S.selE = null;
  syncSel();
  if (window.openProps) { if (S.selNs.length !== 1) closeProps(); }
}
function selEdge(id) {
  S.selE = id; S.selNs = [];
  document.querySelectorAll('.n8n-node').forEach(n => n.classList.remove('selected'));
  document.querySelectorAll('.eg').forEach(g => {
    const p = g.querySelector('.epath'); const sel = +g.dataset.id === id;
    if (p) { p.classList.toggle('sel', sel); p.setAttribute('marker-end', eMark(p.className.baseVal.match(/et-(\S+)/)?.[1] || '', sel)) }
  });
  if (window.openProps) openProps(id, 'edge');
}
function deselAll() {
  S.selNs = []; S.selE = null;
  syncSel();
  if (window.closeProps) closeProps();
}

// ══ Canvas interaction ════════════════════════════════════════════════════════
function setupCanvas() {
  const w = document.getElementById('canvas-wrap');
  w.addEventListener('mousedown', ev => {
    const onBg = !ev.target.closest('.n8n-node, .eg, .toolbar, .props');
    if (ev.button === 0 && onBg && !S.drag) {
      const r = w.getBoundingClientRect();
      const mx = (ev.clientX - r.left - S.ox) / S.scale, my = (ev.clientY - r.top - S.oy) / S.scale;
      if (ev.shiftKey || S.selMode) {
        S.marq = { x: mx, y: my, el: document.getElementById('marquee') };
        S.marq.el.style.display = 'block';
        S.marq.el.style.left = mx + 'px'; S.marq.el.style.top = my + 'px';
        S.marq.el.style.width = '0'; S.marq.el.style.height = '0';
      } else {
        deselAll();
        S.pan = true; S.panO = { x: ev.clientX - S.ox, y: ev.clientY - S.oy }; w.style.cursor = 'grabbing';
      }
      ev.preventDefault();
    }
    else if (ev.button === 1 || (ev.button === 0 && ev.altKey)) { S.pan = true; S.panO = { x: ev.clientX - S.ox, y: ev.clientY - S.oy }; w.style.cursor = 'grabbing'; ev.preventDefault() }
  });
  w.addEventListener('mousemove', ev => {
    const r = w.getBoundingClientRect();
    const cx = (ev.clientX - r.left - S.ox) / S.scale, cy = (ev.clientY - r.top - S.oy) / S.scale;
    if (S.pan) { S.ox = ev.clientX - S.panO.x; S.oy = ev.clientY - S.panO.y; applyXf(); return }
    if (S.marq) {
      const dx = cx - S.marq.x, dy = cy - S.marq.y;
      S.marq.el.style.left = Math.min(S.marq.x, cx) + 'px'; S.marq.el.style.top = Math.min(S.marq.y, cy) + 'px';
      S.marq.el.style.width = Math.abs(dx) + 'px'; S.marq.el.style.height = Math.abs(dy) + 'px';
      return;
    }
    if (S.drag) {
      const dx = (ev.clientX - S.drag.mx) / S.scale, dy = (ev.clientY - S.drag.my) / S.scale;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) S.drag.moved = true;
      if (S.drag.moved) {
        if (S.drag.isResizing) {
          S.drag.el.style.width = (S.drag.ow + dx) + 'px';
          S.drag.el.style.height = (S.drag.oh + dy) + 'px';
        } else {
          S.drag.dx = dx; S.drag.dy = dy;
          if (!S.drag.pendingFrame) {
            S.drag.pendingFrame = requestAnimationFrame(() => {
              if (!S.drag) return;
              const nodes = S.drag.nodeOrigins || [{ id: S.drag.id, x: S.drag.ox, y: S.drag.oy }];
              const dx = Math.round(S.drag.dx), dy = Math.round(S.drag.dy);
              nodes.forEach(n => {
                const el = document.getElementById(`n-${n.id}`);
                if (el) el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
              });
              posAll();
              S.drag.pendingFrame = null;
            });
          }
        }
      }
      return;
    }
    if (S.conn) { const ln = document.getElementById('conn-line'); const nc2 = nc(document.getElementById(`n-${S.conn.id}`)); const ctrl = Math.max(Math.abs(cx - nc2.x) * 0.5, 80); ln.setAttribute('d', `M ${nc2.x} ${nc2.y} C ${nc2.x + ctrl} ${nc2.y},${cx - ctrl} ${cy},${cx} ${cy}`); ln.setAttribute('visibility', 'visible') }
  });
  w.addEventListener('mouseup', async ev => {
    w.style.cursor = '';
    if (S.pan) { S.pan = false; return }
    if (S.marq) {
      const x1 = parseFloat(S.marq.el.style.left), y1 = parseFloat(S.marq.el.style.top);
      const x2 = x1 + parseFloat(S.marq.el.style.width), y2 = y1 + parseFloat(S.marq.el.style.height);
      const hits = S.cur.nodes.filter(n => n.x + n.width > x1 && n.x < x2 && n.y + (n.height || 60) > y1 && n.y < y2);
      hits.forEach(n => selNode(n.id, true));
      if (!hits.length && !ev.shiftKey) deselAll();
      S.marq.el.style.display = 'none'; S.marq = null; return;
    }
    const drag = S.drag;
    if (drag?.moved) {
      S.dragMovedLast = true;
      setTimeout(() => S.dragMovedLast = false, 50);
    }
    S.drag = null;

    if (drag) {
      const dx = drag.dx || 0, dy = drag.dy || 0;
      if (drag.moved) {
        if (drag.isResizing) {
          const w = drag.el.offsetWidth, h = drag.el.offsetHeight;
          await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${drag.id}`, { width: w, height: h });
          const nd = S.cur.nodes.find(n => n.id === drag.id); if (nd) { nd.width = w; nd.height = h }
        } else {
          const nodes = drag.nodeOrigins || [{ id: drag.id, x: drag.ox, y: drag.oy }];
          const dx = Math.round(drag.dx || 0), dy = Math.round(drag.dy || 0);
          const updates = nodes.map(n => ({ id: n.id, x: n.x + dx, y: n.y + dy }));
          for (const n of nodes) {
            const el = document.getElementById(`n-${n.id}`);
            const nx = n.x + dx, ny = n.y + dy;
            if (el) {
              el.style.left = nx + 'px';
              el.style.top = ny + 'px';
              el.style.transform = '';
            }
            const nd = S.cur.nodes.find(x => x.id === n.id); if (nd) { nd.x = nx; nd.y = ny }
          }
          // Recalculate all affected edges in their final position
          posAll();
          syncSel();
          if (updates.length) {
            await api.h(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes-bulk`, { updates });
            syncSel();
          }
        }
      }
    }
    if (S.conn) {
      document.getElementById('conn-line').setAttribute('visibility', 'hidden');
      const tgtPort = ev.target.closest?.('.port, .port-row');
      const tgtNode = ev.target.closest?.('.n8n-node');
      if (tgtNode && +tgtNode.dataset.id !== S.conn.id) {
        const source_port = { side: S.conn.side, col: S.conn.col };
        const target_port = tgtPort ? { side: tgtPort.dataset.s, col: tgtPort.dataset.ci !== undefined ? +tgtPort.dataset.ci : undefined } : { side: 'l' };
        await addEdge(S.conn.id, +tgtNode.dataset.id, source_port, target_port);
      }
      document.querySelectorAll('.port, .port-row').forEach(p => p.classList.remove('pinned'));
      S.conn = null;
    }
  });
  w.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY > 0 ? -0.08 : 0.08) }, { passive: false });
  // dragover must be prevented on the wrap AND every child so the browser
  // shows the copy cursor and fires 'drop'. Using capture so it catches SVG too.
  w.addEventListener('dragover', ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; }, true);
  w.addEventListener('drop', ev => {
    ev.preventDefault();
    const t = ev.dataTransfer.getData('nt');
    if (!t) return;
    if (!S.cur) { toast('Create or open a board first', 'err'); return; }
    const r = w.getBoundingClientRect();
    const x = (ev.clientX - r.left - S.ox) / S.scale;
    const y = (ev.clientY - r.top - S.oy) / S.scale;
    addNode(t, x, y);
  });
  document.addEventListener('keydown', ev => {
    if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT' || ev.target.tagName === 'TEXTAREA') return;
    if (ev.key === 'Delete' || ev.key === 'Backspace') { if (S.selN) delNode(); else if (S.selE) delEdge() }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') { ev.preventDefault(); saveDiagram() }
  });
}

function nodeDown(ev) {
  if (ev.target.classList.contains('port')) return;
  if (ev.button !== 0) return;
  const el = ev.currentTarget; const id = +el.dataset.id;

  // If Shift is held, we toggle and potentially return if toggled OFF
  if (ev.shiftKey) {
    selNode(id, true);
    if (!S.selNs.includes(id)) return; // Toggled OFF
  } else {
    // Selection is handled: if node already selected, keep group selection for drag
    selNode(id, false, true);
  }

  // Cache stats for all nodes involved in the current drag to avoid DOM reads in move loop
  const involvedIds = new Set(S.selNs);
  S.cur.edges.forEach(e => {
    if (involvedIds.has(e.source_id)) involvedIds.add(e.target_id);
    if (involvedIds.has(e.target_id)) involvedIds.add(e.source_id);
  });

  const nodeCache = {};
  involvedIds.forEach(sid => {
    const nel = document.getElementById(`n-${sid}`);
    if (nel) {
      nodeCache[sid] = {
        x: parseFloat(nel.style.left),
        y: parseFloat(nel.style.top),
        w: nel.offsetWidth,
        h: nel.offsetHeight
      };
    }
  });

  S.drag = {
    el, id, mx: ev.clientX, my: ev.clientY,
    ox: parseFloat(el.style.left), oy: parseFloat(el.style.top),
    nodeCache: nodeCache,
    nodeOrigins: S.selNs.map(sid => ({ id: sid, ...nodeCache[sid] }))
  };
  ev.stopPropagation()
}
function toggleSelMode() {
  S.selMode = !S.selMode;
  const btn = document.getElementById('rect-sel-btn');
  btn.classList.toggle('btn-accent', S.selMode);
  btn.classList.toggle('btn-ghost', !S.selMode);
  toast(S.selMode ? 'Selection Mode: Click-drag to select' : 'Standard Mode: Click-drag to pan');
}
function portDown(ev) {
  ev.stopPropagation();
  const p = ev.currentTarget;
  S.conn = {
    id: +p.dataset.ni,
    side: p.dataset.s,
    col: p.dataset.ci !== undefined ? +p.dataset.ci : undefined
  };
  document.querySelectorAll('.port, .port-row').forEach(el => el.classList.add('pinned'));
}
function pdrag(ev, t) { ev.dataTransfer.setData('nt', t) }

function zoom(d) { S.scale = Math.max(0.15, Math.min(3, S.scale + d)); applyXf(); document.getElementById('zoom-val').textContent = Math.round(S.scale * 100) + '%' }
function applyXf() { document.getElementById('canvas').style.transform = `translate(${S.ox}px,${S.oy}px) scale(${S.scale})` }
function fitView() { if (!S.cur?.nodes.length) return; const w = document.getElementById('canvas-wrap'); const xs = S.cur.nodes.map(n => n.x), ys = S.cur.nodes.map(n => n.y); const pad = 80, minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad, maxX = Math.max(...xs) + 280, maxY = Math.max(...ys) + 150; const s = Math.min(w.offsetWidth / (maxX - minX), w.offsetHeight / (maxY - minY), 1.2) * .85; S.scale = s; S.ox = -minX * s + pad / 2; S.oy = -minY * s + pad / 2; applyXf(); document.getElementById('zoom-val').textContent = Math.round(s * 100) + '%' }
function emptyHint(v) { document.getElementById('empty-hint').classList.toggle('show', v) }

// ══ Node and Edge creation ═════════════════════════════════════════════════════
const defaultLabels = {
  start: 'Start', end: 'End', process: 'New Step', decision: 'Condition', io: 'I/O', connector: 'Connector',
  annotation: 'Note', table: 'new_table', view: 'new_view', enum: 'NewEnum', note: 'Note',
  subprocess: 'Sub-process', delay: 'Delay', manual: 'Manual Step', datastore: 'Data Store',
  document: 'Document', predefined: 'Predefined', central: 'Central Topic', branch: 'Main Branch',
  subbranch: 'Sub-branch', idea: 'New Idea', resource: 'Resource', module: 'Module', method: 'Method',
  question: 'New Question', brainstorm: 'Brainstorming', topic: 'New Topic/Group', action: 'New Action',
  pros: 'Pro', cons: 'Con', text: 'Text Block'
};

async function addNode(type, x = 300, y = 240) {
  if (!S.cur) { toast('No board open', 'err'); return; }
  const isT = type === 'db_table' || type === 'table' || type === 'view';
  const meta = isT ? { columns: [{ name: 'id', type: 'INT', pk: true, fk: false }] } : {};
  const n = await api.p(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes`, { label: defaultLabels[type] || type, node_type: type, x, y, width: 220, height: isT ? null : 60, meta });
  if (n.error) { toast('Error: ' + n.error, 'err'); return }
  S.cur.nodes.push(n); makeNode(n); selNode(n.id); emptyHint(false);
  if (window.openProps) openProps(n.id, 'node');
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`); renderWfList();
}
function addNodeMid(t) {
  if (!S.cur) { toast('No board open', 'err'); return; }
  // Using -1, -1 triggers backend auto-positioning
  addNode(t, -1, -1);
}

async function delNode() {
  const ids = S.selNs; if (!ids || !ids.length) return;
  for (const id of ids) {
    await api.d(`/api/projects/${window._activePid}/boards/${S.cur.id}/nodes/${id}`);
    S.cur.nodes = S.cur.nodes.filter(n => n.id !== id);
    S.cur.edges = S.cur.edges.filter(e => e.source_id !== id && e.target_id !== id);
    document.getElementById(`n-${id}`)?.remove();
  }
  document.querySelectorAll('.eg').forEach(g => { if (!S.cur.edges.find(e => e.id === +g.dataset.id)) g.remove() });
  S.selNs = []; if (window.closeProps) closeProps(); emptyHint(!S.cur.nodes.length);
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`); renderWfList(); toast('Selection removed');
}

async function addEdge(src, tgt, sourcePort, targetPort) {
  const et = S.cur.type === 'db_diagram' ? 'one_to_many' : 'default';
  const meta = { source_port: sourcePort, target_port: targetPort };
  if (S.cur.type === 'db_diagram') {
    const sn = S.cur.nodes.find(n => n.id === src);
    const tn = S.cur.nodes.find(n => n.id === tgt);
    if (sn && sourcePort.col !== undefined) meta.source_column = sn.meta?.columns?.[sourcePort.col]?.name;
    if (tn && targetPort.col !== undefined) meta.target_column = tn.meta?.columns?.[targetPort.col]?.name;
  }
  const e = await api.p(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges`, { source_id: src, target_id: tgt, edge_type: et, meta });
  if (e.error) { toast('Error: ' + e.error, 'err'); return }
  S.cur.edges.push(e); makeEdge(e);
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`); renderWfList();
}

async function delEdge() {
  const id = S.selE; if (!id) return;
  await api.d(`/api/projects/${window._activePid}/boards/${S.cur.id}/edges/${id}`);
  S.cur.edges = S.cur.edges.filter(e => e.id !== id);
  document.querySelector(`.eg[data-id="${id}"]`)?.remove();
  S.selE = null; if (window.closeProps) closeProps();
  S.diagrams = await api.g(`/api/projects/${window._activePid}/boards`); renderWfList(); toast('Connection removed');
}
