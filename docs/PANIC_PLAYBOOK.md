# SENTINEL — Panic Playbook

> Emergency procedures for when things are slipping.  
> Trigger: Hour 12. Read this before deciding what to cut.

---

## Decision Framework

At Hour 12, ask three questions:

1. **Can we run the full demo path right now?** (Load → advance → threat → recommendation → query → approve → projection → SITREP)
2. **Which parts break when we try?**
3. **How long would it take to fix vs. how long to route around it?**

If any step takes more than 2 hours to fix, route around it. Do not debug — switch to fallback.

---

## The Riskiest Component

**AI reasoning integration under live scenario advancement.**

It combines: state updates + event timing + LLM API calls + JSON parsing + response formatting + frontend rendering. Any one failure breaks the chain.

---

## Severity Levels

### GREEN — Minor Issues (fix them)

Symptoms: One AI mode returns slightly off formatting. Map tiles are slow. One resource bar doesn't render.

Action: Fix directly. Stay on current plan. No scope cuts needed.

### YELLOW — Moderate Issues (simplify)

Symptoms: AI responses are inconsistent. Phase advance sometimes fails. Query responses are weak. Integration between frontend and backend has rough edges.

Action:
- Reduce to **2 phases** instead of 4 (initial + threat emergence only)
- Use only **1 recommendation** per phase (not multiple)
- Pre-test and **lock 2 demo queries** that always produce good responses
- Cut future projection — just show the recommendation
- Harden fallback responses for every remaining step

### RED — Critical Issues (pivot to fallback mode)

Symptoms: AI integration is unreliable. Backend state management is buggy. Frontend can't render backend responses consistently. More than 2 steps in the demo path are broken.

Action: **Full pivot to Precomputed Mode.** See below.

---

## Precomputed Mode (Red Level)

### What Changes

| Component | Normal Mode | Precomputed Mode |
|---|---|---|
| Scenario engine | Reads JSON, applies events | Loads pre-built WorldState snapshots directly |
| AI reasoning | Live Claude API call | Pre-authored ReasoningOutput from fallback file |
| Query response | Live Claude API call | Pre-authored QueryResponse (2-3 hardcoded questions) |
| Future projection | Live Claude API call | Pre-authored ProjectionOutput |
| SITREP | Live Claude API call | Pre-authored SitrepOutput |
| Scoring | Computed from state | Hardcoded in the pre-built snapshot |
| Frontend | Identical | Identical — no changes needed |

### How to Switch

1. Person 2: Set `FALLBACK_MODE=true` in `.env`
2. Person 2: Ensure `world_state.py` checks the flag and loads from `fallback_outputs.py` instead of calling AI
3. Person 3: Verify all fallback outputs are authored and high-quality
4. Person 1: No changes needed — the API returns the same shaped data either way

### How the Team Reorients

**Person 1 (Frontend):**
- Stop building new features
- Focus 100% on visual polish: colors, spacing, text readability on projector
- Ensure every panel looks professional
- Test on demo hardware

**Person 2 (Backend):**
- Simplify backend to serve pre-built state snapshots
- `/scenario/advance` loads the next pre-built snapshot
- `/query` returns a pre-authored response based on keyword matching
- `/sitrep` returns a static pre-authored SITREP
- Ensure the API is rock-solid (no crashes, no 500s)

**Person 3 (AI/Demo):**
- Stop writing code
- Write the **best possible pre-authored content:**
  - 2-4 ReasoningOutputs (one per phase)
  - 2-3 QueryResponses (for the demo questions)
  - 1 ProjectionOutput
  - 1 SitrepOutput
- Make them sound like a competent military staff officer
- Finalize the demo script
- Start rehearsing narration

---

## What to Cut (in order of priority)

Cut these first — they have the least demo impact:

1. **Future projection** — just show the recommendation, skip "what happens next"
2. **Multiple recommendations** — show one strong recommendation per phase
3. **Free-text query** — use 2-3 pre-set question buttons instead of open input
4. **Phase 3 and 4** — demo only Phase 0 → Phase 1 → done
5. **Animated transitions** — instant state swaps are fine
6. **Scorecard bars** — show text numbers instead of styled gauges
7. **Map popups** — just markers, no click interactions

Cut these only if desperate:

8. **Map entirely** — show a static dark canvas with labeled unit positions
9. **SITREP** — mention it exists, don't demo it
10. **Query box** — narrate what the commander would ask, show a static answer

---

## The Minimum Viable Demo

Even in worst case, this must work:

1. Landing page loads and looks premium
2. Login works (Supabase Auth or pre-authenticated bypass)
3. Dashboard loads with dark theme and looks like a command system
4. At least 3 unit cards visible with status
5. At least 1 threat visible (on map or as a card)
6. AI panel shows an assessment with reasoning text
7. One recommendation with rationale is visible
8. One question-answer pair is shown
9. The narrator tells a coherent 3-minute story

If you have these 9 things, you have a demo. Everything else is enhancement.

---

## Hour-by-Hour Panic Calendar

### Hour 12: Evaluate

- Run the full demo path
- Note every failure
- Classify as GREEN / YELLOW / RED
- Make the cut decision NOW, not at Hour 14

### Hour 13: Execute the cuts

- Person 2 implements any backend simplifications
- Person 3 authors all fallback content
- Person 1 adjusts UI for reduced scope (hide unused panels, simplify interactions)

### Hour 14: Verify

- Run the full reduced demo path 3 times
- Every run must complete without errors
- If it fails, cut more

### Hour 15-18: Polish + rehearse

- Visual polish only (no new features, no new code paths)
- Rehearse demo narration 3+ times
- Pre-test on projector

### Hour 20: FREEZE

- Zero code changes after this point
- Only config/env changes and demo rehearsal

### Hour 22: Record backup video

- Screen-record the best demo run
- Save to a USB drive and phone
- This is insurance against catastrophic live demo failure

---

## The Golden Rule

**If it's broken at Hour 12 and takes more than 2 hours to fix, don't fix it. Route around it.**

A polished demo with pre-computed content beats a buggy demo with live AI every single time. Judges evaluate what they see, not what's happening behind the scenes.
