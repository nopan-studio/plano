import { a as attr_class, e as escape_html, b as ensure_array_like, c as attr, d as derived, s as store_get, f as stringify, u as unsubscribe_stores, h as head } from "../../chunks/index.js";
import { p as page } from "../../chunks/index2.js";
import { h as html } from "../../chunks/html.js";
import { t as toast } from "../../chunks/toast.svelte.js";
function Sidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let showDropdown = false;
    let activePid = derived(() => {
      const id = page.params.id;
      return id ? parseInt(id) : null;
    });
    let activeProject = derived(() => projects.find((p) => p.id === activePid()));
    let currentPath = derived(() => page.url.pathname);
    const sidebarIcons = {
      Overview: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h18v18H3zM3 9h18M9 21V9"/></svg>`,
      Tasks: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
      Milestones: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
      Boards: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
      Updates: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      Ideas: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
      Archive: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
      "Project Logs": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`
    };
    const tabs = [
      "Overview",
      "Tasks",
      "Milestones",
      "Boards",
      "Updates",
      "Ideas",
      "Archive",
      "Project Logs"
    ];
    $$renderer2.push(`<nav class="sidebar" id="sidebar"><a href="/" id="sn-home"${attr_class("nav-item", void 0, { "act": currentPath() === "/" })}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Dashboard</a> <a href="/ideas" id="sn-ideas"${attr_class("nav-item", void 0, { "act": currentPath() === "/ideas" })}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg> Ideas</a> <div class="sidebar-hd" style="margin-top:16px">Workspaces <button class="add-workspace-btn" title="Add Project">+</button></div> <div${attr_class("workspaces-dropdown", void 0, { "show": showDropdown })}><div class="dropdown-trigger"><span id="active-workspace-name">${escape_html(activeProject() ? activeProject().name : "Select Workspace")}</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (activePid()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div id="sidebar-subnav" class="sidebar-subnav" style="display:block"><div class="sidebar-hd">Navigation</div> <!--[-->`);
      const each_array_1 = ensure_array_like(tabs);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let t = each_array_1[$$index_1];
        const slug = t.toLowerCase().replace(" ", "-");
        const href = slug === "overview" ? `/projects/${activePid()}` : `/projects/${activePid()}/${slug}`;
        $$renderer2.push(`<a${attr("href", href)}${attr_class("subnav-item", void 0, { "act": currentPath() === href })}>${html(sidebarIcons[t])} ${escape_html(t)}</a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="sidebar-footer"><a href="https://github.com/nopan-studio/plano" target="_blank" class="github-card"><span class="github-logo"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg></span> <span class="gh-label">Contribute</span></a></div></nav>`);
  });
}
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let breadcrumbs = derived(() => {
      const path = page.url.pathname;
      const parts = path.split("/").filter(Boolean);
      const crumbs = [{ label: "Overview", href: "/" }];
      if (parts[0] === "projects" && parts[1]) {
        const p = projects.find((x) => x.id == parts[1]);
        crumbs.push({
          label: p ? p.name : `Project ${parts[1]}`,
          href: `/projects/${parts[1]}`
        });
        if (parts[2]) {
          const label = parts[2].charAt(0).toUpperCase() + parts[2].slice(1).replace("-", " ");
          crumbs.push({ label });
        }
      } else if (parts[0] === "ideas") {
        crumbs.push({ label: "Ideas" });
      }
      return crumbs;
    });
    $$renderer2.push(`<div class="topbar"><div class="logo-wrap" style="display:flex; align-items:center;"><a href="/" style="text-decoration:none; color:inherit"><div class="logo"><img src="/static/logo.png" style="height:24px; vertical-align:middle; margin-right:8px;" alt="Plano"/> Plano</div></a> <div class="breadcrumb" id="breadcrumb" style="margin-left:14px; display:flex; align-items:center; gap:6px;"><!--[-->`);
    const each_array = ensure_array_like(breadcrumbs());
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let c = each_array[i];
      if (i > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="sep" style="color:var(--text-dim); font-size:12px; margin:0 4px;">›</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (i === breadcrumbs().length - 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span style="color:var(--accent); font-size:13px; font-weight:700; text-shadow: 0 0 10px var(--accent-glow);">${escape_html(c.label)}</span>`);
      } else if (c.href) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<a${attr("href", c.href)} style="text-decoration:none; color:var(--text-mid); font-size:13px; font-weight:500;">${escape_html(c.label)}</a>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<span style="color:var(--text-mid); font-size:13px; font-weight:500;">${escape_html(c.label)}</span>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="top-nav"></div></div>`);
  });
}
function Toast($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div id="toast-container" class="svelte-1cpok13"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$toast", toast));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let t = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`toast ${stringify(t.type)} show`, "svelte-1cpok13")} role="button" tabindex="0">${escape_html(t.message)}</div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    head("12qhfyh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Plano</title>`);
      });
      $$renderer3.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&amp;family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&amp;display=swap" rel="stylesheet"/>`);
    });
    $$renderer2.push(`<div class="shell">`);
    Header($$renderer2);
    $$renderer2.push(`<!----> <div class="body">`);
    Sidebar($$renderer2);
    $$renderer2.push(`<!----> <main class="main">`);
    children($$renderer2);
    $$renderer2.push(`<!----> `);
    Toast($$renderer2);
    $$renderer2.push(`<!----></main></div></div>`);
  });
}
export {
  _layout as default
};
