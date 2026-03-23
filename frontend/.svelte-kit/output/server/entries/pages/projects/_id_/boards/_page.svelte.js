import "clsx";
import "../../../../../chunks/client.js";
import "../../../../../chunks/toast.svelte.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/root.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="page-hd"><div><h1>Boards</h1> <div class="sub">Visual process flows and diagrams for system architecture</div></div> <button class="btn btn-acc btn-sm" style="margin-left:auto">+ New Board</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty"><div class="icon" style="animation: spin 2s linear infinite">⚙️</div> <p>Loading boards...</p></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
