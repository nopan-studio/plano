import { a as attr_class, e as escape_html, f as stringify } from "../../../../../../chunks/index2.js";
import "../../../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let ideas = [];
    $$renderer2.push(`<div class="page-hd"><div><h1>Ideas</h1> <div class="sub">Store and vote on potential workspace features and future plans</div></div> <button class="btn btn-acc btn-sm" style="margin-left:auto">+ New Idea</button></div> <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; margin-top:24px; margin-bottom:16px"><div style="display:flex; gap:12px; font-size:12px"><button${attr_class(`btn btn-out btn-xs ${stringify("act")}`)}>Active Ideas <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => !["implemented", "rejected"].includes(i.status)).length)})</span></button> <button${attr_class(`btn btn-out btn-xs ${stringify("")}`)}>Implemented <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => i.status === "implemented").length)})</span></button> <button${attr_class(`btn btn-out btn-xs ${stringify("")}`)}>Graveyard <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => i.status === "rejected").length)})</span></button></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="prose-wrap">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty">Loading ideas...</div>`);
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
