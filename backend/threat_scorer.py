from models import ScoreCard
import math

def compute_proximity_pressure(threat, units: list) -> float:
    """Returns 0-100. Higher = threat is closer to friendly units."""
    if not units:
        return 50.0
    min_dist = float('inf')
    for u in units:
        # Euclidean distance proxy for demonstration
        dist = math.sqrt((threat.latitude - float(u.latitude))**2 + (threat.longitude - float(u.longitude))**2)
        min_dist = min(min_dist, dist)
        
    # Normalize: <0.05 degrees ≈ 5km = max pressure (100), >0.5 degrees = low (10)
    if min_dist < 0.05:
        return 100.0
    elif min_dist > 0.5:
        return 10.0
    else:
        return 100 - (min_dist - 0.05) / 0.45 * 90

def compute_threat_score(threats: list, units: list) -> float:
    if not threats:
        return 0.0
    max_threat = max(threats, key=lambda t: t.severity)
    severity = max_threat.severity
    confidence = max_threat.confidence
    proximity = compute_proximity_pressure(max_threat, units)
    return severity * 0.40 + proximity * 0.25 + confidence * 0.20 + 15

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
    return min(100, threat_score * 0.6 + (100 - readiness) * 0.4)

def compute_confidence(threats: list) -> float:
    if not threats:
        return 50.0
    return sum(t.confidence for t in threats) / len(threats)

def compute_scorecard(units: list, threats: list) -> ScoreCard:
    t_score = compute_threat_score(threats, units)
    r_score = compute_readiness_score(units)
    e_risk = compute_escalation_risk(t_score, r_score)
    c_score = compute_confidence(threats)
    
    return ScoreCard(
        threat_score=round(t_score, 1),
        readiness_score=round(r_score, 1),
        escalation_risk=round(e_risk, 1),
        confidence_score=round(c_score, 1)
    )
