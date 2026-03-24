/** EditorState v1.1 - Svelte 5 */
import { getContext, setContext } from 'svelte';
import { getDef } from './config';
import { addRealtimeHandler } from '$lib/realtime.svelte';
import { toast } from '$lib/toast.svelte.js';

export const EDITOR_KEY = Symbol('EDITOR');

export class EditorState {
    pid = $state(null);
    did = $state(null);
    diagram = $state({ nodes: [], edges: [], type: 'process_flow' });
    
    // Viewport
    scale = $state(1);
    ox = $state(0);
    oy = $state(0);
    
    // Selection
    selectedNodeIds = $state([]);
    selectedEdgeId = $state(null);
    selMode = $state(false);
    
    // Interaction states
    isPanning = $state(false);
    isDragging = $state(false);
    isConnecting = $state(null); // { source_id, side, col }
    
    // History
    history = $state([]);
    historyIndex = $state(-1);
    wasMoved = $state(false);

    // Derived properties
    selectedNodes = $derived(this.diagram?.nodes?.filter(n => this.selectedNodeIds.includes(n.id)) || []);
    selectedEdge = $derived(this.diagram?.edges?.find(e => e.id === this.selectedEdgeId) || null);
    canUndo = $derived(this.historyIndex > 0);
    canRedo = $derived(this.historyIndex < this.history.length - 1);
    nodeMap = $derived(new Map(this.diagram?.nodes?.map(n => [n.id, n]) || []));

    // Internal interaction state
    drag = $state(null); // { type: 'node'|'pan'|'marq'|'resize'|'conn', ... }

    constructor(pid, did) {
        this.pid = pid;
        this.did = did;
        
        if (typeof window !== 'undefined') {
            this.initListeners();
            this.load().then(() => {
                this.saveHistory();
            });
        }
    }

    saveHistory() {
        // Capture a clean snapshot of nodes and edges
        const snapshot = JSON.stringify({
            nodes: this.diagram.nodes.map(n => ({ ...n })),
            edges: this.diagram.edges.map(e => ({ ...e }))
        });

        // If same as last, ignore
        if (this.historyIndex >= 0 && this.history[this.historyIndex] === snapshot) return;

        // Trim future (redo points)
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snapshot);
        this.historyIndex++;

        // Cap at 100
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
        // 1. Calculate moves & updates
        const ops = [];
        target.nodes.forEach(tn => {
            const current = this.diagram.nodes.find(n => n.id === tn.id);
            if (current) {
                if (current.x !== tn.x || current.y !== tn.y || current.width !== tn.width || current.height !== tn.height || current.label !== tn.label) {
                    ops.push({ 
                        action: 'update_node', 
                        id: tn.id, 
                        x: tn.x, y: tn.y, 
                        width: tn.width, height: tn.height, 
                        label: tn.label,
                        meta: tn.meta
                    });
                }
            }
        });

        // 2. Add/Delete logic is trickier with backend IDs, 
        // but for now we'll focus on making the UI match immediately
        this.diagram.nodes = target.nodes.map(n => ({ ...n }));
        this.diagram.edges = target.edges.map(e => ({ ...e }));

        // 3. Sync significant changes to backend
        if (ops.length > 0) {
            try {
                await fetch(`/api/projects/${this.pid}/boards/${this.did}/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ops })
                });
            } catch (e) {
                toast.error("Undo Sync Failed");
            }
        }
    }

    initListeners() {
        addRealtimeHandler((event) => {
            if (event.type === 'system_change' && event.data.path?.includes(`/boards/${this.did}`)) {
                this.load();
                if (event.data.tool) toast.ok(`AI (${event.data.tool}) updated board`);
            } else if (event.type === 'board_updated' && event.data.id === this.did) {
                this.load();
                toast.ok("Board synchronized");
            }
        });

        window.addEventListener('mousemove', (e) => this.onGlobalMouseMove(e));
        window.addEventListener('mouseup', (e) => this.onGlobalMouseUp(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    async load() {
        if (!this.pid || !this.did) return;
        try {
            const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}`);
            if (!resp.ok) return;
            this.diagram = await resp.json();
        } catch (e) {
            console.error('EditorState: Failed to load diagram', e);
        }
    }

    selectNode(id, toggle = false, keepCurrent = false) {
        if (toggle) {
            if (this.selectedNodeIds.includes(id)) {
                this.selectedNodeIds = this.selectedNodeIds.filter(x => x !== id);
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
        
        // If not selected, we still want to drag it (and potentially select it)
        this.isDragging = true;
        const origins = this.selectedNodeIds.includes(id) 
            ? this.selectedNodes.map(n => ({ node: n, x: n.x, y: n.y }))
            : [this.nodeMap.get(id)].map(n => ({ node: n, x: n.x, y: n.y }));

        this.drag = {
            type: 'node',
            mx: e.clientX,
            my: e.clientY,
            origins,
            moved: false
        };
        e.stopPropagation();
    }

    onPortDown(id, side, col) {
        this.drag = {
            type: 'conn',
            source_id: id,
            side,
            col,
            mx: 0, my: 0
        };
        this.isConnecting = { source_id: id, side, col };
    }

    onResizeDown(id, e) {
        const node = this.nodeMap.get(id);
        if (!node) return;
        this.isDragging = true;
        this.drag = {
            type: 'resize',
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
            type: 'pan',
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

        if (this.drag.type === 'node') {
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) this.drag.moved = true;
            const SNAP = 40;
            this.drag.origins.forEach(orig => {
                orig.node.x = Math.round((orig.x + dx) / SNAP) * SNAP;
                orig.node.y = Math.round((orig.y + dy) / SNAP) * SNAP;
            });
        } else if (this.drag.type === 'resize') {
            const node = this.drag.node;
            if (node) {
                node.width = Math.max(120, this.drag.ow + dx);
                node.height = Math.max(64, this.drag.oh + dy);
            }
        } else if (this.drag.type === 'pan') {
            this.ox = this.drag.ox + (e.clientX - this.drag.mx);
            this.oy = this.drag.oy + (e.clientY - this.drag.my);
        } else if (this.drag.type === 'conn') {
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

        if (drag.type === 'node' && drag.moved) {
            const ops = drag.origins.map(orig => {
                const n = orig.node;
                return { action: 'update_node', id: n.id, x: n.x, y: n.y };
            });
            await fetch(`/api/projects/${this.pid}/boards/${this.did}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ops })
            });
            this.saveHistory();
        } else if (drag.type === 'resize') {
            const node = this.diagram.nodes.find(n => n.id === drag.node.id);
            if (node) {
                await this.updateNode(node.id, { width: node.width, height: node.height });
                this.saveHistory();
            }
        } else if (drag.type === 'conn') {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const portEl = el?.closest('[data-side]');
            const nodeEl = el?.closest('.n8n-node');
            
            if (nodeEl) {
                const targetId = parseInt(nodeEl.dataset.id);
                if (targetId && targetId !== drag.source_id) {
                    const targetSide = portEl?.dataset.side || 'l';
                    const targetCol = portEl?.dataset.col !== undefined ? parseInt(portEl.dataset.col) : undefined;
                    const sourcePort = { side: drag.side, col: drag.col };
                    const targetPort = { side: targetSide, col: targetCol };
                    await this.addEdge(drag.source_id, targetId, sourcePort, targetPort);
                }
            }
        }
    }

    onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        const isMod = e.ctrlKey || e.metaKey;
        
        if (isMod && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) this.redo();
            else this.undo();
            return;
        }
        if (isMod && e.key === 'y') {
            e.preventDefault();
            this.redo();
            return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            this.deleteSelected();
        }
    }

    async updateNode(id, data) {
        const node = this.diagram.nodes.find(n => n.id === id);
        if (!node) return;
        Object.assign(node, data);
        try {
            await fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            this.saveHistory();
        } catch (e) {}
    }

    async updateEdge(id, data) {
        const edge = this.diagram.edges.find(e => e.id === id);
        if (!edge) return;
        Object.assign(edge, data);
        try {
            await fetch(`/api/projects/${this.pid}/boards/${this.did}/edges/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            this.saveHistory();
        } catch (e) {}
    }

    async deleteSelected() {
        if (this.selectedEdgeId) {
            this.deleteEdge(this.selectedEdgeId);
            this.selectedEdgeId = null;
            return;
        }
        if (this.selectedNodeIds.length === 0) return;
        this.selectedNodeIds.forEach(id => {
            const node = this.nodeMap.get(id);
            if (!node) return;
            
            // Delete associated edges
            this.diagram.edges = this.diagram.edges.filter(e => e.source_id !== id && e.target_id !== id);
            this.diagram.nodes = this.diagram.nodes.filter(n => n.id !== id);
            
            fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes/${id}`, { method: 'DELETE' });
        });
        this.selectedNodeIds = [];
        this.saveHistory();
    }

    deleteEdge(id) {
        this.diagram.edges = this.diagram.edges.filter(e => e.id !== id);
        fetch(`/api/projects/${this.pid}/boards/${this.did}/edges/${id}`, { method: 'DELETE' });
        this.saveHistory();
    }

    async addNode(type, x, y) {
        const isT = type === 'db_table' || type === 'table' || type === 'view';
        const isAuto = isT || type === 'todo' || type === 'image' || type === 'youtube' || type === 'text';
        const defaultLabels = {
            start: 'Start', end: 'End', process: 'New Step', decision: 'Condition', io: 'I/O', 
            connector: 'Connector', annotation: 'Note', table: 'new_table', view: 'new_view', 
            enum: 'NewEnum', note: 'Note', db_table: 'new_table',
            todo: 'Checklist', image: 'New Image', link: 'Web Link', text: 'Text Label',
            youtube: 'YouTube Video'
        };
        
        let meta = {};
        if (isT) meta = { columns: [{ name: 'id', type: 'INT', pk: true, fk: false }] };
        if (type === 'todo') meta = { items: [{ text: 'New Item', done: false }] };
        if (type === 'image' || type === 'youtube') meta = { url: '' };
        
        try {
            const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
              toast.error(`Node Error: ${err.error || 'Server rejected creation'}`);
              return;
            }
            const n = await resp.json();
            this.diagram.nodes = [...this.diagram.nodes, n];
            this.selectNode(n.id);
            this.saveHistory();
            return n;
        } catch (e) {
          toast.error('Connection failed');
          console.error('addNode error', e);
        }
    }

    async addEdge(srcId, tgtId, sourcePort, targetPort) {
        const et = this.diagram.type === 'db_diagram' ? 'one_to_many' : 'default';
        const meta = { source_port: sourcePort, target_port: targetPort };
        
        if (this.diagram.type === 'db_diagram') {
          const sn = this.diagram.nodes.find(n => n.id === srcId);
          const tn = this.diagram.nodes.find(n => n.id === tgtId);
          if (sn && sourcePort.col !== undefined) meta.source_column = sn.meta?.columns?.[sourcePort.col]?.name;
          if (tn && targetPort.col !== undefined) meta.target_column = tn.meta?.columns?.[targetPort.col]?.name;
        }

        try {
            const resp = await fetch(`/api/projects/${this.pid}/boards/${this.did}/edges`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    source_id: srcId, 
                    target_id: tgtId, 
                    edge_type: et, 
                    meta 
                })
            });
            const e = await resp.json();
            this.diagram.edges = [...this.diagram.edges, e];
            this.saveHistory();
            return e;
        } catch (e) {}
    }
}

export function setEditorState(pid, did) {
    const s = new EditorState(pid, did);
    setContext(EDITOR_KEY, s);
    return s;
}

export function getEditorState() {
    return getContext(EDITOR_KEY);
}
