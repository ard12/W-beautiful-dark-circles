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
    actor: Optional[str] = None
    attack_type: Optional[str] = None
    owner_country: Optional[str] = None


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


class HeadlineItem(BaseModel):
    source: str
    tags: List[str]
    headline: str
    age: str
    region: Optional[str] = None

class ForecastItem(BaseModel):
    channel: str
    headline: str
    age: str

class RegionalNewsPanel(BaseModel):
    title: str
    count: str
    items: List[HeadlineItem]

class PredictionsPanel(BaseModel):
    market: str
    question: str
    volume: str
    closeDate: str
    yes: int
    no: int
    badge: str

class PostureItem(BaseModel):
    label: str
    level: str
    air: int
    sea: int
    direction: str

class AIInsightBrief(BaseModel):
    title: str
    text: str

class HeadlinesResponse(BaseModel):
    news: List[HeadlineItem]
    intel: List[HeadlineItem]
    world_news: List[HeadlineItem]
    intel_feed: Optional[List[HeadlineItem]] = None
    forecasts: Optional[List[ForecastItem]] = None
    regional_news: Optional[List[RegionalNewsPanel]] = None
    predictions: Optional[PredictionsPanel] = None
    strategic_posture: Optional[List[PostureItem]] = None
    ai_insight: Optional[AIInsightBrief] = None
    updated_at: str

class MarketTicker(BaseModel):
    name: str
    ticker: str
    price: str
    delta: str

class CommodityItem(BaseModel):
    name: str
    price: str
    delta: str
    trend: List[int]

class MarketEnergyItem(BaseModel):
    label: str
    value: str
    delta: str
    tone: str

class MacroStressItem(BaseModel):
    label: str
    value: int

class CompositeMetric(BaseModel):
    label: str
    value: int

class StrategicRiskData(BaseModel):
    score: int
    band: str
    trend: str
    infrastructureLinks: int
    composite: List[CompositeMetric]

class CorrelationItem(BaseModel):
    title: str
    score: int
    description: str

class CountryIntelItem(BaseModel):
    country: str
    score: int
    breakdown: str

class CompositeSignal(BaseModel):
    label: str
    value: int

class FinanceRadarData(BaseModel):
    stockExchanges: int
    commodities: int
    cryptoPairs: int
    centralBanks: int
    compositeScore: int
    compositeSignals: List[CompositeSignal]

class MarketSnapshot(BaseModel):
    metals: List[CommodityItem]
    energy: List[MarketEnergyItem]
    equities: List[MarketTicker]
    macro_stress: List[MacroStressItem]
    strategic_risk: Optional[StrategicRiskData] = None
    cross_stream_correlation: Optional[List[CorrelationItem]] = None
    country_intelligence: Optional[List[CountryIntelItem]] = None
    finance_radar: Optional[FinanceRadarData] = None
    updated_at: str


class IncidentInput(BaseModel):
    attacked_site: str
    location: str
    owner_country: str
    actor: str
    attack_type: str
    severity: int = Field(ge=0, le=100)
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class FullReportOutput(BaseModel):
    reasoning: ReasoningOutput
    sitrep: SitrepOutput
    scores: dict

