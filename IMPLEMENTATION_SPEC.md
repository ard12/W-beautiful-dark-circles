# SENTINEL — Implementation Specification

> Build-ready technical plan for the hackathon MVP.  
> Optimized for 3 people, 24 hours, and agent-friendly execution.

---

## 1. Build Principles

**Core rule:** AI interprets. Backend validates and scores. Frontend visualizes.

### Non-negotiables
- Ship one strong end-to-end path
- Prefer simulation over fragile integrations
- Prefer structured outputs over free-form AI text
- Keep state simple and inspectable
- Make the demo deterministic enough to survive pressure

### Avoid
- Custom databases, Docker, local models, vector databases
- Multi-agent frameworks, real-time external feeds
- Complex RBAC or enterprise auth (Supabase Auth is acceptable — it’s hackathon-friendly)
- Overbuilt abstractions

---

## 2. Data Models

All shared data shapes live in `backend/models.py`. This file is the single source of truth.

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class ResourceState(BaseModel):
    fuel: int = Field(ge=0, le=100)
    ammo: int = Field(ge=0, le=100)
    medical: int = Field(ge=0, le=100)


class UnitState(BaseModel):
    unit_id: str
    name: str
    role: str  # e.g. "infantry", "armor", "medical", "logistics", "cas", "recon"
    status: Literal["ready", "moving", "engaged", "degraded", "offline"]
    latitude: float
    longitude: float
    grid_ref: Optional[str] = None
    resources: ResourceState


class ThreatState(BaseModel):
    threat_id: str
    label: str
    latitude: float
    longitude: float
    severity: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=100)
    summary: str
    source_type: str  # e.g. "comms_intercept", "drone_recon", "ground_sensor", "osint"


class AlertState(BaseModel):
    alert_id: str
    level: Literal["low", "medium", "high", "critical"]
    title: str
    summary: str
    linked_threat_id: Optional[str] = None


class Recommendation(BaseModel):
    action_id: str
    action: str
    priority: Literal["low", "medium", "high", "critical"]
    expected_effectiveness: float = Field(ge=0, le=1)
    resource_cost: float = Field(ge=0, le=1)
    rationale: str


class ScoreCard(BaseModel):
    threat_score: float = Field(ge=0, le=100)
    readiness_score: float = Field(ge=0, le=100)
    escalation_risk: float = Field(ge=0, le=100)
    confidence_score: float = Field(ge=0, le=100)


class ReasoningOutput(BaseModel):
    assessment_summary: str
    key_risks: List[str]
    recommendations: List[Recommendation]
    assumptions: List[str]
    projected_outcome: str


class QueryResponse(BaseModel):
    answer: str
    supporting_points: List[str]
    confidence: float = Field(ge=0, le=1)


class SitrepOutput(BaseModel):
    situation: str
    threats: str
    friendly_status: str
    recommended_action: str
    projected_outlook: str


class ProjectionOutput(BaseModel):
    projected_outcome: str
    expected_changes: List[str]
    new_risks: List[str]


class WorldState(BaseModel):
    theater_name: str
    current_phase_index: int
    phase_title: str
    objective: str
    units: List[UnitState]
    threats: List[ThreatState]
    alerts: List[AlertState]
    scorecard: ScoreCard
    reasoning: Optional[ReasoningOutput] = None
    approved_action_ids: List[str] = []
    event_log: List[str] = []
```

---

## 3. Scenario Design

### Philosophy

One scenario with 3–5 clean phases. One strong narrative arc. Don't try to support many modes.

### Scenario JSON Shape

```json
{
  "theater_name": "Theater Alpha",
  "objective": "Stabilize Sector East and prevent hostile escalation near Grid 447.",
  "initial_threat_level": "elevated",
  "phases": [
    {
      "phase_index": 0,
      "title": "Initial Positioning",
      "events": [
        {
          "type": "intel_report",
          "summary": "SIGINT intercept suggests hostile movement near eastern corridor. Source: comms_intercept."
        }
      ]
    },
    {
      "phase_index": 1,
      "title": "Threat Emergence",
      "events": [
        {
          "type": "threat_detected",
          "threat": {
            "threat_id": "T-1",
            "label": "Hostile armored column",
            "latitude": 34.125,
            "longitude": 71.552,
            "severity": 78,
            "confidence": 71,
            "summary": "3x armored vehicles detected moving south toward Grid 447. Estimated arrival: 45 minutes.",
            "source_type": "drone_recon"
          }
        },
        {
          "type": "resource_change",
          "unit_id": "U-2",
          "resource_patch": { "medical": 0 }
        }
      ]
    },
    {
      "phase_index": 2,
      "title": "Response Window",
      "events": [
        {
          "type": "resource_change",
          "unit_id": "U-3",
          "resource_patch": { "fuel": 34 }
        },
        {
          "type": "intel_report",
          "summary": "Ground sensor confirms hostile column has halted at Grid 445. Possible staging for assault."
        }
      ]
    },
    {
      "phase_index": 3,
      "title": "Post-Action",
      "events": [
        {
          "type": "status_change",
          "unit_id": "U-2",
          "new_status": "moving"
        },
        {
          "type": "intel_report",
          "summary": "Hostile column has dispersed following CAS engagement. BDA pending."
        }
      ]
    }
  ]
}
```

### Supported Event Types (MVP only)

| Type | Description | Key Fields |
|---|---|---|
| `intel_report` | Text intelligence update | `summary` |
| `threat_detected` | New threat marker | `threat` (ThreatState object) |
| `unit_move` | Unit repositions | `unit_id`, `latitude`, `longitude` |
| `resource_change` | Fuel/ammo/medical change | `unit_id`, `resource_patch` |
| `status_change` | Unit status update | `unit_id`, `new_status` |
| `plan_approved` | Action was approved | `action_id` |

---

## 4. World State Management

### Principle

In-memory for runtime speed. Supabase available for auth and optional persistence. One Python class manages the operational world state.

### Manager Interface

```python
class WorldStateManager:
    def initialize(self) -> None:
        """Load units from units_initial.json, load scenario metadata."""

    def get_state(self) -> WorldState:
        """Return current snapshot."""

    def advance_phase(self) -> WorldState:
        """Apply next phase events, recompute scores, run AI reasoning."""

    def approve_action(self, action_id: str) -> WorldState:
        """Record approval, compute projection, return updated state."""

    def reset(self) -> WorldState:
        """Reset to initial state."""
```

### State Update Flow

1. `advance_phase()` reads next phase from scenario JSON
2. Applies each event: adds threats, updates unit resources/status/position, appends to event log
3. Calls `ThreatScorer.compute()` → updates scorecard
4. Calls `AIReasoning.assess()` → updates reasoning output
5. Returns complete WorldState snapshot

---

## 5. Threat Scoring

### Why Deterministic

Scores must be stable, explainable, and demo-safe. The LLM does not own scores — it explains them.

### Formulas

All inputs normalized to 0–100. All outputs 0–100.

```python
def compute_threat_score(threats: list, units: list) -> float:
    if not threats:
        return 0.0
    max_threat = max(threats, key=lambda t: t.severity)
    severity = max_threat.severity
    confidence = max_threat.confidence
    # Proximity: how close is the nearest friendly unit? (simplified)
    proximity = compute_proximity_pressure(max_threat, units)
    return severity * 0.40 + proximity * 0.25 + confidence * 0.20 + 15  # baseline pressure

def compute_readiness_score(units: list) -> float:
    if not units:
        return 0.0
    scores = []
    for u in units:
        if u.status == "offline":
            continue
        avg_resource = (u.resources.fuel + u.resources.ammo + u.resources.medical) / 3
        status_mult = {"ready": 1.0, "moving": 0.85, "engaged": 0.7, "degraded": 0.4}
        scores.append(avg_resource * status_mult.get(u.status, 0.5))
    return sum(scores) / len(scores) if scores else 0.0

def compute_escalation_risk(threat_score: float, readiness: float) -> float:
    # High threat + low readiness = high escalation risk
    return min(100, threat_score * 0.6 + (100 - readiness) * 0.4)

def compute_confidence(threats: list) -> float:
    if not threats:
        return 50.0
    return sum(t.confidence for t in threats) / len(threats)
```

### Proximity Computation (simplified for MVP)

```python
import math

def compute_proximity_pressure(threat, units) -> float:
    """Returns 0-100. Higher = threat is closer to friendly units."""
    if not units:
        return 50.0
    min_dist = float('inf')
    for u in units:
        dist = math.sqrt((threat.latitude - u.latitude)**2 + (threat.longitude - u.longitude)**2)
        min_dist = min(min_dist, dist)
    # Normalize: <0.05 degrees ≈ 5km = max pressure (100), >0.5 degrees = low (10)
    if min_dist < 0.05:
        return 100.0
    elif min_dist > 0.5:
        return 10.0
    else:
        return 100 - (min_dist - 0.05) / 0.45 * 90
```

---

## 6. API Routes

Keep routes small and obvious.

### Route Table

| Method | Path | Purpose | Returns |
|---|---|---|---|
| `GET` | `/health` | Service check | `{"status": "ok"}` |
| `GET` | `/state` | Full current world state | `WorldState` |
| `POST` | `/scenario/advance` | Advance one phase | `WorldState` (with fresh reasoning) |
| `POST` | `/scenario/reset` | Reset to initial state | `WorldState` |
| `POST` | `/query` | Commander NL question | `QueryResponse` |
| `POST` | `/recommendation/approve` | Approve an action | `WorldState` + `ProjectionOutput` |
| `GET` | `/sitrep` | Generate SITREP | `SitrepOutput` |

### Example Request/Response

**POST /scenario/advance** → Returns:

```json
{
  "state": {
    "theater_name": "Theater Alpha",
    "current_phase_index": 1,
    "phase_title": "Threat Emergence",
    "objective": "Stabilize Sector East...",
    "units": [...],
    "threats": [...],
    "alerts": [...],
    "scorecard": {
      "threat_score": 81,
      "readiness_score": 63,
      "escalation_risk": 74,
      "confidence_score": 71
    },
    "reasoning": {
      "assessment_summary": "Hostile armored column detected...",
      "key_risks": ["Local medical supplies depleted", "Threat within striking range"],
      "recommendations": [{
        "action_id": "A-1",
        "action": "Reposition Echo-1 for medevac support at Grid 447",
        "priority": "high",
        "expected_effectiveness": 0.78,
        "resource_cost": 0.35,
        "rationale": "Closest medical unit with available capacity."
      }],
      "assumptions": ["Hostile column intent is offensive", "Current intercept remains valid"],
      "projected_outcome": "If recommendation approved, medical gap closes and defensive posture improves."
    }
  }
}
```

**POST /query** — Body: `{"question": "Who can reinforce Grid 447?"}` → Returns:

```json
{
  "answer": "Bravo-2 is the closest unit to Grid 447 but is medically depleted. Echo-1 Medical is the best option for reinforcement with full medical capacity and moderate fuel.",
  "supporting_points": [
    "Bravo-2 at Grid 443 — closest but medical at 0%",
    "Echo-1 at Grid 449 — medical 100%, fuel 78%, status ready",
    "Charlie-1 could support but fuel is at 34%"
  ],
  "confidence": 0.85
}
```

**POST /recommendation/approve** — Body: `{"action_id": "A-1"}` → Returns WorldState + ProjectionOutput.

---

## 7. AI Reasoning Layer

### Input to AI

Send only compact context — not the entire raw state. Construct a reduced context pack:

```python
def build_ai_context(state: WorldState, doctrine: str, area_briefing: str) -> str:
    units_summary = "\n".join([
        f"- {u.name} ({u.role}): status={u.status}, "
        f"fuel={u.resources.fuel}%, ammo={u.resources.ammo}%, med={u.resources.medical}%, "
        f"grid={u.grid_ref or f'{u.latitude},{u.longitude}'}"
        for u in state.units
    ])
    threats_summary = "\n".join([
        f"- {t.label}: severity={t.severity}, confidence={t.confidence}%, "
        f"source={t.source_type}, {t.summary}"
        for t in state.threats
    ]) or "No active threats."
    
    recent_events = "\n".join(state.event_log[-5:]) or "No recent events."
    
    return f"""MISSION OBJECTIVE: {state.objective}
CURRENT PHASE: {state.phase_title}
THEATER: {state.theater_name}

SCORECARD:
  Threat: {state.scorecard.threat_score:.0f}/100
  Readiness: {state.scorecard.readiness_score:.0f}/100
  Escalation Risk: {state.scorecard.escalation_risk:.0f}/100

FRIENDLY UNITS:
{units_summary}

ACTIVE THREATS:
{threats_summary}

RECENT EVENTS:
{recent_events}

DOCTRINE NOTES:
{doctrine[:500]}

AREA BRIEFING:
{area_briefing[:500]}"""
```

### Structured Output Rule

All AI outputs must be JSON. Use system prompts that explicitly forbid prose preamble. Validate every response with Pydantic. Fall back to cached responses on any parse failure.

---

## 8. Prompting Strategy

### General Rules

Every prompt must: constrain the role, constrain the task, constrain the output format, avoid open-ended speculation, request assumptions explicitly, forbid unsupported claims.

### Threat Assessment Prompt

```
You are SENTINEL ACTUAL, an operational intelligence assistant for a military command system.

You are given the current operational state including friendly units, active threats, scorecard metrics, and recent events.

CURRENT STATE:
{context}

TASK:
1. Assess the current threat posture in 2-3 sentences.
2. Identify 2-3 key operational risks.
3. Recommend 1-2 prioritized actions with rationale, expected effectiveness (0-1), and resource cost (0-1). Each action needs a unique action_id like "A-1", "A-2".
4. State 1-2 key assumptions your assessment depends on.
5. Project the likely short-term outcome if recommendations are followed.

RULES:
- Use only the provided state data. Do not invent facts.
- Be concise and operationally relevant.
- Return ONLY valid JSON matching this exact schema, no other text:

{
  "assessment_summary": "string",
  "key_risks": ["string", "string"],
  "recommendations": [
    {
      "action_id": "string",
      "action": "string",
      "priority": "low|medium|high|critical",
      "expected_effectiveness": 0.0-1.0,
      "resource_cost": 0.0-1.0,
      "rationale": "string"
    }
  ],
  "assumptions": ["string"],
  "projected_outcome": "string"
}
```

### Query Response Prompt

```
You are answering a commander's question using only the provided operational state.

CURRENT STATE:
{context}

COMMANDER'S QUESTION: {question}

RULES:
- Do not invent facts not present in the state data.
- Reference specific units, positions, and resource levels.
- Keep the answer concise (2-4 sentences).
- Include 2-3 supporting data points.
- Return ONLY valid JSON:

{
  "answer": "string",
  "supporting_points": ["string", "string"],
  "confidence": 0.0-1.0
}
```

### Future Projection Prompt

```
You are projecting the likely immediate outcome of an approved action.

CURRENT STATE:
{context}

APPROVED ACTION: {action_description}

TASK:
Estimate the likely immediate impact on the operational situation.

RULES:
- Be specific about what changes.
- Identify 1-2 new risks that may emerge.
- Return ONLY valid JSON:

{
  "projected_outcome": "string",
  "expected_changes": ["string", "string"],
  "new_risks": ["string"]
}
```

### SITREP Prompt

```
You are generating a situation report (SITREP) from the current operational state.

CURRENT STATE:
{context}

Generate a concise SITREP with these sections. Each section should be 1-3 sentences.

Return ONLY valid JSON:

{
  "situation": "string",
  "threats": "string",
  "friendly_status": "string",
  "recommended_action": "string",
  "projected_outlook": "string"
}
```

---

## 9. Fallback AI Strategy

### Why Needed

LLM latency, formatting failures, or API outages will ruin the demo.

### Implementation

Maintain `backend/fallback_outputs.py` with pre-authored responses keyed by `(scenario_name, phase_index, output_type)`:

```python
FALLBACK_REASONING = {
    ("alpha", 0): ReasoningOutput(
        assessment_summary="Initial positioning complete. Low-confidence intercept suggests potential hostile activity in the eastern corridor. Monitoring.",
        key_risks=["Eastern corridor may be contested", "Intel confidence is low — may be deceptive"],
        recommendations=[],
        assumptions=["Intercept is genuine", "Hostile movement has not yet materialized"],
        projected_outcome="Situation stable if hostile movement does not escalate within the next operational window."
    ),
    ("alpha", 1): ReasoningOutput(
        assessment_summary="High-severity threat detected. Hostile armored column moving toward Grid 447. Bravo-2 medical supplies at zero. Immediate response required.",
        key_risks=[
            "Bravo-2 has no medical capacity — any casualties in sector are unserviceable",
            "Hostile column within 45 minutes of critical corridor"
        ],
        recommendations=[
            Recommendation(
                action_id="A-1",
                action="Reposition Echo-1 for medevac support at Grid 447",
                priority="high",
                expected_effectiveness=0.78,
                resource_cost=0.35,
                rationale="Closest medical unit with full capacity. Moderate fuel cost."
            ),
            Recommendation(
                action_id="A-2",
                action="Request CAS from Viper-11 on hostile column at Grid 445",
                priority="high",
                expected_effectiveness=0.82,
                resource_cost=0.45,
                rationale="Viper-11 on station. Interdiction before column reaches engagement range."
            )
        ],
        assumptions=["Hostile intent is offensive", "Current intercept data remains valid for next 60 minutes"],
        projected_outcome="If both actions approved, medical gap closes and hostile column is disrupted before reaching Grid 447."
    ),
    # ... continue for phases 2, 3
}

FALLBACK_QUERIES = {
    ("alpha", "who can reinforce"): QueryResponse(
        answer="Echo-1 Medical is best positioned to reinforce Grid 447 with full medical and adequate fuel. Bravo-2 is closer but medically depleted.",
        supporting_points=[
            "Echo-1: medical 100%, fuel 78%, status ready, Grid 449",
            "Bravo-2: medical 0%, closest but cannot provide casualty support",
            "Charlie-1: fuel at 34%, limited endurance for sustained ops"
        ],
        confidence=0.85
    ),
}
```

### Trigger Conditions

Use fallback if: API call fails, JSON parse fails, response takes >8 seconds, output fails Pydantic validation.

### Rule

**The user should never see a broken AI panel.** Always show the last good state or a fallback.

---

## 10. Frontend Specification

### Layout

Three-column command dashboard. Dark theme. High contrast.

```
┌──────────────────────────────────────────────────────────────────┐
│  SENTINEL // THEATER ALPHA // Phase: Threat Emergence // ██████  │
├────────────┬──────────────────────────────┬───────────────────────┤
│            │                              │  SCORECARD            │
│  MISSION   │                              │  Threat:    81 ██████ │
│  OBJECTIVE │         MAP                  │  Readiness: 63 ████── │
│            │    (Leaflet dark tiles)      │  Escalation:74 █████─ │
│  ORBAT     │                              │                       │
│  ┌──────┐  │    [A1]  [B2]  [!!]         │  AI ASSESSMENT        │
│  │Alpha │  │         [C1]                │  "Hostile armored..." │
│  │ ████ │  │              [E1]           │                       │
│  ├──────┤  │                   [T-1]     │  RECOMMENDATION       │
│  │Bravo │  │                              │  [Approve A-1]        │
│  │ ██── │  │                              │                       │
│  ├──────┤  │                              │  QUERY BOX            │
│  │Charl │  │                              │  > Who can support... │
│  │ █─── │  │                              │  [Answer text]        │
│  ├──────┤  ├──────────────────────────────┤                       │
│  │Echo  │  │ [◄ Reset] [Advance ►]       │  [Generate SITREP]    │
│  │ ████ │  │ Phase 1 of 4                 │                       │
│  └──────┘  │                              │                       │
└────────────┴──────────────────────────────┴───────────────────────┘
```

### Components

| Component | Responsibility |
|---|---|
| `Header` | App title, phase title, theater name, threat level badge, reset button |
| `OrbatPanel` | Renders all units via `UnitCard` components |
| `UnitCard` | Unit name, role icon, status color, fuel/ammo/medical bars |
| `MapView` | react-leaflet with dark tiles, unit markers (green), threat markers (red) |
| `TimelineControls` | "Advance Phase" button, "Reset" button, phase counter |
| `AiPanel` | Scorecard gauges, assessment summary, key risks, assumptions |
| `PlanCard` | Recommendation details + "Approve" button |
| `QueryBox` | Text input + submit + answer display |
| `SitrepModal` | Full SITREP display overlay |

### Color System

```
Background:     #0a0e1a (deep navy)
Surface:        #111827 (dark card)
Border:         #1f2937 (subtle)
Text primary:   #e5e7eb (light gray)
Text secondary: #9ca3af (medium gray)
Accent:         #f59e0b (amber — headers, highlights)

Status green:   #22c55e (ready, OK)
Status yellow:  #eab308 (degraded, caution)
Status red:     #ef4444 (critical, high threat)
Status blue:    #3b82f6 (info, moving)
```

### Frontend State

Use React hooks. Keep it minimal:

```javascript
const [worldState, setWorldState] = useState(null);
const [reasoning, setReasoning] = useState(null);
const [queryAnswer, setQueryAnswer] = useState(null);
const [sitrep, setSitrep] = useState(null);
const [loading, setLoading] = useState({ advance: false, query: false, sitrep: false });
const [error, setError] = useState(null);
```

### UX Rules

- Never leave blank panels — show placeholder/fallback cards
- Keep last good state visible if a request fails
- Show small status badges, not giant error messages
- Every visible panel must earn its place
- Do not overload the map with markers — 6 units + 1-2 threats is plenty

---

## 11. Scenario Advancement

### Normal Mode

1. User clicks "Advance Phase"
2. Frontend calls `POST /scenario/advance`
3. Backend applies next phase events, recomputes scores, calls AI reasoning
4. Returns full updated WorldState with reasoning
5. Frontend re-renders everything

### Panic/Fallback Mode

1. User clicks "Advance Phase"
2. Backend loads precomputed phase state from fallback files
3. Returns pre-authored WorldState + reasoning
4. Frontend renders identically

Fallback mode should be toggleable via config flag. Frontend behavior is identical in both modes.

---

## 12. Error Handling

### Backend
- Never crash on bad AI output — catch and log, return fallback
- Validate all LLM responses with Pydantic `model_validate`
- Wrap all API calls in try/except with timeout (8 seconds)
- Return last good state if current computation fails

### Frontend
- Never show blank panels — display placeholder or last good data
- Show loading spinners during async calls
- Show small inline error badges, not modal dialogs
- Degrade gracefully: if scoring fails, show "—" not "0"

### AI
- Parse JSON safely (strip markdown fences, handle trailing commas)
- Validate with Pydantic before using
- Fallback fast — don't retry more than once

---

## 13. Delivery Order

### Phase 1 (Hours 0–3): Foundation
- Repo setup, install deps
- `models.py` with all Pydantic schemas
- `data/units_initial.json` authored
- `data/scenario_alpha.json` first draft
- Frontend shell (3-column layout, dark theme)
- Backend `/health` and `/state` routes

### Phase 2 (Hours 3–6): Core Rendering
- Map renders unit markers from `/state`
- ORBAT panel renders unit cards
- Scorecard component displays metrics
- `/scenario/advance` route works
- Threat markers appear on map after advance

### Phase 3 (Hours 6–10): AI Integration
- AI reasoning integration with Claude API
- Assessment + recommendations display in AI panel
- `/query` route with NL response
- Query box wired end-to-end

### Phase 4 (Hours 10–14): Planning Loop
- PlanCard with approve button
- `/recommendation/approve` updates state + produces projection
- Projection display in AI panel
- `/sitrep` route generates formatted report
- SITREP modal works

### Phase 5 (Hours 14–24): Harden + Polish
- Fallback outputs authored for all phases
- Visual polish (colors, spacing, typography)
- Demo rehearsal
- Backup video recorded
- Feature freeze at Hour 20

---

## 14. Testing Checklist

### Backend
- [ ] `/health` returns `{"status": "ok"}`
- [ ] `/state` returns valid WorldState JSON
- [ ] `/scenario/advance` updates phase and returns new state
- [ ] Scores update predictably across phases
- [ ] Fallback AI path activates when API fails
- [ ] `/query` returns structured answer
- [ ] `/recommendation/approve` records action and returns projection
- [ ] `/sitrep` returns all sections populated
- [ ] `/scenario/reset` returns to phase 0

### Frontend
- [ ] Dashboard renders with all panels
- [ ] Map loads with dark tiles and markers
- [ ] Unit cards show correct status colors
- [ ] Advance button triggers phase change and UI update
- [ ] AI panel shows assessment after advance
- [ ] Query box accepts input and shows answer
- [ ] Approve button triggers and shows projection
- [ ] SITREP modal opens with content
- [ ] Reset button works

### End-to-End
- [ ] Load → advance → observe threat → see recommendation → ask question → approve → view projection → generate SITREP
- [ ] Complete path works 3 times in a row without error
- [ ] Demo takes under 3 minutes
- [ ] Fallback mode produces identical UX

---

## 15. Setup Reference

### requirements.txt

```
fastapi
uvicorn[standard]
pydantic>=2.0
httpx
python-dotenv
```

### .env.example

```
AI_API_KEY=your_anthropic_api_key_here
AI_MODEL=claude-sonnet-4-20250514
BACKEND_PORT=8000
FALLBACK_MODE=false
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### frontend/package.json (key deps)

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-leaflet": "^4",
    "leaflet": "^1.9",
    "recharts": "^2",
    "@supabase/supabase-js": "^2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^5",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  }
}
```

---

## 16. Final Build Rule

If a feature does not strengthen one of these, cut it:

- Operational picture clarity
- Decision quality and credibility
- Recommendation explainability
- Demo reliability
- Visual impact

That is the whole point of the MVP.
