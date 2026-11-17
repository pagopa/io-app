import type { IconSvgObject } from "@hugeicons/core-free-icons/types";

import {
  CollapseIcon,
  Copy01Icon,
  ExpandIcon
} from "@hugeicons/core-free-icons";

import { buildJsonNode } from "../builders/jsonNode";
import { createSpan } from "../utils/dom";
import { setButtonIcon } from "../widgets/iconButton";

const createButton = (
  icon: IconSvgObject,
  label: string,
  onClick: () => void
) => {
  const button = setButtonIcon(document.createElement("button"), icon, label);
  button.onclick = onClick;
  return button;
};

/** Shows a JSON value as a collapsible tree that can be copied. */
export const createJsonTreeView = (container: Element) => {
  const expanded = new Set([JSON.stringify([])]);
  const current: { value: unknown } = { value: undefined };
  const tree = document.createElement("div");
  tree.className = "json-tree";
  tree.append(
    createSpan("empty-state", "Select a machine to inspect its data.")
  );
  const setAllOpen = (open: boolean) =>
    tree.querySelectorAll("details").forEach(node => (node.open = open));
  const toolbar = document.createElement("div");
  toolbar.className = "json-toolbar toolbar";
  toolbar.append(
    createButton(ExpandIcon, "Expand all", () => setAllOpen(true)),
    createButton(CollapseIcon, "Collapse all", () => setAllOpen(false)),
    createButton(
      Copy01Icon,
      "Copy JSON",
      () =>
        void navigator.clipboard.writeText(
          JSON.stringify(current.value, null, 2) ?? ""
        )
    )
  );
  container.replaceChildren(toolbar, tree);
  return {
    render: (value: unknown) => {
      current.value = value;
      tree.replaceChildren(buildJsonNode(undefined, value, [], expanded));
    }
  };
};
