import type { StateNodeConfig } from "../types/inspector.js";

import { describeState } from "../builders/stateDetails.js";
import { createSpan } from "../utils/dom.js";

const createSection = (title: string, rows: Array<string>) => {
  const section = document.createElement("section");
  const heading = document.createElement("h4");
  heading.textContent = title;
  const list = document.createElement("ul");
  list.append(
    ...rows.map(row => {
      const item = document.createElement("li");
      item.textContent = row;
      return item;
    })
  );
  section.append(heading, list);
  return section;
};

/** Shows what the clicked state does: its actions, actors and transitions. */
export const createStateDetailsView = (
  container: HTMLElement,
  onClose: () => void
) => {
  const header = document.createElement("header");
  const title = document.createElement("h3");
  const close = document.createElement("button");
  close.textContent = "×";
  close.title = "Close";
  close.ariaLabel = "Close state details";
  close.onclick = onClose;
  header.append(title, close);
  const body = document.createElement("div");
  container.replaceChildren(header, body);
  return {
    render: (state?: { node: StateNodeConfig; path: Array<string> }) => {
      container.hidden = state === undefined;
      if (state === undefined) {
        return;
      }
      title.replaceChildren(
        state.path.join("."),
        ...(state.node.type ? [createSpan("state-type", state.node.type)] : [])
      );
      const sections = describeState(state.node);
      body.replaceChildren(
        ...(sections.length
          ? sections.map(({ title: name, rows }) => createSection(name, rows))
          : [createSpan("empty", "No actions, actors or transitions.")])
      );
    }
  };
};
