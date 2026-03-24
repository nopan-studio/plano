import "clsx";
import "../../../../../../chunks/client.js";
import "socket.io-client";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let filter = "all";
    $$renderer2.push(`<div class="page-hd"><div><h1>Updates</h1> <div class="sub">workspace progress and important team decisions</div></div> <div style="margin-left:auto; display:flex; gap:8px; align-items:center">`);
    $$renderer2.select(
      {
        class: "btn btn-out btn-sm",
        value: filter,
        style: "width:auto; padding:4px 8px"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`All Types`);
        });
        $$renderer3.option({ value: "progress" }, ($$renderer4) => {
          $$renderer4.push(`Progress`);
        });
        $$renderer3.option({ value: "bug_fix" }, ($$renderer4) => {
          $$renderer4.push(`Bug Fixes`);
        });
        $$renderer3.option({ value: "blocker" }, ($$renderer4) => {
          $$renderer4.push(`Blockers`);
        });
        $$renderer3.option({ value: "decision" }, ($$renderer4) => {
          $$renderer4.push(`Decisions`);
        });
        $$renderer3.option({ value: "note" }, ($$renderer4) => {
          $$renderer4.push(`Notes`);
        });
      }
    );
    $$renderer2.push(` <button class="btn btn-acc btn-sm">+ Update</button></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="prose-wrap"><div id="updates-feed">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="empty">Loading updates...</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
