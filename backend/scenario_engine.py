"""
Scenario Engine — Person 2 Owned (implemented by Person 3 for integration)
Reads scenario JSON and provides phase data on demand.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger("sentinel.scenario")


class ScenarioEngine:
    def __init__(self, scenario_path: str):
        self.scenario_path = scenario_path
        self.scenario_data: dict = {}
        self.phases: list = []
        self._load()

    def _load(self) -> None:
        """Load scenario JSON from disk."""
        path = Path(self.scenario_path)
        if path.exists():
            with open(path) as f:
                self.scenario_data = json.load(f)
            self.phases = self.scenario_data.get("phases", [])
            logger.info(f"Loaded scenario '{self.scenario_data.get('scenario_id', 'unknown')}' with {len(self.phases)} phases")
        else:
            logger.warning(f"Scenario file not found: {self.scenario_path}")

    def get_metadata(self) -> dict:
        """Return scenario-level metadata (theater_name, objective, etc.)."""
        return {
            "scenario_id": self.scenario_data.get("scenario_id", "alpha"),
            "theater_name": self.scenario_data.get("theater_name", "Theater Alpha"),
            "objective": self.scenario_data.get("objective", ""),
            "initial_threat_level": self.scenario_data.get("initial_threat_level", "elevated"),
            "total_phases": len(self.phases),
        }

    def get_phase(self, phase_index: int) -> dict | None:
        """Return phase data for the given index, or None if out of range."""
        for phase in self.phases:
            if phase.get("phase_index") == phase_index:
                return phase
        return None

    def get_phase_events(self, phase_index: int) -> list:
        """Return events for a given phase index."""
        phase = self.get_phase(phase_index)
        if phase:
            return phase.get("events", [])
        return []

    def get_total_phases(self) -> int:
        """Return total number of phases in the scenario."""
        return len(self.phases)
