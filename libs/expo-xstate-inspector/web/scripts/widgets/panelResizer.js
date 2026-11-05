import { MIN_PANE_WIDTH } from "../constants/limits.js";

/** Lets `handle` be dragged to resize the panel on its right. */
export const bindPanelResizer = handle => {
  handle.onpointerdown = event => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("dragging");
  };
  handle.onpointermove = event => {
    if (!handle.hasPointerCapture(event.pointerId)) {
      return;
    }
    const width = Math.min(
      Math.max(
        innerWidth - event.clientX - handle.offsetWidth / 2,
        MIN_PANE_WIDTH
      ),
      innerWidth - MIN_PANE_WIDTH
    );
    document.body.style.setProperty("--panel-width", `${width}px`);
  };
  handle.onlostpointercapture = () => handle.classList.remove("dragging");
};
