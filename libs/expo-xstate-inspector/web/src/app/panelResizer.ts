const MIN_PANE_WIDTH = 200;
const MIN_DIAGRAM_WIDTH = 240;
const KEYBOARD_STEP = 10;

export const bindPanelResizer = (
  handle: HTMLElement,
  side: "left" | "right"
) => {
  const panel =
    side === "left" ? handle.previousElementSibling : handle.nextElementSibling;
  const diagram = handle.ownerDocument.getElementById("diagram");
  if (panel === null || diagram === null) {
    return;
  }
  const property = side === "left" ? "--sidebar-width" : "--panel-width";
  const opposite = handle.ownerDocument.getElementById(
    side === "left" ? "panel" : "machine-list"
  );
  const oppositeProperty =
    side === "left" ? "--panel-width" : "--sidebar-width";
  const direction = side === "left" ? 1 : -1;
  const drag = { startX: 0, startWidth: 0 };
  const measure = () => {
    const width = panel.getBoundingClientRect().width;
    return {
      width,
      max: Math.max(
        MIN_PANE_WIDTH,
        width + diagram.getBoundingClientRect().width - MIN_DIAGRAM_WIDTH
      )
    };
  };
  const updateAccessibility = () => {
    const { width, max } = measure();
    handle.setAttribute("aria-valuemin", String(MIN_PANE_WIDTH));
    handle.setAttribute("aria-valuemax", String(Math.round(max)));
    handle.setAttribute("aria-valuenow", String(Math.round(width)));
    handle.setAttribute("aria-valuetext", `${Math.round(width)} pixels`);
  };
  const resize = (width: number) => {
    const { max } = measure();
    const next = Math.min(Math.max(width, MIN_PANE_WIDTH), max);
    // Keep a viewport-clamped pane from growing when the other pane shrinks.
    if (
      opposite !== null &&
      diagram.getBoundingClientRect().width <= MIN_DIAGRAM_WIDTH
    ) {
      handle.ownerDocument.body.style.setProperty(
        oppositeProperty,
        `${opposite.getBoundingClientRect().width}px`
      );
    }
    handle.ownerDocument.body.style.setProperty(property, `${next}px`);
    updateAccessibility();
  };

  const observer = new ResizeObserver(updateAccessibility);
  observer.observe(panel);
  observer.observe(diagram);
  updateAccessibility();

  handle.onpointerdown = event => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    drag.startX = event.clientX;
    drag.startWidth = measure().width;
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("dragging");
  };
  handle.onpointermove = event => {
    if (!handle.hasPointerCapture(event.pointerId)) {
      return;
    }
    resize(drag.startWidth + (event.clientX - drag.startX) * direction);
  };
  handle.onkeydown = event => {
    const delta =
      event.key === "ArrowRight"
        ? KEYBOARD_STEP
        : event.key === "ArrowLeft"
          ? -KEYBOARD_STEP
          : 0;
    if (delta !== 0) {
      event.preventDefault();
      resize(measure().width + delta * direction);
    }
  };
  handle.onlostpointercapture = () => handle.classList.remove("dragging");

  return () => {
    observer.disconnect();
    handle.onpointerdown = null;
    handle.onpointermove = null;
    handle.onkeydown = null;
    handle.onlostpointercapture = null;
  };
};
