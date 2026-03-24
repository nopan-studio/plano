import "clsx";
import { p as page } from "../../../../../../../chunks/index3.js";
import { i as setContext, j as getContext, d as derived, b as attr, f as stringify, e as escape_html, a as attr_class, c as ensure_array_like, g as attr_style, k as bind_props } from "../../../../../../../chunks/index2.js";
import "socket.io-client";
import { t as toast } from "../../../../../../../chunks/toast.svelte.js";
import { I as Icon } from "../../../../../../../chunks/Icon.js";
import "@sveltejs/kit/internal";
import "../../../../../../../chunks/exports.js";
import "../../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../../chunks/root.js";
import "../../../../../../../chunks/client.js";
import { m as md } from "../../../../../../../chunks/utils2.js";
import { h as html } from "../../../../../../../chunks/html.js";
const handlers = /* @__PURE__ */ new Set();
function addRealtimeHandler(fn) {
  handlers.add(fn);
  return () => handlers.delete(fn);
}
const CAT = {
  process_flow: [
    { cat: "Flow Steps", col: "var(--green)", nodes: [
      { t: "start", n: "Start", s: "Entry point", i: "start", c: "var(--green)", b: "var(--green-dim)" },
      { t: "process", n: "Step", s: "Process / action", i: "process", c: "var(--blue)", b: "var(--blue-dim)" },
      { t: "decision", n: "Decision", s: "Branch condition", i: "decision", c: "var(--amber)", b: "var(--amber-dim)" },
      { t: "subprocess", n: "Sub-process", s: "Nested flow", i: "subprocess", c: "var(--purple)", b: "var(--purple-dim)" },
      { t: "delay", n: "Delay", s: "Wait / timer", i: "refresh", c: "var(--teal)", b: "var(--teal-dim)" },
      { t: "manual", n: "Manual Step", s: "Human action", i: "check", c: "var(--text-mid)", b: "var(--surface)" }
    ] },
    { cat: "Data", col: "var(--teal)", nodes: [
      { t: "datastore", n: "Data Store", s: "Database / storage", i: "db_table", c: "var(--teal)", b: "var(--teal-dim)" },
      { t: "document", n: "Document", s: "File / report", i: "note", c: "var(--blue)", b: "var(--blue-dim)" },
      { t: "io", n: "I / O", s: "Input or output", i: "refresh", c: "var(--teal)", b: "var(--teal-dim)" }
    ] },
    { cat: "Utils", col: "var(--text-dim)", nodes: [
      { t: "end", n: "End", s: "Exit point", i: "start", c: "var(--rose)", b: "var(--rose-dim)" },
      { t: "annotation", n: "Note", s: "Annotation", i: "note", c: "var(--amber)", b: "var(--amber-dim)" },
      { t: "connector", n: "Connector", s: "Off-page link", i: "chevron-right", c: "var(--text-mid)", b: "var(--surface)" }
    ] }
  ],
  flowchart: [
    { cat: "Shapes", col: "var(--blue)", nodes: [
      { t: "start", n: "Start / End", s: "Rounded terminal", i: "start", c: "var(--green)", b: "var(--green-dim)" },
      { t: "process", n: "Process", s: "Rectangle step", i: "process", c: "var(--blue)", b: "var(--blue-dim)" },
      { t: "decision", n: "Decision", s: "Diamond branch", i: "decision", c: "var(--amber)", b: "var(--amber-dim)" },
      { t: "subprocess", n: "Sub-flow", s: "Nested chart", i: "subprocess", c: "var(--teal)", b: "var(--teal-dim)" }
    ] },
    { cat: "Utils", col: "var(--text-dim)", nodes: [
      { t: "annotation", n: "Note", s: "Annotation", i: "note", c: "var(--amber)", b: "var(--amber-dim)" }
    ] }
  ],
  db_diagram: [
    { cat: "Schema", col: "var(--purple)", nodes: [
      { t: "db_table", n: "Table", s: "Database table", i: "db_table", c: "var(--purple)", b: "var(--purple-dim)" },
      { t: "enum", n: "Enum", s: "Enumeration", i: "enum", c: "var(--amber)", b: "var(--amber-dim)" },
      { t: "external_table", n: "External Ref", s: "Table from other board", i: "external_table", c: "var(--rose)", b: "var(--rose-dim)" }
    ] },
    { cat: "Utils", col: "var(--text-dim)", nodes: [
      { t: "note", n: "Note", s: "Schema note", i: "note", c: "var(--amber)", b: "var(--amber-dim)" }
    ] }
  ],
  idea_map: [
    { cat: "Ideas", col: "var(--amber)", nodes: [
      { t: "central", n: "Central Topic", s: "Core idea", i: "idea", c: "var(--accent)", b: "var(--accent-dim)" },
      { t: "idea", n: "Sub-Idea", s: "Leaf node", i: "idea", c: "var(--green)", b: "var(--green-dim)" },
      { t: "todo", n: "Checklist", s: "Action items", i: "check", c: "var(--blue)", b: "var(--blue-dim)" }
    ] },
    { cat: "Media", col: "var(--purple)", nodes: [
      { t: "youtube", n: "YouTube Video", s: "Embed video", i: "youtube", c: "var(--red)", b: "var(--red-dim)" },
      { t: "image", n: "Image", s: "Visual asset", i: "process", c: "var(--purple)", b: "var(--purple-dim)" },
      { t: "link", n: "Resource", s: "Web link", i: "chevron-right", c: "var(--teal)", b: "var(--teal-dim)" }
    ] },
    { cat: "Structure", col: "var(--text-dim)", nodes: [
      { t: "text", n: "Floating Text", s: "Frameless label", i: "note", c: "var(--text-mid)", b: "transparent" },
      { t: "note", n: "Text Block", s: "Annotated text", i: "note", c: "var(--amber)", b: "var(--amber-dim)" }
    ] }
  ],
  function_flow: [
    { cat: "Code", col: "var(--purple)", nodes: [
      { t: "module", n: "Module", s: "File / package", i: "subprocess", c: "var(--purple)", b: "var(--purple-dim)" },
      { t: "process", n: "Function", s: "Named function", i: "process", c: "var(--blue)", b: "var(--blue-dim)" },
      { t: "start", n: "Trigger", s: "Event / entry", i: "start", c: "var(--green)", b: "var(--green-dim)" }
    ] }
  ]
};
const TYPE_LABELS = {
  process_flow: "Process Flow",
  flowchart: "Flowchart",
  db_diagram: "DB Diagram",
  idea_map: "Idea Map",
  function_flow: "Function Flow"
};
const TYPE_ICONS = {
  process_flow: "process",
  flowchart: "decision",
  db_diagram: "db_table",
  idea_map: "idea",
  function_flow: "process"
};
function getCat(type) {
  return CAT[type] || CAT.process_flow;
}
function getDef(nodeType, diagramType) {
  const cats = getCat(diagramType);
  for (const g of cats) {
    const d = g.nodes.find((x) => x.t === nodeType);
    if (d) return d;
  }
  return { t: nodeType, n: nodeType, i: "process", c: "var(--text-dim)", b: "var(--surface)" };
}
const EDITOR_KEY = Symbol("EDITOR");
class EditorState {
  pid = null;
  did = null;
  diagram = { nodes: [], edges: [], type: "process_flow" };
  // Viewport
  scale = 1;
  ox = 0;
  oy = 0;
  // Selection
  selectedNodeIds = [];
  selectedEdgeId = null;
  selMode = false;
  // Interaction states
  isPanning = false;
  isDragging = false;
  isConnecting = null;
  // { source_id, side, col }
  // History
  history = [];
  historyIndex = -1;
  wasMoved = false;
  #selectedNodes = derived(() => this.diagram?.nodes?.filter((n) => this.selectedNodeIds.includes(n.id)) || []);
  get selectedNodes() {
    return this.#selectedNodes();
  }
  set selectedNodes($$value) {
    return this.#selectedNodes($$value);
  }
  #canUndo = derived(() => this.historyIndex > 0);
  get canUndo() {
    return this.#canUndo();
  }
  set canUndo($$value) {
    return this.#canUndo($$value);
  }
  #canRedo = derived(() => this.historyIndex < this.history.length - 1);
  get canRedo() {
    return this.#canRedo();
  }
  set canRedo($$value) {
    return this.#canRedo($$value);
  }
  #nodeMap = derived(() => new Map(this.diagram?.nodes?.map((n) => [n.id, n]) || []));
  get nodeMap() {
    return this.#nodeMap();
  }
  set nodeMap($$value) {
    return this.#nodeMap($$value);
  }
  drag = null;
  constructor(pid, did) {
    this.pid = pid;
    this.did = did;
    if (typeof window !== "undefined") {
      this.initListeners();
      this.load().then(() => {
        this.saveHistory();
      });
    }
  }
  saveHistory() {
    const snapshot = JSON.stringify({
      nodes: this.diagram.nodes.map((n) => ({ ...n })),
      edges: this.diagram.edges.map((e) => ({ ...e }))
    });
    if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(snapshot);
    this.historyIndex++;
    if (this.history.length > 100) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  async undo() {
    if (!this.canUndo) return;
    this.historyIndex--;
    const state = JSON.parse(this.history[this.historyIndex]);
    await this.syncWithTarget(state);
  }
  async redo() {
    if (!this.canRedo) return;
    this.historyIndex++;
    const state = JSON.parse(this.history[this.historyIndex]);
    await this.syncWithTarget(state);
  }
  async syncWithTarget(target) {
    const ops = [];
    target.nodes.forEach((tn) => {
      const current = this.diagram.nodes.find((n) => n.id === tn.id);
      if (current) {
        if (current.x !== tn.x || current.y !== tn.y || current.width !== tn.width || current.height !== tn.height || current.label !== tn.label) {
          ops.push({
            action: "update_node",
            id: tn.id,
            x: tn.x,
            y: tn.y,
            width: tn.width,
            height: tn.height,
            label: tn.label,
            meta: tn.meta
          });
        }
      }
    });
    this.diagram.nodes = target.nodes.map((n) => ({ ...n }));
    this.diagram.edges = target.edges.map((e) => ({ ...e }));
    if (ops.length > 0) {
      try {
        await fetch(`/api/projects/${this.pid}/boards/${this.did}/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ops })
        });
      } catch (e) {
        toast.error("Undo Sync Failed");
      }
    }
  }
  initListeners() {
    addRealtimeHandler((event) => {
      if (event.type === "system_change" && event.data.path?.includes(`/boards/${this.did}`)) {
        this.load();
        if (event.data.tool) toast.ok(`AI (${event.data.tool}) updated board`);
      } else if (event.type === "board_updated" && event.data.id === this.did) {
        this.load();
        toast.ok("Board synchronized");
      }
    });
    window.addEventListener("mousemove", (e) => this.onGlobalMouseMove(e));
    window.addEventListener("mouseup", (e) => this.onGlobalMouseUp(e));
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
  }
  async load() {
    if (!this.pid || !this.did) return;
    try {
      const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}`);
      if (!resp.ok) return;
      this.diagram = await resp.json();
    } catch (e) {
      console.error("EditorState: Failed to load diagram", e);
    }
  }
  selectNode(id, toggle = false, keepCurrent = false) {
    if (toggle) {
      if (this.selectedNodeIds.includes(id)) {
        this.selectedNodeIds = this.selectedNodeIds.filter((x) => x !== id);
      } else {
        this.selectedNodeIds = [...this.selectedNodeIds, id];
      }
    } else {
      if (!keepCurrent || !this.selectedNodeIds.includes(id)) {
        this.selectedNodeIds = [id];
      }
    }
    this.selectedEdgeId = null;
  }
  selectEdge(id) {
    this.selectedEdgeId = id;
    this.selectedNodeIds = [];
  }
  deselectAll() {
    this.selectedNodeIds = [];
    this.selectedEdgeId = null;
  }
  // ── Interaction Handlers ──
  onNodeDown(id, e) {
    if (e.button !== 0) return;
    this.wasMoved = false;
    this.isDragging = true;
    const origins = this.selectedNodeIds.includes(id) ? this.selectedNodes.map((n) => ({ node: n, x: n.x, y: n.y })) : [this.nodeMap.get(id)].map((n) => ({ node: n, x: n.x, y: n.y }));
    this.drag = {
      type: "node",
      mx: e.clientX,
      my: e.clientY,
      origins,
      moved: false
    };
    e.stopPropagation();
  }
  onPortDown(id, side, col) {
    this.drag = { type: "conn", source_id: id, side, col, mx: 0, my: 0 };
    this.isConnecting = { source_id: id, side, col };
  }
  onResizeDown(id, e) {
    const node = this.nodeMap.get(id);
    if (!node) return;
    this.isDragging = true;
    this.drag = {
      type: "resize",
      node,
      mx: e.clientX,
      my: e.clientY,
      ow: node.width || 220,
      oh: node.height || 60
    };
    e.stopPropagation();
  }
  startPanning(e) {
    this.drag = {
      type: "pan",
      mx: e.clientX,
      my: e.clientY,
      ox: this.ox,
      oy: this.oy
    };
    this.isPanning = true;
  }
  onGlobalMouseMove(e) {
    if (!this.drag) return;
    const dx = (e.clientX - this.drag.mx) / this.scale;
    const dy = (e.clientY - this.drag.my) / this.scale;
    if (this.drag.type === "node") {
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) this.drag.moved = true;
      const SNAP = 40;
      this.drag.origins.forEach((orig) => {
        orig.node.x = Math.round((orig.x + dx) / SNAP) * SNAP;
        orig.node.y = Math.round((orig.y + dy) / SNAP) * SNAP;
      });
    } else if (this.drag.type === "resize") {
      const node = this.drag.node;
      if (node) {
        node.width = Math.max(100, this.drag.ow + dx);
        node.height = Math.max(40, this.drag.oh + dy);
      }
    } else if (this.drag.type === "pan") {
      this.ox = this.drag.ox + (e.clientX - this.drag.mx);
      this.oy = this.drag.oy + (e.clientY - this.drag.my);
    } else if (this.drag.type === "conn") {
      this.drag.cx = e.clientX;
      this.drag.cy = e.clientY;
    }
  }
  async onGlobalMouseUp(e) {
    if (!this.drag) return;
    const drag = this.drag;
    this.wasMoved = drag.moved;
    this.drag = null;
    this.isPanning = false;
    this.isDragging = false;
    this.isConnecting = null;
    if (drag.type === "node" && drag.moved) {
      const ops = drag.origins.map((orig) => {
        const n = orig.node;
        return { action: "update_node", id: n.id, x: n.x, y: n.y };
      });
      await fetch(`/api/projects/${this.pid}/boards/${this.did}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ops })
      });
      this.saveHistory();
    } else if (drag.type === "resize") {
      const node = this.diagram.nodes.find((n) => n.id === drag.node.id);
      if (node) {
        await this.updateNode(node.id, { width: node.width, height: node.height });
        this.saveHistory();
      }
    } else if (drag.type === "conn") {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const portEl = el?.closest("[data-side]");
      const nodeEl = el?.closest(".n8n-node");
      if (nodeEl) {
        const targetId = parseInt(nodeEl.dataset.id);
        if (targetId && targetId !== drag.source_id) {
          const targetSide = portEl?.dataset.side || "l";
          const targetCol = portEl?.dataset.col !== void 0 ? parseInt(portEl.dataset.col) : void 0;
          const sourcePort = { side: drag.side, col: drag.col };
          const targetPort = { side: targetSide, col: targetCol };
          await this.addEdge(drag.source_id, targetId, sourcePort, targetPort);
        }
      }
    }
  }
  onKeyDown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    const isMod = e.ctrlKey || e.metaKey;
    if (isMod && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if (isMod && e.key === "y") {
      e.preventDefault();
      this.redo();
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      this.deleteSelected();
    }
  }
  async updateNode(id, data) {
    const node = this.diagram.nodes.find((n) => n.id === id);
    if (!node) return;
    Object.assign(node, data);
    try {
      await fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      this.saveHistory();
    } catch (e) {
    }
  }
  async updateEdge(id, data) {
    const edge = this.diagram.edges.find((e) => e.id === id);
    if (!edge) return;
    Object.assign(edge, data);
    try {
      await fetch(`/api/projects/${this.pid}/boards/${this.did}/edges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      this.saveHistory();
    } catch (e) {
    }
  }
  async deleteSelected() {
    let deleted = false;
    if (this.selectedNodeIds.length) {
      for (const id of this.selectedNodeIds) {
        await fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes/${id}`, { method: "DELETE" });
        this.diagram.nodes = this.diagram.nodes.filter((n) => n.id !== id);
        this.diagram.edges = this.diagram.edges.filter((e) => e.source_id !== id && e.target_id !== id);
        deleted = true;
      }
      this.selectedNodeIds = [];
    } else if (this.selectedEdgeId) {
      await fetch(`/api/projects/${this.pid}/boards/${this.did}/edges/${this.selectedEdgeId}`, { method: "DELETE" });
      this.diagram.edges = this.diagram.edges.filter((e) => e.id !== this.selectedEdgeId);
      this.selectedEdgeId = null;
      deleted = true;
    }
    if (deleted) this.saveHistory();
  }
  async addNode(type, x, y) {
    const isT = type === "db_table" || type === "table" || type === "view";
    const isAuto = isT || type === "todo" || type === "image" || type === "youtube" || type === "text";
    const defaultLabels = {
      start: "Start",
      end: "End",
      process: "New Step",
      decision: "Condition",
      io: "I/O",
      connector: "Connector",
      annotation: "Note",
      table: "new_table",
      view: "new_view",
      enum: "NewEnum",
      note: "Note",
      db_table: "new_table",
      todo: "Checklist",
      image: "New Image",
      link: "Web Link",
      text: "Text Label",
      youtube: "YouTube Video"
    };
    let meta = {};
    if (isT) meta = { columns: [{ name: "id", type: "INT", pk: true, fk: false }] };
    if (type === "todo") meta = { items: [{ text: "New Item", done: false }] };
    if (type === "image" || type === "youtube") meta = { url: "" };
    try {
      const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: defaultLabels[type] || type,
          node_type: type,
          x: Math.round(x / 40) * 40,
          y: Math.round(y / 40) * 40,
          width: 240,
          height: isAuto ? 120 : 64,
          meta
        })
      });
      if (!resp.ok) {
        const err = await resp.json();
        toast.error(`Node Error: ${err.error || "Server rejected creation"}`);
        return;
      }
      const n = await resp.json();
      this.diagram.nodes = [...this.diagram.nodes, n];
      this.selectNode(n.id);
      this.saveHistory();
      return n;
    } catch (e) {
      toast.error("Connection failed");
      console.error("addNode error", e);
    }
  }
  async addEdge(srcId, tgtId, sourcePort, targetPort) {
    const et = this.diagram.type === "db_diagram" ? "one_to_many" : "default";
    const meta = { source_port: sourcePort, target_port: targetPort };
    if (this.diagram.type === "db_diagram") {
      const sn = this.diagram.nodes.find((n) => n.id === srcId);
      const tn = this.diagram.nodes.find((n) => n.id === tgtId);
      if (sn && sourcePort.col !== void 0) meta.source_column = sn.meta?.columns?.[sourcePort.col]?.name;
      if (tn && targetPort.col !== void 0) meta.target_column = tn.meta?.columns?.[targetPort.col]?.name;
    }
    try {
      const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}/edges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: srcId, target_id: tgtId, edge_type: et, meta })
      });
      const e = await resp.json();
      this.diagram.edges = [...this.diagram.edges, e];
      this.saveHistory();
      return e;
    } catch (e) {
    }
  }
}
function setEditorState(pid, did) {
  const s = new EditorState(pid, did);
  setContext(EDITOR_KEY, s);
  return s;
}
function getEditorState() {
  return getContext(EDITOR_KEY);
}
function Toolbar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const S = getEditorState();
    $$renderer2.push(`<div class="toolbar-wrap svelte-1rxnufp"><div class="toolbar svelte-1rxnufp"><div class="tb-left svelte-1rxnufp"><a${attr("href", `/projects/${stringify(S.pid)}/boards`)} class="btn-tb svelte-1rxnufp" title="Back to Boards">`);
    Icon($$renderer2, { name: "back", size: 20 });
    $$renderer2.push(`<!----></a> <div class="sep svelte-1rxnufp"></div> <div class="board-info svelte-1rxnufp"><div class="bi-icon svelte-1rxnufp" style="background: var(--accent-dim); color: var(--accent)">`);
    Icon($$renderer2, {
      name: TYPE_ICONS[S.diagram.type] || "process",
      size: 14,
      stroke: 2.5
    });
    $$renderer2.push(`<!----></div> <div class="bi-text svelte-1rxnufp"><span class="bn svelte-1rxnufp">${escape_html(S.diagram.name)}</span> <span class="bt svelte-1rxnufp">${escape_html(TYPE_LABELS[S.diagram.type] || S.diagram.type)}</span></div></div></div> <div class="tb-mid svelte-1rxnufp"><div class="tb-group svelte-1rxnufp"><button class="btn-tb svelte-1rxnufp"${attr("disabled", !S.canUndo, true)} title="Undo (Ctrl+Z)">`);
    Icon($$renderer2, { name: "undo", size: 18 });
    $$renderer2.push(`<!----></button> <button class="btn-tb svelte-1rxnufp"${attr("disabled", !S.canRedo, true)} title="Redo (Ctrl+Y)">`);
    Icon($$renderer2, { name: "redo", size: 18 });
    $$renderer2.push(`<!----></button></div> <div class="sep svelte-1rxnufp"></div> <div class="tb-group svelte-1rxnufp"><button${attr_class(`btn-tb ${stringify(S.selMode ? "active" : "")}`, "svelte-1rxnufp")} title="Selection Mode (Shift+Drag)">`);
    Icon($$renderer2, { name: "fit-view", size: 18 });
    $$renderer2.push(`<!----></button> <div class="sep svelte-1rxnufp"></div> <button class="btn-tb svelte-1rxnufp" title="Zoom Out">`);
    Icon($$renderer2, { name: "zoom-out", size: 18 });
    $$renderer2.push(`<!----></button> <div class="zoom-val svelte-1rxnufp">${escape_html(Math.round(S.scale * 100))}%</div> <button class="btn-tb svelte-1rxnufp" title="Zoom In">`);
    Icon($$renderer2, { name: "zoom-in", size: 18 });
    $$renderer2.push(`<!----></button></div> <div class="sep svelte-1rxnufp"></div> <button class="btn-tb-pill svelte-1rxnufp" title="Auto-layout Nodes">`);
    Icon($$renderer2, { name: "layout", size: 16 });
    $$renderer2.push(`<!----> <span>Auto-layout</span></button></div> <div class="tb-right svelte-1rxnufp"><button class="btn-tb svelte-1rxnufp" title="Duplicate Board">`);
    Icon($$renderer2, { name: "duplicate", size: 18 });
    $$renderer2.push(`<!----></button> <button class="btn-tb primary svelte-1rxnufp" title="Refresh Data">`);
    Icon($$renderer2, { name: "refresh", size: 18 });
    $$renderer2.push(`<!----></button></div></div></div>`);
  });
}
function EditorSidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const S = getEditorState();
    const categories = derived(() => getCat(S.diagram.type));
    $$renderer2.push(`<div class="sidebar svelte-1o831wl"><div class="sb-content svelte-1o831wl"><!--[-->`);
    const each_array = ensure_array_like(categories());
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let cat = each_array[$$index_1];
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(cat.nodes);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let node = each_array_1[$$index];
        $$renderer2.push(`<button class="p-item svelte-1o831wl"${attr_style(`--c:${stringify(node.c)}`)} draggable="true"${attr("title", node.n)}><div class="pi svelte-1o831wl">`);
        Icon($$renderer2, { name: node.i, color: node.c, size: 18, stroke: 2 });
        $$renderer2.push(`<!----></div></button>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function Node($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { node } = $$props;
    const S = getEditorState();
    const def = derived(() => getDef(node.node_type, S.diagram?.type));
    const isSelected = derived(() => S.selectedNodeIds.includes(node.id));
    const isNote = derived(() => node.node_type === "annotation" || node.node_type === "note");
    const isTab = derived(() => node.node_type === "db_table" || node.node_type === "table" || node.node_type === "view" || node.node_type === "external_table" || node.node_type === "datastore");
    const isCheck = derived(() => node.node_type === "todo");
    const isImage = derived(() => node.node_type === "image");
    const isText = derived(() => node.node_type === "text");
    const isYoutube = derived(() => node.node_type === "youtube");
    const ytId = derived(() => {
      if (!node.meta?.url) return null;
      const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = node.meta.url.match(reg);
      return match ? match[1] : null;
    });
    const columns = derived(() => node.meta?.columns || []);
    const subtitles = {
      start: "Trigger",
      end: "End",
      process: "Operation",
      decision: "Condition",
      io: "Data Transfer",
      connector: "Bridge",
      annotation: "Context",
      db_table: "Entity",
      enum: "Enum Def",
      note: "Abstract",
      external_table: "Remote",
      todo: "Checklist",
      image: "Visual",
      link: "Resource",
      text: "Floating Tag",
      youtube: "Video Player"
    };
    const hasBody = derived(() => {
      if (isImage()) return !!node.meta?.url;
      if (isYoutube()) return !!ytId();
      if (isCheck()) return (node.meta?.items?.length || 0) > 0;
      if (isTab()) return columns().length > 0;
      return false;
    });
    $$renderer2.push(`<div${attr_class(`n8n-node ${stringify(isSelected() ? "selected" : "")} ${stringify(isNote() ? "is-note" : "")} ${stringify(isText() ? "is-text" : "")} ${stringify(S.isDragging && isSelected() ? "dragging" : "")}`)}${attr_style(`--x: ${stringify(node.x)}px; --y: ${stringify(node.y)}px; width: ${stringify(node.width || 240)}px; ${stringify(isTab() ? "height: auto" : `height: ${node.height || 120}px`)}; --node-color: ${stringify(def().c)}`)}${attr("data-id", node.id)}><div class="node-inner">`);
    if (isText()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="text-node-content" style="padding: 8px 12px; font-size: 18px; font-weight: 700; color: var(--text-mid); text-align: center;">${escape_html(node.label)}</div>`);
    } else if (isNote()) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="note-header">`);
      Icon($$renderer2, { name: def().i, color: def().c, size: 14, stroke: 2.5 });
      $$renderer2.push(`<!----> <span class="node-title" style="margin-left: 8px;">${escape_html(node.label)}</span></div> <div class="note-body">${html(md(node.meta?.description || "Click to edit note content..."))}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="node-row"${attr_style(`background: ${stringify(def().b)}; min-height: 64px;`)}><div class="node-icon-cell" style="width: 52px; background: rgba(0,0,0,0.1)">`);
      Icon($$renderer2, { name: def().i, color: def().c, size: 22, stroke: 1.5 });
      $$renderer2.push(`<!----></div> <div class="node-text-cell" style="padding: 12px 14px;"><div class="node-title" style="font-size: 14px; letter-spacing: -0.01em;">${escape_html(node.label)}</div> <div class="node-subtitle" style="font-size: 9px; opacity: 0.8;">${escape_html(subtitles[node.node_type] || node.node_type)}</div></div> `);
      if (node.node_type === "external_table" && node.meta?.ref_diagram_id) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button class="btn btn-ghost btn-xs" style="margin: 10px; padding: 4px; background: rgba(255,255,255,0.1)" title="Open reference board">➔</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (isImage()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="node-img-wrap" style="height: 140px; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative">`);
        if (node.meta?.url) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<img${attr("src", node.meta.url)}${attr("alt", node.label)} style="width: 100%; height: 100%; object-fit: cover;"/>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div style="text-align:center">`);
          Icon($$renderer2, { name: "process", size: 32, color: "rgba(255,255,255,0.2)" });
          $$renderer2.push(`<!----> <div style="font-size: 8px; color: var(--text-dim); margin-top: 8px;">Click to set image</div></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isYoutube()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="node-yt-wrap" style="height: 180px; background: #000; overflow: hidden; position: relative">`);
        if (ytId()) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<iframe width="100%" height="100%"${attr("src", `https://www.youtube.com/embed/${stringify(ytId())}`)} title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" style="pointer-events: auto;"></iframe>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; opacity: 0.5;">`);
          Icon($$renderer2, { name: "process", size: 32 });
          $$renderer2.push(`<!----> <div style="font-size: 8px;">Click to set YouTube URL</div></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isCheck() && node.meta?.items) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="node-checklist" style="padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.05);"><!--[-->`);
        const each_array = ensure_array_like(node.meta.items);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let item = each_array[$$index];
          $$renderer2.push(`<div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 4px;"><input type="checkbox"${attr("checked", item.done, true)} disabled="" style="width: 12px; height: 12px; accent-color: var(--blue);"/> <span${attr_style(item.done ? "text-decoration: line-through; opacity: 0.5" : "")}>${escape_html(item.text)}</span></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isTab() && columns().length) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="node-cols"><!--[-->`);
        const each_array_1 = ensure_array_like(columns());
        for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
          let c = each_array_1[i];
          $$renderer2.push(`<div class="ncol svelte-1crz6v4"><div${attr_class(`port-row l ${stringify(S.isConnecting?.source_id === node.id ? "pinned" : "")}`)}${attr("data-id", node.id)} data-side="l"${attr("data-col", i)}></div> `);
          if (c.pk) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="badge-pk" style="font-size:8px; padding:0 3px; border-radius:3px; margin-right:4px">PK</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (c.fk) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="badge-fk" style="font-size:8px; padding:0 3px; border-radius:3px; margin-right:4px">FK</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> <span class="col-n">${escape_html(c.name)}</span> <span class="col-t">${escape_html(c.type || "")}</span> <div${attr_class(`port-row r ${stringify(S.isConnecting?.source_id === node.id ? "pinned" : "")}`)}${attr("data-id", node.id)} data-side="r"${attr("data-col", i)}></div></div>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!hasBody() && node.meta?.description) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="node-desc-fb" style="padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; opacity: 0.7; line-height: 1.4;">${html(md(node.meta.description))}</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (!isNote()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<!--[-->`);
      const each_array_2 = ensure_array_like(["l", "r", "t", "b"]);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let side = each_array_2[$$index_2];
        $$renderer2.push(`<div${attr_class(`port port-${stringify(side)} ${stringify(S.isConnecting?.source_id === node.id ? "pinned" : "")}`, "svelte-1crz6v4")}${attr("data-id", node.id)}${attr("data-side", side)}></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="node-resizer"></div></div>`);
  });
}
function Edge($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { edge } = $$props;
    const S = getEditorState();
    let isSelected = derived(() => S.selectedEdgeId === edge.id);
    let sourceNode = derived(() => S.nodeMap.get(edge.source_id));
    let targetNode = derived(() => S.nodeMap.get(edge.target_id));
    let sc = derived(() => getPortCoords(sourceNode(), edge.meta?.source_port?.side, edge.meta?.source_column || edge.meta?.source_port?.col));
    let tc = derived(() => getPortCoords(targetNode(), edge.meta?.target_port?.side, edge.meta?.target_column || edge.meta?.target_port?.col));
    let pathD = derived(() => {
      if (!sc() || !tc()) return "";
      const ctrl = Math.max(Math.abs(tc().x - sc().x) * 0.5, 80);
      return `M ${sc().x} ${sc().y} C ${sc().x + ctrl} ${sc().y},${tc().x - ctrl} ${tc().y},${tc().x} ${tc().y}`;
    });
    function getPortCoords(n, side = "l", colNameOrIdx) {
      if (!n) return { x: 0, y: 0 };
      const x = n.x;
      const y = n.y;
      const w = n.width || 220;
      const h = n.height || 60;
      if (colNameOrIdx !== void 0) {
        const isTab = n.node_type === "db_table" || n.node_type === "table" || n.node_type === "view";
        if (isTab && n.meta?.columns) {
          let idx = -1;
          if (typeof colNameOrIdx === "number") idx = colNameOrIdx;
          else idx = n.meta.columns.findIndex((c) => c.name === colNameOrIdx);
          if (idx !== -1) {
            const headerHeight = 35;
            const rowHeight = 30;
            return {
              x: x + (side === "r" ? w : 0),
              y: y + headerHeight + idx * rowHeight + rowHeight / 2
            };
          }
        }
      }
      if (side === "t") return { x: x + w / 2, y };
      if (side === "b") return { x: x + w / 2, y: y + h };
      if (side === "r") return { x: x + w, y: y + h / 2 };
      return { x, y: y + h / 2 };
    }
    function getMarker(type, selected) {
      if (selected) return "url(#m-acc)";
      if (type === "success" || type === "run_after") return "url(#m-grn)";
      if (type === "one_to_many" || type === "many_to_many" || type === "run_before") return "url(#m-pur)";
      return "url(#m-def)";
    }
    let displayLabel = derived(() => {
      if (edge.label) return edge.label;
      if (edge.edge_type === "run_after") return "Run After";
      if (edge.edge_type === "run_before") return "Run Before";
      return "";
    });
    $$renderer2.push(`<g class="eg svelte-1nb6nut" role="button" tabindex="0"><path class="ehit svelte-1nb6nut"${attr("d", pathD())}></path><path${attr_class(`epath ${stringify(isSelected() ? "sel" : "")} et-${stringify(edge.edge_type)}`, "svelte-1nb6nut")}${attr("d", pathD())}${attr("marker-end", getMarker(edge.edge_type, isSelected()))}></path>`);
    if (displayLabel()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<text class="elabel svelte-1nb6nut"${attr("x", (sc().x + tc().x) / 2)}${attr("y", (sc().y + tc().y) / 2 - 7)} text-anchor="middle">${escape_html(displayLabel())}</text>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></g>`);
  });
}
function Canvas($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { canvasWrap = void 0 } = $$props;
    const S = getEditorState();
    function getPortCoordsForPreview(n, side = "l", colIdx) {
      if (!n) return { x: 0, y: 0 };
      const x = n.x;
      const y = n.y;
      const w = n.width || 220;
      const h = n.height || 60;
      const isTab = n.node_type === "db_table" || n.node_type === "table" || n.node_type === "view";
      if (colIdx !== void 0 && isTab) {
        const headerHeight = 35;
        const rowHeight = 30;
        return {
          x: x + (side === "r" ? w : 0),
          y: y + headerHeight + colIdx * rowHeight + rowHeight / 2
        };
      }
      if (side === "t") return { x: x + w / 2, y };
      if (side === "b") return { x: x + w / 2, y: y + h };
      if (side === "r") return { x: x + w, y: y + h / 2 };
      return { x, y: y + h / 2 };
    }
    $$renderer2.push(`<div class="canvas-container" role="presentation">`);
    if (!S.diagram.nodes) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="canvas-loading">Loading board...</div>`);
    } else if (S.diagram.nodes.length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="canvas-empty">`);
      Icon($$renderer2, { name: "process", size: 48, stroke: 1, color: "var(--border)" });
      $$renderer2.push(`<!----> <p>This board is empty. Drag components from the sidebar to get started.</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (S.selectedNodeIds.length > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="sel-badge">${escape_html(S.selectedNodeIds.length)} nodes selected</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div id="canvas"${attr_style(`transform: translate(${stringify(S.ox)}px, ${stringify(S.oy)}px) scale(${stringify(S.scale)})`)}><svg id="svg-layer"><defs><marker id="m-def" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L0,10 L10,5 Z" fill="var(--text-dim)"></path></marker><marker id="m-acc" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L0,10 L10,5 Z" fill="var(--accent)"></path></marker><marker id="m-grn" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L0,10 L10,5 Z" fill="var(--green)"></path></marker><marker id="m-pur" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L0,10 L10,5 Z" fill="var(--purple)"></path></marker></defs><!--[-->`);
    const each_array = ensure_array_like(S.diagram.edges);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let edge = each_array[$$index];
      Edge($$renderer2, { edge });
    }
    $$renderer2.push(`<!--]-->`);
    if (S.isConnecting && S.drag?.cx) {
      $$renderer2.push("<!--[0-->");
      const br = canvasWrap.getBoundingClientRect();
      const sn = S.nodeMap.get(S.isConnecting.source_id);
      const sp = getPortCoordsForPreview(sn, S.isConnecting.side, S.isConnecting.col);
      const tx = (S.drag.cx - br.left - S.ox) / S.scale;
      const ty = (S.drag.cy - br.top - S.oy) / S.scale;
      const ctrl = Math.max(Math.abs(tx - sp.x) * 0.5, 80);
      $$renderer2.push(`<path class="epath preview"${attr("d", `M ${stringify(sp.x)} ${stringify(sp.y)} C ${stringify(sp.x + (S.isConnecting.side === "r" ? ctrl : S.isConnecting.side === "l" ? -ctrl : 0))} ${stringify(sp.y)}, ${stringify(tx - 50)} ${stringify(ty)}, ${stringify(tx)} ${stringify(ty)}`)} stroke-dasharray="4"></path>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></svg> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div id="nodes-layer"><!--[-->`);
    const each_array_1 = ensure_array_like(S.diagram.nodes);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let node = each_array_1[$$index_1];
      Node($$renderer2, { node });
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
    bind_props($$props, { canvasWrap });
  });
}
function Properties($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const S = getEditorState();
    const node = derived(() => S.selectedNodes[0]);
    const edge = derived(() => S.selectedEdge);
    const def = derived(() => node() ? getDef(node().node_type, S.diagram.type) : null);
    $$renderer2.push(`<div${attr_class(`properties ${stringify(node() || edge() ? "open" : "")}`, "svelte-tj8zpd")}>`);
    if (node()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="prop-header svelte-tj8zpd"><div class="ph-top svelte-tj8zpd"><div class="ph-icon svelte-tj8zpd"${attr_style(`background: ${stringify(def().b)}; color: ${stringify(def().c)}`)}>`);
      Icon($$renderer2, { name: def().i, size: 18, stroke: 2 });
      $$renderer2.push(`<!----></div> <div class="ph-title svelte-tj8zpd"><input class="ghost-input svelte-tj8zpd"${attr("value", node().label)}/> <div class="ph-type svelte-tj8zpd">${escape_html(node().node_type)} • ID ${escape_html(node().id)}</div></div> <button class="btn-close svelte-tj8zpd">`);
      Icon($$renderer2, { name: "chevron-right", size: 16 });
      $$renderer2.push(`<!----></button></div> <div class="ph-tabs svelte-tj8zpd"><button${attr_class(`tab ${stringify("active")}`, "svelte-tj8zpd")}>General</button> `);
      if (node().node_type.includes("table")) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button${attr_class(`tab ${stringify("")}`, "svelte-tj8zpd")}>Schema</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button${attr_class(`tab ${stringify("")}`, "svelte-tj8zpd")}>Style</button></div></div> <div class="prop-content svelte-tj8zpd">`);
      {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="p-section svelte-tj8zpd"><label class="p-label svelte-tj8zpd">Label &amp; Branding</label> <input class="p-input svelte-tj8zpd"${attr("value", node().label)}/></div> <div class="p-section svelte-tj8zpd"><label class="p-label svelte-tj8zpd">Description / Documentation</label> <textarea class="p-input p-area svelte-tj8zpd" placeholder="Add notes, docs, or implementation details...">`);
        const $$body = escape_html(node().meta?.description || "");
        if ($$body) {
          $$renderer2.push(`${$$body}`);
        }
        $$renderer2.push(`</textarea></div> `);
        if (node().node_type === "external_table") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="p-section svelte-tj8zpd"><label class="p-label svelte-tj8zpd">Target Board ID</label> <input type="number" class="p-input svelte-tj8zpd"${attr("value", node().meta?.ref_diagram_id || "")}/></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="p-footer svelte-tj8zpd"><button class="btn-danger-ghost svelte-tj8zpd">`);
      Icon($$renderer2, { name: "delete", size: 14 });
      $$renderer2.push(`<!----> <span>Delete Node</span></button></div></div>`);
    } else if (edge()) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="prop-header svelte-tj8zpd"><div class="ph-top svelte-tj8zpd"><div class="ph-icon svelte-tj8zpd" style="background: var(--surface2); color: var(--text-mid)">`);
      Icon($$renderer2, { name: "process", size: 18 });
      $$renderer2.push(`<!----></div> <div class="ph-title svelte-tj8zpd"><input class="ghost-input svelte-tj8zpd"${attr("value", edge().label || "Connection")}/> <div class="ph-type svelte-tj8zpd">Edge • ID ${escape_html(edge().id)}</div></div> <button class="btn-close svelte-tj8zpd">`);
      Icon($$renderer2, { name: "chevron-right", size: 16 });
      $$renderer2.push(`<!----></button></div></div> <div class="prop-content svelte-tj8zpd"><div class="p-section svelte-tj8zpd"><label class="p-label svelte-tj8zpd">Relationship Type</label> `);
      $$renderer2.select(
        {
          class: "p-input",
          value: edge().edge_type,
          onchange: (e) => S.updateEdge(edge().id, { edge_type: e.target.value })
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(EDGE_TYPES[S.diagram.type] || EDGE_TYPES.process_flow);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let et = each_array_1[$$index_1];
            $$renderer3.option({ value: et.t }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(et.n)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        },
        "svelte-tj8zpd"
      );
      $$renderer2.push(`</div> <div class="p-footer svelte-tj8zpd"><button class="btn-danger-ghost svelte-tj8zpd">`);
      Icon($$renderer2, { name: "delete", size: 14 });
      $$renderer2.push(`<!----> <span>Delete Edge</span></button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="no-selection svelte-tj8zpd"><div class="ns-icon svelte-tj8zpd">`);
      Icon($$renderer2, { name: "start", size: 32, color: "var(--border)", stroke: 1 });
      $$renderer2.push(`<!----></div> <p>Select an element to edit properties</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    setEditorState(page.params.id, page.params.did);
    let canvasWrap = null;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="editor-container svelte-fbrc10"><div class="canvas-wrap svelte-fbrc10">`);
      Canvas($$renderer3, {
        get canvasWrap() {
          return canvasWrap;
        },
        set canvasWrap($$value) {
          canvasWrap = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> `);
      Toolbar($$renderer3);
      $$renderer3.push(`<!----> `);
      EditorSidebar($$renderer3);
      $$renderer3.push(`<!----> `);
      Properties($$renderer3);
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
