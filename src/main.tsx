import { createRoot } from "react-dom/client";
import { DESIGN_VERSION, type DesignVersion } from "./config/designVersion";
import App from "./app/App.tsx";

function resolveThemeVersion(): DesignVersion {
  try {
    const s = localStorage.getItem("design_version");
    if (s === "v1" || s === "v2" || s === "v3" || s === "v4") return s;
  } catch {
    /* ignore */
  }
  return DESIGN_VERSION;
}

void import(`./themes/${resolveThemeVersion()}/tokens.css`);
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
