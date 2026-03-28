# SENTINEL

**Situational Edge Intelligence for Networked Theater Operations & Logistics**

An AI-native mission intelligence co-pilot that fuses multi-source operational inputs into one explainable decision surface — deterministic scoring, structured AI reasoning, dynamic response-path comparison, and consequence projection.

| | |
|---|---|
| **Hackathon** | 24-hour hackathon — *Build the Impossible* |
| **Team** | 3 builders, 24 hours |
| **Primary user** | Commander / operator / analyst |
| **Core promise** | Fragmented inputs → one operational picture → explainable reasoning → projected outcome |
| **Stack** | React 19 + Vite + Tailwind · FastAPI + Pydantic · SQLite (auth) · Claude API |

---

## What is SENTINEL?

SENTINEL is a strategic command console that takes fragmented intelligence — unit positions, threat reports, sensor data, resource states — and compresses it into one coherent, explainable decision surface.

It is not a dashboard. It is not a chatbot. It is not a map.

It is a **fused operational picture** with:
- **Deterministic scoring** — threat level, readiness, escalation risk, confidence (no LLM dependency)
- **Structured AI reasoning** — assessment, recommendations, key risks, assumptions, provenance tracking
- **Backend-driven response paths** — live AI recommendations replace static options after threat assessment
- **Consequence projection** — approve a plan, see the predicted future state
- **Executive briefing** — one-click SITREP generation
- **Conversational intake** — guided chatbot collects incident fields and drives the full AI pipeline

The system helps a commander understand what is happening, why it matters, what the options are, what the AI recommends, and what will likely happen next — all in one screen.

---

## Product Surfaces

### 1. World Monitor (Landing Page)
A premium intelligence dashboard that acts as the product entry point:
- **Live global map** in both 2D (Leaflet/MapLibre) and 3D (globe.gl) modes with 45+ toggleable data layers
- **Strategic signals:** conflict zones, nuclear sites, military bases, GPS jamming, cyber threats, armed conflict events
- **Finance & markets:** stock exchanges, commodity hubs, financial centres, crypto, central banks
- **AI Insights panel** with world brief and strategic posture view
- **Country Intelligence Index** — composite instability scoring across 12 signal streams
- **Cross-stream correlation** — military ↔ economic, disaster ↔ infrastructure, cyber ↔ escalation
- **Live feeds:** news, intel, forecasts, predictions from `/feed/headlines` and `/feed/market-snapshot`
- **Metals, energy complex, and macro stress panels**

### 2. Login Page
SQLite-backed authentication with `pbkdf2_hmac` password hashing (260k iterations, per-user random salt).
- Demo credentials: `commander@sentinel.mil` / `sentinel2026`
- Clean operator entry with form validation, error handling, and live globe preview

### 3. Strategic Console
The core incident-to-decision intelligence interface — 3-column layout:

**Left column:**
- **Surface 01 — Incident Intake** — structured form: site, location, country, actor, attack type, severity (0–100), lat/lon, description. Fields auto-populate from backend `worldState.threats[0]` when available
- **Surface 02 — Intent Analysis** — primary adversarial intent and alternate hypotheses derived from backend AI reasoning (`assessment_summary`, `key_risks`)
- **Surface 03 — Why This Site?** — site-specific strategic context derived from backend reasoning

**Centre column:**
- **Theatre Board** — 2D SVG tactical map with unit markers, threat markers, incident markers, and CAS response arcs
- **Strategic Globe** — interactive 3D globe with incident marker (hot pink), response arcs, and risk zone markers
- **Surface 04 — Response Path Selector** — dynamically populated from backend `recommendations` array (falls back to 5 static paths when no AI reasoning is loaded)
- **Surface 05 — Consequence Engine** — implication summary and consequence highlights driven by selected recommendation

**Right column:**
- **Surface 06 — Scorecards** — 4 deterministic scores: Threat Score, Readiness, Escalation Risk, System Confidence
- **Surface 07 — Trust Panel** — top assumptions, weak evidence areas, confidence breakdown bars — all from backend reasoning
- **Surface 08 — Executive Brief** — narrative brief + escalation timeline from backend `projected_outcome`

### 4. SENTINEL Copilot (Chatbot)
A fully functional conversational operator surface for guided incident analysis:
- **Guided Q&A flow** — chatbot asks one question at a time for each incident field
- **Live progress tracking** — progress bar and sidebar chips update as each field is answered
- **Option buttons** — categorical fields like attack type show clickable option chips automatically
- **Real backend integration** — fetches definitions from `GET /prompts/placeholders`
- **AI report generation** — on completion, calls `POST /prompts/execute` which runs the full AI pipeline
- **State persistence** — on completion, the console immediately reflects the chat incident (actor, attack type, severity, location, lat/lon) via `/state` update
- **Inline report rendering** — scores, threat assessment, key risks, recommendations with priority tags, projected outcome, full SITREP
- **Fallback mode** — works with hardcoded placeholders if backend is unreachable

---

## Core System Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  1. INGEST     Scenario data loads: units, threats, alerts,      │
│                resources, objectives                             │
│                                                                  │
│  2. SCORE      Deterministic computation (no LLM):              │
│                threat level, readiness, escalation risk,         │
│                confidence score                                  │
│                                                                  │
│  3. REASON     Claude API produces structured assessment:        │
│                risks, assumptions, recommendations,              │
│                projected outcome, provenance tracking            │
│                                                                  │
│  4. COMPARE    Response paths derived from AI recommendations    │
│                (ID, action, rationale, priority, cost/effect).   │
│                Static fallback paths used before phase 1.        │
│                                                                  │
│  5. DECIDE     Commander approves an action                      │
│                                                                  │
│  6. PROJECT    System predicts the next state:                   │
│                expected changes, new risks, outlook              │
│                                                                  │
│  7. BRIEF      One-click SITREP generation for                   │
│                higher command reporting                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

The loop is **phase-driven**: advance through the scripted scenario (4 phases). Each advance triggers state update → score recomputation → AI reasoning → UI refresh.

---

## Backend API

### Scenario & State

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/state` | Full world state (units, threats, alerts, scorecard, reasoning) |
| `POST` | `/scenario/advance` | Advance to next scenario phase |
| `POST` | `/scenario/reset` | Reset to phase 0 |

### AI Reasoning

| Method | Route | Description |
|---|---|---|
| `POST` | `/query` | Answer a natural-language commander question |
| `GET` | `/sitrep` | Generate a structured SITREP from current world state |
| `POST` | `/recommendation/approve` | Approve a recommended action and get projected outcome |

### Chatbot / Prompt Filling

| Method | Route | Description |
|---|---|---|
| `GET` | `/prompts/placeholders` | Return the 7 incident placeholder definitions the chatbot uses |
| `POST` | `/prompts/execute` | Accept filled incident data, run full AI pipeline, persist to `/state`, return report |

### Live Feeds

| Method | Route | Description |
|---|---|---|
| `GET` | `/feed/headlines` | News/intel/world headlines (proxied) |
| `GET` | `/feed/market-snapshot` | Metals, energy, equities, macro stress data |

### Auth

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/login` | Login with email + password |
| `POST` | `/auth/logout` | Invalidate session token |
| `GET` | `/auth/me` | Get current user from session token |

---

## AI Pipeline

All AI calls use **Anthropic Claude** with four structured prompt templates in `backend/prompts/`:

| Template | Triggered by | Output |
|---|---|---|
| `threat_assessment.txt` | Phase advance, `/prompts/execute` | `ReasoningOutput` — assessment, risks, recommendations, projected outcome |
| `query_response.txt` | `POST /query` | `QueryResponse` — answer, supporting points, confidence |
| `sitrep.txt` | `GET /sitrep`, `/prompts/execute` | `SitrepOutput` — situation, threats, friendly status, recommended action, outlook |
| `future_projection.txt` | `POST /recommendation/approve` | `ProjectionOutput` — projected outcome, expected changes, new risks |

### Provenance Tracking
Every AI output is enriched with provenance metadata:
- `based_on_threat_ids` — which threats the recommendation references
- `based_on_unit_ids` — which units are cited
- `based_on_event_log` — recent events that informed the reasoning
- `confidence_drivers` — scored factors (source confidence, signal convergence, event recency, unit telemetry)

**Fallback mode:** If `FALLBACK_MODE=true` in `.env`, all AI calls return pre-authored responses from `fallback_outputs.py`. The system never crashes.

---

## Scoring Engine

Deterministic scoring in `threat_scorer.py` — no LLM dependency:

- **Threat Score** — severity × 0.40 + proximity pressure × 0.25 + confidence × 0.20 + 15 baseline
- **Readiness Score** — average resource levels (fuel/ammo/medical) weighted by unit status
- **Escalation Risk** — threat score × 0.60 + (100 − readiness) × 0.40
- **Confidence Score** — average threat confidence across all active threats

---

## Data Models

Key Pydantic models in `backend/models.py`:

```python
ThreatState         # threat_id, label, lat, lon, severity, confidence, summary,
                    # source_type, actor, attack_type, owner_country

IncidentInput       # attacked_site, location, owner_country, actor, attack_type,
                    # severity, description, latitude (optional), longitude (optional)

ReasoningOutput     # assessment_summary, key_risks, recommendations[], assumptions,
                    # projected_outcome, based_on_threat_ids, based_on_unit_ids,
                    # based_on_event_log, confidence_drivers

Recommendation      # action_id, action, priority, expected_effectiveness,
                    # resource_cost, rationale

WorldState          # theater_name, phase, units[], threats[], alerts[],
                    # scorecard, reasoning, approved_action_ids, event_log
```

---

## Technical Architecture

```
┌───────────────────────────────────────────────────────────┐
│  React 19 + Vite 8 + Tailwind CSS 4                       │  ← Frontend
│  App.jsx (all surfaces) · TheatreBoard · StrategicGlobe   │
│  useSentinelState hook · api/client.js                    │
│  Backend-driven incident sync · Computed response paths   │
├───────────────────────────────────────────────────────────┤
│  FastAPI + Pydantic                                        │  ← Backend
│  WorldStateManager · ScenarioEngine (4 phases)            │
│  ThreatScorer (deterministic) · Feed proxy routes         │
│  Auth router (SQLite + pbkdf2_hmac)                       │
│  Prompts execute → persists into /state                   │
├───────────────────────────────────────────────────────────┤
│  Claude API (Anthropic)                                    │  ← AI Layer
│  Structured prompts → JSON → Pydantic validation          │
│  Provenance enrichment (threat/unit/event traceability)   │
│  4-phase fallback reasoning pre-authored per phase        │
├───────────────────────────────────────────────────────────┤
│  SQLite — data/sentinel.db (auth)                         │  ← Data
│  JSON — scenario_alpha.json, units_initial.json           │
│  TXT — doctrine_context.txt, area_briefing.txt            │
│  JSON — landing_feed.json, market_snapshot.json           │
└───────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
sentinel/
├── README.md
├── render.yaml                       ← Render.com deployment config
├── .env.example
│
├── frontend/
│   ├── vercel.json                   ← Vercel SPA routing config
│   └── src/
│       ├── App.jsx                   ← All 4 surfaces, backend-driven console
│       ├── api/client.js             ← All API calls (state, auth, feeds, AI)
│       ├── hooks/
│       │   ├── useSentinelState.js   ← World state hook (fetchState exposed)
│       │   └── useLandingData.js     ← Landing feed data hook
│       ├── components/
│       │   ├── TheatreBoard.jsx      ← 2D SVG tactical map
│       │   ├── StrategicGlobe.jsx    ← 3D interactive globe
│       │   ├── WorldMonitorGlobe.jsx ← Landing page globe
│       │   └── WorldMonitorMap.jsx   ← Landing page flat map
│       └── pages/
│           └── LandingPage.jsx       ← 11-section landing scaffold
│
├── backend/
│   ├── main.py                       ← FastAPI app, routes, CORS
│   ├── models.py                     ← All Pydantic schemas (source of truth)
│   ├── world_state.py                ← State manager (load + advance phases)
│   ├── scenario_engine.py            ← Phase progression engine
│   ├── threat_scorer.py              ← Deterministic scorecard computation
│   ├── ai_reasoning.py               ← Claude API integration + provenance enrichment
│   ├── sitrep.py                     ← SITREP generation
│   ├── auth.py                       ← SQLite auth (pbkdf2_hmac, session tokens)
│   ├── config.py                     ← Settings (env vars)
│   ├── fallback_outputs.py           ← Pre-authored AI fallbacks (4 phases)
│   └── prompts/
│       ├── threat_assessment.txt
│       ├── query_response.txt
│       ├── sitrep.txt
│       └── future_projection.txt
│
└── data/
    ├── scenario_alpha.json           ← 4-phase mission scenario
    ├── units_initial.json            ← 6 deployed units with lat/lon + resources
    ├── doctrine_context.txt          ← Operational doctrine for AI grounding
    ├── area_briefing.txt             ← Theater area briefing
    ├── landing_feed.json             ← Curated news/intel headlines
    ├── market_snapshot.json          ← Financial/market data
    └── sentinel.db                   ← SQLite auth database (auto-created)
```

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

### Health Check
```bash
curl http://localhost:8000/health
```

### Environment Variables
```
AI_API_KEY=your_anthropic_api_key
AI_MODEL=claude-sonnet-4-20250514
AI_TIMEOUT=15
FALLBACK_MODE=false
FRONTEND_URL=http://localhost:5173
VITE_BACKEND_URL=http://localhost:8000
```

---

## Deployment

### Backend → [Render.com](https://render.com)
- **Root Directory:** `backend`
- **Build:** `pip install -r requirements.txt`
- **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Env vars:** `AI_API_KEY`, `AI_MODEL`, `FALLBACK_MODE`, `FRONTEND_URL` (set after Vercel deploy)

### Frontend → [Vercel](https://vercel.com)
- **Root Directory:** `frontend`
- **Build:** `npm run build` / **Output:** `dist`
- **Env var:** `VITE_BACKEND_URL=https://your-render-url.onrender.com`

---

## Demo Flow (3 minutes)

1. **Landing** — global map, live feeds, market signals, AI insights, strategic posture overview
2. **Login** — clean SQLite-backed auth with `commander@sentinel.mil`
3. **Chatbot** — open SENTINEL Copilot, answer 7 incident questions, generate AI report → console auto-updates
4. **Console** — review scorecards, AI-derived response paths (not hardcoded), intent analysis, trust panel
5. **Advance phases** — click "Next System Injection" to progress the scenario, watch all panels update
6. **Query** — ask a natural-language question in the prompt assistant
7. **Approve action** — view projected next state and consequence spread

---

## Fallback Rules

- `FALLBACK_MODE=true` in `.env` → all AI calls return pre-authored JSON per phase (no API key needed)
- If prompt execute fails → AI layer falls back to phase-matched `fallback_outputs.py` responses
- If backend is unreachable → chatbot uses hardcoded placeholder definitions
- If live phase progression is unstable → button-driven step advance (already implemented)
- If everything breaks → play the backup video recording

---

## Stage 1 Presentation Cheat Sheet

**Opening:**
> "SENTINEL is an AI-native mission intelligence co-pilot. It takes fragmented operational data, fuses it into one picture, reasons about threats, recommends actions, and projects outcomes. Think of it as a command-level decision surface powered by explainable AI."

**Three key points:**
1. One fused operational picture — not scattered tools
2. AI that explains *why*, not just *what* — every recommendation has grounded reasoning and provenance
3. Chat → console continuity — incident entered in the chatbot immediately drives the console view

**Closing line:**
> "SENTINEL turns fragmented inputs into one explainable decision surface. AI that explains why. Not just what."
