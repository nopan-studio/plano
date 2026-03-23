import { b as ensure_array_like, e as escape_html, c as attr } from "../../../../../chunks/index.js";
import "../../../../../chunks/client.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let statusFilter = "all";
    let dateFrom = "";
    let dateTo = "";
    $$renderer2.push(`<div class="page-hd"><div><h1>Archived Tasks</h1> <div class="sub">Manage and restore archive tasks. Filter by original status or date.</div></div></div> <div class="form-card" style="margin-bottom:16px;display:flex;gap:12px;align-items:flex-end"><div class="dm-field"><label>Original Status</label> `);
    $$renderer2.select({ value: statusFilter }, ($$renderer3) => {
      $$renderer3.option({ value: "all" }, ($$renderer4) => {
        $$renderer4.push(`All statuses`);
      });
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(["todo", "in_progress", "review", "done", "bugs"]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let s = each_array[$$index];
        $$renderer3.option({ value: s }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(s)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</div> <div class="dm-field"><label>From Date</label> <input type="date"${attr("value", dateFrom)}/></div> <div class="dm-field"><label>To Date</label> <input type="date"${attr("value", dateTo)}/></div> <button class="btn btn-ghost btn-sm">Clear</button></div> <div style="background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,0.15)"><table class="tbl"><thead><tr><th>Task Name</th><th style="width:140px">Previous Status</th><th style="width:140px">Archived On</th><th style="text-align:right;width:100px">Action</th></tr></thead><tbody>`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="4" style="text-align:center;padding:40px">Loading...</td></tr>`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div>`);
  });
}
export {
  _page as default
};
