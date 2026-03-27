"""
World State Manager — manages in-memory operational state.
Applies scenario events, triggers scoring and AI reasoning.
"""

import json
import logging
import os
import uuid
from pathlib import Path

from models import WorldState, UnitState, ThreatState, AlertState, ScoreCard
from threat_scorer import compute_scorecard
from scenario_engine import ScenarioEngine

logger = logging.getLogger("sentinel.state")

DATA_DIR = Path(__file__).parent.parent / "data"


class WorldStateManager:
    def __init__(
        self,
        units_path: str = None,
        scenario_path: str = None,
    ):
        # Resolve paths — support both absolute paths and relative (for Person 2's interface)
        if units_path is None:
            units_path = str(DATA_DIR / "units_initial.json")
        elif not os.path.isabs(units_path) and not os.path.exists(units_path):
            units_path = os.path.join(os.path.dirname(__file__), units_path)

        if scenario_path is None:
            scenario_path = str(DATA_DIR / "scenario_alpha.json")
        elif not os.path.isabs(scenario_path) and not os.path.exists(scenario_path):
            scenario_path = os.path.join(os.path.dirname(__file__), scenario_path)

        self.units_path = units_path
        self.scenario_engine = ScenarioEngine(scenario_path)
        self.state: WorldState | None = None

    def initialize(self) -> None:
        """Load units from JSON, apply phase 0 events, set initial state."""
        # Load units
        with open(self.units_path, "r", encoding="utf-8") as f:
            units_data = json.load(f)
        units = [UnitState.model_validate(u) for u in units_data]

        # Get phase 0 metadata
        phase0 = self.scenario_engine.get_phase(0)
        scenario_meta = self.scenario_engine.get_metadata()

        self.state = WorldState(
            theater_name=scenario_meta.get("theater_name", "Theater Alpha"),
            current_phase_index=0,
            total_phases=self.scenario_engine.get_total_phases(),
            phase_title=phase0["title"] if phase0 else "Initial Positioning",
            objective=scenario_meta.get("objective", "Stabilize Sector East."),
            units=units,
            threats=[],
            alerts=[],
            scorecard=compute_scorecard(units, []),
            reasoning=None,
            approved_action_ids=[],
            event_log=["System initialized. Task Force Alpha deployed to Theater Alpha."],
        )

        # Apply phase 0 events (intel reports etc.)
        if phase0:
            self._apply_events(phase0.get("events", []))
        self.state.scorecard = compute_scorecard(self.state.units, self.state.threats)

    def get_state(self) -> WorldState:
        if not self.state:
            self.initialize()
        return self.state

    async def advance_phase(self) -> WorldState:
        """Apply next phase events, recompute scores, run AI reasoning."""
        if not self.scenario_engine or not self.state:
            return self.state

        next_index = self.state.current_phase_index + 1
        phase_data = self.scenario_engine.get_phase(next_index)

        if phase_data is None:
            logger.info(f"No more phases after index {self.state.current_phase_index}")
            return self.state

        # Update phase info
        self.state.current_phase_index = next_index
        self.state.phase_title = phase_data.get("title", f"Phase {next_index}")

        # Apply events using unified handler
        self._apply_events(phase_data.get("events", []))

        # Recompute scores
        self.state.scorecard = compute_scorecard(self.state.units, self.state.threats)

        # Run AI reasoning
        try:
            from ai_reasoning import assess_threat
            reasoning = await assess_threat(self.state)
            self.state.reasoning = reasoning
        except Exception as e:
            logger.warning(f"AI reasoning failed during advance: {e}")
            # Keep previous reasoning — never break the panel

        return self.state

    def _apply_events(self, events: list) -> None:
        """Apply a list of scenario events to the world state."""
        for event in events:
            event_type = event.get("type")

            if event_type == "intel_report":
                summary = event.get("summary", "")
                self.state.event_log.append(f"[INTEL] {summary}")
                self.state.alerts.append(AlertState(
                    alert_id=f"A-{uuid.uuid4().hex[:6]}",
                    level="medium",
                    title="Intelligence Update",
                    summary=summary,
                ))

            elif event_type == "threat_detected":
                threat_data = event.get("threat", {})
                if threat_data:
                    threat = ThreatState.model_validate(threat_data)
                    # Update if already exists, else append
                    existing = [t for t in self.state.threats if t.threat_id == threat.threat_id]
                    if existing:
                        idx = self.state.threats.index(existing[0])
                        self.state.threats[idx] = threat
                    else:
                        self.state.threats.append(threat)
                    self.state.event_log.append(
                        f"[THREAT] {threat.label} detected. Severity: {threat.severity}"
                    )
                    self.state.alerts.append(AlertState(
                        alert_id=f"A-{uuid.uuid4().hex[:6]}",
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
                        self.state.event_log.append(
                            f"[STATUS] {unit.name}: {old_status} → {new_status}"
                        )
                        break

            elif event_type == "unit_move":
                unit_id = event.get("unit_id")
                for unit in self.state.units:
                    if unit.unit_id == unit_id:
                        if "latitude" in event:
                            unit.latitude = event["latitude"]
                        if "longitude" in event:
                            unit.longitude = event["longitude"]
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
                    self.state.event_log.append(f"[APPROVED] Action {action_id} approved.")

    def approve_action(self, action_id: str) -> WorldState:
        if self.state and action_id not in self.state.approved_action_ids:
            self.state.approved_action_ids.append(action_id)
            self.state.event_log.append(f"[APPROVED] Action {action_id} approved.")
        return self.state

    def reset(self) -> WorldState:
        self.initialize()
        return self.state
