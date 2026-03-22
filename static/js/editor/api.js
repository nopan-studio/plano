// ══ API ══════════════════════════════════════════════════════════════════════
const api = {
  g:p=>fetch(p).then(r=>r.json()),
  p:(p,b)=>fetch(p,{method:'POST', headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()),
  u:(p,b)=>fetch(p,{method:'PUT',  headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()),
  h:(p,b)=>fetch(p,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()),
  d:p=>fetch(p,{method:'DELETE'}).then(r=>r.json()),
};

// ══ Utils ════════════════════════════════════════════════════════════════════
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
let _tt;
function toast(msg,k=''){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg;
  el.className='show'+(k?' '+k:'');
  clearTimeout(_tt);
  _tt=setTimeout(()=>{el.className=''},2400)
}
