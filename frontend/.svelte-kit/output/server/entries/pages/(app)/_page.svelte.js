import { e as escape_html, d as derived } from "../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let totalTasks = derived(() => projects.reduce((s, p) => s + (p.task_count || 0), 0));
    let totalActive = derived(() => projects.filter((p) => p.status === "active").length);
    let totalDone = derived(() => projects.filter((p) => p.status === "completed").length);
    $$renderer2.push(`<div class="page-hd"><div><h1>Dashboard</h1> <div class="sub">Comprehensive view of all active workspaces and team velocity</div></div> <button class="btn btn-acc btn-sm" style="margin-left:auto"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><path d="M12 5v14M5 12h14"></path></svg> New Project</button></div> <div class="stat-row"><div class="stat"><div style="color:var(--text-mid);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path></svg></div> <div class="stat-v">${escape_html(projects.length)}</div> <div class="stat-l">Workspaces</div></div> <div class="stat"><div style="color:var(--blue);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div> <div class="stat-v" style="color:var(--blue); text-shadow:0 0 15px var(--blue-dim)">${escape_html(totalActive())}</div> <div class="stat-l">Active</div></div> <div class="stat"><div style="color:var(--green);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div> <div class="stat-v" style="color:var(--green); text-shadow:0 0 15px var(--green-dim)">${escape_html(totalDone())}</div> <div class="stat-l">Completed</div></div> <div class="stat"><div style="color:var(--accent);margin-bottom:8px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></div> <div class="stat-v">${escape_html(totalTasks())}</div> <div class="stat-l">Total Tasks</div></div></div> <div class="cards" id="project-cards" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty" style="grid-column: 1/-1;">Loading projects...</div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
