export function esc(s) {
  if (typeof document === 'undefined') return String(s ?? '');
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
}

export function md(s) {
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

export function fmtDate(s) { 
    if (!s) return '—';
    return new Date(s).toLocaleDateString(); 
}

export function timeAgo(s) {
  const d = (Date.now() - new Date(s)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  return Math.floor(d/86400) + 'd ago';
}

export function renderFilesMeta(files, pid, tid) {
  if (!files || !files.length) return '';
  const list = typeof files === 'string' ? JSON.parse(files) : files;
  if (!list.length) return '';
  const canDiff = pid && tid && tid !== -1;
  return `
    <div class="dm-section">
      <div class="dm-section-label" style="font-size:11px; color:var(--text-mid); text-transform:uppercase; margin-bottom:8px">Files Affected</div>
      <div class="file-list">
        ${list.map(f => `
          <div class="file-item-wrap" style="margin-bottom:4px">
            <div class="file-item" style="padding:8px; background:var(--surface); border:1px solid var(--border2); border-radius:var(--r); font-size:12px; display:flex; gap:8px; align-items:center">
              <span class="file-action fa-${f.action}" style="font-size:9px; padding:2px 4px; border-radius:3px; text-transform:uppercase; font-weight:700">${f.action}</span>
              <span class="file-path" style="font-family:var(--mono)">${esc(f.path)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
}
