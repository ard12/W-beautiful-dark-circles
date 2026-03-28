from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import (
    WorldState, QueryResponse, SitrepOutput, ProjectionOutput,
    IncidentInput, FullReportOutput, ReasoningOutput,
    UnitState, ThreatState, AlertState, ScoreCard, ResourceState,
    HeadlinesResponse, MarketSnapshot,
)
from world_state import WorldStateManager
from sitrep import generate_sitrep
from ai_reasoning import answer_query, project_future, load_doctrine, load_area_briefing, assess_threat
from threat_scorer import compute_scorecard

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state_manager = WorldStateManager()
state_manager.initialize()

# Pre-load context files at startup
_doctrine = load_doctrine()
_area_briefing = load_area_briefing()

class QueryRequest(BaseModel):
    question: str

class RecommendationApproveRequest(BaseModel):
    action_id: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/state", response_model=WorldState)
def get_state():
    return state_manager.get_state()

@app.post("/scenario/advance", response_model=WorldState)
async def advance_scenario():
    return await state_manager.advance_phase()

@app.post("/scenario/reset", response_model=WorldState)
def reset_scenario():
    return state_manager.reset()

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    current_state = state_manager.get_state()
    return await answer_query(
        state=current_state,
        question=request.question,
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )

@app.post("/recommendation/approve")
async def approve_recommendation(request: RecommendationApproveRequest):
    new_state = state_manager.approve_action(request.action_id)
    # Find the action description from reasoning recommendations
    action_desc = request.action_id
    if new_state.reasoning:
        for rec in new_state.reasoning.recommendations:
            if rec.action_id == request.action_id:
                action_desc = rec.action
                break
    projection = await project_future(
        state=new_state,
        action_description=action_desc,
        doctrine=_doctrine,
    )
    return {
        "state": new_state.model_dump(),
        "projection": projection.model_dump(),
    }

@app.get("/sitrep", response_model=SitrepOutput)
async def sitrep():
    return await generate_sitrep(
        state_manager.get_state(),
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )


# ---------------------------------------------------------------------------
# Landing feed proxy endpoints (feature/frontend)
# ---------------------------------------------------------------------------

@app.get("/feed/headlines", response_model=HeadlinesResponse)
def get_headlines():
    import json
    import os
    path = os.path.join(os.path.dirname(__file__), "..", "data", "landing_feed.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/feed/market-snapshot", response_model=MarketSnapshot)
def get_market_snapshot():
    import json
    import os
    path = os.path.join(os.path.dirname(__file__), "..", "data", "market_snapshot.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Prompt-driven chatbot endpoints (main / ai-feature)
# ---------------------------------------------------------------------------

PROMPT_PLACEHOLDERS = [
    {
        "key": "attacked_site",
        "label": "Attacked site",
        "question": "What site or installation was attacked?",
        "placeholder": "Northern Radar Relay",
    },
    {
        "key": "location",
        "label": "Location",
        "question": "Where did the incident occur?",
        "placeholder": "Kupwara sector",
    },
    {
        "key": "owner_country",
        "label": "Owner country",
        "question": "Which country owns or controls the affected site?",
        "placeholder": "India",
    },
    {
        "key": "actor",
        "label": "Actor",
        "question": "Who is the suspected actor or adversary?",
        "placeholder": "Pakistan-backed proxy network",
    },
    {
        "key": "attack_type",
        "label": "Attack type",
        "question": "What was the mode of attack?",
        "placeholder": "Drone attack",
        "options": [
            "Missile strike",
            "Drone attack",
            "Militant raid",
            "Cyber disruption",
            "Bombing",
            "Artillery exchange",
        ],
    },
    {
        "key": "severity",
        "label": "Severity (0-100)",
        "question": "How severe was the incident on a 0-100 scale?",
        "placeholder": "74",
    },
    {
        "key": "description",
        "label": "Description",
        "question": "Give a short operational description of the incident.",
        "placeholder": "Forward radar relay degraded after a stand-off drone strike.",
    },
]


@app.get("/prompts/placeholders")
def get_prompt_placeholders():
    """Return the list of prompts / placeholders the chatbot should ask."""
    return {"placeholders": PROMPT_PLACEHOLDERS}


def _build_world_state_from_incident(incident: IncidentInput) -> WorldState:
    """Synthesise a minimal WorldState from incident input so AI prompts work."""
    threat = ThreatState(
        threat_id="T-INC-1",
        label=f"{incident.attack_type} on {incident.attacked_site}",
        latitude=34.5261,
        longitude=74.2612,
        severity=float(incident.severity),
        confidence=65.0,
        summary=incident.description,
        source_type="incident_report",
    )

    unit = UnitState(
        unit_id="U-QRF-1",
        name="Quick Reaction Force",
        role="infantry",
        status="ready",
        latitude=34.53,
        longitude=74.27,
        resources=ResourceState(fuel=78, ammo=85, medical=90),
    )

    scorecard = compute_scorecard([unit], [threat])

    return WorldState(
        theater_name=f"{incident.location} \u2014 {incident.owner_country}",
        current_phase_index=0,
        phase_title="Incident reported",
        objective=f"Assess and respond to {incident.attack_type} by {incident.actor} on {incident.attacked_site}",
        units=[unit],
        threats=[threat],
        alerts=[],
        scorecard=scorecard,
        total_phases=1,
        event_log=[
            f"{incident.attack_type} reported at {incident.attacked_site} ({incident.location})",
            f"Attributed to {incident.actor}. Severity: {incident.severity}/100.",
        ],
    )


@app.post("/prompts/execute", response_model=FullReportOutput)
async def execute_prompt(incident: IncidentInput):
    """Run the full AI pipeline given the filled incident placeholders."""
    state = _build_world_state_from_incident(incident)

    reasoning = await assess_threat(
        state=state,
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )

    sitrep_out = await generate_sitrep(
        state,
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )

    return FullReportOutput(
        reasoning=reasoning,
        sitrep=sitrep_out,
        scores={
            "threat_score": state.scorecard.threat_score,
            "readiness_score": state.scorecard.readiness_score,
            "escalation_risk": state.scorecard.escalation_risk,
            "confidence_score": state.scorecard.confidence_score,
        },
    )
