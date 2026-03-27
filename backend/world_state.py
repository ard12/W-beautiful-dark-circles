"""
World State Manager — Person 2 Owned (AI wiring by Person 3)
Manages in-memory operational state, applies scenario events, triggers scoring and AI reasoning.
"""

import json
import logging
from pathlib import Path
from models import WorldState, ScoreCard, UnitState, ThreatState, AlertState
from threat_scorer import compute_scorecard
from scenario_engine import ScenarioEngine

logger = logging.getLogger("sentinel.state")

DATA_DIR = Path(__file__).parent.parent / "data"


class WorldStateManager:
    def __init__(self):
        self.state: WorldState | None = None
        self.scenario_engine: ScenarioEngine | None = None

    def initialize(self) -> None:
        """Load units from units_initial.json, load scenario, set initial state."""
        # Load initial units
        units_path = DATA_DIR / "units_initial.json"
        units = []
        if units_path.exists():
            with open(units_path) as f:
                units_data = json.load(f)
            units = [UnitState.model_validate(u) for u in units_data]
        
        # Load scenario
        scenario_path = DATA_DIR / "scenario_alpha.json"
        self.scenario_engine = ScenarioEngine(str(scenario_path))
        scenario_meta = self.scenario_engine.get_metadata()

        self.state = WorldState(
            theater_name=scenario_meta.get("theater_name", "Theater Alpha"),
            current_phase_index=0,
            phase_title="Initial Positioning",
            objective=scenario_meta.get("objective", "Stabilize Sector East and prevent hostile escalation near Grid 447."),
            units=units,
            threats=[],
            alerts=[],
            scorecard=compute_scorecard(units, []),
            event_log=["System initialized. Task Force Alpha deployed to Theater Alpha."],
        )

    def get_state(self) -> WorldState:
        return self.state

    async def advance_phase(self) -> WorldState:
        """Apply next phase events, recompute scores, run AI reasoning."""
        if not self.scenario_engine:
            return self.state

        next_index = self.state.current_phase_index + 1
        phase_data = self.scenario_engine.get_phase(next_index)
        
        if phase_data is None:
            logger.info(f"No more phases after index {self.state.current_phase_index}")
            return self.state

        # Update phase info
        self.state.current_phase_index = next_index
        self.state.phase_title = phase_data.get("title", f"Phase {next_index}")

        # Apply events
        events = phase_data.get("events", [])
        for event in events:
            self._apply_event(event)

        # Recompute scores
        self.state.scorecard = compute_scorecard(self.state.units, self.state.threats)

        # Run AI reasoning
        try:
            from ai_reasoning import assess_threat
            reasoning = await assess_threat(self.state)
            self.state.reasoning = reasoning
        except Exception as e:
            logger.warning(f"AI reasoning failed during advance: {e}")
            # Keep previous reasoning or leave None

        return self.state

    def _apply_event(self, event: dict) -> None:
        """Apply a single scenario event to the world state."""
        event_type = event.get("type")

        if event_type == "intel_report":
            summary = event.get("summary", "")
            self.state.event_log.append(f"[INTEL] {summary}")
            # Create alert
            alert_id = f"ALERT-{len(self.state.alerts) + 1}"
            self.state.alerts.append(AlertState(
                alert_id=alert_id,
                level="medium",
                title="Intelligence Update",
                summary=summary,
            ))

        elif event_type == "threat_detected":
            threat_data = event.get("threat", {})
            threat = ThreatState.model_validate(threat_data)
            # Check if threat already exists (update) or new
            existing = [t for t in self.state.threats if t.threat_id == threat.threat_id]
            if existing:
                idx = self.state.threats.index(existing[0])
                self.state.threats[idx] = threat
            else:
                self.state.threats.append(threat)
            self.state.event_log.append(f"[THREAT] {threat.label} detected at {threat.latitude},{threat.longitude}. Severity: {threat.severity}")
            # Create high-priority alert
            self.state.alerts.append(AlertState(
                alert_id=f"ALERT-{len(self.state.alerts) + 1}",
                level="high" if threat.severity >= 60 else "medium",
                title=f"Threat Detected: {threat.label}",
                summary=threat.summary,
                linked_threat_id=threat.threat_id,
            ))

        elif event_type == "resource_change":
            unit_id = event.get("unit_id")
            patch = event.get("resource_patch", {})
            for unit in self.state.units:
                if unit.unit_id == unit_id:
                    if "fuel" in patch:
                        unit.resources.fuel = patch["fuel"]
                    if "ammo" in patch:
                        unit.resources.ammo = patch["ammo"]
                    if "medical" in patch:
                        unit.resources.medical = patch["medical"]
                    changes = ", ".join([f"{k}={v}%" for k, v in patch.items()])
                    self.state.event_log.append(f"[RESOURCE] {unit.name}: {changes}")
                    break

        elif event_type == "status_change":
            unit_id = event.get("unit_id")
            new_status = event.get("new_status")
            for unit in self.state.units:
                if unit.unit_id == unit_id:
                    old_status = unit.status
                    unit.status = new_status
                    self.state.event_log.append(f"[STATUS] {unit.name}: {old_status} → {new_status}")
                    break

        elif event_type == "unit_move":
            unit_id = event.get("unit_id")
            for unit in self.state.units:
                if unit.unit_id == unit_id:
                    unit.latitude = event.get("latitude", unit.latitude)
                    unit.longitude = event.get("longitude", unit.longitude)
                    if "grid_ref" in event:
                        unit.grid_ref = event["grid_ref"]
                    self.state.event_log.append(
                        f"[MOVE] {unit.name} repositioned to {unit.grid_ref or f'{unit.latitude},{unit.longitude}'}"
                    )
                    break

        elif event_type == "plan_approved":
            action_id = event.get("action_id")
            if action_id and action_id not in self.state.approved_action_ids:
                self.state.approved_action_ids.append(action_id)
                self.state.event_log.append(f"[APPROVED] Action {action_id} approved by commander")

    def approve_action(self, action_id: str) -> WorldState:
        if self.state and action_id not in self.state.approved_action_ids:
            self.state.approved_action_ids.append(action_id)
            self.state.event_log.append(f"[APPROVED] Action {action_id} approved by commander")
        return self.state

    def reset(self) -> WorldState:
        self.initialize()
        return self.state
