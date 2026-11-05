import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.esm.min.mjs";

export type DiagramRenderer = (
  code: string,
  dark: boolean
) => Promise<string | undefined>;

/**
 * Renders Mermaid code to SVG. Resolves `undefined` when a newer render started
 * meanwhile, so stale diagrams are never shown. Mermaid measures the diagram in
 * `sandbox`, which must stay laid out, otherwise it appends to the page body.
 */
export const createMermaidRenderer = (sandbox: Element): DiagramRenderer => {
  const renders = { count: 0 };
  return async (code, dark) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: dark ? "dark" : "neutral",
      securityLevel: "strict",
      suppressErrorRendering: true,
      // Natural size, so the pan and zoom start from real proportions.
      state: { useMaxWidth: false }
    });
    const id = `diagram-${++renders.count}`;
    const { svg } = await mermaid.render(id, code, sandbox);
    return id === `diagram-${renders.count}` ? svg : undefined;
  };
};
