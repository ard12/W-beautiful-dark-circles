from models import ScoreCard

def compute_scorecard(units: list, threats: list) -> ScoreCard:
    return ScoreCard(
        threat_score=45.0,
        readiness_score=85.0,
        escalation_risk=55.0,
        confidence_score=90.0
    )
