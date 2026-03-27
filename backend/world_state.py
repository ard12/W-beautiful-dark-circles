import json
import uuid
import os
from models import WorldState, UnitState, ThreatState, AlertState, ScoreCard
from scenario_engine import ScenarioEngine
from threat_scorer import compute_scorecard

class WorldStateManager:
    def __init__(self, units_path: str = "../data/units_initial.json", scenario_path: str = "../data/scenario_alpha.json"):
        # Resolve path relative to backend directory or workspace root
        self.units_path = units_path if os.path.exists(units_path) else os.path.join(os.path.dirname(__file__), units_path)
        self.scenario_engine = ScenarioEngine(scenario_path if os.path.exists(scenario_path) else os.path.join(os.path.dirname(__file__), scenario_path))
        self.state = None
        
    def initialize(self) -> None:
        with open(self.units_path, 'r', encoding='utf-8') as f:
            units_data = json.load(f)
            
        units = [UnitState(**u) for u in units_data]
        
        phase = self.scenario_engine.get_phase(0)
        
        self.state = WorldState(
            theater_name=self.scenario_engine.get_theater_name(),
            current_phase_index=0,
            total_phases=self.scenario_engine.get_total_phases(),
            phase_title=phase["title"] if phase else "Initialization",
            objective=self.scenario_engine.get_objective(),
            units=units,
            threats=[],
            alerts=[],
            scorecard=compute_scorecard(units, []),
            reasoning=None,
            approved_action_ids=[],
            event_log=["System initialized."]
        )
        
        # Apply phase 0 events
        if phase:
            self._apply_events(phase.get("events", []))
            
        self.state.scorecard = compute_scorecard(self.state.units, self.state.threats)

    def get_state(self) -> WorldState:
        if not self.state:
            self.initialize()
        return self.state

    def _apply_events(self, events: list):
        for event in events:
            event_type = event.get("type")
            if event_type == "intel_report":
                summary = event.get("summary", "")
                self.state.event_log.append(f"Intel: {summary}")
                self.state.alerts.append(AlertState(
                    alert_id=f"A-{uuid.uuid4().hex[:6]}",
                    level="low",
                    title="Intel Report",
                    summary=summary
                ))
            elif event_type == "threat_detected":
                threat_data = event.get("threat")
                if threat_data:
                    self.state.threats.append(ThreatState(**threat_data))
                    self.state.event_log.append(f"Threat Detected: {threat_data.get('label')}")
            elif event_type == "resource_change":
                uid = event.get("unit_id")
                patch = event.get("resource_patch", {})
                for u in self.state.units:
                    if u.unit_id == uid:
                        if "fuel" in patch: u.resources.fuel = patch["fuel"]
                        if "ammo" in patch: u.resources.ammo = patch["ammo"]
                        if "medical" in patch: u.resources.medical = patch["medical"]
                        self.state.event_log.append(f"Unit {uid} resources updated.")
            elif event_type == "status_change":
                uid = event.get("unit_id")
                new_status = event.get("new_status")
                for u in self.state.units:
                    if u.unit_id == uid:
                        u.status = new_status
                        self.state.event_log.append(f"Unit {uid} status changed to {new_status}.")
            elif event_type == "unit_move":
                uid = event.get("unit_id")
                for u in self.state.units:
                    if u.unit_id == uid:
                        if "latitude" in event: u.latitude = event["latitude"]
                        if "longitude" in event: u.longitude = event["longitude"]
                        if "grid_ref" in event: u.grid_ref = event["grid_ref"]
                        self.state.event_log.append(f"Unit {uid} moved to {u.grid_ref}.")

    def advance_phase(self) -> WorldState:
        next_phase_index = self.state.current_phase_index + 1
        phase = self.scenario_engine.get_phase(next_phase_index)
        
        if phase:
            self.state.current_phase_index = next_phase_index
            self.state.phase_title = phase.get("title", "")
            self._apply_events(phase.get("events", []))
            self.state.scorecard = compute_scorecard(self.state.units, self.state.threats)
            
        return self.state

    def approve_action(self, action_id: str) -> WorldState:
        if self.state and action_id not in self.state.approved_action_ids:
            self.state.approved_action_ids.append(action_id)
            self.state.event_log.append(f"Action {action_id} approved.")
        return self.state

    def reset(self) -> WorldState:
        self.initialize()
        return self.state
