# SENTINEL

**Situational Edge Intelligence for Networked Theater Operations & Logistics**

An AI-native mission intelligence co-pilot that fuses multi-source operational inputs into one explainable decision surface — with deterministic scoring, structured AI reasoning, response-path comparison, and consequence projection.

| | |
|---|---|
| **Hackathon** | 24-hour hackathon — *Build the Impossible* |
| **Team** | 3 builders, 24 hours |
| **Primary user** | Commander / operator / analyst |
| **Core promise** | Fragmented inputs → one operational picture → explainable reasoning → projected outcome |
| **Stack** | React + Vite + Tailwind · FastAPI + Pydantic · SQLite (auth) · Claude API |

---

## What is SENTINEL?

SENTINEL is a strategic command console that takes fragmented intelligence — unit positions, threat reports, sensor data, resource states — and compresses it into one coherent, explainable decision surface.

It is not a dashboard. It is not a chatbot. It is not a map.

It is a **fused operational picture** with:
- **deterministic scoring** (threat level, readiness, escalation risk, confidence)
- **structured AI reasoning** (assessment, recommendations, key risks, assumptions)
- **response-path comparison** (four strategic options with trade-offs)
- **consequence projection** (approve a plan, see the predicted future state)
- **executive briefing** (one-click SITREP generation)

The system helps a commander understand what is happening, why it matters, what the options are, what the AI recommends, and what will likely happen next — all in one screen.

---

## Why It Exists

In real operational environments, decision-makers face three compounding problems:

1. **Fragmented intelligence** — signals, imagery, ground reports, and logistics data live in separate systems with separate timelines
2. **Slow decision cycles** — by the time the picture is assembled, the situation has already changed
3. **Opaque AI** — most AI tools give answers without reasoning; in high-stakes environments, trust requires explanation

SENTINEL addresses all three by fusing inputs into a single picture, computing scores deterministically, and requiring the AI to explain every recommendation with grounded reasoning.

---

## Why This Fits "Build the Impossible"

Compressing multi-source intelligence fusion, threat assessment, response planning, and consequence forecasting into one coherent product surface is genuinely hard. It typically requires:
- teams of dozens
- months of development
- classified data pipelines
- complex geospatial systems

SENTINEL delivers the core decision loop — from incident intake to projected outcome — in a single product built in 24 hours. The impossibility is the compression: not faking the result, but building a real, explainable pipeline that a judge can walk through and understand in under three minutes.

---

## Product Surfaces

The MVP has three user-facing surfaces with distinct roles:

### 1. Landing Page
Premium product intro for judges. Explains the problem, the system, and the value proposition. Features live data feeds (headlines, market signals) pulled from backend proxy routes. A full scaffold with 11 sections exists at `frontend/src/pages/LandingPage.jsx`.

### 2. Login Page
SQLite-backed authentication with `pbkdf2_hmac` password hashing (260k iterations, per-user random salt). Demo credentials: `commander@sentinel.mil` / `sentinel2026`. Clean, product-grade entry with form validation and error handling.

### 3. Strategic Console
The core product. Three-column command layout:
- **Left** — Incident intake, intent analysis, strategic context
- **Center** — 2D Theatre Board (SVG tactical map) + 3D strategic globe
- **Right** — Scorecards, trust panel, AI reasoning, response-path selector

---

## Core System Loop

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. INGEST     Scenario data loads: units, threats, │
│                alerts, resources, objectives        │
│                                                     │
│  2. SCORE      Deterministic computation:           │
│                threat level, readiness, escalation   │
│                risk, confidence score               │
│                                                     │
│  3. REASON     Claude API produces structured       │
│                assessment: risks, assumptions,       │
│                recommendations, projected outcome   │
│                                                     │
│  4. COMPARE    Four response paths shown with       │
│                trade-offs and strategic labels       │
│                                                     │
│  5. DECIDE     Commander approves an action         │
│                                                     │
│  6. PROJECT    System predicts the next state:      │
│                expected changes, new risks, outlook  │
│                                                     │
│  7. BRIEF      One-click SITREP generation for      │
│                higher command reporting              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

The loop is **phase-driven**: the user advances through a scripted scenario. Each advance triggers state update → score recomputation → AI reasoning → UI refresh. This gives reliability, demo control, and a strong narrative.

---

## Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| Strategic console (3-column) | ✅ Implemented | Full incident-to-decision layout with all surfaces |
| 2D Theatre Board | ✅ Implemented | SVG tactical map with units, threats, incident markers, CAS response arcs |
| 3D Strategic Globe | ✅ Implemented | Interactive globe with incident markers, response arcs, risk zones |
| Deterministic threat scoring | ✅ Implemented | 4-axis scorecard: threat, readiness, escalation risk, confidence |
| AI-powered assessment | ✅ Implemented | Structured reasoning via Claude API with Pydantic validation |
| Commander NL queries | ✅ Implemented | Plain-language questions answered from operational state |
| Response-path comparison | ✅ Implemented | 4 strategic options with trade-off labels |
| Approve → projection loop | ✅ Implemented | Approve a plan, see predicted consequences |
| SITREP generation | ✅ Implemented | One-click formal situation report |
| AI chatbot / prompt assistant | ✅ Implemented | Structured incident intake → full AI pipeline → report output |
| SQLite login system | ✅ Implemented | pbkdf2_hmac auth with session tokens, login/logout/me endpoints |
| Landing page with live feeds | ✅ Implemented | Backend proxy routes for headlines and market data |
| Landing page scaffold (11-section) | 🟡 Scaffolded | Full React+Tailwind scaffold at `pages/LandingPage.jsx`, not yet wired to router |
| Live RSS / financial API proxy | 🟡 Scaffolded | Routes exist, serve local JSON (not yet connected to external APIs) |
| Multi-scenario library | ○ Planned | Currently single scenario (Theater Alpha) |
| Multi-agent reasoning | ○ Planned | Currently single orchestrated reasoning layer |
| Real external data feeds | ○ Planned | Currently simulated with curated JSON |

---

## Technical Architecture

```
┌───────────────────────────────────────────────┐
│  React 19 + Vite 8 + Tailwind CSS 4           │  ← Frontend
│  App.jsx · TheatreBoard · StrategicGlobe      │
│  LoginSurface · ChatSurface · LandingSurface  │
│  api/client.js (all API calls)                │
├───────────────────────────────────────────────┤
│  FastAPI + Pydantic                            │  ← Backend
│  WorldStateManager · ScenarioEngine            │
│  ThreatScorer · Feed proxy routes              │
│  Auth router (SQLite + pbkdf2_hmac)            │
├───────────────────────────────────────────────┤
│  Claude API (Anthropic)                        │  ← AI Layer
│  Structured prompts → JSON validation          │
│  Threat assessment · NL query · SITREP         │
│  Projection · Full report generation           │
├───────────────────────────────────────────────┤
│  SQLite — data/sentinel.db (auth)              │  ← Data
│  JSON — scenario_alpha, units_initial          │
│  TXT — doctrine_context, area_briefing         │
│  JSON — landing_feed, market_snapshot          │
└───────────────────────────────────────────────┘
```

### Backend API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Health check |
| `/state` | GET | Full world state snapshot |
| `/scenario/advance` | POST | Advance to next scenario phase |
| `/scenario/reset` | POST | Reset to phase 0 |
| `/query` | POST | Commander NL question → grounded answer |
| `/sitrep` | GET | Structured situation report |
| `/project` | POST | Consequence projection for approved action |
| `/report` | POST | Full incident report (chatbot pipeline) |
| `/prompts/placeholders` | GET | Prompt template fields for chatbot |
| `/feed/headlines` | GET | News headlines (proxy) |
| `/feed/market-snapshot` | GET | Financial/market data (proxy) |
| `/auth/login` | POST | Email + password login |
| `/auth/logout` | POST | Session invalidation |
| `/auth/me` | GET | Current user from session token |

---

## Repository Structure

```
sentinel/
├── README.md                         ← You are here
├── BLUEPRINT.md                      ← Strategy, architecture, timeline, demo plan
├── IMPLEMENTATION_SPEC.md            ← Schemas, routes, scoring, build details
├── ROLES.md                          ← Team ownership split and parallel work plan
│
├── frontend/
│   └── src/
│       ├── App.jsx                   ← Main app: surfaces, console, login, landing, chat
│       ├── api/client.js             ← All API calls (state, auth, feeds, AI)
│       ├── hooks/
│       │   ├── useSentinelState.js   ← World state hook
│       │   └── useLandingData.js     ← Landing feed data hook
│       ├── components/
│       │   ├── TheatreBoard.jsx      ← 2D SVG tactical map
│       │   ├── StrategicGlobe.jsx    ← 3D interactive globe
│       │   ├── WorldMonitorGlobe.jsx ← Landing page globe
│       │   ├── WorldMonitorMap.jsx   ← Landing page flat map
│       │   └── ...                   ← OrbatPanel, UnitCard, AiPanel, etc.
│       └── pages/
│           └── LandingPage.jsx       ← 11-section landing scaffold (not yet routed)
│
├── backend/
│   ├── main.py                       ← FastAPI app, routes, startup
│   ├── models.py                     ← All Pydantic schemas (source of truth)
│   ├── world_state.py                ← State manager (loads scenario + units)
│   ├── scenario_engine.py            ← Phase progression engine
│   ├── threat_scorer.py              ← Deterministic scorecard computation
│   ├── ai_reasoning.py               ← Claude API integration
│   ├── sitrep.py                     ← SITREP generation
│   ├── auth.py                       ← SQLite auth (pbkdf2_hmac)
│   ├── fallback_outputs.py           ← Pre-authored AI fallbacks
│   └── prompts/                      ← LLM prompt templates
│
├── data/
│   ├── scenario_alpha.json           ← 4-phase mission scenario
│   ├── units_initial.json            ← 6 deployed units with lat/lon
│   ├── doctrine_context.txt          ← Operational doctrine for AI grounding
│   ├── area_briefing.txt             ← Theater area briefing
│   ├── landing_feed.json             ← Curated news headlines
│   ├── market_snapshot.json          ← Financial/market data
│   └── sentinel.db                   ← SQLite auth database (auto-created)
│
└── docs/
    ├── DEMO_SCRIPT.md                ← 3-minute demo narration + Q&A prep
    ├── AGENT_TASKS.md                ← Copy-paste task prompts for coding agents
    └── PANIC_PLAYBOOK.md             ← Emergency fallback plan
```

---

## Team Roles

| Person 1 — Frontend | Person 2 — Backend / Integration | Person 3 — AI / Scenario / Demo |
|---|---|---|
| Dashboard layout & all surfaces | FastAPI app & all routes | Prompt engineering |
| TheatreBoard, Globe, Maps | World state & scenario engine | Structured AI outputs |
| ORBAT cards & UX polish | Scoring, auth, feed proxy | Fallback responses |
| Login surface & visual design | Integration gatekeeper | Demo script & narration |

---

## Demo & Presentation Relevance

### 3-Minute Demo Arc
1. **Landing page** — product vision, problem framing, live data
2. **Login** — clean SQLite-backed auth entry
3. **Console loads** — theater, units, theatre board, objective visible
4. **Advance scenario** — threat marker appears, scorecard updates, Theatre Board highlights
5. **AI assessment** — structured reasoning with recommendations
6. **Commander query** — "Who can reinforce Grid 447?" — grounded answer
7. **Approve action** — projected next state appears with new risks
8. **Generate SITREP** — formal report, close with value proposition

### Stage 1 Selection — Strongest Angles
- **Problem**: Fragmented intelligence kills decision speed. SENTINEL compresses the cycle.
- **Impossible**: Full fusion-to-projection pipeline built in 24 hours by 3 people.
- **Progress**: Working product with 14 API routes, 3 surfaces, SVG theatre board, auth system.
- **Why now**: AI reasoning is finally good enough to make explainable assessment practical at hackathon scale.

---

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env      # Set AI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — landing page loads. Login with `commander@sentinel.mil` / `sentinel2026`.

### Environment Variables
```
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-sonnet-4-20250514
BACKEND_URL=http://localhost:8000
```

### Health Check
```bash
curl http://localhost:8000/health
```

---

## Immediate Next Steps

1. **Wire landing scaffold** — replace inline `LandingSurface` with the 11-section `LandingPage.jsx`
2. **Add logout button** — the `handleLogout` function exists in App.jsx but has no UI button in the console header
3. **Console screenshots** — embed in the landing page scaffold for visual proof
4. **Polish Theatre Board** — add grid labels and optional terrain shading
5. **External feed integration** — connect proxy routes to real RSS / financial APIs

---

## Fallback Rules

- If live AI is slow or broken → set `FALLBACK_MODE=true` in `.env` — pre-authored responses serve identical UX
- If live phase progression is unstable → button-driven step advance (already implemented)
- If the map breaks → static Theatre Board canvas with same state data
- If everything breaks → play the backup video recording

---

## Document Guide

| Document | Purpose |
|----------|---------|
| `BLUEPRINT.md` | Full strategy, architecture, timeline, and demo plan |
| `IMPLEMENTATION_SPEC.md` | Pydantic models, API routes, scoring formulas, prompt strategy, frontend spec |
| `ROLES.md` | Team ownership split and parallel work plan |
| `docs/DEMO_SCRIPT.md` | Exact 3-minute demo narration with judge Q&A prep |
| `docs/AGENT_TASKS.md` | Copy-paste task prompts for coding agents |
| `docs/PANIC_PLAYBOOK.md` | Emergency triage and fallback plan |

---

## Stage 1 Presentation Cheat Sheet

**Opening (20 seconds):**
> "SENTINEL is an AI-native mission intelligence co-pilot. It takes fragmented operational data, fuses it into one picture, reasons about threats, recommends actions, and projects outcomes. Think of it as a command-level decision surface powered by explainable AI."

**Three key points:**
1. One fused operational picture — not scattered tools
2. AI that explains *why*, not just *what* — every recommendation has grounded reasoning
3. Approve a plan, see the projected consequence — the commander stays in the loop

**Three proof-of-progress points:**
1. Working 3-surface product: landing → login → strategic console
2. 14 live API routes including auth, feeds, AI reasoning, and projection
3. 2D Theatre Board with animated tactical visualization

**Two challenge points:**
1. Getting Claude to produce consistent structured JSON under hackathon time pressure
2. Balancing visual ambition with build stability in 24 hours

**Closing line:**
> "SENTINEL turns fragmented inputs into one explainable decision surface. AI that explains why. Not just what."
