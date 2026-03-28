# SENTINEL

**Situational Edge Intelligence for Networked Theater Operations & Logistics**

An AI-native mission intelligence and planning co-pilot that fuses battlefield-style inputs into one operational picture — explains threats, recommends actions, projects likely outcomes, and guides operators through structured incident analysis via a conversational chatbot.

| | |
|---|---|
| **Project type** | 24-hour hackathon prototype (AMD Slingshot 2026) |
| **Team** | Aimeblack — 3 active builders |
| **Primary user** | Commander / operator / analyst |
| **Core promise** | Input → fused picture → reasoning → recommendation → projected outcome |
| **Stack** | React + Vite + Tailwind · FastAPI + Pydantic · Claude API |

---

## Product Surfaces

SENTINEL has four user-facing surfaces:

### 1. World Monitor (Landing Page)
A premium intelligence dashboard that acts as the product entry point:
- **Live global map** in both 2D (Leaflet) and 3D (globe.gl) modes with 45+ toggleable data layers
- **Strategic signals:** conflict zones, nuclear sites, military bases, GPS jamming, cyber threats, armed conflict events
- **Finance & markets:** stock exchanges, commodity hubs, financial centres, crypto, central banks
- **AI Insights panel** with world brief and strategic posture view
- **Country Intelligence Index** — composite instability scoring across 12 signal streams
- **Cross-stream correlation** — military ↔ economic, disaster ↔ infrastructure, cyber ↔ escalation
- **Live feeds:** news, intel, forecasts, predictions, webcams
- **Metals, energy complex, and macro stress panels**

### 2. Login Page
Clean operator authentication surface with a live globe preview and product value proposition.

### 3. Strategic Console (Dashboard)
The core incident-to-decision intelligence interface — 3-column layout:

**Left column:**
- **Incident Intake (Surface 01)** — structured form fields: site, location, country, actor, attack type, severity (0–100), lat/lon, description
- **Intent Analysis (Surface 02)** — primary and alternate adversarial intents auto-derived from attack profile
- **Why This Site? (Surface 03)** — site-specific strategic lens explanation

**Centre column:**
- **Strategic Globe** — interactive 3D globe with incident marker (hot pink), response arcs (cyan/red/green), and risk zone markers
- **Response Path Selector (Surface 04)** — 5 selectable strategic response paths (Restraint, Defensive Reinforcement, Surveillance Surge, Diplomatic Signaling, Limited Calibrated Response)
- **Consequence Engine (Surface 05)** — implication summary and consequence highlights driven by selected path

**Right column:**
- **Scorecards (Surface 06)** — 6 computed scores: Threat Score, Intent Confidence, Escalation Risk, Civilian Impact, Diplomatic Cost, Strategic Stability
- **Trust Panel (Surface 07)** — top assumptions, weak evidence areas, confidence breakdown bars
- **Executive Brief (Surface 08)** — narrative brief + 3-window escalation timeline (6h / 24h / 72h)

### 4. SENTINEL Copilot (Chatbot Page)
A fully functional conversational operator surface for filling backend prompt placeholders:

- **Guided Q&A flow** — chatbot asks one question at a time for each incident field
- **Live progress tracking** — progress bar and sidebar chips update as each field is answered
- **Option buttons** — for categorical fields like attack type, clickable option chips appear automatically
- **Real backend integration** — fetches placeholder definitions from `GET /prompts/placeholders`
- **AI report generation** — on completion, calls `POST /prompts/execute` which runs the full AI pipeline
- **Inline report rendering** — scores (threat / readiness / escalation / confidence), threat assessment, key risks, recommendations with priority tags, projected outcome, and full SITREP
- **Fallback mode** — works with hardcoded placeholders if backend is unreachable

---

## Backend API

### Scenario & State

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/state` | Current world state (units, threats, alerts, scorecard) |
| `POST` | `/scenario/advance` | Advance to next scenario phase |
| `POST` | `/scenario/reset` | Reset to initial state |

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
| `POST` | `/prompts/execute` | Accept filled incident data, run AI threat assessment + SITREP, return full report |

---

## AI Pipeline

All AI calls use **Anthropic Claude** with four structured prompt templates in `backend/prompts/`:

| Template | Triggered by | Output |
|---|---|---|
| `threat_assessment.txt` | World state update, `/prompts/execute` | `ReasoningOutput` — assessment, risks, recommendations, projected outcome |
| `query_response.txt` | `POST /query` | `QueryResponse` — answer, supporting points, confidence |
| `sitrep.txt` | `GET /sitrep`, `/prompts/execute` | `SitrepOutput` — situation, threats, friendly status, recommended action, outlook |
| `future_projection.txt` | `POST /recommendation/approve` | `ProjectionOutput` — projected outcome, expected changes, new risks |

**Fallback mode:** If `FALLBACK_MODE=true` in `.env`, all AI calls return pre-authored responses from `fallback_outputs.py`. The system never crashes.

---

## Scoring Engine

Deterministic scoring in `threat_scorer.py` — no LLM dependency:

- **Threat Score** — severity × 0.40 + proximity pressure × 0.25 + confidence × 0.20 + 15 baseline
- **Readiness Score** — average resource levels (fuel/ammo/medical) weighted by unit status
- **Escalation Risk** — threat score × 0.60 + (100 − readiness) × 0.40
- **Confidence Score** — average threat confidence across all active threats

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in your API key
uvicorn main:app --reload --port 8000
```

Verify: `curl http://localhost:8000/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` — landing page loads. Navigate to:
- `/#/console` — Strategic Console
- `/#/chat` — SENTINEL Copilot (chatbot)

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

## Repository Structure

```
sentinel/
├── README.md                    ← You are here
├── BLUEPRINT.md                 ← Strategy, architecture, timeline, demo plan
├── IMPLEMENTATION_SPEC.md       ← Schemas, routes, scoring, build details
├── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx              ← All four surfaces (landing, login, console, chat)
│       ├── api/client.js        ← API client (state, query, sitrep, prompts)
│       ├── components/
│       │   ├── StrategicGlobe.jsx
│       │   ├── WorldMonitorGlobe.jsx
│       │   ├── WorldMonitorMap.jsx
│       │   └── PromptAssistantDrawer.jsx
│       └── data/monitorData.js  ← All static data for landing surface
├── backend/
│   ├── main.py                  ← FastAPI app + all routes
│   ├── models.py                ← Pydantic models (WorldState, IncidentInput, FullReportOutput…)
│   ├── ai_reasoning.py          ← Claude API integration (assess_threat, answer_query, project_future)
│   ├── threat_scorer.py         ← Deterministic scoring engine
│   ├── world_state.py           ← Live world state manager
│   ├── sitrep.py                ← SITREP generation
│   ├── scenario_engine.py       ← Scenario phase loader
│   ├── fallback_outputs.py      ← Pre-authored fallback responses
│   └── prompts/
│       ├── threat_assessment.txt
│       ├── query_response.txt
│       ├── sitrep.txt
│       └── future_projection.txt
└── data/
    ├── doctrine_context.txt
    └── area_briefing.txt
```

---

## Demo Flow (4 minutes)

1. **Landing** — global map, live feeds, AI insights, strategic posture overview
2. **Login** — clean entry with globe preview
3. **Chatbot** — open SENTINEL Copilot, answer 7 incident questions, generate AI report
4. **Console** — review scorecard, switch response paths, observe consequence engine
5. **Query** — open prompt assistant, ask a natural-language question
6. **Approve** — select a recommended action, view projected next state and SITREP

---

## Fallback Rules

- `FALLBACK_MODE=true` in `.env` → all AI calls return pre-authored JSON (no API key needed)
- If map breaks → static canvas with state cards still works
- If backend is unreachable → chatbot uses hardcoded placeholder definitions
- If everything breaks → serve the backup video recording
