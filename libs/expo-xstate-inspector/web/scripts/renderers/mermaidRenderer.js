import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.esm.min.mjs";

/**
 * Renders Mermaid code to SVG. Resolves `undefined` when a newer render started
 * meanwhile, so stale diagrams are never shown.
 */
export const createMermaidRenderer = () => {
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "strict"
  });
  const renders = { count: 0 };
  return async code => {
    const id = `diagram-${++renders.count}`;
    const { svg } = await mermaid.render(id, code);
    return id === `diagram-${renders.count}` ? svg : undefined;
  };
};
