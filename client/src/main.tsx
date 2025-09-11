import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Only render in standalone mode (not when used as microfrontend)
if (!window.__webpack_require__) {
  const container = document.getElementById("root");
  if (container) {
    createRoot(container).render(<App />);
  }
}
