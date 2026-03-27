# SENTINEL

**Situational Edge Intelligence for Networked Theater Operations & Logistics**

An AI-native mission intelligence and planning co-pilot that fuses multiple battlefield-style inputs into one operational picture, explains threats, recommends actions, and projects likely next outcomes.

| | |
|---|---|
| **Project type** | 24-hour hackathon prototype (AMD Slingshot 2026) |
| **Team** | Aimeblack — 3 active builders |
| **Primary user** | Commander / operator / analyst |
| **Core promise** | Input → fused picture → reasoning → recommendation → projected outcome |
| **Stack** | React + Vite + Tailwind + Leaflet · FastAPI + Pydantic · Claude API |

---

## What It Does

- Loads a staged mission scenario from mock multi-source intelligence
- Fuses units, threats, alerts, and resources into one live world state
- Computes deterministic scores: threat level, readiness, escalation risk, confidence
- Uses an LLM for structured assessment, recommendations, NL query answers, future projection, and SITREP generation
- Lets the operator approve a recommended action and immediately see projected impact

## MVP Scope

| In the MVP | Not in the MVP |
|---|---|
| Single-screen command dashboard | Real classified data integration |
| Map with units and threat markers | Live video or drone inference |
| Deterministic threat scoring | Vector DB / RAG stack |
| AI recommendations with explanations | Persistent database layer |
| Commander NL query box | Secure comms / mesh sync / offline-first |
| One approve-plan → projection loop | Multi-agent reasoning loops |
| SITREP generation | Full doctrinal planning engine |

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env  # fill in your API key
uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — dashboard should load with initial state from backend.

### Environment

Copy `.env.example` to `.env` and set:

```
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-sonnet-4-20250514
BACKEND_URL=http://localhost:8000
```

## Repository Structure

```
sentinel-bms/
├── README.md                    ← You are here
├── BLUEPRINT.md                 ← Strategy, architecture, timeline, demo plan
├── IMPLEMENTATION_SPEC.md       ← Schemas, routes, scoring, build details
├── .env.example
├── frontend/                    ← React + Vite + Tailwind + Leaflet
├── backend/                     ← FastAPI + Pydantic + AI reasoning
│   └── prompts/                 ← LLM prompt templates
├── data/                        ← Scenario JSON, unit data, context files
└── docs/                        ← Demo script, agent tasks, panic playbook
    ├── DEMO_SCRIPT.md
    ├── AGENT_TASKS.md
    └── PANIC_PLAYBOOK.md
```

## Team Split

| Person 1 — Frontend | Person 2 — Backend | Person 3 — AI/Scenario |
|---|---|---|
| Dashboard layout | FastAPI app | Prompt engineering |
| Map + markers | Scenario engine | Structured AI outputs |
| ORBAT cards | World state manager | Fallback responses |
| AI panel + chat UX | Scoring + routes | Scenario data authoring |
| Visual polish | Integration ownership | Demo script + narration |

## Demo Flow (3 minutes)

1. Open dashboard — theater, units, and objective visible
2. Advance scenario — threat marker appears, scorecard updates
3. AI assessment and recommendation surface
4. Commander asks: "Who can reinforce Grid 447?"
5. Approve recommended action — projected next state appears
6. Generate SITREP — close with value proposition

## Key Documents

- **[BLUEPRINT.md](./BLUEPRINT.md)** — Why we're building this, what to build, what to cut, how to win
- **[IMPLEMENTATION_SPEC.md](./IMPLEMENTATION_SPEC.md)** — Pydantic models, API routes, scoring formulas, prompt strategy, frontend spec
- **[docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md)** — Exact 3-minute demo narration with fallback plans
- **[docs/AGENT_TASKS.md](./docs/AGENT_TASKS.md)** — Copy-paste task prompts for coding agents
- **[docs/PANIC_PLAYBOOK.md](./docs/PANIC_PLAYBOOK.md)** — Hour-12 emergency plan

## Fallback Rules

- If live phase progression is unstable → button-driven step advance
- If model output is unreliable → serve pre-validated fallback JSON by scenario phase
- If the map breaks → static operational canvas with same state cards
- If everything breaks → play the backup video recording
