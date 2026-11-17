declare module "https://cdn.jsdelivr.net/npm/mermaid@12.3.0/dist/mermaid.esm.min.mjs" {
  const mermaid: {
    initialize: (config: Record<string, unknown>) => void;
    render: (
      id: string,
      text: string,
      container?: Element
    ) => Promise<{ svg: string }>;
  };
  export default mermaid;
}
