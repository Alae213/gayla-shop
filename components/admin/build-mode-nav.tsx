"use client";

/**
 * M3 Task 3.2 — Floating section jump navigation for Build Mode.
 * Renders a fixed bottom-right dock with three icon buttons that
 * smooth-scroll to the Stats, Hero, and Products sections.
 * Collapses to a single ChevronUp FAB on mobile.
 */

import { useEffect, useState } from "react";
import { BarChart2, Sparkles, Package, ChevronUp } from "lucide-react";

const SECTIONS = [
  { id: "section-stats",    label: "Stats",    Icon: BarChart2,  shortcut: "Alt+1" },
  { id: "section-hero",     label: "Hero",     Icon: Sparkles,   shortcut: "Alt+2" },
  { id: "section-products", label: "Products", Icon: Package,    shortcut: "Alt+3" },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BuildModeNav() {
  const [expanded, setExpanded] = useState(false);

  // Alt+1/2/3 section jump shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "1") { e.preventDefault(); scrollTo("section-stats"); }
      if (e.key === "2") { e.preventDefault(); scrollTo("section-hero"); }
      if (e.key === "3") { e.preventDefault(); scrollTo("section-products"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">

      {/* Desktop dock — always visible on sm+ */}
      <div className="hidden sm:flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
        {SECTIONS.map(({ id, label, Icon, shortcut }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            title={`${label} (${shortcut})`}
            className="group relative flex items-center justify-center h-10 w-10 rounded-xl hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <Icon className="h-5 w-5" />
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-12 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
              <kbd className="ml-1.5 text-gray-400 font-mono text-[10px]">{shortcut}</kbd>
            </span>
          </button>
        ))}
      </div>

      {/* Mobile FAB — expands on tap */}
      <div className="flex sm:hidden flex-col items-end gap-2">
        {expanded && (
          <div className="flex flex-col items-center gap-1.5 bg-white border border-gray-200 rounded-2xl shadow-lg p-2">
            {SECTIONS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { scrollTo(id); setExpanded(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 text-sm font-medium transition-colors w-full"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-colors"
          title="Jump to section"
        >
          <ChevronUp className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
