/**
 * Mounts the standalone inspector UI served by its Vite process.
 */
import { createRoot } from "react-dom/client";

import { App } from "./ui/App";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("xstate-inspector: index.html has no #root element");
}

createRoot(container).render(<App />);
