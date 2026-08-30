import { useState } from "react";
import { createRoot } from "react-dom/client";
import BreathingApp from "../components/BreathingApp";
// `?inline` gives us the fully processed (Tailwind included) CSS as a string,
// which we inject into the shadow root below so host-page styles can never
// leak in or out.
import styles from "../index.css?inline";

const HOST_ID = "catbreath-overlay-host";

function OverlayWidget() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open breathing exercise"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-charcoal/10 bg-cream/90 text-xl shadow-lg backdrop-blur transition-transform hover:scale-105"
      >
        🐾
      </button>
    );
  }

  return (
    <div className="flex h-[440px] w-[300px] flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/55 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between px-3 pt-2">
        <span className="text-xs font-medium text-charcoal/60">Cat Wave Breathing</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="rounded-full px-1.5 py-0.5 text-charcoal/50 hover:bg-charcoal/10"
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <BreathingApp compact transparentCanvasBg />
      </div>
    </div>
  );
}

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.zIndex = "2147483647";
  host.style.bottom = "20px";
  host.style.right = "20px";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const styleEl = document.createElement("style");
  styleEl.textContent = styles;
  shadow.appendChild(styleEl);

  const appRoot = document.createElement("div");
  shadow.appendChild(appRoot);

  createRoot(appRoot).render(<OverlayWidget />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
