export const CAT = {
  process_flow: [
    { cat:'Flow Steps', col:'var(--green)', nodes:[
      {t:'start',      n:'Start',        s:'Entry point',       i:'start', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'process',    n:'Step',         s:'Process / action',  i:'process', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'decision',   n:'Decision',     s:'Branch condition',  i:'decision', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'subprocess', n:'Sub-process',  s:'Nested flow',       i:'subprocess', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'delay',      n:'Delay',        s:'Wait / timer',      i:'refresh', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'manual',     n:'Manual Step',  s:'Human action',      i:'check', c:'var(--text-mid)',b:'var(--surface)'},
    ]},
    { cat:'Data', col:'var(--teal)', nodes:[
      {t:'datastore',  n:'Data Store',   s:'Database / storage',i:'db_table', c:'var(--teal)',    b:'var(--teal-dim)'},
      {t:'document',   n:'Document',     s:'File / report',     i:'note', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'io',         n:'I / O',        s:'Input or output',   i:'refresh', c:'var(--teal)',    b:'var(--teal-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'end',        n:'End',          s:'Exit point',        i:'start', c:'var(--rose)',    b:'var(--rose-dim)'},
      {t:'annotation', n:'Note',         s:'Annotation',        i:'note', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'connector',  n:'Connector',    s:'Off-page link',     i:'chevron-right', c:'var(--text-mid)',b:'var(--surface)'},
    ]},
  ],
  flowchart: [
    { cat:'Shapes', col:'var(--blue)', nodes:[
      {t:'start',      n:'Start / End',  s:'Rounded terminal',  i:'start', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'process',    n:'Process',      s:'Rectangle step',    i:'process', c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'decision',   n:'Decision',     s:'Diamond branch',    i:'decision', c:'var(--amber)',   b:'var(--amber-dim)'},
      {t:'subprocess', n:'Sub-flow',     s:'Nested chart',      i:'subprocess', c:'var(--teal)',    b:'var(--teal-dim)'},
    ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'annotation', n:'Note',         s:'Annotation',        i:'note', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
  ],
  db_diagram: [
      { cat:'Schema', col:'var(--purple)', nodes:[
        {t:'db_table',   n:'Table',        s:'Database table',    i:'db_table', c:'var(--purple)',  b:'var(--purple-dim)'},
        {t:'enum',       n:'Enum',         s:'Enumeration',       i:'enum', c:'var(--amber)',   b:'var(--amber-dim)'},
        {t:'external_table', n:'External Ref', s:'Table from other board', i:'external_table', c:'var(--rose)', b:'var(--rose-dim)'},
      ]},
    { cat:'Utils', col:'var(--text-dim)', nodes:[
      {t:'note',       n:'Note',         s:'Schema note',       i:'note', c:'var(--amber)',   b:'var(--amber-dim)'},
    ]},
  ],
  idea_map: [
    { cat:'Ideas', col:'var(--amber)', nodes:[
      {t:'central',    n:'Central Topic', s:'Core idea',         i:'idea', c:'var(--accent)',     b:'var(--accent-dim)'},
      {t:'idea',       n:'Sub-Idea',      s:'Leaf node',         i:'idea', c:'var(--green)',   b:'var(--green-dim)'},
      {t:'todo',       n:'Checklist',     s:'Action items',      i:'check', c:'var(--blue)',    b:'var(--blue-dim)'},
    ]},
    { cat:'Media', col:'var(--purple)', nodes:[
      {t:'youtube',    n:'YouTube Video', s:'Embed video',       i:'youtube', c:'var(--red)',    b:'var(--red-dim)'},
      {t:'image',      n:'Image',         s:'Visual asset',      i:'process', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'link',       n:'Resource',      s:'Web link',          i:'chevron-right', c:'var(--teal)', b:'var(--teal-dim)'},
    ]},
    { cat:'Structure', col:'var(--text-dim)', nodes:[
      {t:'text',       n:'Floating Text', s:'Frameless label',   i:'note',  c:'var(--text-mid)',b:'transparent'},
      {t:'note',       n:'Text Block',    s:'Annotated text',    i:'note',  c:'var(--amber)', b:'var(--amber-dim)'},
    ]},
  ],
  function_flow: [
    { cat:'Code', col:'var(--purple)', nodes:[
      {t:'module',     n:'Module',        s:'File / package',    i:'subprocess', c:'var(--purple)',  b:'var(--purple-dim)'},
      {t:'process',    n:'Function',      s:'Named function',    i:'process',  c:'var(--blue)',    b:'var(--blue-dim)'},
      {t:'start',      n:'Trigger',       s:'Event / entry',     i:'start', c:'var(--green)',   b:'var(--green-dim)'},
    ]},
  ],
};

export const TYPE_LABELS = {
  process_flow:'Process Flow', flowchart:'Flowchart', db_diagram:'DB Diagram',
  idea_map:'Idea Map', function_flow:'Function Flow'
};

export const TYPE_ICONS = {
  process_flow:'process', flowchart:'decision', db_diagram:'db_table', idea_map:'idea', function_flow:'process'
};

export const EDGE_TYPES = {
  process_flow: [
    {t:'default', n:'Association'},
    {t:'success', n:'Success Path'},
    {t:'failure', n:'Failure Path'},
    {t:'conditional', n:'Conditional'},
    {t:'run_after', n:'Run After'},
    {t:'run_before', n:'Run Before'},
  ],
  flowchart: [
    {t:'default', n:'Flow'},
    {t:'success', n:'Yes / True'},
    {t:'failure', n:'No / False'},
    {t:'run_after', n:'Next Step'},
    {t:'run_before', n:'Previous Step'},
  ],
  db_diagram: [
    {t:'one_to_many', n:'One to Many'},
    {t:'one_to_one', n:'One to One'},
    {t:'many_to_many', n:'Many to Many'},
    {t:'belongs_to', n:'Belongs To'},
  ],
};

export function getCat(type) { return CAT[type]||CAT.process_flow }

export function getDef(nodeType, diagramType) {
    const cats = getCat(diagramType);
    for (const g of cats) {
        const d = g.nodes.find(x => x.t === nodeType);
        if (d) return d;
    }
    return { t: nodeType, n: nodeType, i: 'process', c: 'var(--text-dim)', b: 'var(--surface)' };
}
