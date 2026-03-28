"""
SITREP Generator — Person 3 Owned
Generates situation reports using LLM or fallback content.
"""

import json
import logging
from pathlib import Path

from models import WorldState, SitrepOutput
from config import settings
from fallback_outputs import FALLBACK_SITREPS

logger = logging.getLogger("sentinel.sitrep")

PROMPTS_DIR = Path(__file__).parent / "prompts"


async def generate_sitrep(state: WorldState, doctrine: str = "", area_briefing: str = "") -> SitrepOutput:
    """
    Generate a SITREP from current world state.
    Uses LLM if available, falls back to pre-authored content.
    """
    # Check fallback mode
    if settings.FALLBACK_MODE:
        fallback = FALLBACK_SITREPS.get(("alpha", state.current_phase_index))
        if fallback:
            logger.info(f"FALLBACK_MODE: returning pre-authored SITREP for phase {state.current_phase_index}")
            return fallback

    try:
        # Import here to avoid circular imports
        from ai_reasoning import build_ai_context, _call_llm, load_doctrine, load_area_briefing

        if not doctrine:
            doctrine = load_doctrine()
        if not area_briefing:
            area_briefing = load_area_briefing()

        context = build_ai_context(state, doctrine, area_briefing)
        prompt_template = (PROMPTS_DIR / "sitrep.txt").read_text()
        user_prompt = prompt_template.replace("{context}", context)

        data = await _call_llm(
            system_prompt="You are a military operational intelligence assistant generating a formal situation report. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        return SitrepOutput.model_validate(data)

    except Exception as e:
        logger.warning(f"SITREP generation failed: {e}. Using fallback.")
        fallback = FALLBACK_SITREPS.get(("alpha", state.current_phase_index))
        if fallback:
            return fallback
        # Ultimate fallback
        return SitrepOutput(
            situation=f"Phase {state.current_phase_index}: {state.phase_title}. Theater: {state.theater_name}. {len(state.units)} friendly units, {len(state.threats)} active threats.",
            threats=f"{len(state.threats)} threat(s) active. Threat score: {state.scorecard.threat_score:.0f}/100." if state.threats else "No active threats confirmed.",
            friendly_status=f"{len(state.units)} units operational. Readiness: {state.scorecard.readiness_score:.0f}/100.",
            recommended_action="Refer to AI assessment panel for current recommendations.",
            projected_outlook=f"Escalation risk: {state.scorecard.escalation_risk:.0f}/100. Continued monitoring recommended.",
        )
