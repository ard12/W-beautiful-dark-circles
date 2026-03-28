import React, { useRef } from "react";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Layers3,
  LockKeyhole,
  Map,
  Radar,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { BackgroundPaperShaders } from "@/components/ui/background-paper-shaders";
import { Component as RobotFlyby } from "@/components/ui/robot-flyby";

const heroFacts = [
  { value: "24h", label: "Hackathon", detail: "Build the Impossible" },
  { value: "3", label: "Team", detail: "Builders" },
  { value: "1", label: "Primary user", detail: "Commander / operator / analyst" },
  { value: "4", label: "Core promise", detail: "Inputs to projected outcome" },
];

const coreCapabilities = [
  {
    title: "Deterministic scoring",
    text: "Threat level, readiness, escalation risk, and confidence are computed explicitly.",
  },
  {
    title: "Structured AI reasoning",
    text: "Assessment, recommendations, key risks, and assumptions are returned in a grounded structure.",
  },
  {
    title: "Response-path comparison",
    text: "Four strategic options are shown together with their trade-offs.",
  },
  {
    title: "Consequence projection",
    text: "Approve a plan and see the predicted future state.",
  },
  {
    title: "Executive briefing",
    text: "Generate a formal SITREP in one click.",
  },
];

const problemStatements = [
  "Fragmented intelligence: signals, imagery, ground reports, and logistics data live in separate systems with separate timelines.",
  "Slow decision cycles: by the time the picture is assembled, the situation has already changed.",
  "Opaque AI: in high-stakes environments, trust requires explanation, not just answers.",
];

const surfaces = [
  {
    title: "Landing Page",
    text: "Premium product intro for judges. Explains the problem, the system, and the value proposition.",
  },
  {
    title: "Login Page",
    text: "SQLite-backed authentication with pbkdf2_hmac password hashing, form validation, and error handling.",
  },
  {
    title: "Strategic Console",
    text: "Three-column command layout for incident intake, tactical and strategic views, scorecards, trust, AI reasoning, and response paths.",
  },
];

const loopSteps = [
  { label: "Ingest", text: "Scenario data loads: units, threats, alerts, resources, objectives." },
  { label: "Score", text: "Deterministic computation of threat level, readiness, escalation risk, and confidence." },
  { label: "Reason", text: "Claude API produces structured assessment, risks, assumptions, recommendations, and projected outcome." },
  { label: "Compare", text: "Four response paths are shown with trade-offs and strategic labels." },
  { label: "Decide", text: "Commander approves an action." },
  { label: "Project", text: "System predicts the next state, expected changes, new risks, and outlook." },
  { label: "Brief", text: "One-click SITREP generation for higher-command reporting." },
];

const featureGroups = [
  {
    title: "Implemented",
    items: [
      "Strategic console (3-column)",
      "2D Theatre Board",
      "3D Strategic Globe",
      "Deterministic threat scoring",
      "AI-powered assessment",
      "Commander NL queries",
      "Response-path comparison",
      "Approve to projection loop",
      "SITREP generation",
      "SQLite login system",
      "Landing page with live feeds",
    ],
  },
  {
    title: "Scaffolded",
    items: [
      "Landing page scaffold at frontend/src/pages/LandingPage.jsx",
      "Live RSS and financial API proxy routes serving local JSON",
    ],
  },
  {
    title: "Planned",
    items: [
      "Multi-scenario library",
      "Multi-agent reasoning",
      "Real external data feeds",
    ],
  },
];

const architectureLayers = [
  {
    title: "Frontend",
    text: "React 19 + Vite 8 + Tailwind CSS 4. App.jsx manages the surfaces, console, login, landing, and chat.",
  },
  {
    title: "Backend",
    text: "FastAPI + Pydantic with WorldStateManager, ScenarioEngine, ThreatScorer, feed proxy routes, and auth routing.",
  },
  {
    title: "AI Layer",
    text: "Claude API with structured prompts and JSON validation for assessment, queries, SITREP, projection, and report generation.",
  },
  {
    title: "Data",
    text: "SQLite for auth plus scenario, units, doctrine, area briefing, landing feed, and market snapshot files.",
  },
];

const apiRoutes = [
  "/state",
  "/scenario/advance",
  "/query",
  "/sitrep",
  "/project",
  "/report",
  "/feed/headlines",
  "/feed/market-snapshot",
  "/auth/login",
];

function Section({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/70">{eyebrow}</p>
        <div className="mt-4 max-w-4xl">
          <h2 className="text-3xl font-semibold text-white md:text-5xl">{title}</h2>
          {description ? <p className="mt-5 text-base leading-8 text-slate-400 md:text-lg">{description}</p> : null}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function GridCard({ icon: Icon, title, text, accent = "cyan" }) {
  const accentClass = {
    cyan: "text-cyan-300 border-cyan-400/15 bg-cyan-400/10",
    rose: "text-rose-300 border-rose-400/15 bg-rose-400/10",
    amber: "text-amber-300 border-amber-400/15 bg-amber-400/10",
    emerald: "text-emerald-300 border-emerald-400/15 bg-emerald-400/10",
  };

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)] backdrop-blur">
      <div className={`inline-flex rounded-2xl border p-3 ${accentClass[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
    </article>
  );
}

function MiniStat({ value, label, detail }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5 text-left">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm font-medium text-slate-200">{label}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">{detail}</div>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  const overviewRef = useRef(null);

  const scrollToOverview = () => overviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#020816_0%,#07101f_45%,#020617_100%)] text-white">
      <section className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#020816]">
        <div className="absolute inset-0">
          <RobotFlyby />
        </div>
        <BackgroundPaperShaders className="opacity-55 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.48),rgba(2,8,22,0.18)_26%,rgba(2,8,22,0.82)_72%,rgba(2,8,22,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,255,0.22),transparent_24%),radial-gradient(circle_at_80%_25%,rgba(244,63,94,0.14),transparent_18%)]" />
        <div className="absolute inset-0 sentinel-grid opacity-20" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-6 py-6 lg:px-10">
          <div className="flex items-center justify-between rounded-full border border-white/10 bg-slate-950/45 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <Radar className="h-4 w-4 text-cyan-300" />
              <span className="text-[0.72rem] uppercase tracking-[0.42em] text-cyan-200/85">SENTINEL</span>
            </div>
            <div className="hidden items-center gap-3 text-xs uppercase tracking-[0.26em] text-slate-400 md:flex">
              <span>React + Vite + Tailwind</span>
              <span>FastAPI + Pydantic</span>
              <span>Claude API</span>
            </div>
          </div>

          <div className="flex flex-1 items-center py-12 lg:py-20">
            <div className="grid w-full items-end gap-10 lg:grid-cols-[minmax(0,1.14fr)_360px]">
              <div className="max-w-5xl">
                <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[0.72rem] uppercase tracking-[0.28em] text-cyan-100">
                  Situational Edge Intelligence for Networked Theater Operations & Logistics
                </div>
                <h1 className="mt-8 max-w-5xl text-4xl font-black uppercase leading-[0.92] text-white md:text-6xl xl:text-7xl">
                  One explainable decision surface for fragmented mission inputs
                </h1>
                <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-slate-200/88 md:text-xl">
                  SENTINEL is an AI-native mission intelligence co-pilot that fuses multi-source operational inputs into
                  one explainable decision surface with deterministic scoring, structured AI reasoning, response-path
                  comparison, and consequence projection.
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate?.("console")}
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Strategic Console
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("login")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
                  >
                    Login
                    <LockKeyhole className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.("monitor")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/70 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-slate-900"
                  >
                    World Monitor
                    <Map className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur">
                <p className="text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/70">Mission brief</p>
                <div className="mt-5 space-y-4">
                  {coreCapabilities.slice(0, 4).map((item) => (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-[0.28em] text-cyan-200">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                  Demo credentials: commander@sentinel.mil / sentinel2026
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-4">
            {heroFacts.map((fact) => (
              <MiniStat key={fact.label} value={fact.value} label={fact.label} detail={fact.detail} />
            ))}
          </div>

          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={scrollToOverview}
              className="hero-scroll inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/45 px-5 py-3 text-sm text-slate-100 backdrop-blur transition hover:border-cyan-300/35"
            >
              Scroll to overview
              <ChevronRight className="h-4 w-4 rotate-90" />
            </button>
          </div>
        </div>
      </section>

      <Section
        id="overview"
        eyebrow="What Is SENTINEL"
        title="Not a dashboard, not a chatbot, not a map"
        description="SENTINEL is a fused operational picture that helps a commander understand what is happening, why it matters, what the options are, what the AI recommends, and what will likely happen next."
      >
        <div ref={overviewRef} className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <GridCard icon={Radar} title={coreCapabilities[0].title} text={coreCapabilities[0].text} accent="rose" />
          <GridCard icon={BrainCircuit} title={coreCapabilities[1].title} text={coreCapabilities[1].text} accent="cyan" />
          <GridCard icon={Workflow} title={coreCapabilities[2].title} text={coreCapabilities[2].text} accent="emerald" />
          <GridCard icon={Layers3} title={coreCapabilities[3].title} text={coreCapabilities[3].text} accent="amber" />
          <GridCard icon={ShieldCheck} title={coreCapabilities[4].title} text={coreCapabilities[4].text} accent="cyan" />
        </div>
      </Section>

      <Section
        id="why"
        eyebrow="Why It Exists"
        title="The product is built around three operational problems"
        description="SENTINEL addresses fragmented intelligence, slow decision cycles, and opaque AI by fusing inputs into one picture, computing scores deterministically, and requiring the AI to explain every recommendation with grounded reasoning."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <GridCard icon={Radar} title="Fragmented intelligence" text={problemStatements[0]} accent="rose" />
          <GridCard icon={Workflow} title="Slow decision cycles" text={problemStatements[1]} accent="amber" />
          <GridCard icon={BrainCircuit} title="Opaque AI" text={problemStatements[2]} accent="cyan" />
        </div>
      </Section>

      <Section
        id="surfaces"
        eyebrow="Product Surfaces"
        title="Three user-facing surfaces with distinct roles"
        description="The README defines the product as a landing page for judges, a SQLite-backed login page, and the core strategic console."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {surfaces.map((surface, index) => (
            <GridCard
              key={surface.title}
              icon={[Layers3, LockKeyhole, Radar][index]}
              title={surface.title}
              text={surface.text}
              accent={index === 0 ? "cyan" : index === 1 ? "amber" : "emerald"}
            />
          ))}
        </div>
      </Section>

      <Section
        id="loop"
        eyebrow="Core System Loop"
        title="The decision loop runs from intake to briefing"
        description="The loop is phase-driven: each advance triggers state update, score recomputation, AI reasoning, and UI refresh."
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {loopSteps.map((step, index) => (
            <div key={step.label} className="rounded-[26px] border border-white/10 bg-slate-950/60 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-slate-950">
                {index + 1}
              </div>
              <div className="mt-4 text-xs uppercase tracking-[0.28em] text-cyan-200">{step.label}</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="features"
        eyebrow="Build Status"
        title="Implemented, scaffolded, and planned work"
        description="The README already separates what is implemented today from what is scaffolded and what remains planned."
      >
        <div className="grid gap-5 xl:grid-cols-3">
          {featureGroups.map((group) => (
            <div key={group.title} className="rounded-[30px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
              <p className="text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/70">{group.title}</p>
              <div className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="architecture"
        eyebrow="Technical Architecture"
        title="Frontend, backend, AI, and data are all explicit in the repo"
        description="The README defines the stack, the main system boundaries, and the backend routes that support the product."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="grid gap-5 md:grid-cols-2">
            {architectureLayers.map((layer, index) => (
              <GridCard
                key={layer.title}
                icon={[Layers3, Workflow, BrainCircuit, ShieldCheck][index]}
                title={layer.title}
                text={layer.text}
                accent={index % 2 === 0 ? "cyan" : "emerald"}
              />
            ))}
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
            <p className="text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/70">Backend API Routes</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {apiRoutes.map((route) => (
                <div key={route} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 font-mono text-sm text-slate-200">
                  {route}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[36px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(8,47,73,0.95),rgba(2,6,23,0.98))] p-8 shadow-[0_30px_90px_rgba(2,6,23,0.42)] lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-3xl">
            <p className="text-[0.72rem] uppercase tracking-[0.34em] text-cyan-300/70">Build The Impossible</p>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Fragmented inputs to one operational picture, explainable reasoning, and projected outcome
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              The README frames the core challenge as compression: incident intake, threat assessment, response
              planning, and consequence forecasting brought into one coherent product surface in 24 hours.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 lg:mt-0">
            <button
              type="button"
              onClick={() => onNavigate?.("console")}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Strategic Console
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40"
            >
              Login
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.("monitor")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-slate-900"
            >
              World Monitor
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
