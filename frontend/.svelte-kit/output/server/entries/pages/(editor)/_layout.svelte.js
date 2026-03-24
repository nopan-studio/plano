import { h as head } from "../../../chunks/index2.js";
import "socket.io-client";
import { T as Toast } from "../../../chunks/Toast.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    head("fy7yra", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Plano Editor</title>`);
      });
      $$renderer3.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&amp;family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&amp;display=swap" rel="stylesheet"/>`);
    });
    children($$renderer2);
    $$renderer2.push(`<!----> `);
    Toast($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
export {
  _layout as default
};
