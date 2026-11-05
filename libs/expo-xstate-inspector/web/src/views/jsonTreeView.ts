import { buildJsonNode } from "../builders/jsonNode.js";

const createButton = (label: string, onClick: () => void) => {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = onClick;
  return button;
};

/** Shows a JSON value as a collapsible tree that can be copied. */
export const createJsonTreeView = (container: Element) => {
  const expanded = new Set([JSON.stringify([])]);
  const current: { value: unknown } = { value: undefined };
  const tree = document.createElement("div");
  tree.className = "json-tree";
  const setAllOpen = (open: boolean) =>
    tree.querySelectorAll("details").forEach(node => (node.open = open));
  const toolbar = document.createElement("div");
  toolbar.className = "json-toolbar toolbar";
  toolbar.append(
    createButton("Expand all", () => setAllOpen(true)),
    createButton("Collapse all", () => setAllOpen(false)),
    createButton(
      "Copy",
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
