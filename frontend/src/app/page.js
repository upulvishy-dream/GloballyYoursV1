"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Home() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState("scenario1");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [chatEnded, setChatEnded] = useState(false); // 🚀 NEW state
  const chatEndRef = useRef(null);

  const scenarios = [
    { id: "scenario1", title: "Student — Group project conflict", persona: "student", icon: "🎓", difficulty: "Easy", color: "green" },
    { id: "scenario2", title: "Student — Classroom debate / directness", persona: "student", icon: "💬", difficulty: "Medium", color: "yellow" },
    { id: "scenario3", title: "Student — Presentation & time expectations", persona: "student", icon: "⏰", difficulty: "Medium", color: "yellow" },
    { id: "scenario4", title: "Corporate Expat — Supplier negotiation", persona: "expat", icon: "🤝", difficulty: "Hard", color: "red" },
    { id: "scenario5", title: "Corporate Expat — Performance feedback", persona: "expat", icon: "📊", difficulty: "Hard", color: "red" },
    { id: "scenario6", title: "Corporate Expat — Leading mixed meeting", persona: "expat", icon: "👥", difficulty: "Hard", color: "red" },
    { id: "scenario7", title: "Recruiter — Interview: indirect answers", persona: "recruiter", icon: "💼", difficulty: "Medium", color: "yellow" },
    { id: "scenario8", title: "Recruiter — Panel disagreement", persona: "recruiter", icon: "⚖️", difficulty: "Hard", color: "red" },
    { id: "scenario9", title: "Recruiter — Onboarding instructions", persona: "recruiter", icon: "🔄", difficulty: "Hard", color: "red" }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const startScenario = () => {
    if (!selectedScenario) {
      alert("Please select a scenario to begin.");
      return;
    }
    setShowWelcome(false);
    setChatEnded(false); // 🚀 reset when starting fresh
    setChatLog([
      { sender: "system", text: `🎯 Starting: ${currentScenario.title}`, timestamp: new Date() },
      { sender: "bot", text: "Hello! I'm your AI roleplay partner. Let's begin - how would you handle this situation?", timestamp: new Date() }
    ]);
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading || chatEnded) return;

    const userMessage = {
      sender: "user",
      text: message,
      timestamp: new Date()
    };

    setChatLog(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setTypingIndicator(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat", {
        scenario_id: selectedScenario,
        message: userMessage.text,
        chat_log: [...chatLog, userMessage].map(msg => ({ sender: msg.sender, text: msg.text }))
      });

      setTypingIndicator(false);
      setIsLoading(false);

      // 👇 Handle backend-driven flow
      if (res.data.reply) {
        // Normal roleplay continuation
        setChatLog(prev => [...prev, {
          sender: "bot",
          text: res.data.reply,
          timestamp: new Date()
        }]);
      } else if (res.data.evaluation) {
        setChatEnded(true);
        // Redirect to evaluation page with JSON in query params
        const evalData = encodeURIComponent(JSON.stringify(res.data.evaluation));
        window.location.href = `/evaluation?data=${evalData}`;
      }

    } catch (err) {
      console.error("Error sending message:", err);
      setTypingIndicator(false);
      setIsLoading(false);
      setChatLog(prev => [...prev, {
        sender: "bot",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Structured Data (non-invasive; safe in client)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SoftCode",
    applicationCategory: "EducationalApplication",
    description: "Practice real-world cross-cultural scenarios with AI feedback.",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
    // TODO: add publisher/org once you have public URLs
  };

  // --- Render welcome screen ---
  if (showWelcome) {
    return (
      <div className="min-h-screen text-gray-900 bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(59,130,246,.25),transparent),radial-gradient(800px_500px_at_90%_10%,rgba(168,85,247,.25),transparent)] relative">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white text-gray-900 px-3 py-2 rounded-md shadow">
          Skip to content
        </a>

        {/* Decorative glow */}
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="container mx-auto px-6 py-16 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Master <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Soft Skills</span> Across Cultures
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Practice real-world cross-cultural scenarios with AI feedback.
          </p>

          <div className="mx-auto max-w-xl space-y-6">
            {/* Scenario Dropdown */}
            <div className="text-left">
              <label htmlFor="scenario-select" className="block text-sm font-medium text-gray-700 mb-2">
                Choose a scenario
              </label>
              <div className="relative">
                <select
                  id="scenario-select"
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="block w-full appearance-none rounded-xl bg-white/90 backdrop-blur border border-gray-300 px-4 py-3 pr-10 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Select a scenario to begin"
                >
                  <option value="" disabled>Select a Scenario</option>
                  {scenarios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.title} ({s.difficulty})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">▾</span>
              </div>
            </div>

            <button
              onClick={startScenario}
              disabled={!selectedScenario}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50"
              aria-label="Start the selected scenario"
            >
              <span className="mr-2">🌍</span> Start Scenario →
            </button>

            {/* Trust cues / mini-proof */}
            <div className="pt-6 text-sm text-gray-600">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1">
                ✅ No signup • ⚡ Instant practice • 🔒 Private by default
              </span>
            </div>
          </div>
        </div>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </div>
    );
  }

  // --- Render chat interface ---
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <a href="#chat-input" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-white text-gray-900 px-3 py-2 rounded-md shadow">
        Skip to message input
      </a>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white grid place-items-center font-bold shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold leading-tight">SoftCode</h1>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span aria-hidden="true">{currentScenario?.icon}</span>
                <span className="line-clamp-1">{currentScenario?.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-800 border">
                  {currentScenario?.difficulty}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowWelcome(true)}
            className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 text-gray-700 hover:text-blue-700 hover:border-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
            aria-label="Back to scenario selection"
          >
            ← Back to Problems
          </button>
        </div>
      </header>

      <main id="content" className="flex-1 flex flex-col">
        <section className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div
            className="mx-auto max-w-4xl space-y-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {chatLog.map((msg, idx) => (
              <div key={idx} className={`${msg.sender === "user" ? "flex justify-end" : "flex justify-start"}`}>
                <div
                  className={`max-w-lg rounded-2xl px-4 py-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-xs" aria-hidden="true">
                      {msg.sender === "user" && <span>👤</span>}
                      {msg.sender === "bot" && <span>🤖</span>}
                      {msg.sender === "system" && <span>⚡</span>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.timestamp && (
                        <p className={`mt-1 text-[11px] ${msg.sender === "user" ? "text-white/80" : "text-gray-500"}`}>
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {typingIndicator && (
              <div className="flex justify-start" aria-live="assertive" aria-label="Assistant is typing">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xs" aria-hidden="true">🤖</span>
                    <div className="flex gap-1" aria-hidden="true">
                      <div className="w-2 h-2 bg-gray-400/80 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400/80 rounded-full animate-bounce [animation-delay:120ms]"></div>
                      <div className="w-2 h-2 bg-gray-400/80 rounded-full animate-bounce [animation-delay:240ms]"></div>
                    </div>
                    <span className="sr-only">Typing…</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 p-3 sm:p-4">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-end gap-3">
              <label htmlFor="chat-input" className="sr-only">
                Message input
              </label>
              <textarea
                id="chat-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                placeholder={chatEnded ? "✅ Conversation ended. Restart scenario." : "Type your response..."}
                disabled={isLoading || chatEnded}
                className="flex-1 resize-none rounded-xl bg-gray-100 text-gray-900 border border-gray-300 px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
                aria-disabled={isLoading || chatEnded}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || chatEnded}
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:opacity-50"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Press <kbd className="rounded border px-1">Enter</kbd> to send • <kbd className="rounded border px-1">Shift</kbd> + <kbd className="rounded border px-1">Enter</kbd> for a new line
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
