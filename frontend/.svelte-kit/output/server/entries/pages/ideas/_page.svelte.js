import { a as attr_class, b as ensure_array_like, g as attr_style, f as stringify, e as escape_html } from "../../../chunks/index.js";
import { m as md } from "../../../chunks/utils2.js";
import { h as html } from "../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let ideas = [];
    $$renderer2.push(`<div class="page-hd"><div><h1>All Ideas</h1> <div class="sub">Store and vote on potential workspace features and future plans</div></div> <button class="btn btn-acc btn-sm" style="margin-left:auto">+ New Idea</button></div> <div style="display:flex; gap:12px; margin-bottom:16px; font-size:12px"><button${attr_class(`btn btn-out btn-xs ${stringify("act")}`)}>All Ideas</button> <button${attr_class(`btn btn-out btn-xs ${stringify("")}`)}>Global Only</button></div> <div class="prose-wrap"><div class="idea-post-list"><!--[-->`);
    const each_array = ensure_array_like(ideas);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let i = each_array[$$index_1];
      $$renderer2.push(`<div class="idea-post"${attr_style(`view-transition-name: idea-post-${stringify(i.id)}`)}><div class="idea-post-header"><div class="idea-post-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;color:var(--amber)"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg> ${escape_html(i.title)}</div> <span${attr_class(`badge s-${stringify(i.status)}`)}>${escape_html(i.status)}</span></div> `);
      if (i.description) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="idea-post-desc">${html(md(i.description))}</div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="idea-post-footer"><button class="vote-btn">▲ ${escape_html(i.votes)} votes</button> `);
      if (i.tags) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(i.tags);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let t = each_array_1[$$index];
          $$renderer2.push(`<span class="chip" style="background:var(--surf2);color:var(--mid)">${escape_html(t)}</span>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (ideas.length === 0 && false) ;
    else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
