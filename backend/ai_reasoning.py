"""
AI Reasoning Layer — Person 3 Owned
Claude API integration for threat assessment, query handling, and future projection.
Falls back to pre-authored responses on any failure.
"""

import json
import os
import re
import logging
from pathlib import Path

import anthropic

from models import WorldState, ReasoningOutput, QueryResponse, ProjectionOutput, Recommendation
from config import settings
from fallback_outputs import (
    FALLBACK_REASONING,
    FALLBACK_QUERIES,
    FALLBACK_PROJECTIONS,
    get_fallback_query,
)

logger = logging.getLogger("sentinel.ai")

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROMPTS_DIR = Path(__file__).parent / "prompts"
DATA_DIR = Path(__file__).parent.parent / "data"

# ---------------------------------------------------------------------------
# Context file loaders (cached at module level)
# ---------------------------------------------------------------------------
_doctrine_cache: str | None = None
_area_briefing_cache: str | None = None


def load_doctrine() -> str:
    global _doctrine_cache
    if _doctrine_cache is None:
        path = DATA_DIR / "doctrine_context.txt"
        _doctrine_cache = path.read_text() if path.exists() else ""
    return _doctrine_cache


def load_area_briefing() -> str:
    global _area_briefing_cache
    if _area_briefing_cache is None:
        path = DATA_DIR / "area_briefing.txt"
        _area_briefing_cache = path.read_text() if path.exists() else ""
    return _area_briefing_cache


def _load_prompt(name: str) -> str:
    """Load a prompt template from the prompts/ directory."""
    return (PROMPTS_DIR / name).read_text()


# ---------------------------------------------------------------------------
# Context builder
# ---------------------------------------------------------------------------
def build_ai_context(state: WorldState, doctrine: str, area_briefing: str) -> str:
    """Construct a compact context string from the current world state."""
    units_summary = "\n".join([
        f"- {u.name} ({u.role}): status={u.status}, "
        f"fuel={u.resources.fuel}%, ammo={u.resources.ammo}%, med={u.resources.medical}%, "
        f"grid={u.grid_ref or f'{u.latitude},{u.longitude}'}"
        for u in state.units
    ])
    threats_summary = "\n".join([
        f"- {t.label}: severity={t.severity}, confidence={t.confidence}%, "
        f"source={t.source_type}, {t.summary}"
        for t in state.threats
    ]) or "No active threats."

    recent_events = "\n".join(state.event_log[-5:]) or "No recent events."

    return f"""MISSION OBJECTIVE: {state.objective}
CURRENT PHASE: {state.phase_title}
THEATER: {state.theater_name}

SCORECARD:
  Threat: {state.scorecard.threat_score:.0f}/100
  Readiness: {state.scorecard.readiness_score:.0f}/100
  Escalation Risk: {state.scorecard.escalation_risk:.0f}/100

FRIENDLY UNITS:
{units_summary}

ACTIVE THREATS:
{threats_summary}

RECENT EVENTS:
{recent_events}

DOCTRINE NOTES:
{doctrine[:500]}

AREA BRIEFING:
{area_briefing[:500]}"""


# ---------------------------------------------------------------------------
# LLM caller
# ---------------------------------------------------------------------------
def _clean_json_response(text: str) -> str:
    """Strip markdown fences and leading prose from LLM output."""
    # Remove ```json ... ``` fences
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    # Find the first { and last } to extract JSON object
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return text.strip()


async def _call_llm(system_prompt: str, user_prompt: str) -> dict:
    """
    Call Claude API and return parsed JSON dict.
    Raises on any failure (caller handles fallback).
    """
    client = anthropic.AsyncAnthropic(api_key=settings.AI_API_KEY)

    response = await client.messages.create(
        model=settings.AI_MODEL,
        max_tokens=1024,
        messages=[
            {"role": "user", "content": user_prompt}
        ],
        system=system_prompt,
        timeout=settings.AI_TIMEOUT,
    )

    raw_text = response.content[0].text
    cleaned = _clean_json_response(raw_text)
    return json.loads(cleaned)


# ---------------------------------------------------------------------------
# Public API functions
# ---------------------------------------------------------------------------
async def assess_threat(
    state: WorldState,
    doctrine: str | None = None,
    area_briefing: str | None = None,
) -> ReasoningOutput:
    """
    Run threat assessment. Returns structured ReasoningOutput.
    Falls back to pre-authored content on any failure.
    """
    if doctrine is None:
        doctrine = load_doctrine()
    if area_briefing is None:
        area_briefing = load_area_briefing()

    # Check fallback mode first
    if settings.FALLBACK_MODE:
        fallback = FALLBACK_REASONING.get(("alpha", state.current_phase_index))
        if fallback:
            logger.info(f"FALLBACK_MODE: returning pre-authored reasoning for phase {state.current_phase_index}")
            return fallback

    try:
        context = build_ai_context(state, doctrine, area_briefing)
        prompt_template = _load_prompt("threat_assessment.txt")
        user_prompt = prompt_template.replace("{context}", context)

        data = await _call_llm(
            system_prompt="You are SENTINEL ACTUAL, a military operational intelligence assistant. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        # Validate with Pydantic
        return ReasoningOutput.model_validate(data)

    except Exception as e:
        logger.warning(f"AI assess_threat failed: {e}. Using fallback.")
        fallback = FALLBACK_REASONING.get(("alpha", state.current_phase_index))
        if fallback:
            return fallback
        # Ultimate fallback
        return ReasoningOutput(
            assessment_summary="Situation assessed. AI analysis temporarily unavailable — using cached assessment.",
            key_risks=["AI reasoning layer offline — manual assessment recommended"],
            recommendations=[],
            assumptions=["Cached data may not reflect latest operational changes"],
            projected_outcome="Situation requires manual commander assessment.",
        )


async def answer_query(
    state: WorldState,
    question: str,
    doctrine: str | None = None,
    area_briefing: str | None = None,
) -> QueryResponse:
    """
    Answer a commander's natural language question.
    Falls back to pre-authored content on any failure.
    """
    if doctrine is None:
        doctrine = load_doctrine()
    if area_briefing is None:
        area_briefing = load_area_briefing()

    # Check fallback mode
    if settings.FALLBACK_MODE:
        fallback = get_fallback_query(question, state.current_phase_index)
        if fallback:
            logger.info(f"FALLBACK_MODE: returning pre-authored query response")
            return fallback

    try:
        context = build_ai_context(state, doctrine, area_briefing)
        prompt_template = _load_prompt("query_response.txt")
        user_prompt = prompt_template.replace("{context}", context).replace("{question}", question)

        data = await _call_llm(
            system_prompt="You are a military operational intelligence assistant answering commander questions. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        return QueryResponse.model_validate(data)

    except Exception as e:
        logger.warning(f"AI answer_query failed: {e}. Using fallback.")
        fallback = get_fallback_query(question, state.current_phase_index)
        if fallback:
            return fallback
        return QueryResponse(
            answer="AI query service temporarily unavailable. Please refer to the operational state display for current information.",
            supporting_points=["System is using cached data", "Live AI analysis will resume shortly"],
            confidence=0.3,
        )


async def project_future(
    state: WorldState,
    action_description: str,
    doctrine: str | None = None,
) -> ProjectionOutput:
    """
    Project future state after an approved action.
    Falls back to pre-authored content on any failure.
    """
    if doctrine is None:
        doctrine = load_doctrine()

    # Check fallback mode
    if settings.FALLBACK_MODE:
        fallback = FALLBACK_PROJECTIONS.get(("alpha", state.current_phase_index))
        if fallback:
            logger.info(f"FALLBACK_MODE: returning pre-authored projection")
            return fallback

    try:
        context = build_ai_context(state, doctrine, load_area_briefing())
        prompt_template = _load_prompt("future_projection.txt")
        user_prompt = prompt_template.replace("{context}", context).replace("{action_description}", action_description)

        data = await _call_llm(
            system_prompt="You are a military operational intelligence assistant projecting outcomes. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        return ProjectionOutput.model_validate(data)

    except Exception as e:
        logger.warning(f"AI project_future failed: {e}. Using fallback.")
        fallback = FALLBACK_PROJECTIONS.get(("alpha", state.current_phase_index))
        if fallback:
            return fallback
        return ProjectionOutput(
            projected_outcome="Projection unavailable — AI analysis offline. Manual assessment recommended.",
            expected_changes=["Action recorded in operational log"],
            new_risks=["Automated projection temporarily unavailable"],
        )
