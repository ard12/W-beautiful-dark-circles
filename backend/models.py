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
    total_phases: int = 0
    reasoning: Optional[ReasoningOutput] = None
    approved_action_ids: List[str] = []
    event_log: List[str] = []


class IncidentInput(BaseModel):
    attacked_site: str
    location: str
    owner_country: str
    actor: str
    attack_type: str
    severity: int = Field(ge=0, le=100)
    description: str


class FullReportOutput(BaseModel):
    reasoning: ReasoningOutput
    sitrep: SitrepOutput
    scores: dict
