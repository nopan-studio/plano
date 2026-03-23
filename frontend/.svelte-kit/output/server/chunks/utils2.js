function md(s) {
  if (!s) return "";
  let res = String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  res = res.replace(/```([\s\S]*?)```/g, (match, code) => `<pre class="md-code-block"><code>${code.trim()}</code></pre>`);
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/~~(.*?)~~/g, "<del>$1</del>").replace(/`([^`\n]+)`/g, "<code>$1</code>");
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="md-link">$1</a>').replace(/(^|\s)#(\w+)/g, '$1<span class="md-tag">#$2</span>');
  res = res.replace(/\[x\]/gi, "✅").replace(/\[ \]/g, "⬜").replace(/\(!\)/g, "⚠️").replace(/\(\?\)/g, "❓").replace(/\(\*\)/g, "⭐").replace(/\(i\)/g, "ℹ️");
  const lines = res.split(/\r?\n/);
  const processed = [];
  for (let original of lines) {
    let line = original.trim();
    if (!line) {
      processed.push('<div style="height:8px"></div>');
      continue;
    }
    if (line === "---") {
      processed.push('<hr class="md-hr">');
      continue;
    }
    if (line.startsWith("# ")) {
      processed.push(`<h3 class="md-h1">${line.substring(2)}</h3>`);
    } else if (line.startsWith("## ")) {
      processed.push(`<h4 class="md-h2">${line.substring(3)}</h4>`);
    } else if (line.startsWith("### ")) {
      processed.push(`<h5 class="md-h3">${line.substring(4)}</h5>`);
    } else if (line.startsWith("> ")) {
      processed.push(`<blockquote class="md-quote">${line.substring(2)}</blockquote>`);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      processed.push(`<div class="md-li"><span>•</span><div>${original.substring(original.indexOf(line[0]) + 2)}</div></div>`);
    } else {
      const numMatch = line.match(/^(\d+)\.\s+/);
      if (numMatch) {
        processed.push(`<div class="md-li"><span>${numMatch[1]}.</span><div>${original.substring(original.indexOf(numMatch[1]) + numMatch[1].length + 2)}</div></div>`);
      } else {
        processed.push(`<div class="md-p">${original}</div>`);
      }
    }
  }
  return processed.join("");
}
function fmtDate(s) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString();
}
export {
  fmtDate as f,
  md as m
};
