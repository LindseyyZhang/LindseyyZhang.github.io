import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import BreathingApp from "../components/BreathingApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BreathingApp />
  </StrictMode>,
);
