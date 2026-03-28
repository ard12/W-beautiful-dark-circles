# SENTINEL — 24-Hour Hackathon Blueprint

> Master planning document for a 3-person, 24-hour build.  
> Strategy, architecture, timeline, roles, and demo plan.

---

## 1. Project Snapshot

**One-line idea:** An AI-native mission intelligence co-pilot that fuses multi-source inputs into one operational picture, reasons about threats, recommends actions, and projects future outcomes.

**Format:** 24-hour hackathon  
**Team:** 3 active builders  
**Primary user:** Commander / operator / analyst in a fast-moving operational environment  
**Core promise:** Turn fragmented operational inputs into a single, explainable, actionable decision surface

### Why this is a strong hackathon project

- Highly visual — dark military dashboard, map with markers, real-time alerts
- Premium product presence — landing page + login + dashboard makes it feel like a real product, not a weekend hack
- Easy to narrate — judges understand the loop in under a minute
- Strong AI story without needing frontier research
- Feels bigger than the MVP actually is
- Reliable because the demo uses staged scenario data
- Clear demo arc: landing → login → operational picture → reasoning → projected outcome

---

## 2. Vision

The original concept is not just a dashboard. It is a combined system for multi-source fusion, threat evaluation, AI reasoning, planning support, execution visibility, and future-ops projection.

The deeper logic:

**Objective → Inputs → Situation Assessment → Outcome → Planning → Execution → Future Ops Planning**

### What survives into the MVP

- One fused operational picture (map + ORBAT + threats in one screen)
- AI that explains itself (structured assessment with reasoning)
- Commander query interface (NL questions, grounded answers)
- One planning loop (recommend → approve → project)
- One future-projection moment
- One clean story-driven scenario
- SITREP generation

### What does NOT survive into the MVP

- Real secure comms or mesh networking
- Real drone / video inference
- Local edge AI deployment (Ollama, Mistral 7B)
- Multi-agent reasoning systems
- Full mission-planner depth
- Full logistics platform
- Vector DB / RAG pipeline
- 3D globe (Cesium.js)

---

## 3. Design Recommendation

### MVP Shape

Three product surfaces:

1. **Landing / product page** — premium intro surface that frames the problem, explains SENTINEL, and communicates value. This is the judge's first impression and should feel like a polished product reveal, not a placeholder.
2. **Login page** — clean Supabase Auth entry. Simple, intentional, product-grade.
3. **Command dashboard** — the core operational interface, a single-screen with three columns:
   - **Left:** ORBAT / unit cards / resource status / alerts
   - **Center:** Operational map with unit and threat markers
   - **Right:** Scorecard, AI assessment, recommendation card, query box, SITREP action

### Why landing + login matter for a hackathon

- Judges see a complete product, not a raw internal tool
- The landing page controls the narrative before the demo begins
- Login signals seriousness and product maturity
- The transition from landing → login → dashboard is itself a wow moment
- Total build cost is low; presentation impact is high

### Interaction Model

**Phase-based scenario advancement** — not real-time streaming.

The user clicks "Advance Phase" to step through a scripted mission timeline. Each advance triggers: state update → score recomputation → AI reasoning → UI refresh.

This gives you: reliability, demo control, less debugging risk, a stronger narrative.

### Intelligence Model

**Single orchestrated reasoning layer** — not multi-agent.

- Compute key scores deterministically in backend code
- Use one LLM call per phase advance for structured assessment
- Require JSON output from the LLM, validate with Pydantic
- Show both computed metrics AND AI reasoning to the user

### Build Philosophy

- Simulate inputs, make the UI look real
- Keep the backend simple, push complexity into scenario design and presentation
- Optimize for one excellent demo path, not feature breadth
- Invest in first impressions: landing page and login polish are part of demo reliability

---

## 4. Our Direction vs. Recommended Direction

### Keep
- Fused operational picture
- Threat assessment with explanation
- AI recommendations with rationale
- Commander-style query interface
- SITREP generation
- Planning + future impact framing
- Map + unit-state visualization
- Resource tracking (simplified)

### Simplify
- Multi-agent reasoning → single structured reasoning pipeline
- Mission planner → one recommendation flow with approval
- Resource tracker → embedded in unit cards (fuel/ammo/medical bars)
- Future ops planning → one projected-outcome panel
- Multi-source ingestion → staged synthetic sources in scenario JSON

### Replace
- Real drone/vision feeds → scripted detection events
- Local edge model stack → cloud LLM API (Claude)
- Full retrieval / vector DB → curated context pack (doctrine + area briefing text files)
- Cesium.js 3D globe → Leaflet 2D with dark tiles
- Custom auth system → Supabase Auth (simple, fast, hackathon-friendly)

### Cut from MVP
- Mesh sync, encrypted comms, offline-first
- Full doctrine engine
- Live video analysis, voice pipeline
- Real classified-source handling
- Docker, heavy custom infrastructure
- Complex RBAC or enterprise auth

---

## 5. Feasibility Triage

### Must Build
- Landing / product page (premium first impression)
- Login page (Supabase Auth)
- Single-screen dashboard (3-column layout)
- Scenario engine (JSON phase reader)
- In-memory world state manager
- Map with unit + threat markers (Leaflet)
- ORBAT / unit cards with status colors and resource bars
- AI reasoning panel (assessment + recommendations)
- Text query box with grounded NL answers
- Deterministic threat scoring (backend-computed)
- One recommendation → approval → projection loop
- SITREP generation
- One stable demo scenario

### Build Only in Simplified Form
- Planning loop (one cycle, not continuous)
- Future-state projection (LLM-generated text, not full state recalculation)
- Resource model (three bars: fuel, ammo, medical — no complex math)
- Multiple source types (labels in scenario JSON, not real adapters)
- Confidence/explanation display (text in AI panel, not elaborate viz)

### Stretch Goals (only if stable by Hour 18)
- Animated unit movement on map
- Second scenario
- Voice query (browser Web Speech API)
- Decision audit trail panel
- Timeline scrubber
- Threat-radius overlays on map

### Do Not Build in 24 Hours
- Real sensor/video ingestion
- Local LLM deployment
- Vector DB / full RAG
- Multi-agent loops
- Mesh networking / secure node sync
- Production persistence layer
- Real tactical comms integrations
- Multi-user collaboration

---

## 6. Recommended MVP

A simulated mission intelligence and planning dashboard that:

1. Ingests a staged scenario from multiple mock sources
2. Fuses inputs into a live world state
3. Computes a threat score and readiness status
4. Asks an LLM for structured assessment + recommendations
5. Lets the commander ask natural-language questions
6. Lets the commander approve a recommendation
7. Shows projected future state
8. Generates a SITREP

### What the MVP must prove

- The system **sees** a combined picture
- The system **understands** the picture
- The system **recommends** action
- The system **explains why**
- The system **projects** likely downstream impact

### Success criteria at Hour 24

Open the dashboard → run the scenario → show threat changes → show AI reasoning → ask a state-aware question → approve a plan → show projected impact → generate SITREP → finish a 3-minute demo without breaking flow.

---

## 7. Alternative MVP Path

**Trigger:** If the scenario pipeline is unstable by Hour 6, switch to this.

### Static Snapshot + Step Advance Mode

- Load one precomputed operational state
- Show alerts and recommendations pre-populated
- Use the query interface as main interaction
- "Advance to Next Phase" button loads a second precomputed state
- Show projection after approval

This preserves: fused picture, reasoning, planning, projection, SITREP — while eliminating the scenario engine as a risk factor.

---

## 8. Non-Goals

We are **not** building: a real military system, a production command platform, real offensive automation, real classified integration, autonomous decision-making, full doctrinal planning, mission-critical infrastructure, real-time video inference, or a long-term data platform.

---

## 9. 24-Hour Definition of Done

### Must be working
- Dashboard renders with all three panels
- World state updates at least once during demo (phase advance)
- AI output appears in structured readable form
- Query returns a grounded answer
- One recommendation can be approved
- Projected future state appears after approval
- SITREP generates

### Must be visible to judges
- Unit status with color-coded health
- Threat markers on map
- AI assessment and recommendation text
- Scorecard with numeric metrics
- Resource/sustainment indicators
- Plan → projection transition

### Must be demo-safe
- Pre-seeded fallback state available
- Cached/fallback LLM responses ready
- Backup video or screenshots prepared
- Fixed demo script rehearsed

---

## 10. Happy Path

1. Landing page loads — premium product intro, problem framing, value proposition
2. Commander logs in via Supabase Auth — clean, fast, product-grade
3. Dashboard opens in Theater Alpha — units, map, and objective visible
4. Scenario phase advances — intel report arrives, threat marker appears on map
5. ORBAT/resource status updates — Bravo-2 medical drops, Charlie-1 fuel degrades
6. AI panel explains the threat and scores it — recommendations surface
7. Commander types: "Who can support this sector?"
8. System responds using current world state with supporting data points
9. Commander approves recommended plan
10. System projects likely next state — new risks and expected changes shown
11. SITREP generated — formatted situation report covering all aspects

---

## 11. System Architecture

### Data Flow

```
Scenario JSON / Mock Inputs
        ↓
Scenario Engine (phase reader)
        ↓
World State Manager (in-memory)
        ↓
Threat / Readiness / Escalation Scoring (deterministic)
        ↓
AI Reasoning Layer (structured JSON via LLM API)
        ↓
API Response (REST endpoints)
        ↓
Frontend Dashboard (React + Leaflet)
```

### Core Rule

**AI interprets. Backend validates and scores. Frontend visualizes.**

1. Scenario event enters backend
2. Backend updates world state
3. Deterministic scorer recomputes metrics
4. LLM receives constrained prompt + current state + context pack
5. LLM returns typed assessment/recommendation JSON
6. Backend validates against Pydantic schema
7. Frontend updates map, cards, and reasoning panel
8. User approves action or asks follow-up
9. Backend generates projected next state
10. SITREP available on demand

### User Flow

**Observe → Inspect → Ask → Approve → Project → Report**

---

## 12. Core Components

### Scenario Engine
- Reads event timeline from JSON
- Supports event types: `intel_report`, `threat_detected`, `unit_move`, `resource_change`, `status_change`, `plan_approved`
- Advances through 3-5 phases on user command

### World State Manager
- Holds in-memory: units, threats, resources, alerts, event log, approved actions, projected summary
- Initializes from `units_initial.json` + scenario metadata
- Applies phase events, recomputes scorecard, exposes snapshot

### Threat Scoring Layer
- Deterministic computation — not LLM-dependent
- Inputs: severity, proximity to friendlies, intelligence confidence, operational pressure
- Outputs: `threat_score`, `readiness_score`, `escalation_risk`, `confidence_score` (all 0-100)

### AI Reasoning Layer
- Cloud LLM (Claude API) with structured JSON output
- Five modes: threat assessment, recommendation, query response, future projection, SITREP
- All outputs validated against Pydantic schemas
- Fallback to pre-cached responses if API fails

### Query Handler
- Accepts NL questions grounded in current world state
- Returns structured answer with supporting points and confidence

### Recommendation Layer
- Produces: action, priority, expected effectiveness, resource cost, rationale
- Commander can approve — triggers projection

### SITREP Generator
- Sections: situation, threats, friendly status, sustainment, recommended action, projected outlook
- One-click generation from current state

---

## 13. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast setup, hot reload |
| Styling | TailwindCSS | Rapid dark-theme, no CSS debugging |
| Map | react-leaflet + CartoDB Dark Matter tiles | 5-min setup, dark military look |
| Charts | Recharts (optional) | Quick resource bar charts |
| Auth + DB | Supabase (Auth + Postgres) | Instant auth, optional persistence, hackathon-friendly |
| Backend | Python 3.11 + FastAPI | Async, orchestration, scoring, AI reasoning |
| Validation | Pydantic v2 | Schema enforcement for all data |
| AI/LLM | Anthropic Claude API | Best reasoning quality |
| State | In-memory Python dict + Supabase fallback | Fast runtime state; Supabase for persistence where useful |
| Data | JSON files + plaintext context | Scenario seeding, fallback, demo safety |

---

## 14. Repository Layout

```
sentinel-bms/
├── README.md
├── BLUEPRINT.md
├── IMPLEMENTATION_SPEC.md
├── .env.example
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/client.js
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── OrbatPanel.jsx
│   │   │   ├── UnitCard.jsx
│   │   │   ├── ThreatPanel.jsx
│   │   │   ├── AiPanel.jsx
│   │   │   ├── PlanCard.jsx
│   │   │   ├── QueryBox.jsx
│   │   │   ├── SitrepModal.jsx
│   │   │   └── TimelineControls.jsx
│   │   ├── hooks/useScenarioState.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   └── styles/index.css
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── config.py
│   ├── models.py
│   ├── world_state.py
│   ├── scenario_engine.py
│   ├── threat_scorer.py
│   ├── ai_reasoning.py
│   ├── sitrep.py
│   ├── fallback_outputs.py
│   ├── prompts/
│   │   ├── threat_assessment.txt
│   │   ├── query_response.txt
│   │   ├── future_projection.txt
│   │   └── sitrep.txt
│   └── routes/
│       ├── state.py
│       ├── scenario.py
│       ├── query.py
│       └── sitrep_route.py
├── data/
│   ├── units_initial.json
│   ├── scenario_alpha.json
│   ├── scenario_backup.json
│   ├── doctrine_context.txt
│   └── area_briefing.txt
└── docs/
    ├── DEMO_SCRIPT.md
    ├── AGENT_TASKS.md
    └── PANIC_PLAYBOOK.md
```

---

## 15. 3-Person Role Split

### Person 1 — Frontend / UX / Demo Surface
- Dashboard shell and 3-column layout
- Map rendering with react-leaflet
- ORBAT panel and unit cards
- AI panel, query box, plan card, SITREP modal
- Dark theme styling and visual polish
- Interaction wiring to backend API

### Person 2 — Backend / State / Integration
- FastAPI app skeleton and routes
- Pydantic models (the source of truth for all data shapes)
- World state manager
- Scenario engine
- Threat scorer
- Frontend-backend integration (owns merging everything)

### Person 3 — AI / Prompting / Scenario / Demo Narrative
- Prompt template authoring and iteration
- AI reasoning integration (Claude API calls)
- Structured output validation
- Fallback response files
- Scenario JSON authoring (events, phases, narrative arc)
- Doctrine and area briefing context files
- Demo script and narration

### Integration Ownership
- **Person 2** owns final technical integration
- **Person 3** owns final demo coherence
- **Person 1** owns visual polish and operator experience

---

## 16. 24-Hour Execution Timeline

### First 30 Minutes
- Agree final MVP scope (this document)
- Create repo, install deps
- Define and lock: schema shapes, API surface, scenario structure
- Assign owners, start building

### Hours 1–3
- Frontend shell renders (3-column, dark theme, placeholder cards)
- Backend skeleton serves `/health` and `/state`
- Scenario JSON first draft written
- Initial world state schema locked in `models.py`
- AI prompt placeholders ready, first test call to Claude API confirmed

### Hours 3–6
- Map renders unit markers from backend state
- ORBAT cards render with status colors and resource bars
- Scenario engine advances phases and updates world state
- First threat score computed and visible
- First LLM structured response validated and displayed

### Hours 6–12
- Query interface wired end-to-end
- Recommendation card appears with approve button
- SITREP generation works
- Future projection step works after approval
- **Hour 8: First full dry run of the demo path**

### Hours 12–18
- Polish: labels, copy, colors, spacing, animations
- Reduce/cut unstable features
- Prepare fallback states and cached AI responses
- Strengthen demo logic and timing
- **Hour 14: Second full dry run**

### Hours 18–24
- **Hour 20: FEATURE FREEZE**
- Repeated demo rehearsal (minimum 3 full runs)
- Cache all backup outputs
- Visual cleanup on demo machine/projector
- Final smoke tests
- **Hour 22: Record backup demo video**
- **Hour 23: Final rehearsal with narration**

---

## 17. Integration Plan

### Integration Order
1. Static frontend layout renders
2. Backend serves world state via `/state`
3. Frontend renders state from API (map + ORBAT)
4. Scoring computes and appears in UI
5. `/scenario/advance` triggers phase change → UI updates
6. AI panel renders structured reasoning output
7. `/query` returns grounded answer → displays in chat
8. `/recommendation/approve` updates projected state
9. `/sitrep` generates report → modal displays
10. End-to-end demo path works

### Keep Stubbed Until Late
- Extra scenarios
- Charts beyond resource bars
- Fancy animations
- Audit trail
- Advanced resource recalculation

---

## 18. Critical Path

If these are not working, the demo fails:

1. Map + unit rendering
2. One threat event appearing
3. One AI recommendation with explanation
4. One query response
5. One approve-plan → projection step
6. One SITREP generation

Everything else is enhancement.

---

## 19. What to Simulate

**Simulate:** all external data feeds, threat detections, intel updates, operational timeline, doctrinal context, projected future state.

**Stub if needed:** dynamic resource recalculation, multiple source-specific adapters, advanced route logic, historical retrieval.

**Never block on:** live integrations, secure infra, production persistence, fancy AI orchestration.

---

## 20. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Live scenario pipeline is unstable | Switch to phase-based button progression |
| LLM output is messy or slow | Enforce JSON schema + pre-cache fallback outputs |
| UI is visually weak | Prioritize dark theme and information density early |
| Team spreads too wide | Lock MVP by Hour 1, cut aggressively |
| Map integration takes too long | Replace with static operational canvas or image overlay |
| API rate-limited during demo | Use cached responses with fake 1-second delay |

---

## 21. Backup Plans

- Live ingestion fails → pre-seeded events
- Query quality weak → curated context + fallback responses
- Map unstable → static theater canvas
- Streaming unstable → manual phase advance buttons
- Future projection weak → precomputed next-state panel
- SITREP inconsistent → template-filled structured report
- Scoring noisy → hardcode normalized values for demo scenario

---

## 22. Panic Button Plan

See **[docs/PANIC_PLAYBOOK.md](./docs/PANIC_PLAYBOOK.md)** for the full emergency plan.

**Summary:** At Hour 12, if the AI + scenario pipeline is unreliable, cut live LLM calls entirely. Switch to precomputed AI outputs keyed by phase. Person 3 writes the best possible pre-authored content. Person 2 simplifies backend to serve static JSON. Person 1 polishes the display. The demo looks identical to judges.

---

## 23. Demo Strategy

See **[docs/DEMO_SCRIPT.md](./docs/DEMO_SCRIPT.md)** for the full 3-minute narration.

### What judges should see
- Polished product entry: landing page → login → dashboard transition
- Clear operational picture with professional military aesthetic
- Threat emergence → AI reasoning → concrete recommendation
- Commander interaction (query + approval)
- Future impact projection
- Professional SITREP output

### Key wow moments
1. Premium landing page that frames the product before the demo begins
2. One-screen fusion of everything
3. AI that explains *why* something is dangerous
4. Recommendation approval → immediate projected impact
5. Instant formatted SITREP

---

## 24. Stretch Goals

Only if core is rock-solid by Hour 18:
- Second scenario
- Voice input (Web Speech API)
- Animated map markers
- Threat-radius overlays
- Timeline scrubber
- Decision audit trail

---

## 25. Future Vision

Post-hackathon evolution (none of this pollutes the MVP):
- Edge AI deployment on AMD hardware (Mistral/Llama via ROCm)
- Real retrieval / doctrine memory (vector DB)
- Multi-agent planning (specialized agents per domain)
- Real sensor adapters (drone feeds, SIGINT)
- Secure mesh node sync (AES-256 encrypted P2P)
- Advanced sustainment logic
- Multi-operator collaboration
- Audit and after-action review trail

---

## 26. Final Rule

If a feature does not improve the **demo story**, **decision clarity**, or **reliability**, cut it.

This hackathon is won by: coherence, visual clarity, strong reasoning, disciplined scope, and clean execution.
