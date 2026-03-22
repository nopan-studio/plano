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

function md(s) {
  if (!s) return '';
  // Pre-escape HTML but preserve newlines
  let res = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1. Block code ```...```
  res = res.replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="md-code-block"><code>${code.trim()}</code></pre>`);

  // 2. Inline formats
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
           .replace(/\*(.*?)\*/g, '<em>$1</em>')
           .replace(/~~(.*?)~~/g, '<del>$1</del>')
           .replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // 3. Links and Hashtags
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>')
           .replace(/(^|\s)#(\w+)/g, '$1<span class="md-tag">#$2</span>');

  // 4. Symbols
  res = res.replace(/\[x\]/gi, '✅').replace(/\[ \]/g, '⬜')
           .replace(/\(!\)/g, '⚠️').replace(/\(\?\)/g, '❓')
           .replace(/\(\*\)/g, '⭐').replace(/\(i\)/g, 'ℹ️');

  // 5. Line processing
  const lines = res.split(/\r?\n/);
  const processed = [];
  for (let original of lines) {
    let line = original.trim();
    if (!line) {
      processed.push('<div style="height:8px"></div>');
      continue;
    }
    if (line === '---') { processed.push('<hr class="md-hr">'); continue; }

    // Headers
    if (line.startsWith('# ')) { processed.push(`<h3 class="md-h1">${line.substring(2)}</h3>`); }
    else if (line.startsWith('## ')) { processed.push(`<h4 class="md-h2">${line.substring(3)}</h4>`); }
    else if (line.startsWith('### ')) { processed.push(`<h5 class="md-h3">${line.substring(4)}</h5>`); }
    else if (line.startsWith('> ')) { processed.push(`<blockquote class="md-quote">${line.substring(2)}</blockquote>`); }
    // Lists (Bullet and Numbered)
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      processed.push(`<div class="md-li"><span>•</span><div>${original.substring(original.indexOf(line[0])+2)}</div></div>`);
    } else {
      const numMatch = line.match(/^(\d+)\.\s+/);
      if (numMatch) {
         processed.push(`<div class="md-li"><span>${numMatch[1]}.</span><div>${original.substring(original.indexOf(numMatch[1]) + numMatch[1].length + 2)}</div></div>`);
      } else { processed.push(`<div class="md-p">${original}</div>`); }
    }
  }
  return processed.join('');
}

let _tt;
function toast(msg,k=''){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg;
  el.className='show'+(k?' '+k:'');
  clearTimeout(_tt);
  _tt=setTimeout(()=>{el.className=''},2400)
}
