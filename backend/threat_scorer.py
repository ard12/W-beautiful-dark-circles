"""
Threat Scoring Layer — Person 2 Owned (implemented by Person 3 per IMPLEMENTATION_SPEC)
Deterministic scoring that does not depend on LLM. AI explains these scores, not computes them.
"""

import math
from models import ScoreCard, UnitState, ThreatState


def compute_proximity_pressure(threat: ThreatState, units: list[UnitState]) -> float:
    """Returns 0-100. Higher = threat is closer to friendly units."""
    if not units:
        return 50.0
    min_dist = float("inf")
    for u in units:
        dist = math.sqrt(
            (threat.latitude - u.latitude) ** 2 + (threat.longitude - u.longitude) ** 2
        )
        min_dist = min(min_dist, dist)
    # Normalize: <0.05 degrees ≈ 5km = max pressure (100), >0.5 degrees = low (10)
    if min_dist < 0.05:
        return 100.0
    elif min_dist > 0.5:
        return 10.0
    else:
        return 100 - (min_dist - 0.05) / 0.45 * 90


def compute_threat_score(threats: list[ThreatState], units: list[UnitState]) -> float:
    if not threats:
        return 0.0
    max_threat = max(threats, key=lambda t: t.severity)
    severity = max_threat.severity
    confidence = max_threat.confidence
    proximity = compute_proximity_pressure(max_threat, units)
    score = severity * 0.40 + proximity * 0.25 + confidence * 0.20 + 15  # baseline pressure
    return min(100.0, max(0.0, score))


def compute_readiness_score(units: list[UnitState]) -> float:
    if not units:
        return 0.0
    scores = []
    status_mult = {
        "ready": 1.0,
        "moving": 0.85,
        "engaged": 0.7,
        "degraded": 0.4,
        "offline": 0.0,
    }
    for u in units:
        if u.status == "offline":
            continue
        avg_resource = (u.resources.fuel + u.resources.ammo + u.resources.medical) / 3
        mult = status_mult.get(u.status, 0.5)
        scores.append(avg_resource * mult)
    return sum(scores) / len(scores) if scores else 0.0


def compute_escalation_risk(threat_score: float, readiness: float) -> float:
    # High threat + low readiness = high escalation risk
    return min(100.0, threat_score * 0.6 + (100.0 - readiness) * 0.4)


def compute_confidence(threats: list[ThreatState]) -> float:
    if not threats:
        return 50.0
    return sum(t.confidence for t in threats) / len(threats)


def compute_scorecard(units: list[UnitState], threats: list[ThreatState]) -> ScoreCard:
    """Compute full scorecard from current units and threats."""
    threat_score = compute_threat_score(threats, units)
    readiness = compute_readiness_score(units)
    escalation = compute_escalation_risk(threat_score, readiness)
    confidence = compute_confidence(threats)

    return ScoreCard(
        threat_score=round(threat_score, 1),
        readiness_score=round(readiness, 1),
        escalation_risk=round(escalation, 1),
        confidence_score=round(confidence, 1),
    )
