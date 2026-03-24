import "clsx";
import { w as writable } from "./index.js";
function createToast() {
  const { subscribe, update } = writable([]);
  function send(message, type = "ok", duration = 3e3) {
    const id = Math.random().toString(36).substring(2);
    update((state) => [...state, { id, message, type }]);
    setTimeout(
      () => {
        remove(id);
      },
      duration
    );
  }
  function remove(id) {
    update((state) => state.filter((t) => t.id !== id));
  }
  return {
    subscribe,
    ok: (msg) => send(msg, "ok"),
    err: (msg) => send(msg, "err"),
    remove
  };
}
const toast = createToast();
export {
  toast as t
};
