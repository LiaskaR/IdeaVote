import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// This function will be called by the host application
export const mount = (container: HTMLElement, props: { locale: string }) => {
  const root = createRoot(container);
  root.render(<App {...props} />);
  return root;
};

// This function will be called when the microfrontend is unmounted
export const unmount = (root: any) => {
  if (root) {
    root.unmount();
  }
};

// For standalone development
if (process.env.NODE_ENV === 'development' && !window.__webpack_require__) {
  const container = document.getElementById("root");
  if (container) {
    mount(container);
  }
}
