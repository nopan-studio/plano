import { a as attr_class, e as escape_html, c as ensure_array_like, g as attr_style, f as stringify, b as attr, d as derived } from "../../../../chunks/index2.js";
import { m as md } from "../../../../chunks/utils2.js";
import "socket.io-client";
import { h as html } from "../../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let ideas = [];
    let milestones = [];
    let projects = [];
    let newIdea = {
      title: "",
      description: "",
      project_id: null
    };
    let filteredIdeas = derived(() => ideas.filter((i) => ["new", "exploring", "accepted"].includes(i.status) || !["implemented", "rejected"].includes(i.status)));
    $$renderer2.push(`<div class="page-hd"><div><h1>All Ideas</h1> <div class="sub">Store and vote on potential workspace features and future plans</div></div> <button class="btn btn-acc btn-sm" style="margin-left:auto">+ New Idea</button></div> <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; margin-top:24px; margin-bottom:16px"><div style="display:flex; gap:12px; font-size:12px"><button${attr_class(`btn btn-out btn-xs ${stringify("act")}`)}>Active Ideas <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => !["implemented", "rejected"].includes(i.status)).length)})</span></button> <button${attr_class(`btn btn-out btn-xs ${stringify("")}`)}>Implemented <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => i.status === "implemented").length)})</span></button> <button${attr_class(`btn btn-out btn-xs ${stringify("")}`)}>Graveyard <span style="opacity:0.6; margin-left:4px">(${escape_html(ideas.filter((i) => i.status === "rejected").length)})</span></button></div> <div style="display:flex; gap:6px; font-size:11px; align-items:center"><span style="color:var(--mid); font-weight:600; text-transform:uppercase; letter-spacing:0.05em">Filter:</span> <button${attr_class(`btn btn-ghost btn-xs ${stringify("act")}`)} style="padding:2px 8px; border-radius:4px">All</button> <button${attr_class(`btn btn-ghost btn-xs ${stringify("")}`)} style="padding:2px 8px; border-radius:4px">Global</button></div></div> <div class="prose-wrap"><div class="idea-post-list"><!--[-->`);
    const each_array = ensure_array_like(filteredIdeas());
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let i = each_array[$$index_1];
      $$renderer2.push(`<div class="idea-post"${attr_style(`view-transition-name: idea-post-${stringify(i.id)}`)}><div class="idea-post-header"><div class="idea-post-title">${escape_html(i.title)}</div> <div style="display:flex; gap:6px; align-items:center">`);
      if (i.project_id) {
        $$renderer2.push("<!--[0-->");
        const p = projects.find((pr) => pr.id === i.project_id);
        if (p) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span style="font-size:10px; padding:1px 6px; background:var(--surf2); border-radius:10px; color:var(--mid)">${escape_html(p.name)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <span${attr_class(`badge s-${stringify(i.status)}`)}>${escape_html(i.status)}</span> `);
      if (i.milestone_id) {
        $$renderer2.push("<!--[0-->");
        const m = milestones.find((ms) => ms.id === i.milestone_id);
        if (m) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span style="font-size:10px; opacity:0.6; display:flex; align-items:center; gap:3px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg> ${escape_html(m.name)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
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
    if (filteredIdeas().length === 0 && false) ;
    else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> `);
    if (showNewModal) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="detail-overlay"><div class="detail-modal"><div class="dm-header"><div class="dm-header-icon">💡</div> <div class="dm-header-body"><h2>New Idea</h2> <div class="dm-meta">Share your thoughts for the project</div></div> <button class="dm-close">✕</button></div> <div class="dm-body"><div class="dm-section"><label class="dm-section-label">Title</label> <input type="text"${attr("value", newIdea.title)} placeholder="Idea title"/></div> <div class="dm-section"><label class="dm-section-label">Description</label> <textarea placeholder="Describe your idea..." style="min-height:120px">`);
      const $$body = escape_html(newIdea.description);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div> <div class="dm-field-row"><div class="dm-field"><label>Project</label> `);
      $$renderer2.select({ value: newIdea.project_id, class: "full" }, ($$renderer3) => {
        $$renderer3.option({ value: null }, ($$renderer4) => {
          $$renderer4.push(`Global (No Project)`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(projects);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let p = each_array_2[$$index_2];
          $$renderer3.option({ value: p.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(p.name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="dm-footer"><button class="btn btn-out btn-sm">Cancel</button> <button class="btn btn-acc btn-sm">Submit Idea</button></div></div></div>`);
    } else {
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
