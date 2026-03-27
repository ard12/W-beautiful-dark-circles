"""
Fallback Outputs — Person 3 Owned
Pre-authored AI responses for all 4 scenario phases.
Used when: API fails, JSON parse fails, response > timeout, FALLBACK_MODE=true.
The user should NEVER see a broken AI panel.
"""

from models import (
    ReasoningOutput,
    Recommendation,
    QueryResponse,
    SitrepOutput,
    ProjectionOutput,
)

# ---------------------------------------------------------------------------
# Fallback Reasoning (keyed by scenario_id, phase_index)
# ---------------------------------------------------------------------------
FALLBACK_REASONING: dict[tuple, ReasoningOutput] = {
    ("alpha", 0): ReasoningOutput(
        assessment_summary="Initial positioning complete. SIGINT intercept from the eastern corridor indicates encrypted burst transmission consistent with hostile C2 activity. Confidence is moderate. No confirmed threat materialized yet, but the intercept warrants elevated surveillance posture.",
        key_risks=[
            "Eastern corridor may be contested — intercept suggests hostile command activity in Grid 440-450 area",
            "Intel confidence is moderate — intercept could be deceptive or routine communications",
        ],
        recommendations=[
            Recommendation(
                action_id="A-1",
                action="Increase surveillance along eastern corridor using Viper-11 recon pass",
                priority="medium",
                expected_effectiveness=0.65,
                resource_cost=0.15,
                rationale="Low-cost reconnaissance to validate intercept before committing ground forces. Viper-11 has fuel at 90% and is well-positioned at Grid 451.",
            )
        ],
        assumptions=[
            "Intercept is genuine and not a deception operation",
            "Hostile movement has not yet materialized in the eastern corridor",
        ],
        projected_outcome="Situation remains stable if hostile movement does not escalate within the next operational window. Surveillance should provide early warning of any column approaching Grid 447.",
    ),
    ("alpha", 1): ReasoningOutput(
        assessment_summary="High-severity threat detected. Drone recon confirms hostile armored column (3x vehicles) moving south toward Grid 447 with estimated arrival in 45 minutes. Simultaneously, Bravo-2 reports medical supplies at 0% after IED casualties. Two concurrent crises demand immediate response.",
        key_risks=[
            "Bravo-2 has zero medical capacity — any casualties in Sector East are unserviceable without medevac support",
            "Hostile armored column within 45 minutes of Grid 447 chokepoint — offensive formation suggests intent to seize the corridor",
            "Single-source drone recon at 71% confidence — hostile intent classified as probable but not confirmed",
        ],
        recommendations=[
            Recommendation(
                action_id="A-1",
                action="Reposition Echo-1 for medevac support at Grid 447",
                priority="high",
                expected_effectiveness=0.78,
                resource_cost=0.35,
                rationale="Echo-1 is the closest medical unit with full capacity (medical 100%, fuel 78%) at Grid 449. Can reach Grid 447 within 15 minutes to cover the medical gap.",
            ),
            Recommendation(
                action_id="A-2",
                action="Request CAS from Viper-11 on hostile column at Grid 445",
                priority="high",
                expected_effectiveness=0.82,
                resource_cost=0.45,
                rationale="Viper-11 on station at Grid 451 with 85% ammo. Interdiction before column reaches engagement range reduces threat to Grid 447 corridor. Doctrine authorizes CAS preparation at threat score above 70.",
            ),
        ],
        assumptions=[
            "Hostile column intent is offensive — formation and direction indicate assault posture",
            "Current drone recon data remains valid for the next 60 minutes",
            "No additional hostile forces approaching from alternate axes",
        ],
        projected_outcome="If both actions approved: Echo-1 closes the medical gap within 15 minutes, and Viper-11 CAS disrupts the hostile column before it reaches Grid 447. Escalation risk decreases from high to moderate. Bravo-2 casualties can be evacuated.",
    ),
    ("alpha", 2): ReasoningOutput(
        assessment_summary="Hostile column has halted at Grid 445 — possible staging for coordinated assault or awaiting reinforcement. A second, lower-confidence threat detected: possible hostile observation post on ridgeline at Grid 449-area. Charlie-1 fuel critically low at 34%, limiting sustained operations.",
        key_risks=[
            "Hostile halt at Grid 445 may indicate preparation for coordinated assault — stationary vehicles could be waiting for infantry or additional armor",
            "Possible hostile forward observer on ridgeline could be directing fire or providing targeting for the armored column",
            "Charlie-1 fuel at 34% restricts ability to reposition or sustain extended engagement",
        ],
        recommendations=[
            Recommendation(
                action_id="A-3",
                action="Dispatch Hotel-6 for emergency fuel resupply to Charlie-1 at Grid 440",
                priority="high",
                expected_effectiveness=0.72,
                resource_cost=0.30,
                rationale="Hotel-6 logistics at Grid 438 with 95% fuel. Charlie-1 at 34% fuel cannot sustain operations. Resupply route through western valley avoids threat axis per doctrine.",
            ),
            Recommendation(
                action_id="A-4",
                action="Task Alpha-1 to investigate possible OP on ridgeline near Grid 449",
                priority="medium",
                expected_effectiveness=0.60,
                resource_cost=0.20,
                rationale="Alpha-1 infantry at Grid 441 can move to ridgeline for visual confirmation. Low confidence on OP detection (55%) warrants ground verification before committing CAS resources.",
            ),
        ],
        assumptions=[
            "Hostile column halt is tactical staging, not withdrawal",
            "Ridgeline IR signature is a hostile observer, not wildlife or equipment",
            "Western valley resupply route remains uncontested",
        ],
        projected_outcome="If resupply approved, Charlie-1 operational endurance extends by 4-6 hours. If OP confirmed and neutralized, hostile column loses forward observation capability, degrading their ability to coordinate an assault on Grid 447.",
    ),
    ("alpha", 3): ReasoningOutput(
        assessment_summary="CAS engagement by Viper-11 confirmed successful. Hostile column dispersed — two vehicles disabled, one retreating north. Bravo-2 now moving (previous medical crisis being addressed). Sector East corridor pressure significantly reduced. BDA pending for full damage assessment.",
        key_risks=[
            "Retreating hostile vehicle may regroup with reinforcements east of Grid 450 — follow-up probe possible within 2-4 hours",
            "Viper-11 ammo now at 62% after engagement — reduced CAS capacity for subsequent threats",
            "BDA not yet complete — actual hostile force attrition may be less than estimated",
        ],
        recommendations=[
            Recommendation(
                action_id="A-5",
                action="Maintain Viper-11 on station for overwatch while BDA is completed",
                priority="medium",
                expected_effectiveness=0.70,
                resource_cost=0.15,
                rationale="Continued air presence deters immediate hostile follow-up action. Viper-11 still has adequate fuel (90%) and ammo (62%) for monitoring role.",
            ),
            Recommendation(
                action_id="A-6",
                action="Request BDA assessment and prepare SITREP for higher command",
                priority="medium",
                expected_effectiveness=0.85,
                resource_cost=0.05,
                rationale="Accurate battle damage assessment is critical for decision-making. Higher command needs updated operational picture for theater-level planning.",
            ),
        ],
        assumptions=[
            "Hostile force will not immediately re-engage with remaining vehicle",
            "CAS engagement did not cause collateral civilian impact",
            "Echo-1 medevac support reached Bravo-2 sector successfully",
        ],
        projected_outcome="Sector East is temporarily stabilized. If Viper-11 maintains overwatch and BDA confirms column destruction, threat level can be downgraded from high to moderate within the next 2 hours. Recommend transitioning to defensive consolidation posture.",
    ),
}


# ---------------------------------------------------------------------------
# Fallback Query Responses
# ---------------------------------------------------------------------------
FALLBACK_QUERIES: dict[tuple, QueryResponse] = {
    ("alpha", "who can reinforce"): QueryResponse(
        answer="Echo-1 Medical is best positioned to reinforce Grid 447 with full medical capacity and adequate fuel. Bravo-2 is closer but medically depleted after IED casualties.",
        supporting_points=[
            "Echo-1: medical 100%, fuel 78%, status ready, Grid 449 — 15 min to Grid 447",
            "Bravo-2: medical 0%, closest unit at Grid 443 but cannot provide casualty support",
            "Charlie-1: fuel at 34%, limited endurance for sustained operations from Grid 440",
        ],
        confidence=0.85,
    ),
    ("alpha", "who can support"): QueryResponse(
        answer="Echo-1 Medical is the strongest support option for Sector East with full medical capacity. Viper-11 CAS can provide air support from Grid 451 with 85% ammo. Alpha-1 infantry is available at Grid 441 for ground reinforcement.",
        supporting_points=[
            "Echo-1: full medical (100%), fuel 78%, ready at Grid 449",
            "Viper-11: CAS on station at Grid 451, ammo 85%, fuel 90%",
            "Alpha-1: infantry, all resources above 85%, ready at Grid 441",
        ],
        confidence=0.88,
    ),
    ("alpha", "what is the threat"): QueryResponse(
        answer="Primary threat is a hostile armored column detected moving south toward Grid 447. Three armored vehicles confirmed by drone recon with 71% confidence. Formation and direction suggest offensive intent with estimated arrival within 45 minutes.",
        supporting_points=[
            "Threat T-1: severity 78/100, confidence 71%, source drone_recon",
            "Column heading toward Grid 447 chokepoint — decisive terrain per area briefing",
            "Prior SIGINT intercept corroborates hostile C2 activity in eastern corridor",
        ],
        confidence=0.82,
    ),
    ("alpha", "fuel status"): QueryResponse(
        answer="Charlie-1 is critically low on fuel at 34% and should not be tasked for extended operations without resupply. Hotel-6 logistics has 95% fuel and is best positioned for resupply from Grid 438. All other units have adequate fuel above 70%.",
        supporting_points=[
            "Charlie-1: fuel 34% — below doctrine minimum of 30% threshold",
            "Hotel-6: logistics, fuel 95%, Grid 438 — can resupply via western valley route",
            "Viper-11: fuel 90%, Alpha-1: fuel 88%, Echo-1: fuel 78%, Bravo-2: fuel 71%",
        ],
        confidence=0.92,
    ),
    ("alpha", "medical status"): QueryResponse(
        answer="Bravo-2 medical supplies are at 0% after treating IED casualties — this is a critical gap in Sector East. Echo-1 Medical has full 100% medical capacity and should be repositioned to cover the gap. All other units have adequate medical above 60%.",
        supporting_points=[
            "Bravo-2: medical 0% — depleted, requesting medevac support",
            "Echo-1: medical 100%, nearest medical-capable unit at Grid 449",
            "Doctrine requires MEDEVAC takes priority over logistics resupply",
        ],
        confidence=0.90,
    ),
}


def get_fallback_query(question: str, phase_index: int) -> QueryResponse | None:
    """
    Find the best matching fallback query response using keyword matching.
    Returns None if no match found.
    """
    question_lower = question.lower()
    # Try exact key matches first
    for (scenario, key), response in FALLBACK_QUERIES.items():
        if key in question_lower:
            return response
    # Try partial keyword matching
    keyword_map = {
        "reinforce": ("alpha", "who can reinforce"),
        "support": ("alpha", "who can support"),
        "threat": ("alpha", "what is the threat"),
        "fuel": ("alpha", "fuel status"),
        "medical": ("alpha", "medical status"),
        "medevac": ("alpha", "medical status"),
        "casualt": ("alpha", "medical status"),
    }
    for keyword, key in keyword_map.items():
        if keyword in question_lower:
            return FALLBACK_QUERIES.get(key)
    return None


# ---------------------------------------------------------------------------
# Fallback SITREP Outputs
# ---------------------------------------------------------------------------
FALLBACK_SITREPS: dict[tuple, SitrepOutput] = {
    ("alpha", 0): SitrepOutput(
        situation="Task Force Alpha positioned in Theater Alpha, Sector East. All units at initial positions with nominal resource levels. SIGINT intercept detected encrypted burst transmission from eastern corridor consistent with hostile C2 activity.",
        threats="No confirmed threats materialized. Moderate-confidence intercept suggests potential hostile activity in Grid 440-450 area. Monitoring posture recommended.",
        friendly_status="All six units operational and ready. Alpha-1 infantry at Grid 441, Bravo-2 armor at Grid 443, Charlie-1 armor at Grid 440, Echo-1 medical at Grid 449, Viper-11 CAS on station at Grid 451, Hotel-6 logistics at Grid 438. Resource levels nominal across all elements.",
        recommended_action="Maintain current defensive posture. Increase surveillance along eastern corridor. Monitor for follow-up intercepts or visual confirmation of hostile movement.",
        projected_outlook="Situation stable with elevated surveillance posture. If hostile activity materializes in the eastern corridor, early warning should provide sufficient reaction time to reinforce Grid 447 chokepoint.",
    ),
    ("alpha", 1): SitrepOutput(
        situation="Significant threat emergence in Sector East. Drone recon confirms hostile armored column (3x vehicles) moving south toward Grid 447 chokepoint. Concurrent medical crisis: Bravo-2 reports zero medical supplies after IED casualties on patrol route.",
        threats="Primary threat T-1: hostile armored column at Grid 447 approach, severity 78/100, confidence 71%. Formation and movement pattern indicate offensive intent with estimated arrival 45 minutes. Single-source drone reconnaissance.",
        friendly_status="Bravo-2 medically depleted (0%) after IED casualties — critical gap in Sector East casualty support. Echo-1 medical at full capacity (100%) at Grid 449. Viper-11 CAS on station with 85% ammo. Charlie-1 and Alpha-1 at nominal readiness. Hotel-6 logistics at rear.",
        recommended_action="PRIORITY 1: Reposition Echo-1 for medevac at Grid 447. PRIORITY 2: Authorize Viper-11 CAS against hostile column at Grid 445 before it reaches engagement range. Doctrine threshold met (threat score >70).",
        projected_outlook="If recommendations approved, medical gap closes within 15 minutes and hostile column disrupted before reaching Grid 447. Without action, Sector East faces simultaneous combat and medical crisis within 45 minutes.",
    ),
    ("alpha", 2): SitrepOutput(
        situation="Hostile column halted at Grid 445 — possible staging for coordinated assault. Second threat detected: possible hostile observation post on ridgeline (Grid 449-area, low confidence 55%). Charlie-1 fuel critically low at 34%.",
        threats="T-1 remains active at Grid 445 — hostile vehicles stationary for 12+ minutes, possibly staging. T-2: IR signature on ridgeline, severity 42/100, confidence 55%. If confirmed as hostile OP, adversary has observation over Sector East approach.",
        friendly_status="Charlie-1 fuel at 34% — approaching doctrine minimum (30%). Bravo-2 still medically depleted. Echo-1 repositioning for medevac support. Viper-11 on station. Hotel-6 available for logistics support from Grid 438.",
        recommended_action="PRIORITY 1: Emergency fuel resupply to Charlie-1 via Hotel-6 (western valley route). PRIORITY 2: Ground verification of ridgeline OP by Alpha-1 before committing CAS. Maintain Viper-11 ready for column engagement.",
        projected_outlook="Hostile column halt creates a response window. If staging is confirmed, expect coordinated assault within 1-2 hours. Logistic resupply and OP neutralization should be completed before hostile action resumes.",
    ),
    ("alpha", 3): SitrepOutput(
        situation="CAS engagement successful. Viper-11 engaged hostile armored column at Grid 445. Two vehicles disabled, one retreating north. Bravo-2 now moving (medical crisis being addressed). Echo-1 repositioned to Grid 447. Sector East corridor pressure significantly reduced.",
        threats="Residual threat: one hostile vehicle retreating north toward staging area east of Grid 450. May regroup with reinforcements. BDA assessment pending — actual attrition may differ from initial reports. Viper-11 ammo reduced to 62%.",
        friendly_status="Echo-1 now providing medical coverage at Grid 447. Bravo-2 in motion to secure position. Viper-11 ammo at 62% after engagement, fuel adequate (90%). Charlie-1 fuel status addressed. Alpha-1 and Hotel-6 at nominal readiness.",
        recommended_action="Maintain Viper-11 on overwatch during BDA completion. Monitor for hostile reinforcement activity east of Grid 450. Prepare transition to defensive consolidation posture. Generate full assessment for higher command.",
        projected_outlook="Sector East temporarily stabilized. Threat level can be downgraded from high to moderate within 2 hours if BDA confirms column destruction. Expect possible follow-up probe in 2-4 hours as adversary reassesses.",
    ),
}


# ---------------------------------------------------------------------------
# Fallback Projection Outputs
# ---------------------------------------------------------------------------
FALLBACK_PROJECTIONS: dict[tuple, ProjectionOutput] = {
    ("alpha", 0): ProjectionOutput(
        projected_outcome="Surveillance increased along eastern corridor. If intercept is genuine, early warning of hostile movement expected within 30-60 minutes. Task Force maintains defensive posture with improved situational awareness.",
        expected_changes=[
            "Viper-11 redeploys for recon pass along Grid 445-450 corridor",
            "Surveillance coverage of eastern approach increases from 60% to 85%",
        ],
        new_risks=[
            "Viper-11 recon pass may alert hostile forces to air surveillance capability",
        ],
    ),
    ("alpha", 1): ProjectionOutput(
        projected_outcome="Echo-1 medevac closes the medical gap at Grid 447 within 15 minutes. Viper-11 CAS engagement disrupts hostile column before reaching Grid 447, reducing immediate threat by approximately 60%. Bravo-2 casualties can be evacuated. Defensive posture strengthens materially.",
        expected_changes=[
            "Echo-1 repositions from Grid 449 to Grid 447 — fuel decreases by ~10%",
            "Viper-11 engages hostile column — ammo expected to decrease by 20-25%",
            "Hostile armored threat neutralized or significantly degraded at Grid 445",
            "Medical evacuation capability restored in Sector East",
        ],
        new_risks=[
            "Viper-11 ammo reduction limits follow-on CAS availability",
            "Hostile forces may retaliate with indirect fire or follow-on column from east",
        ],
    ),
    ("alpha", 2): ProjectionOutput(
        projected_outcome="Charlie-1 receives emergency fuel resupply, extending operational endurance by 4-6 hours. If ridgeline OP confirmed and neutralized by Alpha-1, hostile column loses forward observation, degrading their assault coordination capability.",
        expected_changes=[
            "Charlie-1 fuel increases from 34% to approximately 75% after resupply",
            "Hotel-6 fuel decreases by ~15% for resupply trip via western valley",
            "Alpha-1 moves from Grid 441 to ridgeline near Grid 449 for OP verification",
        ],
        new_risks=[
            "Alpha-1 movement toward ridgeline may be observed by hostile OP",
            "Hotel-6 resupply convoy on western valley route — vulnerability window during transit",
        ],
    ),
    ("alpha", 3): ProjectionOutput(
        projected_outcome="With Viper-11 maintaining overwatch, hostile forces are deterred from immediate follow-up action. BDA completion provides accurate picture for higher command. Sector East transitions to defensive consolidation with improved posture.",
        expected_changes=[
            "Viper-11 continues overwatch — fuel consumption increases but ammo preserved at 62%",
            "BDA report generated within 30-60 minutes",
            "Threat level assessment updated from high to moderate pending BDA confirmation",
            "SITREP transmitted to higher command for theater-level decision support",
        ],
        new_risks=[
            "Prolonged Viper-11 station time increases fuel consumption — may need to rotate or refuel",
            "Hostile force may attempt night-time regrouping beyond current surveillance range",
        ],
    ),
}
