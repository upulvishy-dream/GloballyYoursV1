// app/evaluation/EvaluationClient.jsx
'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/**
 * EvaluationClient
 * - Client component which uses useSearchParams/useRouter and Recharts.
 * - Keep heavy client UI here to avoid CSR bailout in the server page.
 */
export default function EvaluationClient() {
  const router = useRouter();
  const searchParams = useSearchParams && useSearchParams();

  // Safe parse of query data (defensive)
  const raw = searchParams ? searchParams.get("data") : null;
  let parsed = null;
  if (raw) {
    try {
      parsed = JSON.parse(decodeURIComponent(raw));
    } catch (err) {
      console.error("Failed to parse evaluation data from query:", err);
      parsed = null;
    }
  }

  const evalData = parsed;

  // Demo/test data (not used if evalData exists)
  const testData = [
    { subject: "Communication", A: 85, fullMark: 100 },
    { subject: "Leadership", A: 75, fullMark: 100 },
    { subject: "Teamwork", A: 90, fullMark: 100 },
    { subject: "Problem Solving", A: 80, fullMark: 100 },
  ];

  const [useTestData, setUseTestData] = useState(false);

  // Debug logs
  // console.log("EVAL CLIENT - evalData raw:", evalData);

  if (!evalData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center p-8 bg-white/6 backdrop-blur-2xl rounded-3xl border border-white/10 max-w-lg">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg width="28" height="28" className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-white/90 text-2xl font-semibold mb-2">No evaluation data found</h3>
          <p className="text-white/60 text-sm">Please return to complete an assessment or open the dev launcher.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => router.push("/")} className="px-4 py-2 rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition">← Back</button>
            <button
              onClick={() => {
                const demo = encodeURIComponent(
                  JSON.stringify({
                    scores: { Communication: 85, Leadership: 75, Teamwork: 90, "Problem Solving": 80 },
                    total: 330,
                    max: 400,
                    feedback: ["Great clarity in answers.", "Consider delegating more often."],
                  })
                );
                router.push(`/evaluation?data=${demo}`);
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow"
            >
              Open Demo Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // At this point we have evalData
  const { scores = {}, total = 0, max = 100, feedback = [] } = evalData;
  const percentage = Math.round((Number(total) / Number(max)) * 100);

  const radarData = Object.entries(scores || {}).map(([skill, score]) => ({
    subject: skill,
    A: Number(score),
    fullMark: 100,
  }));

  // Mount guard for Recharts SSR/hydration quirks
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const getPerformanceMetrics = (percentage) => {
    if (percentage >= 90)
      return { level: "Exceptional", color: "from-emerald-500 to-green-600", bgColor: "bg-emerald-50", textColor: "text-emerald-700", icon: "🚀" };
    if (percentage >= 80)
      return { level: "Excellent", color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", textColor: "text-blue-700", icon: "⭐" };
    if (percentage >= 70)
      return { level: "Proficient", color: "from-purple-500 to-violet-600", bgColor: "bg-purple-50", textColor: "text-purple-700", icon: "💪" };
    if (percentage >= 60)
      return { level: "Developing", color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700", icon: "📈" };
    return { level: "Emerging", color: "from-red-400 to-pink-500", bgColor: "bg-red-50", textColor: "text-red-700", icon: "🎯" };
  };

  const performanceMetrics = getPerformanceMetrics(percentage);

  const MetricCard = ({ title, value, sub, from = "from-indigo-500", to = "to-indigo-600" }) => (
    <div className="p-4 rounded-2xl bg-white/6 backdrop-blur-sm border border-white/8 hover:shadow-xl transition transform hover:-translate-y-1">
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-base font-semibold bg-gradient-to-r ${from} ${to} text-white/90 shadow-sm mb-3`}>
        {title}
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-extrabold text-white">{value}</div>
          {sub && <div className="text-xs text-white/70 mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );

  const generateOpportunity = (evidence) => {
    if (!evidence || typeof evidence !== "string") return "Consider targeted development in this area.";
    const lower = evidence.toLowerCase();
    if (lower.includes("great") || lower.includes("excellent") || lower.includes("strong")) {
      return "Build on this strength by mentoring peers and taking stretch assignments.";
    }
    if (lower.includes("consider") || lower.includes("should")) {
      return "Define a small, measurable action to try in the next 2 weeks and track outcomes.";
    }
    if (lower.includes("delegate") || lower.includes("delegat")) {
      return "Experiment with delegating one task per week and establish clear handoffs.";
    }
    if (lower.includes("clarity") || lower.includes("communication")) {
      return "Practice concise summaries and solicit feedback after key meetings.";
    }
    return "Create a focused plan: set one concrete goal, schedule short practice sessions, and review progress.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-xl font-medium">Skip to content</a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" style={{ color: "white" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Evaluation Results</h1>
              <p className="text-xs text-white/70">Investor & Prototype view</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm px-3 py-1 rounded-full bg-white/6 text-white/90 font-medium">Prototype</div>
            <button onClick={() => router.push("/")} className="text-sm rounded-lg border border-white/20 bg-white/6 px-4 py-2 text-white/90 hover:bg-white/10 transition" aria-label="Back to Home">
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-6 py-10 sm:py-14 space-y-10">
        <section className="text-xl grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Total Score" value={`${total} / ${max}`} sub="Aggregate across categories" from="from-indigo-500" to="to-purple-600" />
          <MetricCard title="Percentile" value={`${Number.isFinite(percentage) ? percentage : 0}%`} sub={`${performanceMetrics.level} performance`} from="from-emerald-500" to="to-green-600" />
          <MetricCard title="Feedback Points" value={Array.isArray(feedback) ? feedback.length : 0} sub="Actionable improvements" from="from-yellow-500" to="to-orange-500" />
        </section>

        <section aria-labelledby="overall-score" className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 blur-3xl opacity-40 rounded-3xl" style={{ background: "linear-gradient(90deg,#0ea5e977,#8b5cf666)" }} />
          <div className="relative p-8 sm:p-12 bg-gradient-to-br from-white/5 to-white/3 border border-white/6 rounded-3xl backdrop-blur">
            <div className="flex items-center justify-between gap-6 flex-col sm:flex-row">
              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${performanceMetrics.bgColor} ${performanceMetrics.textColor} mb-4 shadow-sm`}>
                  <span className="mr-2">{performanceMetrics.icon}</span>
                  {performanceMetrics.level} Performance
                </div>

                <h2 id="overall-score" className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Overall Assessment</h2>
                <p className="text-sm text-white/70 max-w-xl">A concise, investor-friendly snapshot of candidate soft skills — ready to present as a prototype.</p>
              </div>

              <div className="flex items-center space-x-6 mt-6 sm:mt-0">
                <div className="text-center p-4 rounded-2xl bg-white/6 border border-white/6 shadow">
                  <div className={`text-5xl font-extrabold bg-gradient-to-r ${performanceMetrics.color} bg-clip-text text-transparent`}>{total}</div>
                  <div className="text-sm text-white/70 mt-1">out of {max}</div>
                </div>

                <div className="text-center p-4 rounded-2xl bg-white/6 border border-white/6 shadow">
                  <div className="text-3xl font-extrabold">{Number.isFinite(percentage) ? percentage : 0}%</div>
                  <div className="text-sm text-white/70 mt-1">Overall Score</div>
                </div>
              </div>
            </div>

            <div className="mt-8 max-w-2xl mx-auto">
              <div className="w-full rounded-full bg-white/10 h-6 shadow-inner" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage} aria-label="Overall score percentage" style={{ height: 18 }}>
                <div className={`h-6 rounded-full bg-gradient-to-r ${performanceMetrics.color} shadow-lg transition-all duration-1000 ease-out relative overflow-hidden`} style={{ width: `${Math.max(0, Math.min(100, percentage))}%`, height: 18 }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-8">
          <section aria-labelledby="skill-radar" className="bg-white/5 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/6 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 id="skill-radar" className="text-lg font-bold text-white flex items-center"><span className="mr-3 text-2xl">🌐</span>Skills Assessment — Radar</h2>
            </div>

            <div className="p-6">
              <div className="w-full" style={{ height: 420, minHeight: 320 }}>
                {!mounted ? (
                  <div className="h-full grid place-items-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                      <p className="text-white/70 font-medium">Loading visualization...</p>
                    </div>
                  </div>
                ) : radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '10px', boxShadow: '0 8px 30px rgba(2,6,23,0.6)', fontSize: '13px', fontWeight: '600', color: '#fff' }} itemStyle={{ color: '#fff' }} wrapperStyle={{ outline: 'none' }} />
                      <Radar name="Score" dataKey="A" stroke="#7c3aed" strokeWidth={3} fill="url(#radarGradient)" fillOpacity={0.35} dot={{ fill: '#7c3aed', strokeWidth: 2, stroke: '#0b1220', r: 4 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full grid place-items-center text-white/60">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a..." />
                        </svg>
                      </div>
                      <p className="font-medium">No skill data to visualize</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="by-category" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 id="by-category" className="text-2xl font-bold text-white flex items-center"><span className="mr-3">📊</span>Detailed Category Breakdown</h2>
              <div className="text-sm text-white/70">Designed for presentation & investor review</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(scores || {}).map(([skill, score]) => {
                const value = Number(score);
                const categoryMetrics = getPerformanceMetrics(value);
                return (
                  <article key={skill} className="group rounded-2xl p-5 border border-white/6 shadow-lg bg-gradient-to-br from-white/3 to-white/6 transform hover:-translate-y-1 transition" aria-label={`${skill} score`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-white uppercase tracking-wide">{skill}</p>
                      <span className="text-2xl">{categoryMetrics.icon}</span>
                    </div>

                    <div className="flex items-baseline space-x-3 mb-4">
                      <p className={`text-4xl font-extrabold bg-gradient-to-r ${categoryMetrics.color} bg-clip-text text-transparent`}>{value}</p>
                      <p className="text-sm text-white/70 font-medium mt-2">/ 100</p>
                    </div>

                    <div className="w-full bg-white/8 rounded-full h-3 overflow-hidden mb-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={`${skill} percentage`} style={{ height: 12 }}>
                      <div className={`h-3 rounded-full bg-gradient-to-r ${categoryMetrics.color} transition-all duration-1000 ease-out`} style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: 12 }} />
                    </div>

                    <p className={`mt-2 text-xs font-semibold ${categoryMetrics.textColor}`}>{categoryMetrics.level}</p>
                    <p className="mt-3 text-sm text-white/70">
                      {value >= 75
                        ? "You are strong here — keep up the great work."
                        : value >= 50
                        ? "There is room to grow. Focused practice will help."
                        : value >= 30
                        ? "Consider dedicating regular time to improve this skill."
                        : "This area would benefit from attention; small steps yield big gains."}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <section aria-labelledby="improvements" className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/6 p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
            <h2 id="improvements" className="text-2xl font-bold text-white flex items-center"><span className="mr-4">💡</span>Strategic Development Opportunities</h2>
          </div>

          <div className="p-8">
            {Array.isArray(feedback) && feedback.length > 0 ? (
              <div className="grid gap-6">
                {feedback.map((f, idx) => (
                  <div key={idx} className="group p-6 rounded-2xl bg-gradient-to-br from-orange-400/6 to-amber-500/6 border border-white/6 hover:shadow-lg hover:-translate-y-1 transition" role="article" aria-label="Feedback evidence and opportunity">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                      <div className="p-4 rounded-xl bg-white/3 border border-white/6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white font-semibold">E</div>
                          <h3 className="text-sm font-semibold text-white">Evidence</h3>
                        </div>
                        <p className="text-white/85 leading-relaxed">{typeof f === 'string' ? f : JSON.stringify(f)}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/3 border border-white/6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">O</div>
                          <h3 className="text-sm font-semibold text-white">Opportunity</h3>
                        </div>
                        <p className="text-white/85 leading-relaxed">{generateOpportunity(f)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow">
                  <svg width="28" height="28" className="text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/90 font-medium">Excellent performance across all categories!</p>
              </div>
            )}
          </div>
        </section>

        <div className="text-center pt-4">
          <button onClick={() => router.push("/")} className="group inline-flex items-center rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-2xl hover:shadow-blue-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 transition-all duration-300 hover:scale-[1.02] text-lg" aria-label="Return to Dashboard">
            <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3" />
            </svg>
            Return to Dashboard
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SoftCode Evaluation",
            applicationCategory: "EducationalApplication",
            description: "AI-powered evaluation results for soft-skill roleplay across cultures.",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}
