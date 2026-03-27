# SENTINEL — Demo Script

> Exact 3-minute narration for the live demo.  
> Person 1 operates the UI. Person 3 narrates. Person 2 is on standby for technical recovery.

---

## Pre-Demo Checklist

- [ ] Backend running on demo machine (`uvicorn main:app --port 8000`)
- [ ] Frontend running (`npm run dev` or built + served)
- [ ] API key confirmed working (run one test advance)
- [ ] Scenario reset to Phase 0 (`POST /scenario/reset`)
- [ ] Browser zoom level tested on projector (usually 110-125%)
- [ ] Font size readable from back of room
- [ ] Fallback responses cached and verified
- [ ] Backup video ready on second device
- [ ] WiFi confirmed stable (or use mobile hotspot backup for API calls)

---

## The Script

### 0:00 — 0:20 | Opening — The Problem

**[Dashboard is already open. Phase 0. All units green. Map visible.]**

**Narrator (Person 3):**

> "A modern theater commander is drowning in data. Drone feeds, signals intelligence, unit reports, logistics — all in separate systems. By the time they correlate it manually, the decision window has closed."

> "SENTINEL changes that. One screen. Fused intelligence. AI that reasons and recommends. Let me show you."

**[Person 1: Gesture to the dashboard. Point out the map, the ORBAT panel, the AI panel.]**

---

### 0:20 — 0:50 | Threat Emergence

**Narrator:**

> "We're in Theater Alpha. Our objective is to stabilize Sector East. Let's see what happens when new intelligence arrives."

**[Person 1: Click "Advance Phase". Wait for UI update. Threat marker appears on map. Scorecard updates. AI panel populates.]**

**Narrator:**

> "A drone recon report just detected three hostile armored vehicles moving toward Grid 447. Watch what happens — SENTINEL doesn't just show you the marker. It scores the threat at [read score], identifies that Bravo-2's medical supplies are at zero, and immediately surfaces its assessment."

**[Person 1: Point to the AI panel. Scroll to show assessment text and key risks.]**

**Narrator:**

> "Every recommendation comes with reasoning. The AI isn't a black box — it explains why it's recommending this action, what assumptions it's making, and what the expected effectiveness is."

---

### 0:50 — 1:20 | Recommendation

**[Person 1: Point to the PlanCard showing the recommendation.]**

**Narrator:**

> "SENTINEL recommends repositioning Echo-1 for medevac support at Grid 447. Expected effectiveness: 78%. Resource cost: moderate. The rationale: it's the closest medical unit with available capacity."

> "This isn't just an alert — it's a plan the commander can act on."

---

### 1:20 — 1:50 | Commander Query

**Narrator:**

> "But a real commander doesn't just accept recommendations. They ask questions."

**[Person 1: Click into query box. Type: "Who can reinforce Grid 447?" Press enter. Wait for response.]**

**Narrator (reading the response):**

> "SENTINEL pulls from the current operational state and tells us: Echo-1 is the best option with full medical and 78% fuel. Bravo-2 is closer but medically depleted. Charlie-1 could support but fuel is at 34%. Every answer is grounded in real data — nothing hallucinated."

---

### 1:50 — 2:15 | Plan Approval + Future Projection

**Narrator:**

> "The commander is convinced. Let's approve the recommendation and see what SENTINEL predicts."

**[Person 1: Click "Approve" on the PlanCard. Wait for projection to appear.]**

**Narrator:**

> "With the action approved, SENTINEL projects the likely next state: medical gap closes at Grid 447, defensive posture improves, but it also flags a new risk — Echo-1's reposition leaves the northern sector with reduced medical coverage. This is the planning loop: see, understand, decide, and see what comes next."

---

### 2:15 — 2:40 | SITREP Generation

**Narrator:**

> "And when the commander needs to report up the chain, one click."

**[Person 1: Click "Generate SITREP". SITREP modal opens.]**

**Narrator:**

> "A complete situation report — threats, friendly status, actions taken, projected outlook — generated in seconds from the current operational state. No manual writing. No copy-paste across six systems."

**[Person 1: Scroll through SITREP sections briefly.]**

---

### 2:40 — 3:00 | Closing

**Narrator:**

> "SENTINEL takes what used to require a staff of analysts and hours of manual correlation, and delivers it in one screen, in real time."

> "Fused intelligence. Explainable AI. Actionable recommendations. Projected outcomes. Built in 24 hours by a team of three."

> "Better decisions. Not more data."

**[Hold on the dashboard for 5 seconds. End.]**

---

## Recovery Playbook

### If the AI response is slow (>5 seconds)

Person 3 fills time: "SENTINEL is processing the current threat landscape..." 

Person 1: If response arrives, continue. If >10 seconds, Person 2 triggers fallback mode from terminal. UI refreshes with cached response. Continue as normal.

### If the AI response is bad or malformed

Person 1: Do NOT draw attention to it. Click "Advance" again or reset the phase. Person 2 switches to fallback mode.

### If the query response is weak

Person 3: Summarize what the answer *should* say based on the visible state: "SENTINEL identifies Echo-1 as the best reinforcement option based on the unit readiness data we see here." Move on.

### If the map doesn't load

Person 1: Maximize the ORBAT panel and AI panel. Person 3: "We're focusing on the decision intelligence layer today — let me walk you through what SENTINEL is reasoning about."

### If everything breaks

Person 2: Switch to backup video immediately. Person 3: "Let me show you the full experience we built." Play the recording.

---

## Judge Q&A — Likely Questions + Answers

**"How would this work with real data?"**
> "The architecture is designed for it. The scenario engine would be replaced by real adapters — drone RTSP feeds, sensor APIs, radio transcription. The fusion layer and AI reasoning work identically regardless of whether inputs are real or simulated."

**"Why not use a local model?"**
> "For the hackathon, cloud API gives us the best reasoning quality. In production, this would run on AMD hardware using Mistral or Llama via ROCm — fully edge-native, zero cloud dependency. The API is a swap, not a redesign."

**"How does the scoring work?"**
> "Threat and readiness scores are computed deterministically — weighted formulas using severity, proximity, confidence, and resource levels. The AI doesn't own the scores; it explains them. This makes the system auditable and stable."

**"Is the AI just calling ChatGPT?"**
> "We use a structured prompting approach — the AI receives the exact operational state, a constrained task, and must return typed JSON. Every output is validated. The AI reasons about the data; it doesn't generate it."

**"What about security?"**
> "In production, SENTINEL would run air-gapped with AES-256 encrypted mesh sync between nodes. The prototype focuses on the intelligence and reasoning layer. Security hardening is a deployment-phase concern."
