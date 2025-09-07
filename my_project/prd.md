🔥 Love the energy. Here’s a **full Product Requirements Document (PRD)** draft for our MVP — polished, clear, and buildathon-ready.

---

# 📄 PRD: Leetcode for Soft Skills (MVP)

---

## 1. Problem Statement

Traditional business school case studies and corporate training modules are **passive, outdated, and lack interactivity**. They don’t prepare individuals for **real-world soft skill challenges** — especially in **cross-cultural and high-stakes business environments**.

At the same time, recruiters and L\&D teams struggle to **objectively measure soft skills** during hiring and training.

We need a solution that makes **soft skills measurable, trainable, and scalable** — just like Leetcode did for coding.

---

## 2. Goals & Objectives

### MVP Goals

1. Build an **interactive AI-driven simulation** where users can practice professional and cultural scenarios.
2. Provide **structured feedback & scoring** based on Erin Meyer’s *The Culture Map* (8 cultural dimensions).
3. Showcase **3 core personas** (students, corporate expats, recruiters).
4. Deliver an **engaging, demo-ready product** within 5 days for the buildathon.

### Long-term Vision

* Become the **global platform for practicing soft skills**, like Leetcode for coding.
* Build a **network effect** with user-generated scenarios and alumni contributions.
* Provide **recruiting insights** based on aggregate soft-skill performance.

---

## 3. Target Personas

1. **B-School Student**

   * Use case: Preparing for exchange programs, navigating unfamiliar classroom/team dynamics.
   * Goal: Practice cultural adaptability and conflict management.

2. **Corporate Expat**

   * Use case: Relocating professionals needing fast adaptation to local work culture.
   * Goal: Learn how to handle cross-cultural negotiations, feedback styles, and team leadership.

3. **Recruiter / L\&D Professional**

   * Use case: Assessing soft skills and cultural fit of candidates or employees.
   * Goal: Get structured insights into adaptability, decision-making, and collaboration styles.

---

## 4. Features (MVP Scope)

### Core Features

* **Scenario Repository (JSON-based)**

  * At least 9 scenarios (3 per persona).
  * Each scenario includes: context, conflict, cultural dimensions, possible paths.

* **Interactive Simulation (AI Chat)**

  * User engages via free-text input (chat interface).
  * AI roleplays counterpart (professor, supplier, manager, etc.).
  * AI evaluates user’s response and matches against possible paths.

* **AI Evaluation & Scoring**

  * Based on Erin Meyer’s 8 dimensions (communication, trust, feedback, etc.).
  * Structured JSON output → `scores`, `feedback`, `cultural fit notes`.
  * Immediate user feedback: pros, cons, suggestions.

* **Feedback Dashboard**

  * Scenario result + scores across 8 cultural dimensions.
  * Progress tracker: “Your adaptability profile.”
  * Insights: strengths, blind spots, role fit hints.

### Differentiators

* **Not MCQ** → immersive free-text/voice interactions.
* **Scoring system** for benchmarking.
* **Cultural nuance baked in** from Day 1.

---

## 5. Out of Scope (MVP)

* User onboarding / account management (use dummy users).
* Full recruiter dashboard with team-level insights.
* Voice integration (nice-to-have, not required for MVP).
* Monetization features (subscriptions, credits).

---

## 6. Success Metrics

### MVP Buildathon

* **Completion**: Demo-ready product with 9 scenarios.
* **Engagement**: At least 70% of test users complete 1 scenario.
* **Immersion**: Testers report “felt realistic” (qualitative feedback).

### Longer-term Metrics

* Daily Active Users (DAU).
* Scenario completion rate.
* Recruiter adoption (paid pilots).
* Creator contributions (# of alumni uploading scenarios).

---

## 7. Risks & Mitigations

* **Risk: User misleads AI with irrelevant responses.**

  * Mitigation: AI guardrails → gently redirect to scenario context.

* **Risk: Free-text too unstructured for consistent scoring.**

  * Mitigation: Prompt-engineered structured evaluation (JSON schema).

* **Risk: Content authenticity.**

  * Mitigation: Start with curated + publicly available scenarios (TV, books, media).

* **Risk: Buildathon time constraint.**

  * Mitigation: Prioritize 9 scenarios + text-first interface. Leave voice & recruiter analytics as future work.

---

## 8. Tech Stack

* **Frontend**: React / Next.js + Tailwind.
* **Backend**: Node.js or Python FastAPI.
* **AI Layer**: GPT/Windsurf for roleplay + scoring.
* **Voice (Optional)**: ElevenLabs for output.
* **DB**: Firestore / MongoDB.

---

## 9. Roadmap (5-Day Sprint for Buildathon)

**Day 1**: Finalize 9 scenarios + JSON repo.
**Day 2**: Build chat UI + connect AI roleplay.
**Day 3**: Implement evaluation prompts + scoring schema.
**Day 4**: Build feedback dashboard.
**Day 5**: Polish demo flows for 3 personas, rehearse pitch.

---

✅ With this MVP PRD, we are demo-ready in 5 days and strategically positioned as the **Leetcode of Soft Skills**.

---

Do you want me to **expand Day 1 (Scenario Writing) into a structured playbook** with ready-to-use prompts/templates — so you can generate those 9 high-quality scenarios quickly? That’s the first bottleneck.
