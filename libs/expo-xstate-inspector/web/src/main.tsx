import { createRoot } from "react-dom/client";

import "./app/styles.css";
import { App } from "./app/App";

const target = document.getElementById("app");
if (!target) {
  throw new Error("Missing #app element");
}

createRoot(target).render(<App />);
