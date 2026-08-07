"use client";

// Temporary switch between the live 4-organisation curriculum and the 8-organisation
// Word/Excel rebuild. Deliberately plain — it ships only until one dataset wins, then this
// file, the localStorage key and the `dataset` query param all go.
// ponytail: no design, no animation, no settings screen — it is scaffolding.

import { useEffect, useState } from "react";
import { currentDataset, setDataset } from "@/lib/task-bundle";

export function DatasetSwitch() {
  // Read after mount: localStorage isn't available during server render.
  const [dataset, setLocal] = useState<"live" | "v2" | null>(null);
  useEffect(() => setLocal(currentDataset()), []);
  if (!dataset) return null;

  const v2 = dataset === "v2";
  return (
    <button
      type="button"
      onClick={() => setDataset(v2 ? "live" : "v2")}
      title="Switch curriculum dataset (reloads the page)"
      className={`fixed bottom-3 right-3 z-50 rounded-md border px-2.5 py-1 font-mono text-[11px] shadow-sm ${
        v2
          ? "border-amber-400 bg-amber-50 text-amber-800"
          : "border-slate-300 bg-white text-slate-500"
      }`}
    >
      {v2 ? "data: 8-org (v2)" : "data: live (4-org)"}
    </button>
  );
}
