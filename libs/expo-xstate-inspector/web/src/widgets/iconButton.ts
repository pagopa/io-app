import type { IconSvgObject } from "@hugeicons/core-free-icons/types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const ICON_VIEW_BOX = "0 0 24 24";
const ICON_STROKE_WIDTH = "2";

export const setButtonIcon = (
  button: HTMLButtonElement,
  icon: IconSvgObject,
  label: string,
  tooltip = label
) => {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.setAttribute("viewBox", ICON_VIEW_BOX);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke-width", ICON_STROKE_WIDTH);
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.append(
    ...icon.map(([tag, attributes]) => {
      const element = document.createElementNS(SVG_NAMESPACE, tag);
      Object.entries(attributes).forEach(([name, value]) => {
        if (name !== "key" && name !== "strokeWidth") {
          element.setAttribute(
            name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`),
            String(value)
          );
        }
      });
      return element;
    })
  );
  button.type = "button";
  button.classList.add("icon-button");
  button.ariaLabel = label;
  button.title = tooltip;
  button.replaceChildren(svg);
  return button;
};
