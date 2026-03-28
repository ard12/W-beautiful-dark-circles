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


def _unique_preserving_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _clip_score(value: float) -> int:
    return max(0, min(100, round(value)))


def _collect_matching_threat_ids(state: WorldState, text: str) -> list[str]:
    haystack = text.lower()
    matched = [
        threat.threat_id
        for threat in state.threats
        if any(
            token and token.lower() in haystack
            for token in [
                threat.threat_id,
                threat.label,
                threat.actor or "",
                threat.attack_type or "",
                threat.owner_country or "",
                threat.source_type or "",
            ]
        )
    ]
    if matched:
        return _unique_preserving_order(matched)

    ranked = sorted(state.threats, key=lambda threat: (threat.severity, threat.confidence), reverse=True)
    return [threat.threat_id for threat in ranked[:2]]


def _collect_matching_unit_ids(state: WorldState, text: str) -> list[str]:
    haystack = text.lower()
    matched = [
        unit.unit_id
        for unit in state.units
        if any(
            token and token.lower() in haystack
            for token in [unit.unit_id, unit.name, unit.role, unit.grid_ref or ""]
        )
    ]
    if matched:
        return _unique_preserving_order(matched)

    stressed_units = [
        unit.unit_id
        for unit in state.units
        if unit.status != "ready" or min(unit.resources.fuel, unit.resources.ammo, unit.resources.medical) < 60
    ]
    if stressed_units:
        return _unique_preserving_order(stressed_units[:2])

    return [unit.unit_id for unit in state.units[:1]]


def _collect_relevant_event_log(state: WorldState, text: str, threat_ids: list[str], unit_ids: list[str]) -> list[str]:
    recent_events = state.event_log[-5:]
    if not recent_events:
        return []

    haystack = text.lower()
    threat_refs = {
        threat.threat_id: threat
        for threat in state.threats
    }
    unit_refs = {
        unit.unit_id: unit
        for unit in state.units
    }

    keywords = [
        *threat_ids,
        *unit_ids,
        *[threat_refs[threat_id].label for threat_id in threat_ids if threat_id in threat_refs],
        *[unit_refs[unit_id].name for unit_id in unit_ids if unit_id in unit_refs],
    ]

    matched_events = [
        event
        for event in recent_events
        if any(keyword and keyword.lower() in event.lower() for keyword in keywords) or event.lower() in haystack
    ]
    if matched_events:
        return _unique_preserving_order(matched_events)[:3]

    return recent_events[-3:]


def _build_confidence_drivers(state: WorldState) -> list[dict]:
    drivers: list[dict] = []
    recent_events = state.event_log[-5:]

    if state.threats:
        highest_conf = max(state.threats, key=lambda threat: threat.confidence)
        drivers.append({
            "label": "Threat-source confidence",
            "score": _clip_score(highest_conf.confidence),
            "reason": f"{highest_conf.label} is tracked at {highest_conf.confidence:.0f}% confidence via {highest_conf.source_type}.",
            "impact": "supports" if highest_conf.confidence >= 70 else "limits",
        })

        unique_sources = len({threat.source_type for threat in state.threats})
        convergence_score = _clip_score(32 + unique_sources * 20 + min(len(state.threats), 3) * 12)
        drivers.append({
            "label": "Signal convergence",
            "score": convergence_score,
            "reason": f"{len(state.threats)} active threat line(s) across {unique_sources} source stream(s) are informing the assessment.",
            "impact": "supports" if unique_sources > 1 or len(state.threats) > 1 else "limits",
        })
    else:
        drivers.append({
            "label": "Threat-source confidence",
            "score": 28,
            "reason": "No active threats are currently confirmed in the state snapshot.",
            "impact": "limits",
        })

    drivers.append({
        "label": "Event recency",
        "score": _clip_score(35 + len(recent_events) * 12),
        "reason": recent_events[-1] if recent_events else "No recent events have been logged.",
        "impact": "supports" if recent_events else "limits",
    })

    telemetry_score = _clip_score(sum(
        (unit.resources.fuel + unit.resources.ammo + unit.resources.medical) / 3
        for unit in state.units
    ) / len(state.units)) if state.units else 0
    drivers.append({
        "label": "Unit telemetry coverage",
        "score": telemetry_score,
        "reason": f"{len(state.units)} unit(s) are reporting status and resource telemetry into the model context.",
        "impact": "supports" if telemetry_score >= 65 else "limits",
    })

    return drivers[:4]


def _merge_confidence_drivers(existing: list, derived: list[dict]) -> list[dict]:
    merged: list[dict] = []
    seen_labels: set[str] = set()
    for driver in [*(existing or []), *derived]:
        label = driver.label if hasattr(driver, "label") else driver.get("label")
        if not label or label in seen_labels:
            continue
        seen_labels.add(label)
        merged.append(driver if isinstance(driver, dict) else driver.model_dump())
    return merged


def _enrich_with_provenance(model, state: WorldState, text: str):
    threat_ids = _collect_matching_threat_ids(state, text)
    unit_ids = _collect_matching_unit_ids(state, text)
    event_log = _collect_relevant_event_log(state, text, threat_ids, unit_ids)
    payload = {
        **model.model_dump(),
        "based_on_threat_ids": _unique_preserving_order([
            *(getattr(model, "based_on_threat_ids", []) or []),
            *threat_ids,
        ]),
        "based_on_unit_ids": _unique_preserving_order([
            *(getattr(model, "based_on_unit_ids", []) or []),
            *unit_ids,
        ]),
        "based_on_event_log": _unique_preserving_order([
            *(getattr(model, "based_on_event_log", []) or []),
            *event_log,
        ])[:3],
        "confidence_drivers": _merge_confidence_drivers(
            getattr(model, "confidence_drivers", []) or [],
            _build_confidence_drivers(state),
        ),
    }
    return model.__class__.model_validate(payload)


def enrich_reasoning_output(output: ReasoningOutput, state: WorldState) -> ReasoningOutput:
    enriched_recommendations = [
        _enrich_with_provenance(
            recommendation,
            state,
            " ".join(filter(None, [recommendation.action, recommendation.rationale])),
        )
        for recommendation in output.recommendations
    ]

    reasoning_text = " ".join(filter(None, [
        output.assessment_summary,
        output.projected_outcome,
        *output.key_risks,
        *output.assumptions,
        *[recommendation.action for recommendation in enriched_recommendations],
        *[recommendation.rationale for recommendation in enriched_recommendations],
    ]))

    return _enrich_with_provenance(
        output.model_copy(update={"recommendations": enriched_recommendations}),
        state,
        reasoning_text,
    )


def enrich_query_response(output: QueryResponse, state: WorldState) -> QueryResponse:
    return _enrich_with_provenance(output, state, " ".join([output.answer, *output.supporting_points]))


def enrich_projection_output(output: ProjectionOutput, state: WorldState, action_description: str = "") -> ProjectionOutput:
    return _enrich_with_provenance(
        output,
        state,
        " ".join([action_description, output.projected_outcome, *output.expected_changes, *output.new_risks]),
    )


def enrich_sitrep_output(output, state: WorldState):
    return _enrich_with_provenance(
        output,
        state,
        " ".join([
            output.situation,
            output.threats,
            output.friendly_status,
            output.recommended_action,
            output.projected_outlook,
        ]),
    )


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
            return enrich_reasoning_output(fallback, state)

    try:
        context = build_ai_context(state, doctrine, area_briefing)
        prompt_template = _load_prompt("threat_assessment.txt")
        user_prompt = prompt_template.replace("{context}", context)

        data = await _call_llm(
            system_prompt="You are SENTINEL ACTUAL, a military operational intelligence assistant. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        # Validate with Pydantic
        return enrich_reasoning_output(ReasoningOutput.model_validate(data), state)

    except Exception as e:
        logger.warning(f"AI assess_threat failed: {e}. Using fallback.")
        fallback = FALLBACK_REASONING.get(("alpha", state.current_phase_index))
        if fallback:
            return enrich_reasoning_output(fallback, state)
        # Ultimate fallback
        return enrich_reasoning_output(ReasoningOutput(
            assessment_summary="Situation assessed. AI analysis temporarily unavailable — using cached assessment.",
            key_risks=["AI reasoning layer offline — manual assessment recommended"],
            recommendations=[],
            assumptions=["Cached data may not reflect latest operational changes"],
            projected_outcome="Situation requires manual commander assessment.",
        ), state)


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
            return enrich_query_response(fallback, state)

    try:
        context = build_ai_context(state, doctrine, area_briefing)
        prompt_template = _load_prompt("query_response.txt")
        user_prompt = prompt_template.replace("{context}", context).replace("{question}", question)

        data = await _call_llm(
            system_prompt="You are a military operational intelligence assistant answering commander questions. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        return enrich_query_response(QueryResponse.model_validate(data), state)

    except Exception as e:
        logger.warning(f"AI answer_query failed: {e}. Using fallback.")
        fallback = get_fallback_query(question, state.current_phase_index)
        if fallback:
            return enrich_query_response(fallback, state)
        return enrich_query_response(QueryResponse(
            answer="AI query service temporarily unavailable. Please refer to the operational state display for current information.",
            supporting_points=["System is using cached data", "Live AI analysis will resume shortly"],
            confidence=0.3,
        ), state)


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
            return enrich_projection_output(fallback, state, action_description)

    try:
        context = build_ai_context(state, doctrine, load_area_briefing())
        prompt_template = _load_prompt("future_projection.txt")
        user_prompt = prompt_template.replace("{context}", context).replace("{action_description}", action_description)

        data = await _call_llm(
            system_prompt="You are a military operational intelligence assistant projecting outcomes. Return ONLY valid JSON.",
            user_prompt=user_prompt,
        )

        return enrich_projection_output(ProjectionOutput.model_validate(data), state, action_description)

    except Exception as e:
        logger.warning(f"AI project_future failed: {e}. Using fallback.")
        fallback = FALLBACK_PROJECTIONS.get(("alpha", state.current_phase_index))
        if fallback:
            return enrich_projection_output(fallback, state, action_description)
        return enrich_projection_output(ProjectionOutput(
            projected_outcome="Projection unavailable — AI analysis offline. Manual assessment recommended.",
            expected_changes=["Action recorded in operational log"],
            new_risks=["Automated projection temporarily unavailable"],
        ), state, action_description)
