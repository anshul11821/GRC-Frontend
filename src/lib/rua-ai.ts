"use client";

// AI grading for the RUA gate's four free-text cards (POST /me/rua-check): the concept
// explanation, the step paraphrase, the deliverable contract and the exam answer. Everything else
// in the gate has an answer key and stays deterministic in rua-engine.ts.
//
// The deterministic graders stay as Layer 1 — the objective floor (too short, verbatim copy) that
// never needs a model call — and as the fallback when this returns null. A preparation gate must
// not become unpassable because the grader is down.

import { api } from "./api";

export type RuaCheckKind = "explain" | "step" | "contract" | "answer";

export interface AiDim { label: string; score: number; hint: string }

export interface AiGrade {
  dims: AiDim[];
  avg: number;
  passed: boolean;
  outcome: "pass" | "partial" | "fail";
  feedback: string;
}

/** null = grade it with the deterministic fallback (no key, quota gone, outage, offline). */
export async function aiCheck(body: {
  taskCode: string;
  kind: RuaCheckKind;
  index?: number;
  text: string;
  text2?: string;
}): Promise<AiGrade | null> {
  try {
    const r = await api.post<AiGrade & { available: boolean }>("/me/rua-check", {
      index: 0, text2: "", ...body,
    });
    return r.available ? r : null;
  } catch {
    return null;
  }
}
