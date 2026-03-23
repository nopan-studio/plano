import { a as attr_class, g as attr_style, f as stringify, c as attr, e as escape_html, d as derived, b as ensure_array_like } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/index2.js";
import { m as md, f as fmtDate } from "../../../../../chunks/utils2.js";
import { h as html } from "../../../../../chunks/html.js";
function KanbanCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      task,
      milestones = [],
      isDragging = false
    } = $$props;
    const pColor = derived(() => ({
      low: "var(--text-dim)",
      medium: "var(--blue)",
      high: "var(--amber)",
      critical: "var(--rose)"
    })[task.priority] || "var(--text-dim)");
    $$renderer2.push(`<div${attr_class("k-card svelte-7v0i77", void 0, { "ai-active": task.is_ai_working, "dragging": isDragging })} draggable="true" role="button" tabindex="0"${attr_style(`view-transition-name: task-card-${stringify(task.id)}`)}${attr("data-task-id", task.id)}${attr("data-status", task.status)}>`);
    if (task.is_ai_working) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<svg class="ai-border-svg svelte-7v0i77" preserveAspectRatio="none"><rect x="0" y="0" width="100%" height="100%" rx="var(--r)" ry="var(--r)" class="svelte-7v0i77"></rect></svg>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="k-card-id svelte-7v0i77">#${escape_html(task.id)}</div> `);
    if (task.is_ai_working) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="ai-badge svelte-7v0i77"><div class="bot-icon svelte-7v0i77"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="svelte-7v0i77"><rect x="3" y="11" width="18" height="10" rx="2" class="svelte-7v0i77"></rect><circle cx="12" cy="5" r="2" class="svelte-7v0i77"></circle><path d="M12 7v4M8 11V9a4 4 0 1 1 8 0v2M9 15h.01M15 15h.01" class="svelte-7v0i77"></path></svg></div> AI Working</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="k-card-title svelte-7v0i77">${escape_html(task.title)}</div> `);
    if (task.description) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="k-card-sub svelte-7v0i77">${html(md(task.description.substring(0, 100)))}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="k-card-chips svelte-7v0i77"><span class="chip svelte-7v0i77"${attr_style(`color:${stringify(pColor())}; background:var(--surface2)`)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-7v0i77"><circle cx="12" cy="12" r="10" class="svelte-7v0i77"></circle><polyline points="12 6 12 12 16 14" class="svelte-7v0i77"></polyline></svg> ${escape_html(task.priority)}</span> `);
    if (task.assignee) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="chip chip-assignee svelte-7v0i77"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-7v0i77"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" class="svelte-7v0i77"></path><circle cx="12" cy="7" r="4" class="svelte-7v0i77"></circle></svg> ${escape_html(task.assignee)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (task.due_date) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="chip chip-due svelte-7v0i77"${attr_style(`color: ${stringify(new Date(task.due_date) < /* @__PURE__ */ new Date() ? "var(--rose)" : "var(--text-mid)")}`)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-7v0i77"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" class="svelte-7v0i77"></rect><line x1="16" x2="16" y1="2" y2="6" class="svelte-7v0i77"></line><line x1="8" x2="8" y1="2" y2="6" class="svelte-7v0i77"></line><line x1="3" x2="21" y1="10" y2="10" class="svelte-7v0i77"></line></svg> ${escape_html(fmtDate(task.due_date))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (task.milestone_id && task.milestone_id != -1) {
      $$renderer2.push("<!--[0-->");
      const msObj = milestones?.find((m) => String(m.id) === String(task.milestone_id));
      $$renderer2.push(`<span class="chip chip-ms svelte-7v0i77"${attr("title", `Milestone ID: ${stringify(task.milestone_id)}`)}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="svelte-7v0i77"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" class="svelte-7v0i77"></path><line x1="4" x2="4" y1="22" y2="15" class="svelte-7v0i77"></line></svg> ${escape_html(msObj ? msObj.name : `Milestone #${task.milestone_id}`)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function KanbanColumn($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      col,
      tasks = [],
      milestones = [],
      dropIndex = -1,
      dropStatus = null,
      draggingTaskId = null,
      draggingTaskHeight = 0
    } = $$props;
    const augmentedTasks = derived(() => {
      if (dropStatus !== col.id) return tasks;
      const res = [...tasks];
      const idx = Math.min(dropIndex, res.length);
      res.splice(idx, 0, { id: "drop-placeholder", isPlaceholder: true });
      return res;
    });
    $$renderer2.push(`<div${attr_class(`kanban-col col-${stringify(col.id === "in_progress" ? "progress" : col.id)}`, "svelte-mykq0n")}><div class="kanban-col-hd svelte-mykq0n"><h3 class="svelte-mykq0n"><span class="status-circle svelte-mykq0n"></span> ${escape_html(col.label)} <span class="cnt svelte-mykq0n">${escape_html(tasks.length)}</span></h3> <div class="kanban-col-hd-right svelte-mykq0n">`);
    if (col.id === "done" && tasks.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="btn btn-ghost btn-xs archive-all-btn" title="Archive all Done tasks">Archive All</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button class="add-task-col-btn svelte-mykq0n"${attr("title", `Add task to ${stringify(col.label)}`)}>+</button></div></div> <div class="kanban-col-sub svelte-mykq0n">${escape_html(col.sub)}</div> <div class="kanban-col-body svelte-mykq0n"${attr("data-status", col.id)} role="region"${attr("aria-label", `Tasks column for ${stringify(col.label)}`)}>`);
    const each_array = ensure_array_like(augmentedTasks());
    if (each_array.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let task = each_array[$$index];
        $$renderer2.push(`<div>`);
        if (task.isPlaceholder) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="drop-placeholder svelte-mykq0n"${attr_style(`height: ${stringify(draggingTaskHeight)}px`)}></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          KanbanCard($$renderer2, {
            task,
            milestones,
            isDragging: task.id === draggingTaskId
          });
        }
        $$renderer2.push(`<!--]--></div>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="empty-col svelte-mykq0n">No ${escape_html(col.id === "bugs" ? "bugs recorded" : "tasks")}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const pid = derived(() => page.params.id);
    let project = {};
    let tasks = [];
    let milestones = [];
    const columns = [
      { id: "todo", label: "To Do", sub: "Tasks ready to be started" },
      {
        id: "in_progress",
        label: "In Progress",
        sub: "Work currently being tackled"
      },
      { id: "bugs", label: "Bugs", sub: "Issues needing attention" },
      { id: "review", label: "Review", sub: "Pending peer approval" },
      { id: "done", label: "Done", sub: "Completed successfully" }
    ];
    function getKanbanOrder() {
      try {
        return JSON.parse(localStorage.getItem(`fmc_kanban_order_${pid()}`)) || {};
      } catch {
        return {};
      }
    }
    function sortByOrder(arr, status) {
      const order = getKanbanOrder()[status] || [];
      if (!order.length) return arr;
      return arr.slice().sort((a, b) => {
        const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    function getTasksByStatus(status) {
      return sortByOrder(tasks.filter((t) => t.status === status), status);
    }
    let draggingTaskId = null;
    let draggingTaskHeight = 0;
    let dropIndex = -1;
    let dropStatus = null;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="page-hd"><div><h1>Tasks</h1> <div class="sub">Track progress and manage team workflows through columns · ${escape_html(project.name)}</div></div></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <div class="kanban svelte-1semk1y" role="main"><!--[-->`);
      const each_array_3 = ensure_array_like(columns);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let col = each_array_3[$$index_3];
        KanbanColumn($$renderer3, {
          col,
          tasks: getTasksByStatus(col.id),
          milestones,
          dropIndex,
          dropStatus,
          draggingTaskId,
          draggingTaskHeight
        });
      }
      $$renderer3.push(`<!--]--></div> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
