import { buildJsonNode } from "../builders/jsonNode.js";

const createButton = (label, onClick) => {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = onClick;
  return button;
};

/** Shows a JSON value as a collapsible tree that can be copied. */
export const createJsonTreeView = container => {
  const expanded = new Set([JSON.stringify([])]);
  const current = { value: undefined };
  const tree = document.createElement("div");
  tree.className = "json-tree";
  const setAllOpen = open =>
    tree.querySelectorAll("details").forEach(node => (node.open = open));
  const toolbar = document.createElement("div");
  toolbar.className = "json-toolbar";
  toolbar.append(
    createButton("Expand all", () => setAllOpen(true)),
    createButton("Collapse all", () => setAllOpen(false)),
    createButton("Copy", () =>
      navigator.clipboard.writeText(
        JSON.stringify(current.value, null, 2) ?? ""
      )
    )
  );
  container.replaceChildren(toolbar, tree);
  return {
    render: value => {
      current.value = value;
      tree.replaceChildren(buildJsonNode(undefined, value, [], expanded));
    }
  };
};
