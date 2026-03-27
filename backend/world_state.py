from models import WorldState, ScoreCard

class WorldStateManager:
    def __init__(self):
        self.state = None
        
    def initialize(self) -> None:
        self.state = WorldState(
            theater_name="Theater Alpha",
            current_phase_index=0,
            phase_title="Initialization",
            objective="Stabilize Sector East and prevent hostile escalation near Grid 447.",
            units=[],
            threats=[],
            alerts=[],
            scorecard=ScoreCard(threat_score=0.0, readiness_score=100.0, escalation_risk=0.0, confidence_score=100.0)
        )

    def get_state(self) -> WorldState:
        return self.state

    def advance_phase(self) -> WorldState:
        # Stub: just return current state
        return self.state

    def approve_action(self, action_id: str) -> WorldState:
        if self.state and action_id not in self.state.approved_action_ids:
            self.state.approved_action_ids.append(action_id)
        return self.state

    def reset(self) -> WorldState:
        self.initialize()
        return self.state
