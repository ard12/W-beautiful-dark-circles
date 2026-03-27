# SENTINEL — Coding Agent Task Breakdown

> Copy-paste task definitions for Antigravity, Codex, or similar coding agents.  
> Each task is self-contained with scope, constraints, and expected output.

---

## Before Handing Off to Agents

Lock these first (human decision):

- [ ] Schema shapes in `models.py` (finalized)
- [ ] API route surface (6 routes — see IMPLEMENTATION_SPEC.md §6)
- [ ] Scenario JSON structure (see IMPLEMENTATION_SPEC.md §3)
- [ ] Frontend layout (3-column — see IMPLEMENTATION_SPEC.md §10)
- [ ] Color system (see IMPLEMENTATION_SPEC.md §10)

**Do not** delegate to agents until these are agreed.

---

## Agent Task 1: Backend Foundation

**Owner:** Person 2 / Backend agent  
**Scope:** FastAPI app, models, world state, scenario engine, scoring  
**Input files needed:** `data/units_initial.json`, `data/scenario_alpha.json`

### Prompt

```
Build a FastAPI backend for a military command dashboard called SENTINEL.

REQUIREMENTS:

1. Create `backend/models.py` with these exact Pydantic v2 models:
   - ResourceState (fuel, ammo, medical — all int 0-100)
   - UnitState (unit_id, name, role, status literal, lat/lng, grid_ref optional, resources)
   - ThreatState (threat_id, label, lat/lng, severity 0-100, confidence 0-100, summary, source_type)
   - AlertState (alert_id, level literal, title, summary, linked_threat_id optional)
   - Recommendation (action_id, action, priority literal, expected_effectiveness 0-1, resource_cost 0-1, rationale)
   - ScoreCard (threat_score, readiness_score, escalation_risk, confidence_score — all 0-100)
   - ReasoningOutput (assessment_summary, key_risks list, recommendations list, assumptions list, projected_outcome)
   - QueryResponse (answer, supporting_points list, confidence 0-1)
   - SitrepOutput (situation, threats, friendly_status, recommended_action, projected_outlook)
   - ProjectionOutput (projected_outcome, expected_changes list, new_risks list)
   - WorldState (theater_name, current_phase_index, phase_title, objective, units list, threats list, alerts list, scorecard, reasoning optional, approved_action_ids list, event_log list)

2. Create `backend/world_state.py` — WorldStateManager class:
   - initialize(): loads units from data/units_initial.json, loads scenario from data/scenario_alpha.json
   - get_state() -> WorldState
   - advance_phase() -> WorldState (applies next phase events, recomputes scores)
   - approve_action(action_id) -> WorldState
   - reset() -> WorldState

3. Create `backend/scenario_engine.py`:
   - Reads scenario JSON file
   - Returns events for a given phase index
   - Supports event types: intel_report, threat_detected, unit_move, resource_change, status_change

4. Create `backend/threat_scorer.py`:
   - compute_scorecard(units, threats) -> ScoreCard
   - Deterministic formulas: threat_score weighted by severity/proximity/confidence, readiness from avg resource levels and status, escalation_risk from threat+readiness inverse

5. Create `backend/main.py` — FastAPI app with CORS:
   - GET /health -> {"status": "ok"}
   - GET /state -> WorldState
   - POST /scenario/advance -> WorldState (with fresh scorecard)
   - POST /scenario/reset -> WorldState
   - POST /query -> stub that returns {"answer": "...", "supporting_points": [], "confidence": 0.5}
   - POST /recommendation/approve body: {"action_id": "A-1"} -> WorldState
   - GET /sitrep -> stub SitrepOutput

CONSTRAINTS:
- Python 3.11+, FastAPI, Pydantic v2, uvicorn
- No database — all state in memory
- No Docker
- CORS enabled for http://localhost:5173
- Load .env with python-dotenv
- Keep functions small and testable
- Return consistent JSON matching the Pydantic models exactly
```

---

## Agent Task 2: AI Reasoning Layer

**Owner:** Person 3 / AI agent  
**Scope:** LLM integration, prompt templates, fallback responses  
**Input files needed:** Prompt templates from `backend/prompts/`, context files from `data/`

### Prompt

```
Build the AI reasoning layer for SENTINEL, a military command dashboard.

REQUIREMENTS:

1. Create `backend/ai_reasoning.py` with these async functions:
   - assess_threat(state: WorldState, doctrine: str, area_briefing: str) -> ReasoningOutput
   - answer_query(state: WorldState, question: str, doctrine: str, area_briefing: str) -> QueryResponse
   - project_future(state: WorldState, action_description: str, doctrine: str) -> ProjectionOutput
   - generate_sitrep(state: WorldState, doctrine: str) -> SitrepOutput

2. Each function must:
   - Build a compact context string from the WorldState (unit summaries, threat summaries, scorecard, recent events)
   - Load the appropriate prompt template from backend/prompts/
   - Inject the context into the template
   - Call the Anthropic Claude API using httpx
   - Parse the JSON response
   - Validate with the appropriate Pydantic model
   - Return the validated object

3. Use this API call pattern:
   ```python
   async with httpx.AsyncClient() as client:
       response = await client.post(
           "https://api.anthropic.com/v1/messages",
           headers={
               "x-api-key": api_key,
               "anthropic-version": "2023-06-01",
               "content-type": "application/json"
           },
           json={
               "model": model_name,
               "max_tokens": 1024,
               "messages": [{"role": "user", "content": prompt}]
           },
           timeout=10.0
       )
   ```

4. Create `backend/fallback_outputs.py`:
   - Dictionary of pre-authored ReasoningOutput, QueryResponse, SitrepOutput objects keyed by (scenario, phase_index) or (scenario, query_keyword)
   - These are used when the API fails, times out, or returns unparseable output

5. Error handling:
   - Wrap every API call in try/except
   - Strip markdown code fences from response before JSON parse
   - If JSON parse fails, try extracting JSON from between { and }
   - If Pydantic validation fails, log error and return fallback
   - If API call takes >8 seconds, return fallback
   - Never raise an exception to the caller — always return a valid object

CONSTRAINTS:
- Use httpx for async HTTP calls
- API key from environment variable AI_API_KEY
- Model from environment variable AI_MODEL (default: claude-sonnet-4-20250514)
- All outputs must be valid instances of the Pydantic models defined in models.py
- Import models from models.py, do not redefine them
```

---

## Agent Task 3: Frontend Dashboard

**Owner:** Person 1 / Frontend agent  
**Scope:** React app, layout, map, all UI components  
**Input:** Mock data matching the WorldState schema from the backend

### Prompt

```
Build a React dashboard for SENTINEL, a military command system.

REQUIREMENTS:

1. Setup: React 18 + Vite + TailwindCSS + react-leaflet

2. App.jsx — main layout:
   - Dark background (#0a0e1a)
   - Header bar at top
   - Three columns below: left (20%), center (50%), right (30%)
   - On mount, fetch GET /state from http://localhost:8000

3. Header.jsx:
   - Show: "SENTINEL" | theater name | phase title | threat level badge (color-coded)
   - Right side: "Reset" button (calls POST /scenario/reset)

4. OrbatPanel.jsx (left column):
   - Mission objective text at top
   - List of UnitCard components
   - Each UnitCard shows: unit name, role, status (color dot: green/yellow/red), three horizontal bars for fuel/ammo/medical (green >60, yellow 30-60, red <30)

5. MapView.jsx (center column):
   - react-leaflet map with CartoDB Dark Matter tiles (URL: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png)
   - Center on [34.1, 71.5], zoom 11
   - Green circle markers for friendly units with label popup
   - Red pulsing circle markers for threats with label popup
   - No extra controls needed

6. TimelineControls.jsx (below map):
   - "Advance Phase" button → calls POST /scenario/advance → updates all state
   - "Reset" button → calls POST /scenario/reset
   - Show "Phase X of Y" text

7. Right column — stacked vertically:
   a. Scorecard: four horizontal bars (Threat, Readiness, Escalation, Confidence) with numeric labels
   b. AiPanel: assessment summary text, key risks list, assumptions list
   c. PlanCard: if recommendations exist, show action + rationale + "Approve" button. Approve calls POST /recommendation/approve with {"action_id": "..."}, then shows projection result
   d. QueryBox: text input + submit button. Calls POST /query with {"question": "..."}. Shows answer and supporting points below
   e. "Generate SITREP" button → calls GET /sitrep → opens SitrepModal

8. SitrepModal.jsx:
   - Overlay modal with dark background
   - Shows SITREP sections: Situation, Threats, Friendly Status, Recommended Action, Projected Outlook
   - Close button

9. State management:
   - useState for worldState, reasoning, queryAnswer, sitrep, loading flags
   - When /scenario/advance returns, update all state from response
   - Show loading spinner on buttons during API calls

10. API client (src/api/client.js):
    - Base URL from env or default http://localhost:8000
    - Functions: getState(), advancePhase(), resetScenario(), submitQuery(question), approveAction(actionId), getSitrep()

COLOR SYSTEM:
- Background: #0a0e1a
- Card surface: #111827
- Border: #1f2937
- Text primary: #e5e7eb
- Text secondary: #9ca3af
- Accent/headers: #f59e0b (amber)
- Status green: #22c55e
- Status yellow: #eab308
- Status red: #ef4444
- Status blue: #3b82f6

CONSTRAINTS:
- No TypeScript — use .jsx
- No state management library — just React hooks
- No CSS files beyond Tailwind — use utility classes only
- Handle loading and error states for every API call
- Never show blank panels — show placeholder text if no data
```

---

## Agent Task 4: Scenario Data + Context Files

**Owner:** Person 3 (human-authored, agent can help with formatting)  
**Scope:** JSON data files, doctrine text, area briefing

### Prompt

```
Create the data files for SENTINEL's demo scenario.

1. data/units_initial.json — 6 units:
   - Alpha-1: Infantry, ready, Grid 441, fuel 88, ammo 92, medical 85
   - Bravo-2: IFV, ready, Grid 443, fuel 71, ammo 78, medical 64
   - Charlie-1: Armor, ready, Grid 440, fuel 67, ammo 81, medical 72
   - Echo-1: Medical, ready, Grid 449, fuel 78, ammo 30, medical 100
   - Viper-11: CAS, ready, Grid 451, fuel 90, ammo 85, medical 95
   - Hotel-6: Logistics, ready, Grid 438, fuel 95, ammo 40, medical 60

   All positions should be realistic coordinates near lat 34.0-34.2, lon 71.4-71.6.
   Format must match the UnitState Pydantic model with nested ResourceState.

2. data/scenario_alpha.json — 4 phases:
   Phase 0 "Initial Positioning": one intel_report about intercepted comms
   Phase 1 "Threat Emergence": threat_detected (hostile armored column at Grid 447) + resource_change (Bravo-2 medical drops to 0)
   Phase 2 "Response Window": resource_change (Charlie-1 fuel drops to 34) + intel_report confirming threat staging
   Phase 3 "Post-Action": status_change (Bravo-2 moving for medevac) + intel_report (hostile dispersed)

3. data/doctrine_context.txt — 200 words of fictional operational doctrine covering:
   - Force protection priorities
   - Escalation thresholds
   - Medical evacuation protocols
   - CAS request authority levels
   - Resupply window guidelines

4. data/area_briefing.txt — 200 words covering:
   - Theater Alpha geography (mountainous terrain, eastern corridor is key chokepoint)
   - Known hostile force disposition
   - Friendly force mission
   - Key terrain and grid references
   - Weather/terrain constraints

FORMAT: JSON files must be valid and match the Pydantic schemas exactly. Text files are plain text.
```

---

## What Should NOT Be Delegated

- **Final scenario narrative** — Person 3 should write or heavily edit the scenario to ensure it tells a compelling story
- **Prompt template tuning** — run each prompt 3-5 times and iterate until output quality is consistently good
- **Visual polish** — agents produce functional but generic UIs; Person 1 must tune colors, spacing, animations
- **Integration testing** — Person 2 must manually test the full flow after merging all pieces
- **Demo narration** — Person 3 writes and rehearses the script

## Human Review Gates

After each agent task completes:

1. Run the code — does it start without errors?
2. Check API responses — do they match the Pydantic schemas?
3. Check AI outputs — are they coherent, specific, and grounded?
4. Check styling — does it look like a military ops room, not a default React app?
5. Test the full path — can you go from Phase 0 to SITREP without breaking?
