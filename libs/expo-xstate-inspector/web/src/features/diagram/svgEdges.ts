const markerOf = (path: Element) =>
  /url\(#([^)]+)\)/.exec(path.getAttribute("marker-end") ?? "")?.[1];

// Arrowheads are shared markers, so taken edges point at a recoloured copy.
const takenMarker = (svg: SVGSVGElement, id: string) => {
  const takenId = `${id}-taken`;
  if (!svg.getElementById(takenId)) {
    const original = svg.getElementById(id);
    if (!original) {
      return undefined;
    }
    const marker = original.cloneNode(true) as Element;
    marker.id = takenId;
    marker.classList.add("taken");
    original.after(marker);
  }
  return takenId;
};

/** Adds the `taken` class to the Mermaid edges at `indices`, labels included. */
export const markTakenEdges = (
  container: ParentNode,
  indices: Array<number>
) => {
  const svg = container.querySelector("svg");
  indices.forEach(index => {
    const id = `edge${index}`;
    const path = svg?.querySelector(`path[data-id="${id}"]`);
    if (!svg || !path) {
      return;
    }
    path.classList.add("taken");
    const marker = markerOf(path);
    const copy = marker && takenMarker(svg, marker);
    if (copy) {
      path.setAttribute("marker-end", `url(#${copy})`);
    }
    svg
      .querySelector(`.edgeLabel [data-id="${id}"]`)
      ?.closest(".edgeLabel")
      ?.classList.add("taken");
  });
};
