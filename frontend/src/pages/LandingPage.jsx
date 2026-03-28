import React, { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   SENTINEL — Landing Page Scaffold
   ───────────────────────────────────────────────────────────────────
   Usage:  Import and render, or paste sections into existing
           LandingSurface if preferred.
   Notes:  Self-contained.  No router dependency.
           Uses only Tailwind utilities — no external CSS.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Tiny helpers ─────────────────────────────────────────────────── */

function Badge({ children }) {
  return (
    <span className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-cyan-300">
      {children}
    </span>
  );
}

function SectionEyebrow({ children }) {
  return (
    <p className="text-[0.65rem] uppercase tracking-[0.34em] text-cyan-300/70">
      {children}
    </p>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-slate-950/60 p-6 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function StatBlock({ value, label, sub }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  SECTIONS                                                         */
/* ══════════════════════════════════════════════════════════════════ */

/* ── 1. Hero ──────────────────────────────────────────────────────── */

function HeroSection({ onEnter }) {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(34,211,238,0.06)_0%,transparent_60%)]" />

      <Badge>24-Hour Hackathon · Build the Impossible</Badge>

      <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
        One operational picture.
        <br />
        <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
          One decision surface.
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
        SENTINEL fuses fragmented intelligence into a single, explainable
        command interface — powered by AI reasoning, deterministic scoring,
        and consequence projection.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={onEnter}
          className="rounded-full bg-cyan-400 px-8 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Enter SENTINEL
        </button>
        <a
          href="#problem"
          className="rounded-full border border-white/15 px-8 py-3 text-sm text-slate-200 transition hover:border-cyan-300/40"
        >
          Learn more
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 animate-bounce text-slate-500">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}

/* ── 2. Problem ───────────────────────────────────────────────────── */

function ProblemSection() {
  const problems = [
    {
      title: "Fragmented intelligence",
      desc: "Signals, imagery, ground reports, logistics data — scattered across systems, teams, and timelines.",
    },
    {
      title: "Slow decision cycles",
      desc: "By the time a commander assembles the picture, the situation has already changed.",
    },
    {
      title: "Opaque AI",
      desc: "Most AI tools give answers without reasoning. In high-stakes environments, trust requires explanation.",
    },
  ];

  return (
    <section id="problem" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionEyebrow>The problem</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          Decision-makers are drowning in data
          <br className="hidden md:block" />
          and starving for clarity.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {problems.map((p) => (
            <Card key={p.title}>
              <h3 className="text-lg font-semibold text-white">{p.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{p.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. What is SENTINEL ──────────────────────────────────────────── */

function WhatSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionEyebrow>What is SENTINEL</SectionEyebrow>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
          An AI-native mission intelligence co-pilot that turns chaos into
          one explainable decision surface.
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400">
          SENTINEL stands for <strong className="text-white">Situational Edge Intelligence for Networked Theater
          Operations &amp; Logistics</strong>. It fuses multi-source intelligence, computes
          deterministic threat scores, generates explainable AI assessments,
          recommends response paths, and projects likely outcomes — all in one
          screen.
        </p>

        <div className="mt-16 grid gap-2 md:grid-cols-5">
          {[
            { step: "01", label: "Ingest", desc: "Multi-source inputs fused" },
            { step: "02", label: "Assess", desc: "Threats scored & explained" },
            { step: "03", label: "Recommend", desc: "Actions ranked by AI" },
            { step: "04", label: "Decide", desc: "Commander approves" },
            { step: "05", label: "Project", desc: "Future state predicted" },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-center">
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-cyan-300/60">Step {s.step}</p>
              <p className="mt-2 text-lg font-semibold text-white">{s.label}</p>
              <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 4. Build the Impossible ──────────────────────────────────────── */

function ImpossibleSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <Badge>Hackathon theme</Badge>
        <h2 className="mt-6 text-3xl font-semibold text-white md:text-4xl">
          Build the Impossible
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-base leading-8 text-slate-400">
          Real-world command decisions depend on fusing dozens of intelligence
          sources, reasoning about cascading consequences, and projecting
          outcomes under uncertainty — all in minutes. That workflow is
          fragmented across people, systems, and weeks of analysis.
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-base leading-8 text-slate-300">
          SENTINEL compresses that entire cycle into{" "}
          <strong className="text-cyan-300">one AI-powered decision surface</strong>,
          built in 24 hours.
        </p>
      </div>
    </section>
  );
}

/* ── 5. Product surfaces ──────────────────────────────────────────── */

function SurfacesSection() {
  const surfaces = [
    {
      num: "01",
      title: "Strategic Console",
      desc: "Three-column command layout: ORBAT status, 2D theatre board, AI reasoning. Everything a commander needs in one screen.",
      tag: "Core product",
    },
    {
      num: "02",
      title: "AI Chatbot",
      desc: "Prompt-driven incident intake. The system asks structured questions, runs the full AI pipeline, and delivers reasoning, sitrep, and scores.",
      tag: "Conversational AI",
    },
    {
      num: "03",
      title: "Theatre Board",
      desc: "A fixed 2D tactical map that visualizes the region, assets, threats, and incident markers — instantly legible for judges and operators.",
      tag: "Visualization",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionEyebrow>Product surfaces</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          Three surfaces. One coherent product.
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {surfaces.map((s) => (
            <Card key={s.num}>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-cyan-300/60">Surface {s.num}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{s.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{s.desc}</p>
              <span className="mt-4 inline-block rounded-full border border-white/10 px-3 py-1 text-[0.6rem] uppercase tracking-widest text-slate-500">
                {s.tag}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 6. Key Features ──────────────────────────────────────────────── */

function FeaturesSection() {
  const features = [
    {
      icon: "◎",
      title: "Deterministic threat scoring",
      desc: "Threat level, readiness, escalation risk, and confidence — computed algorithmically, explained by AI.",
    },
    {
      icon: "⬡",
      title: "Structured AI reasoning",
      desc: "Every assessment includes key risks, assumptions, recommendations, and projected outcomes. JSON-validated, not freeform.",
    },
    {
      icon: "✦",
      title: "Response path comparison",
      desc: "Four strategic response options ranked with trade-offs. Commander approves, system projects the consequence.",
    },
    {
      icon: "⊕",
      title: "Commander NL queries",
      desc: "Ask questions in plain language. The system answers using only the real operational state — no hallucination.",
    },
    {
      icon: "▸",
      title: "SITREP generation",
      desc: "One-click formal situation report covering the full operational picture. Ready for higher command.",
    },
    {
      icon: "◆",
      title: "Live data feeds",
      desc: "Landing page pulls real-time headlines, market signals, and regional intelligence from backend-owned proxy routes.",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionEyebrow>Capabilities</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          What the system actually does
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
              <span className="text-xl text-cyan-400">{f.icon}</span>
              <h3 className="mt-3 text-sm font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 7. Trust & Explainability ────────────────────────────────────── */

function TrustSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <SectionEyebrow>Trust &amp; explainability</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          AI that explains <em className="text-cyan-300">why</em>. Not just{" "}
          <em className="text-slate-500">what</em>.
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-base leading-8 text-slate-400">
          Every recommendation includes its rationale. Every score has a
          deterministic formula. Every assessment lists assumptions and
          projected outcomes. The commander sees the reasoning, not a
          black box.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { title: "Grounded prompts", desc: "Every LLM call includes the full operational state, doctrine notes, and area briefing." },
            { title: "Validated outputs", desc: "All AI responses conform to strict Pydantic schemas. No freeform text leaks into the UI." },
            { title: "Fallback safety", desc: "If the model is slow or unreliable, pre-validated responses serve identical UX with zero downtime." },
          ].map((t) => (
            <Card key={t.title}>
              <h3 className="text-sm font-semibold text-white">{t.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Architecture ──────────────────────────────────────────────── */

function ArchSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <SectionEyebrow>Architecture</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          Lean stack. Real depth.
        </h2>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/40 p-8 font-mono text-sm leading-8 text-slate-400">
          <pre className="whitespace-pre-wrap">{`┌───────────────────────────────────────────┐
│  React + Vite + Tailwind                  │  ← Frontend
│  Strategic Console · Theatre Board · Chat │
├───────────────────────────────────────────┤
│  FastAPI + Pydantic                       │  ← Backend
│  World State · Scoring · Scenario Engine  │
│  Feed Proxy · Auth (SQLite)               │
├───────────────────────────────────────────┤
│  Claude API (Anthropic)                   │  ← AI Layer
│  Structured prompts · JSON validation     │
│  Threat assessment · SITREP · Projection  │
├───────────────────────────────────────────┤
│  SQLite (auth) · JSON files (scenario)    │  ← Data
└───────────────────────────────────────────┘`}</pre>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4 text-center">
          <StatBlock value="6" label="API routes" sub="core product" />
          <StatBlock value="5" label="AI surfaces" sub="reasoning endpoints" />
          <StatBlock value="4" label="Score axes" sub="deterministic" />
          <StatBlock value="24h" label="Build time" sub="hackathon sprint" />
        </div>
      </div>
    </section>
  );
}

/* ── 9. Build Status ──────────────────────────────────────────────── */

function StatusSection() {
  const rows = [
    { feature: "Landing page with live data feeds", status: "implemented", icon: "●" },
    { feature: "SQLite-backed login system", status: "implemented", icon: "●" },
    { feature: "Strategic console (3-column layout)", status: "implemented", icon: "●" },
    { feature: "2D Theatre Board visualization", status: "implemented", icon: "●" },
    { feature: "Deterministic threat scoring", status: "implemented", icon: "●" },
    { feature: "AI-powered threat assessment", status: "implemented", icon: "●" },
    { feature: "Commander NL queries", status: "implemented", icon: "●" },
    { feature: "Response path comparison", status: "implemented", icon: "●" },
    { feature: "Approve → projection loop", status: "implemented", icon: "●" },
    { feature: "SITREP generation", status: "implemented", icon: "●" },
    { feature: "Prompt-driven chatbot (AI Assistant)", status: "implemented", icon: "●" },
    { feature: "Live RSS / financial API integration", status: "scaffolded", icon: "◐" },
    { feature: "Multi-scenario library", status: "planned", icon: "○" },
    { feature: "Multi-agent reasoning", status: "planned", icon: "○" },
  ];

  const statusColor = {
    implemented: "text-emerald-400",
    scaffolded: "text-amber-400",
    planned: "text-slate-500",
  };

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <SectionEyebrow>Build status</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          What's real. Right now.
        </h2>
        <div className="mt-10 space-y-2">
          {rows.map((r) => (
            <div key={r.feature} className="flex items-center gap-3 rounded-xl border border-white/5 bg-slate-900/30 px-4 py-3">
              <span className={`text-sm ${statusColor[r.status]}`}>{r.icon}</span>
              <span className="flex-1 text-sm text-slate-300">{r.feature}</span>
              <span className={`text-[0.6rem] uppercase tracking-widest ${statusColor[r.status]}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">●</span> Implemented</span>
          <span className="flex items-center gap-1.5"><span className="text-amber-400">◐</span> Scaffolded</span>
          <span className="flex items-center gap-1.5"><span className="text-slate-500">○</span> Planned</span>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Team ─────────────────────────────────────────────────────── */

function TeamSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <SectionEyebrow>The Team</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          Three builders. 24 hours.
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { role: "Frontend", scope: "Dashboard, UI surfaces, map, visual polish" },
            { role: "Backend", scope: "FastAPI, world state, scoring, integration" },
            { role: "AI / Scenario", scope: "Prompt engineering, scenario data, demo narration" },
          ].map((m) => (
            <Card key={m.role}>
              <p className="text-sm font-semibold text-cyan-300">{m.role}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{m.scope}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 11. CTA ──────────────────────────────────────────────────────── */

function CTASection({ onEnter }) {
  return (
    <section className="px-6 py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          See the impossible, built.
        </h2>
        <p className="mt-6 text-base leading-8 text-slate-400">
          From fragmented inputs to one explainable decision surface.
          Enter the strategic console and experience the full pipeline.
        </p>
        <button
          onClick={onEnter}
          className="mt-10 rounded-full bg-cyan-400 px-10 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Enter SENTINEL →
        </button>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
/*  PAGE ASSEMBLY                                                    */
/* ══════════════════════════════════════════════════════════════════ */

export default function LandingPage({ onNavigate }) {
  const handleEnter = () => {
    if (onNavigate) onNavigate("login");
    else window.location.hash = "#login";
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#0c1a33_0%,#08111f_40%,#020617_100%)] text-white selection:bg-cyan-400/30">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />
          <span className="text-sm font-bold tracking-wide text-white">SENTINEL</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] text-slate-500">
            v2.6.5
          </span>
        </div>
        <button
          onClick={handleEnter}
          className="rounded-full bg-cyan-400/10 border border-cyan-400/25 px-4 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
        >
          Launch Console
        </button>
      </nav>

      <HeroSection onEnter={handleEnter} />

      {/* Divider */}
      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <ProblemSection />
      <WhatSection />
      <ImpossibleSection />

      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <SurfacesSection />
      <FeaturesSection />
      <TrustSection />

      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <ArchSection />
      <StatusSection />
      <TeamSection />
      <CTASection onEnter={handleEnter} />

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-slate-600">
        SENTINEL · 24-Hour Hackathon · Built in 24 hours
      </footer>
    </div>
  );
}
