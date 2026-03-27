# SENTINEL — Role Split & Parallel Work Plan

---

## Person 1 — Frontend

**Owns:**
- `frontend/` (entire directory)
- All `.jsx` components, hooks, styles
- Visual design, layout, dark theme, map rendering
- UX polish and demo-readiness on projector

**Starts with:**
1. Vite + React + Tailwind scaffold
2. 3-column layout in `App.jsx` (dark background, placeholder cards)
3. `MapView.jsx` with dark tiles and 3 hardcoded markers

**Do not change without team discussion:**
- `backend/models.py` (data shapes)
- API route signatures
- Scenario JSON structure

**Depends on:**
- Person 2 delivers `/state` endpoint by Hour 2 (use mock JSON until then)
- Person 2 delivers `/scenario/advance` by Hour 5
- Agreed WebSocket/REST message shapes locked by Hour 1

**Hands off to:**
- Person 2 for any backend CORS or response format issues
- Person 3 for AI panel text content and label wording

---

## Person 2 — Backend + Integration

**Owns:**
- `backend/main.py`, `config.py`, `models.py`, `world_state.py`, `scenario_engine.py`, `threat_scorer.py`
- `backend/routes/` (all route files)
- `data/units_initial.json`, `data/scenario_alpha.json`
- Final integration merge — Person 2 is the gatekeeper for connecting frontend ↔ backend ↔ AI

**Starts with:**
1. `models.py` — all Pydantic schemas (lock by Hour 1)
2. `main.py` — FastAPI skeleton with CORS, `/health`, `/state`
3. `world_state.py` — initialize from JSON, return snapshot
4. `scenario_engine.py` — phase reader

**Do not change without team discussion:**
- Prompt templates in `backend/prompts/`
- Fallback response content in `fallback_outputs.py`
- Frontend component structure

**Depends on:**
- Person 3 delivers `ai_reasoning.py` function signatures by Hour 2
- Person 3 delivers working `assess_threat()` by Hour 6

**Hands off to:**
- Person 1: the exact JSON shape returned by each endpoint (document early)
- Person 3: the `WorldState` snapshot format that gets injected into prompts

---

## Person 3 — AI + Scenario + Demo

**Owns:**
- `backend/ai_reasoning.py`, `backend/sitrep.py`, `backend/fallback_outputs.py`
- `backend/prompts/` (all `.txt` templates)
- `data/doctrine_context.txt`, `data/area_briefing.txt`
- `docs/DEMO_SCRIPT.md` — demo narration and judge Q&A prep
- Demo narrative ownership — Person 3 decides what the demo says and shows

**Starts with:**
1. Test Claude API call — confirm key works, measure latency
2. Draft `threat_assessment.txt` prompt template
3. Implement `assess_threat()` in `ai_reasoning.py` with one working end-to-end call
4. Author fallback response for Phase 1 (the critical demo phase)

**Do not change without team discussion:**
- `models.py` schema shapes
- API route signatures
- Scenario JSON structure (co-owned with Person 2)

**Depends on:**
- Person 2 delivers `WorldState` snapshot format by Hour 1 (needed to build prompt context)
- Person 2 wires AI functions into routes by Hour 8

**Hands off to:**
- Person 2: validated `ai_reasoning.py` functions to be called from routes
- Person 1: final text labels, severity wording, and recommendation copy for the AI panel

---

## Parallel Work Plan — Hours 0–6

```
Hour 0-1 (ALL TOGETHER)
├── Lock: models.py schema shapes
├── Lock: API route list + response formats
├── Lock: scenario_alpha.json structure
├── Everyone: repo setup, deps installed, API key tested
│
Hour 1-3 (FULLY PARALLEL)
├── P1: 3-column layout + Header + MapView with mock data
├── P2: /health + /state + world_state.py + scenario_engine.py
├── P3: First prompt template + first working AI call + first fallback
│
Hour 3-6 (PARALLEL WITH ONE SYNC)
├── P1: OrbatPanel + UnitCard + scorecard display (still using mock JSON)
├── P2: /scenario/advance + threat_scorer.py + wire AI into advance route
├── P3: All 4 prompt templates drafted + query handler + fallback for Phase 0-1
│
└── SYNC at Hour 3: Confirm /state returns real data. P1 switches from mock to live API.
```

**Hour 8 checkpoint:** First full demo path runs end-to-end. If it doesn't, evaluate cuts per `PANIC_PLAYBOOK.md`.

---

## Shared No-Touch Rules

| File / Area | Owner | Others must ask before editing |
|---|---|---|
| `models.py` | Person 2 | Everyone |
| `scenario_alpha.json` | Person 2 + 3 | Person 1 |
| `ai_reasoning.py` | Person 3 | Person 2 |
| `prompts/*.txt` | Person 3 | Everyone |
| `App.jsx` layout structure | Person 1 | Everyone |
| Route response shapes | Person 2 | Everyone |
