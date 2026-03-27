import json

class ScenarioEngine:
    def __init__(self, scenario_path: str):
        self.scenario_path = scenario_path
        with open(self.scenario_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
            
    def get_theater_name(self) -> str:
        return self.data.get("theater_name", "Unknown Theater")
        
    def get_objective(self) -> str:
        return self.data.get("objective", "Unknown Objective")
        
    def get_total_phases(self) -> int:
        return len(self.data.get("phases", []))

    def get_phase(self, phase_index: int):
        phases = self.data.get("phases", [])
        for phase in phases:
            if phase.get("phase_index") == phase_index:
                return phase
        return None
