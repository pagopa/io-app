/**
 * Mounts the inspector UI. The Metro dev server serves this page and its bundle
 * under `/xstate-inspector`, and `index.html` carries the styles.
 */
import { createRoot } from "react-dom/client";

import { App } from "./ui/App";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("xstate-inspector: index.html has no #root element");
}

createRoot(container).render(<App />);
