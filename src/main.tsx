import React from "react";
import ReactDOM from "react-dom/client";
import { AppStateProvider } from "./store/appState";
import App from "./App";
import "./ui/theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>
);
