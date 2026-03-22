// ══ Catalogue ════════════════════════════════════════════════════════════════
const CAT = {
  process_flow: [
    { cat:'Flow Steps', col:'var(--green)', nodes:[
      {t:'start',      n:'Start',        s:'Entry point',       i:'▶', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'process',    n:'Step',         s:'Process / action',  i:'⬡', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'decision',   n:'Decision',     s:'Branch condition',  i:'◇', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'subprocess', n:'Sub-process',  s:'Nested flow',       i:'⧉', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'delay',      n:'Delay',        s:'Wait / timer',      i:'⏱', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'manual',     n:'Manual Step',  s:'Human action',      i:'✋', c:'var(--text-mid)',b:'var(--surface)'},
    ]},
    { cat:'Data', col:'var(--teal)', nodes:[
      {t:'datastore',  n:'Data Store',   s:'Database / storage',i:'🗄', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'document',   n:'Document',     s:'File / report',     i:'📄', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'io',         n:'I / O',        s:'Input or output',   i:'⇌', c:'var(--teal)',    b:'var(--teal-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'end',        n:'End',          s:'Exit point',        i:'⬛', c:'var(--rose)',    b:'var(--rose-dim)'},
      {t:'annotation', n:'Note',         s:'Annotation',        i:'✎', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'connector',  n:'Connector',    s:'Off-page link',     i:'◎', c:'var(--text-mid)',b:'var(--surface)'},
    ]},
  ],
  flowchart: [
    { cat:'Shapes', col:'var(--blue)', nodes:[
      {t:'start',      n:'Start / End',  s:'Rounded terminal',  i:'◯', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'process',    n:'Process',      s:'Rectangle step',    i:'▭', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'decision',   n:'Decision',     s:'Diamond branch',    i:'◇', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'predefined', n:'Predefined',   s:'Sub-routine',       i:'⊟', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'subprocess', n:'Sub-flow',     s:'Nested chart',      i:'⧉', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'io',         n:'I / O',        s:'Parallelogram',     i:'⇌', c:'var(--teal)',    b:'var(--teal-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'annotation', n:'Note',         s:'Annotation',        i:'✎', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'connector',  n:'Connector',    s:'Off-page ref',      i:'◎', c:'var(--text-mid)',b:'var(--surface)'},
    ]},
  ],
  db_diagram: [
      { cat:'Schema', col:'var(--purple)', nodes:[
        {t:'db_table',   n:'Table',        s:'Database table',    i:'⊞', c:'var(--purple)',  b:'var(--purple-dim)'},
        {t:'enum',       n:'Enum',         s:'Enumeration',       i:'≡', c:'var(--amber)',   b:'var(--amber-dim)'},
        {t:'external_table', n:'External Ref', s:'Table from other board', i:'📤', c:'var(--rose)', b:'var(--rose-dim)'},
      ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'note',       n:'Note',         s:'Schema note',       i:'✎', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
  ],
  idea_map: [
    { cat:'Ideas', col:'var(--amber)', nodes:[
      {t:'central',    n:'Central Topic', s:'Core idea',         i:'◉', c:'var(--acc)',     b:'var(--accent-dim)'},
      {t:'branch',     n:'Main Branch',   s:'Primary category',  i:'◆', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'subbranch',  n:'Sub-branch',    s:'Detail / sub-topic',i:'◇', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'idea',       n:'Idea',          s:'Leaf idea node',    i:'💡', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'resource',   n:'Resource',      s:'Link / reference',  i:'🔗', c:'var(--teal)',    b:'var(--teal-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'annotation', n:'Note',          s:'Free-text note',    i:'✎', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
  ],
  function_flow: [
    { cat:'Code', col:'var(--purple)', nodes:[
      {t:'module',     n:'Module',        s:'File / package',    i:'📦', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'process',    n:'Function',      s:'Named function',    i:'ƒ',  c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'method',     n:'Method',        s:'Class method',      i:'⊕', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'start',      n:'Trigger',       s:'Event / entry',     i:'▶', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'end',        n:'Return',        s:'Return / exit',     i:'↩', c:'var(--rose)',    b:'var(--rose-dim)'},
    ]},
    { cat:'Data', col:'var(--teal)', nodes:[
      {t:'io',         n:'Input Param',   s:'Function argument', i:'→', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'datastore',  n:'Output',        s:'Return value',      i:'←', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'decision',   n:'Side Effect',   s:'Mutation / I/O',    i:'⚡', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'annotation', n:'Note',          s:'Code comment',      i:'✎', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
  ],
};
const TYPE_LABELS = {
  process_flow:'Process Flow', flowchart:'Flowchart', db_diagram:'DB Diagram',
  idea_map:'Idea Map', function_flow:'Function Flow'
};
const TYPE_ICONS = {
  process_flow:'⬡', flowchart:'◇', db_diagram:'⊞', idea_map:'◉', function_flow:'ƒ'
};
function getCat() { return CAT[S.cur?.type]||CAT.process_flow }
function getDef(type) { for(const g of getCat()) { const d=g.nodes.find(x=>x.t===type); if(d) return d } return {t:type,n:type,i:'◈',c:'var(--text-dim)',b:'var(--surface)'} }

// ══ State ════════════════════════════════════════════════════════════════════
window.S = { diagrams:[], cur:null, selN:null, selE:null, scale:1, ox:0, oy:0, drag:null, conn:null, pan:false, panO:null };
