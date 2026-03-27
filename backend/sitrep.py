from models import WorldState, SitrepOutput

async def generate_sitrep(state: WorldState) -> SitrepOutput:
    return SitrepOutput(
        situation="[Placeholder] Situation nominal.",
        threats="[Placeholder] No active threats.",
        friendly_status="[Placeholder] Ready.",
        recommended_action="[Placeholder] Standby.",
        projected_outlook="[Placeholder] Stable."
    )
