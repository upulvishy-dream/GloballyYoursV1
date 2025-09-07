// app/evaluation/page.js (server component)
import React, { Suspense } from "react";
import EvaluationClient from "./EvaluationClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/70">Loading evaluation...</div>
        </div>
      }
    >
      <EvaluationClient />
    </Suspense>
  );
}
