import { c as ensure_array_like, s as store_get, a as attr_class, f as stringify, e as escape_html, u as unsubscribe_stores } from "./index2.js";
import { t as toast } from "./toast.svelte.js";
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
export {
  Toast as T
};
