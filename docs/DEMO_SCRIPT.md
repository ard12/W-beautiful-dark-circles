# SENTINEL — 3-Minute Demo Script

> **Person 3 owns this document.** This is the narration guide for the hackathon demo.

---

## Pre-Demo Checklist

- [ ] Backend running: `cd backend && uvicorn main:app --reload`
- [ ] Frontend running: `cd frontend && npm run dev`
- [ ] API key set in `.env` (or `FALLBACK_MODE=true` for safety)
- [ ] Browser open at `http://localhost:5173`
- [ ] Demo rehearsed at least once end-to-end

---

## Demo Flow (3 Minutes)

### Opening — Product Intro (30 sec)

"This is **SENTINEL** — an AI-native mission intelligence co-pilot. It takes fragmented operational data, fuses it into one picture, reasons about threats, recommends actions, and projects outcomes."

"Think of it as a command-level decision surface powered by AI reasoning."

### Dashboard Entry (15 sec)

Navigate to the command dashboard. Point out:
- **Left panel:** ORBAT — six deployed units with real-time resource status
- **Center:** Operational map — unit positions and threat markers in Theater Alpha
- **Right panel:** AI scorecard, assessment, recommendations, and query box

"One screen. Everything a commander needs."

### Phase 1 — Threat Emergence (45 sec)

Click **"Advance Phase"**.

"A hostile armored column has been detected moving south toward our chokepoint at Grid 447. Drone recon confirms three armored vehicles — severity 78 out of 100."

Point to:
- Threat marker appearing on the map
- Scorecard updating (threat score rising, escalation risk increasing)
- AI assessment panel showing structured reasoning
- Two recommendations: medevac and CAS engagement

"The AI reads the full operational picture — unit positions, resource levels, threats — and provides grounded, explainable recommendations. Not generic — specific to this situation."

### Commander Query (30 sec)

Type in query box: **"Who can reinforce Grid 447?"**

"The commander can ask natural-language questions. The system responds using only the actual operational state — no hallucination."

Point to the answer referencing specific units, grid positions, and resource levels.

### Approve & Project (30 sec)

Click **"Approve"** on the CAS recommendation.

"When the commander approves an action, the system projects the likely consequence. Echo-1 closes the medical gap, Viper-11 disrupts the hostile column — and it identifies new risks to watch."

Point to the projection panel showing expected changes and new risks.

### SITREP Generation (15 sec)

Click **"Generate SITREP"**.

"One click — a formal situation report covering the entire operational picture. Ready for higher command."

Point to the structured SITREP covering situation, threats, friendly status, recommendations, and outlook.

### Closing (15 sec)

"SENTINEL turns fragmented inputs into **one operational picture**, provides **explainable AI reasoning**, supports **commander decision-making**, and generates **projection and reporting** — all in real time."

"AI that explains **why**. Not just **what**."

---

## Judge Q&A Prep

| Question | Answer |
|---|---|
| What AI model are you using? | Claude API with structured JSON output, validated by Pydantic schemas |
| How do scores work? | Deterministic — threat score, readiness, escalation risk computed from unit/threat data. AI explains them, doesn't compute them |
| What if the AI fails? | Full fallback system — pre-authored responses for every phase. Panel never shows broken state |
| Is this real data? | Simulated scenario with realistic operational data. Designed for reliable demo, not live feeds |
| What's the tech stack? | React + Vite frontend, FastAPI backend, Claude API for reasoning, in-memory state |
| How is the AI grounded? | Every prompt includes current world state, doctrine notes, and area briefing. Output is constrained to JSON schema |

---

## Emergency Fallback

If live AI is slow or broken during demo:
1. Set `FALLBACK_MODE=true` in `.env` and restart backend
2. All AI outputs use pre-authored content — identical UX
3. Demo flow works exactly the same way
