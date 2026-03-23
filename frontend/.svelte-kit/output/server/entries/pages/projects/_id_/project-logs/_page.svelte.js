import { e as escape_html } from "../../../../../chunks/index.js";
import "clsx";
import "../../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let totalLogs = 0;
    $$renderer2.push(`<div class="page-hd"><div><h1>Project Logs</h1> <div class="sub">A chronological audit trail of all manual and AI modifications</div></div> <span style="font-size:12px;color:var(--text-mid);margin-left:auto;font-family:var(--mono)">${escape_html(totalLogs)} entries</span></div> <div class="prose-wrap">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty">Reading audit logs...</div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
