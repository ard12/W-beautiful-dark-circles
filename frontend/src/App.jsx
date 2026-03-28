import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import StrategicGlobe from "./components/StrategicGlobe";
import WorldMonitorGlobe from "./components/WorldMonitorGlobe";
import WorldMonitorMap from "./components/WorldMonitorMap";
import TheatreBoard from "./components/TheatreBoard";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { DemoPage as LoginPage } from "@/components/ui/login-page";
import LandingPage from "./pages/LandingPage";
import { useSentinelState } from "./hooks/useSentinelState";
import { useLandingData } from "./hooks/useLandingData";
import { getPromptPlaceholders, executePrompt, loginUser, logoutUser } from "./api/client";
import {
  AI_INSIGHT_BRIEF,
  CHAT_BRIEFING_MODULES,
  COUNTRY_INTELLIGENCE_INDEX,
  COUNTRY_INTELLIGENCE_SIGNALS,
  CROSS_STREAM_CORRELATION,
  DEFAULT_ACTIVE_LAYER_IDS,
  ENERGY_COMPLEX,
  FINANCE_RADAR,
  FORECAST_FILTERS,
  FORECAST_ITEMS,
  INTEL_FEED_ITEMS,
  LIVE_INTELLIGENCE_ITEMS,
  LIVE_NEWS_FEEDS,
  LIVE_NEWS_ITEMS,
  MACRO_STRESS,
  MAP_LAYER_GROUPS,
  MAP_STATS,
  MARKETS_PANEL,
  METALS_AND_MATERIALS,
  PREDICTIONS_PANEL,
  REGIONAL_NEWS_PANELS,
  STRATEGIC_POSTURE,
  STRATEGIC_RISK,
  WEBCAM_TABS,
  WEBCAM_TILES,
  WORLD_NEWS_ITEMS,
} from "./data/monitorData";

const RESPONSE_PATHS = [
  {
    id: "restrain",
    title: "Restraint / Observe",
    summary: "Hold immediate escalation while deepening monitoring, attribution, and readiness.",
    ring: "Low external signal, high internal stability",
    riskBias: 18,
    diplomaticBias: 16,
    stabilityBias: 68,
  },
  {
    id: "reinforce",
    title: "Defensive Reinforcement",
    summary: "Harden nearby sites, move assets, raise surveillance, and increase force protection.",
    ring: "Balanced control response",
    riskBias: 34,
    diplomaticBias: 24,
    stabilityBias: 79,
  },
  {
    id: "surge",
    title: "Surveillance Surge",
    summary: "Expand ISR coverage, watchlists, and alerting to detect follow-on moves early.",
    ring: "Information dominance path",
    riskBias: 28,
    diplomaticBias: 12,
    stabilityBias: 74,
  },
  {
    id: "signal",
    title: "Diplomatic Signaling",
    summary: "Coordinate public narrative, external messaging, and coalition pressure.",
    ring: "Political containment path",
    riskBias: 22,
    diplomaticBias: 29,
    stabilityBias: 72,
  },
  {
    id: "calibrated",
    title: "Limited Calibrated Response",
    summary: "Demonstrate resolve with bounded action while trying to avoid spiral escalation.",
    ring: "Higher deterrence, higher instability",
    riskBias: 63,
    diplomaticBias: 56,
    stabilityBias: 46,
  },
];

const INITIAL_INCIDENT = {
  title: "Attack on Northern Radar Relay",
  location: "Kupwara sector",
  ownerCountry: "India",
  actor: "Pakistan-backed proxy network",
  attackType: "Drone attack",
  severity: 74,
  description:
    "Forward radar relay degraded after a stand-off drone strike. Limited casualties, high signaling value, immediate uncertainty over follow-on activity.",
  time: "2026-03-28T00:30",
  lat: 34.5261,
  lon: 74.2612,
};

const ATTACK_PROFILES = {
  "Missile strike": {
    intent: "Escalatory signaling through overt precision disruption.",
    alternate: "Deterrence testing before a larger pressure campaign.",
    siteLens: "The site has surveillance value and symbolic command relevance.",
  },
  "Drone attack": {
    intent: "Probing defenses while preserving ambiguity and pace of operations.",
    alternate: "A calibrated warning meant to test thresholds without full escalation.",
    siteLens: "The site is attractive because it combines sensing, reach, and low-cost disruption value.",
  },
  "Militant raid": {
    intent: "Shock creation and political signaling through deniable ground action.",
    alternate: "A diversionary attack to stretch force posture across nearby sectors.",
    siteLens: "The site is vulnerable to symbolic shock and narrative impact.",
  },
  "Cyber disruption": {
    intent: "Temporary degradation and information pressure rather than kinetic destruction.",
    alternate: "Preparatory shaping for a later physical or diplomatic move.",
    siteLens: "The site acts as a leverage point because disruption spreads beyond the physical target.",
  },
  Bombing: {
    intent: "Disruption plus public pressure against perceived weak points.",
    alternate: "Punitive retaliation designed for media and psychological impact.",
    siteLens: "The site has strong symbolic value and creates immediate uncertainty.",
  },
  "Artillery exchange": {
    intent: "Localized coercion and pressure escalation across the frontier.",
    alternate: "A boundary test to measure reaction speed and reinforcement patterns.",
    siteLens: "The site sits inside a corridor where tactical pressure is easy to scale up quickly.",
  },
};

const GLOBE_MARKERS = [
  { id: "north-1", label: "High-risk border sector", lat: 33.7782, lon: 74.0924, color: "#38bdf8", scale: 0.95 },
  { id: "north-2", label: "Logistics corridor", lat: 31.1048, lon: 77.1734, color: "#60a5fa", scale: 0.9 },
  { id: "north-3", label: "Diplomatic attention zone", lat: 28.6139, lon: 77.209, color: "#22d3ee", scale: 1.05 },
  { id: "north-4", label: "Financial relay", lat: 19.076, lon: 72.8777, color: "#34d399", scale: 0.86 },
];

const MONITOR_HOTSPOTS = [
  {
    id: "monitor-kupwara-relay",
    title: "Northern radar relay strike",
    location: "Kupwara sector",
    ownerCountry: "India",
    actor: "Pakistan-backed proxy network",
    attackType: "Drone attack",
    severity: 74,
    description: "Forward radar relay degraded after a stand-off drone strike. Limited casualties, high signaling value, immediate uncertainty over follow-on activity.",
    lat: 34.5261,
    lon: 74.2612,
    source: "Border ISR mesh",
    tags: ["BORDER", "ISR", "DRONES"],
  },
  {
    id: "monitor-gwadar-cyber",
    title: "Gwadar logistics port disruption",
    location: "Gwadar",
    ownerCountry: "Pakistan",
    actor: "State-linked cyber unit",
    attackType: "Cyber disruption",
    severity: 61,
    description: "Port scheduling and customs systems degraded by a coordinated intrusion, raising concern over wider supply-chain signaling.",
    lat: 25.1264,
    lon: 62.3228,
    source: "Port authority telemetry",
    tags: ["PORT", "CYBER", "SUPPLY"],
  },
  {
    id: "monitor-tehran-air",
    title: "Integrated air-defense probing",
    location: "Tehran air corridor",
    ownerCountry: "Iran",
    actor: "Regional strike package",
    attackType: "Missile strike",
    severity: 83,
    description: "Layered missile and decoy activity probed response timing around the capital's air-defense belt, indicating a coercive signaling campaign.",
    lat: 35.6895,
    lon: 51.389,
    source: "Air-defense warning net",
    tags: ["AIR", "MISSILE", "SIGNALING"],
  },
];

function hotspotToIncident(hotspot) {
  return {
    title: hotspot.title,
    location: hotspot.location,
    ownerCountry: hotspot.ownerCountry,
    actor: hotspot.actor,
    attackType: hotspot.attackType,
    severity: hotspot.severity,
    description: hotspot.description,
    time: new Date().toISOString().slice(0, 16),
    lat: hotspot.lat,
    lon: hotspot.lon,
  };
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildConsoleModel(incident, selectedPath) {
  const profile = ATTACK_PROFILES[incident.attackType] || ATTACK_PROFILES["Drone attack"];
  const severity = Number(incident.severity) || 0;
  const threatScore = clamp(severity * 0.78 + 18);
  const intentConfidence = clamp(56 + severity * 0.28);
  const escalationRisk = clamp(selectedPath.riskBias + severity * 0.42);
  const civilianRisk = clamp(16 + severity * 0.22 + (selectedPath.id === "calibrated" ? 16 : 0));
  const diplomaticCost = clamp(selectedPath.diplomaticBias + severity * 0.18);
  const strategicStability = clamp(selectedPath.stabilityBias - severity * 0.15);

  const implicationSummary =
    selectedPath.id === "calibrated"
      ? "A calibrated response may restore deterrent signaling, but it increases the chance of reciprocal pressure and compressed decision timelines."
      : `${selectedPath.title} keeps the response within a more defensible strategic frame, preserving room for escalation control and external signaling.`;

  const trust = {
    assumptions: [
      "Attribution remains stable across the next 12 hours.",
      "The attacker is optimizing for signaling more than sustained territorial gain.",
      "There is still time to shape follow-on behavior through posture and messaging.",
    ],
    weakEvidence: [
      "No confirmed evidence yet of a second wave.",
      "Intent confidence still depends on incomplete pattern matching from similar incidents.",
    ],
    confidenceBreakdown: [
      { label: "Source reliability", value: 78 },
      { label: "Evidence freshness", value: 82 },
      { label: "Model certainty", value: intentConfidence },
      { label: "Analyst agreement", value: 69 },
    ],
    evidenceTrace: {
      threatIds: [],
      unitIds: [],
      eventLog: [
        `${incident.title || "Incident"} reported at ${incident.location || "current theater"}.`,
        `Severity assessed at ${severity}/100 with ${incident.attackType || "attack"} profile.`,
      ],
      confidenceDrivers: [
        {
          label: "Threat-profile match",
          score: intentConfidence,
          reason: `${incident.attackType || "Selected attack type"} aligns with the active intent profile and site lens.`,
          impact: "supports",
        },
      ],
    },
  };

  return {
    primaryIntent: profile.intent,
    alternateIntents: [
      profile.alternate,
      "Threshold testing to observe response speed and coordination gaps.",
      "Narrative shaping aimed at domestic and international audiences.",
    ],
    whyThisSite: `${profile.siteLens} ${incident.title || "The attacked site"} sits in ${incident.location || "the current theater"}, making it useful for influence, disruption, and signaling in one move.`,
    implicationSummary,
    consequenceHighlights: [
      `${selectedPath.title} changes the immediate escalation tempo over the next 6-24 hours.`,
      "Border vigilance and political messaging will likely matter as much as force movement.",
      "If follow-on pressure emerges, nearby surveillance and logistics sites become the next likely stress points.",
    ],
    timeline: [
      { window: "Next 6 hours", text: "Attribution firms up, watch for probing or narrative amplification." },
      { window: "Next 24 hours", text: "Response path choice drives diplomatic and tactical pressure bands." },
      { window: "Next 72 hours", text: "Strategic stability depends on whether follow-on pressure spreads to nearby sites." },
    ],
    scores: [
      { label: "Threat score", value: threatScore, tone: "rose" },
      { label: "Intent confidence", value: intentConfidence, tone: "cyan" },
      { label: "Escalation risk", value: escalationRisk, tone: "amber" },
      { label: "Civilian impact", value: civilianRisk, tone: "violet" },
      { label: "Diplomatic cost", value: diplomaticCost, tone: "slate" },
      { label: "Strategic stability", value: strategicStability, tone: "emerald" },
    ],
    trust,
    brief: `Executive brief: ${incident.title} in ${incident.location} is assessed as ${profile.intent.toLowerCase()} The preferred path is ${selectedPath.title.toLowerCase()}, which preserves strategic control while addressing immediate risk. Key concerns are escalation tempo, civilian exposure, and the confidence limits around follow-on action.`,
  };
}

function getSurfaceFromHash() {
  const value = window.location.hash.replace(/^#\//, "");
  if (value === "login" || value === "console" || value === "chat" || value === "monitor") {
    return value;
  }
  return "landing";
}

function surfaceToHash(surface) {
  if (surface === "landing") return "";
  return `#/${surface}`;
}

function useHeaderClock() {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });

    const updateClock = () => setClock(formatter.format(new Date()));
    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return clock;
}

function Section({ eyebrow, title, children, actions }) {
  return (
    <section className="sentinel-panel rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/75">{eyebrow}</p> : null}
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ScorePill({ score }) {
  const toneClasses = {
    rose: "from-rose-500/20 to-rose-400/5 border-rose-400/20 text-rose-200",
    cyan: "from-cyan-500/20 to-cyan-400/5 border-cyan-400/20 text-cyan-100",
    amber: "from-amber-500/20 to-amber-400/5 border-amber-400/20 text-amber-100",
    violet: "from-violet-500/20 to-violet-400/5 border-violet-400/20 text-violet-100",
    slate: "from-slate-500/20 to-slate-400/5 border-slate-300/15 text-slate-100",
    emerald: "from-emerald-500/20 to-emerald-400/5 border-emerald-400/20 text-emerald-100",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br px-4 py-4 ${toneClasses[score.tone]}`}>
      <p className="text-[0.68rem] uppercase tracking-[0.28em] opacity-80">{score.label}</p>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-3xl font-semibold">{score.value}</span>
        <span className="text-xs uppercase tracking-[0.22em] opacity-70">/100</span>
      </div>
    </div>
  );
}

const COUNTERFACTUAL_METRICS = [
  { key: "deterrence", label: "Deterrence", higherIsBetter: true },
  { key: "escalationRisk", label: "Escalation risk", higherIsBetter: false },
  { key: "civilianImpact", label: "Civilian impact", higherIsBetter: false },
  { key: "strategicStability", label: "Strategic stability", higherIsBetter: true },
];

function buildScoreLookup(scores) {
  return scores.reduce((lookup, score) => {
    lookup[score.label.toLowerCase()] = score.value;
    return lookup;
  }, {});
}

function computeDeterrenceScore(path, scoreLookup) {
  const titleSummary = `${path.title} ${path.summary}`.toLowerCase();
  let postureBias = 0;

  if (/calibrated|response|strike|reinforcement/.test(titleSummary)) postureBias += 12;
  if (/surveillance|surge|watch|isr/.test(titleSummary)) postureBias += 6;
  if (/restraint|observe|diplomatic/.test(titleSummary)) postureBias -= 6;

  return clamp(
    44
      + path.riskBias * 0.42
      + (scoreLookup["strategic stability"] || 0) * 0.18
      - (scoreLookup["diplomatic cost"] || 0) * 0.12
      - (scoreLookup["escalation risk"] || 0) * 0.08
      + postureBias,
  );
}

function buildCounterfactualOption(incident, path) {
  const model = buildConsoleModel(incident, path);
  const scoreLookup = buildScoreLookup(model.scores);

  return {
    id: path.id,
    title: path.title,
    summary: path.summary,
    ring: path.ring,
    projectedOutcome: model.implicationSummary,
    metrics: {
      deterrence: computeDeterrenceScore(path, scoreLookup),
      escalationRisk: scoreLookup["escalation risk"] || 0,
      civilianImpact: scoreLookup["civilian impact"] || 0,
      strategicStability: scoreLookup["strategic stability"] || 0,
    },
  };
}

function pickMetricLeader(options, metricKey, direction) {
  return options.reduce((best, option) => {
    if (!best) return option;
    if (direction === "max") {
      return option.metrics[metricKey] > best.metrics[metricKey] ? option : best;
    }
    return option.metrics[metricKey] < best.metrics[metricKey] ? option : best;
  }, null);
}

function formatSignedDelta(value) {
  if (value === 0) return "0";
  return `${value > 0 ? "+" : ""}${value}`;
}

function buildDeltaTone(metric, delta) {
  if (delta === 0) return "border-white/10 bg-white/5 text-slate-300";
  const favorable = metric.higherIsBetter ? delta > 0 : delta < 0;
  return favorable
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
    : "border-rose-400/20 bg-rose-400/10 text-rose-100";
}

function buildCounterfactualCompareData(incident, responsePaths, selectedPath) {
  const options = responsePaths.map((path) => buildCounterfactualOption(incident, path));
  const selectedOption = options.find((option) => option.id === selectedPath.id) || options[0];

  const leaders = {
    deterrence: pickMetricLeader(options, "deterrence", "max"),
    stability: pickMetricLeader(options, "strategicStability", "max"),
    civilianRisk: pickMetricLeader(options, "civilianImpact", "min"),
  };

  const badgeMap = new Map();
  const addBadge = (optionId, label) => {
    if (!optionId) return;
    badgeMap.set(optionId, [...(badgeMap.get(optionId) || []), label]);
  };

  addBadge(leaders.deterrence?.id, "Best for deterrence");
  addBadge(leaders.stability?.id, "Best for stability");
  addBadge(leaders.civilianRisk?.id, "Best for civilian risk");

  const compareOrder = [];
  const pushUnique = (option) => {
    if (option && !compareOrder.some((entry) => entry.id === option.id)) {
      compareOrder.push(option);
    }
  };

  pushUnique(selectedOption);
  pushUnique(leaders.deterrence);
  pushUnique(leaders.stability);
  pushUnique(leaders.civilianRisk);

  options
    .slice()
    .sort((left, right) => {
      const stabilityGap = right.metrics.strategicStability - left.metrics.strategicStability;
      if (stabilityGap !== 0) return stabilityGap;
      return left.metrics.civilianImpact - right.metrics.civilianImpact;
    })
    .forEach(pushUnique);

  const selectedMetrics = selectedOption?.metrics || {};
  const compareCards = compareOrder.slice(0, 3).map((option) => ({
    ...option,
    badges: [
      ...(option.id === selectedOption?.id ? ["Selected path"] : []),
      ...(badgeMap.get(option.id) || []),
    ],
    deltas: Object.fromEntries(
      COUNTERFACTUAL_METRICS.map((metric) => [
        metric.key,
        option.metrics[metric.key] - (selectedMetrics[metric.key] || 0),
      ]),
    ),
  }));

  return {
    compareCards,
    leaders,
    selectedOption,
  };
}

function CounterfactualCompareSection({ compareData }) {
  const { compareCards, leaders, selectedOption } = compareData;

  return (
    <Section
      eyebrow="Counterfactual"
      title="Compare three response paths"
      actions={
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[0.65rem] uppercase tracking-[0.24em] text-slate-300">
          Delta vs {selectedOption?.title || "selected path"}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-rose-400/15 bg-rose-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-rose-100">
          Best for deterrence: {leaders.deterrence?.title}
        </span>
        <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-emerald-100">
          Best for stability: {leaders.stability?.title}
        </span>
        <span className="rounded-full border border-violet-400/15 bg-violet-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-violet-100">
          Best for civilian risk: {leaders.civilianRisk?.title}
        </span>
      </div>

      <div className="mt-4 grid gap-3 2xl:grid-cols-3">
        {compareCards.map((option) => (
          <article
            key={option.id}
            className={`rounded-[24px] border p-4 ${
              option.id === selectedOption?.id
                ? "border-cyan-300/45 bg-cyan-400/8"
                : "border-white/10 bg-slate-900/65"
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {option.badges.map((badge) => (
                <span
                  key={`${option.id}-${badge}`}
                  className={`rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] ${
                    badge === "Selected path"
                      ? "border border-cyan-300/25 bg-cyan-400/12 text-cyan-100"
                      : "border border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-white">{option.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{option.summary}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-cyan-200">
                  {option.ring}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-cyan-300/80">Projected outcome</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{option.projectedOutcome}</p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              {COUNTERFACTUAL_METRICS.map((metric, metricIndex) => (
                <div
                  key={`${option.id}-${metric.key}`}
                  className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 ${
                    metricIndex !== COUNTERFACTUAL_METRICS.length - 1 ? "border-b border-white/10" : ""
                  }`}
                >
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{option.metrics[metric.key]}</p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${buildDeltaTone(
                      metric,
                      option.deltas[metric.key],
                    )}`}
                  >
                    {formatSignedDelta(option.deltas[metric.key])}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function uniqueItems(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function collectRecommendationProvenance(recommendations = []) {
  const confidenceDrivers = [];
  const seenDriverLabels = new Set();

  recommendations.forEach((recommendation) => {
    (recommendation.confidence_drivers || []).forEach((driver) => {
      if (!driver?.label || seenDriverLabels.has(driver.label)) return;
      seenDriverLabels.add(driver.label);
      confidenceDrivers.push(driver);
    });
  });

  return {
    threatIds: uniqueItems(recommendations.flatMap((recommendation) => recommendation.based_on_threat_ids || [])),
    unitIds: uniqueItems(recommendations.flatMap((recommendation) => recommendation.based_on_unit_ids || [])),
    eventLog: uniqueItems(recommendations.flatMap((recommendation) => recommendation.based_on_event_log || [])),
    confidenceDrivers,
  };
}

function mergeConfidenceDrivers(primary = [], secondary = []) {
  const merged = [];
  const seen = new Set();
  [...primary, ...secondary].forEach((driver) => {
    if (!driver?.label || seen.has(driver.label)) return;
    seen.add(driver.label);
    merged.push(driver);
  });
  return merged;
}

function buildChatPrefill(placeholders, incident) {
  const values = {
    attacked_site: incident.title || incident.attacked_site || "",
    location: incident.location || "",
    owner_country: incident.ownerCountry || incident.owner_country || "",
    actor: incident.actor || "",
    attack_type: incident.attackType || incident.attack_type || "",
    severity: Number(incident.severity) || 0,
    description: incident.description || "",
    latitude: incident.lat ?? incident.latitude ?? null,
    longitude: incident.lon ?? incident.longitude ?? null,
  };

  const placeholderValues = placeholders.reduce((accumulator, placeholder) => {
    if (values[placeholder.key] !== undefined && values[placeholder.key] !== null) {
      accumulator[placeholder.key] = values[placeholder.key];
    }
    return accumulator;
  }, {});

  if (values.latitude !== null) {
    placeholderValues.latitude = values.latitude;
  }
  if (values.longitude !== null) {
    placeholderValues.longitude = values.longitude;
  }

  return placeholderValues;
}

function LandingPanel({ title, count, children, className = "", actions }) {
  return (
    <article className={`panel ${className}`.trim()}>
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-title">{title}</span>
        </div>
        {count ? <span className="panel-count">{count}</span> : null}
        {actions}
      </div>
      <div className="panel-content">{children}</div>
    </article>
  );
}

function FeedPanel({ title, count, items }) {
  return (
    <LandingPanel title={title} count={count}>
      <div className="wm-feed-stack">
        {items.map((item) => (
          <div key={`${title}-${item.headline}`} className="wm-feed-item">
            <div className="wm-feed-item__tags">
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p>{item.headline}</p>
            <small className="wm-feed-item__source">
              {item.source} <em>{item.age}</em>
            </small>
          </div>
        ))}
      </div>
    </LandingPanel>
  );
}

function SignalSparkline({ values, trend }) {
  const path = values
    .map((value, index) => `${index === 0 ? "M" : "L"} ${index * 16} ${44 - value / 2}`)
    .join(" ");

  return (
    <svg viewBox="0 0 96 44" className="wm-sparkline">
      <path d={path} className={`wm-sparkline__path wm-sparkline__path--${trend}`.trim()} />
    </svg>
  );
}

function TopMapStats() {
  return (
    <div className="wm-map-stats">
      {MAP_STATS.map((item) => (
        <div key={item.label} className="wm-map-stat">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
          <small>{item.detail}</small>
        </div>
      ))}
    </div>
  );
}

function LandingSurface({
  onBackToLanding,
  onEnterConsole,
  onOpenLogin,
  onOpenAssistant,
  onHotspotConsole,
  onHotspotAssistant,
  incident,
  incidentPoint,
  selectedResponsePath,
  consoleModel,
  mapMode,
  setMapMode,
  globeArcs,
  activeLayerIds,
  toggleLayer,
  monitorMarkers,
  selectedMonitorHotspot,
  onSelectMonitorHotspot,
}) {
  const clock = useHeaderClock();
  const { headlines, marketSnapshot } = useLandingData();

  const newsItems = headlines?.news || LIVE_NEWS_ITEMS;
  const intelItems = headlines?.intel || LIVE_INTELLIGENCE_ITEMS;
  const worldNewsItems = headlines?.world_news || WORLD_NEWS_ITEMS;

  const metalsItems = marketSnapshot?.metals || METALS_AND_MATERIALS;
  const energyItems = marketSnapshot?.energy || ENERGY_COMPLEX;
  const equitiesItems = marketSnapshot?.equities || MARKETS_PANEL;
  const stressItems = marketSnapshot?.macro_stress || MACRO_STRESS;

  const forecastItems = headlines?.forecasts || FORECAST_ITEMS;
  const intelFeedItems = headlines?.intel_feed || INTEL_FEED_ITEMS;
  const regionalItems = headlines?.regional_news || REGIONAL_NEWS_PANELS;
  const predictionsData = headlines?.predictions || PREDICTIONS_PANEL;
  const postureItems = headlines?.strategic_posture || STRATEGIC_POSTURE;
  const aiInsightData = headlines?.ai_insight || AI_INSIGHT_BRIEF;

  const riskData = marketSnapshot?.strategic_risk || STRATEGIC_RISK;
  const correlationItems = marketSnapshot?.cross_stream_correlation || CROSS_STREAM_CORRELATION;
  const countryIntelItems = marketSnapshot?.country_intelligence || COUNTRY_INTELLIGENCE_INDEX;
  const financeData = marketSnapshot?.finance_radar || FINANCE_RADAR;

  return (
    <div className="wm-shell wm-shell--homepage">
      <div className="wm-promo-bar">
        <div className="wm-promo-pill">PRO</div>
        <p>Pro is coming — More Signal, Less Noise. More AI Briefings. A geopolitical &amp; equity researcher just for you.</p>
        <button type="button" onClick={onOpenLogin}>
          Reserve your spot +
        </button>
      </div>

      <header className="header">
        <div className="header-left">
          <div className="variant-switcher">
            <button type="button" className="variant-option active" data-variant="full">
              <span className="variant-icon">🌍</span>
              <span className="variant-label">World</span>
            </button>
          </div>
          <div className="wm-icon-strip">
            <button type="button">🖥</button>
            <button type="button">◧</button>
            <button type="button">↖</button>
            <button type="button">☀</button>
          </div>
          <span className="logo">MONITOR</span>
          <span className="version">v2.6.5</span>
          <span className="wm-handle">@eliehabib</span>
          <span className="wm-meta-pill">45k</span>
          <div className="status-indicator">
            <span className="status-dot" />
            <span>LIVE</span>
          </div>
          <div className="region-selector">
            <select className="region-select" defaultValue="global">
              <option value="global">Global</option>
              <option value="south-asia">South Asia</option>
              <option value="indo-pacific">Indo-Pacific</option>
              <option value="middle-east">Middle East</option>
            </select>
          </div>
          <div className="wm-defcon-pill">
            <span>DEFCON 5</span>
            <em>6%</em>
          </div>
        </div>

        <div className="header-right">
          <button type="button" className="wm-count-pill">
            🔔 25
          </button>
          <button type="button" className="copy-link-btn" onClick={onBackToLanding}>
            Landing
          </button>
          <button type="button" className="search-btn" onClick={onOpenAssistant}>
            <kbd>⌘K</kbd> Search
          </button>
          <button type="button" className="copy-link-btn" onClick={onEnterConsole}>
            Link
          </button>
          <button type="button" className="wm-icon-square" onClick={onEnterConsole}>
            ⛶
          </button>
          <button type="button" className="wm-icon-square" onClick={onOpenLogin}>
            ⚙
          </button>
        </div>
      </header>

      <div className="main-content">
        <section className="map-section">
          <div className="panel-header">
            <div className="panel-header-left">
              <span className="panel-title">Global Situation</span>
            </div>
            <span className="header-clock">{clock}</span>
            <div className="map-header-actions">
              <div className="map-dimension-toggle">
                <button
                  type="button"
                  className={`map-dim-btn ${mapMode === "flat" ? "active" : ""}`.trim()}
                  onClick={() => setMapMode("flat")}
                >
                  2D
                </button>
                <button
                  type="button"
                  className={`map-dim-btn ${mapMode === "globe" ? "active" : ""}`.trim()}
                  onClick={() => setMapMode("globe")}
                >
                  3D
                </button>
              </div>
              <button type="button" className="wm-icon-square" onClick={onOpenAssistant}>
                AI
              </button>
            </div>
          </div>

          <div className="map-container wm-map-home">
            <div className="wm-map-layer-rail">
              {MAP_LAYER_GROUPS.map((group) => (
                <div key={group.title} className="wm-map-layer-group">
                  <div className="wm-map-layer-group__title">{group.title}</div>
                  {group.items.map((layer) => {
                    const active = activeLayerIds.includes(layer.id);
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        className={`wm-map-layer ${active ? "active" : ""}`.trim()}
                        onClick={() => toggleLayer(layer.id)}
                      >
                        <span className="wm-map-layer__check">{active ? "✓" : "○"}</span>
                        <span className="wm-map-layer__icon">{layer.icon}</span>
                        <span>{layer.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="wm-map-layer-rail__credit">© Elie Habib • frontend adaptation</div>
            </div>

            {mapMode === "globe" ? (
              <WorldMonitorGlobe
                incidentPoint={incidentPoint}
                markers={monitorMarkers}
                arcs={globeArcs}
                onMarkerClick={onSelectMonitorHotspot}
              />
            ) : (
              <WorldMonitorMap
                incidentPoint={incidentPoint}
                markers={monitorMarkers}
                activeLayerIds={activeLayerIds}
                onMarkerClick={onSelectMonitorHotspot}
              />
            )}

            {selectedMonitorHotspot ? (
              <div className="absolute bottom-6 left-6 z-20 max-w-[380px] rounded-[28px] border border-white/10 bg-slate-950/88 p-5 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  {(selectedMonitorHotspot.tags || []).map((tag) => (
                    <span
                      key={`${selectedMonitorHotspot.id}-${tag}`}
                      className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-cyan-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Hotspot handoff</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{selectedMonitorHotspot.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {selectedMonitorHotspot.location} · {selectedMonitorHotspot.source}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{selectedMonitorHotspot.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onHotspotConsole(selectedMonitorHotspot)}
                    className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Open in console
                  </button>
                  <button
                    type="button"
                    onClick={() => onHotspotAssistant(selectedMonitorHotspot)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-white/10"
                  >
                    Send to copilot
                  </button>
                </div>
              </div>
            ) : null}

            <TopMapStats />

            <div className="wm-map-legend-bar">
              <span>Legend</span>
              <span><i className="wm-dot wm-dot--red" /> High Alert</span>
              <span><i className="wm-dot wm-dot--orange" /> Elevated</span>
              <span><i className="wm-dot wm-dot--yellow" /> Monitoring</span>
              <span><i className="wm-dot wm-dot--blue" /> Base</span>
              <span><i className="wm-dot wm-dot--white" /> Nuclear</span>
            </div>
          </div>

          <div className="map-resize-handle" />
        </section>

        <section className="wm-home-grid">
          <LandingPanel title="Live News" count="93" className="wm-home-panel wm-home-panel--news">
            <div className="wm-tab-row">
              {LIVE_NEWS_FEEDS.map((feed, index) => (
                <button key={feed} type="button" className={index === 0 ? "active" : ""}>
                  {feed}
                </button>
              ))}
            </div>
            <div className="wm-live-news-hero">
              <div className="wm-live-news-hero__caption">
                <span>{newsItems[0].headline}</span>
                <strong>{newsItems[0].source.toUpperCase()}</strong>
              </div>
            </div>
            <div className="wm-live-intel-list">
              {intelItems.map((item) => (
                <div key={item.headline} className="wm-live-intel-item">
                  <div>
                    <strong>{item.source}</strong>
                    <p>{item.headline}</p>
                  </div>
                  <span>{item.age}</span>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Live Webcams" count="27" className="wm-home-panel wm-home-panel--webcams">
            <div className="wm-tab-row">
              {WEBCAM_TABS.map((tab, index) => (
                <button key={tab} type="button" className={index === 0 ? "active" : ""}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="wm-webcam-grid">
              {WEBCAM_TILES.map((tile, index) => (
                <div key={tile.id} className={`wm-webcam-tile wm-webcam-tile--${index + 1}`.trim()}>
                  {tile.embedUrl ? (
                    <iframe
                      className="wm-webcam-tile__video"
                      src={tile.embedUrl}
                      title={`${tile.label} live webcam`}
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : null}
                  <span>{tile.label}</span>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="AI Insights" count="LIVE" className="wm-home-panel wm-home-panel--insights">
            <div className="wm-insights-card">
              <div className="wm-insights-card__eyebrow">{aiInsightData.title}</div>
              <p>{aiInsightData.text}</p>
              <div className="wm-inline-note">
                <strong>Incident</strong>
                <span>
                  {incident.title}: {consoleModel.primaryIntent}
                </span>
              </div>
            </div>
            <div className="wm-posture-list">
              {postureItems.map((item) => (
                <div key={item.label} className="wm-posture-item">
                  <div className="wm-posture-item__header">
                    <strong>{item.label}</strong>
                    <span>{item.level}</span>
                  </div>
                  <div className="wm-posture-item__meta">
                    <span>AIR {item.air}</span>
                    <span>SEA {item.sea}</span>
                    <span>{item.direction}</span>
                  </div>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Operational Hotspots" count={`${MONITOR_HOTSPOTS.length} LIVE`} className="wm-home-panel wm-home-panel--insights">
            <div className="wm-panel-note">
              Click a hotspot to prefill SENTINEL with an incident package, then jump straight into the console or copilot.
            </div>
            <div className="wm-correlation-stack">
              {MONITOR_HOTSPOTS.map((hotspot) => {
                const active = selectedMonitorHotspot?.id === hotspot.id;
                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    onClick={() => onSelectMonitorHotspot(hotspot)}
                    className={`wm-correlation-card text-left transition ${active ? "border-cyan-300/35 bg-cyan-400/10" : ""}`}
                  >
                    <div className="wm-correlation-card__top">
                      <strong>{hotspot.title}</strong>
                      <span>{hotspot.severity}</span>
                    </div>
                    <div className="wm-country-row__bar">
                      <div style={{ width: `${hotspot.severity}%` }} />
                    </div>
                    <p>{hotspot.location} · {hotspot.actor}</p>
                  </button>
                );
              })}
            </div>
          </LandingPanel>
        </section>

        <section className="wm-dashboard-grid">
          <LandingPanel title="AI Forecasts" count="LIVE">
            <div className="wm-pill-filter-row">
              {FORECAST_FILTERS.map((filter, index) => (
                <button key={filter} type="button" className={index === 0 ? "active" : ""}>
                  {filter}
                </button>
              ))}
            </div>
            <div className="wm-forecast-theater">
              <div>
                <span>Active theaters</span>
                <strong>Black Sea maritime disruption state</strong>
              </div>
              <em>90%</em>
            </div>
            <div className="wm-live-intel-list wm-live-intel-list--compact">
              {forecastItems.map((item) => (
                <div key={item.headline} className="wm-live-intel-item">
                  <div>
                    <strong>{item.channel}</strong>
                    <p>{item.headline}</p>
                  </div>
                  <span>{item.age}</span>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Country Intelligence Index" count={`${COUNTRY_INTELLIGENCE_SIGNALS.length} SIG`}>
            <div className="wm-panel-note">
              Composite national instability scoring across military, economic, cyber, civil, infrastructure, maritime, narrative, and market signals.
            </div>
            <div className="wm-country-list">
              {countryIntelItems.map((row) => (
                <div key={row.country} className="wm-country-row">
                  <div className="wm-country-row__top">
                    <span>{row.country}</span>
                    <strong>{row.score}</strong>
                  </div>
                  <div className="wm-country-row__bar">
                    <div style={{ width: `${row.score}%` }} />
                  </div>
                  <small>{row.breakdown}</small>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Strategic Risk Overview" count="LIVE">
            <div className="wm-risk-gauge">
              <div className="wm-risk-gauge__ring">
                <div>
                  <strong>{riskData.score}</strong>
                  <span>{riskData.band}</span>
                </div>
              </div>
              <div className="wm-risk-gauge__trend">
                <span>Trend</span>
                <strong>{riskData.trend}</strong>
              </div>
            </div>
            <div className="wm-cascade-bar">
              <span>Infrastructure cascade</span>
              <strong>{riskData.infrastructureLinks} links</strong>
            </div>
            <div className="wm-mini-metric-list">
              {riskData.composite.map((item) => (
                <div key={item.label} className="wm-mini-metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Cross-Stream Correlation" count="LIVE">
            <div className="wm-panel-note">
              Military, economic, disaster, and escalation signals converging into a shared decision window.
            </div>
            <div className="wm-correlation-stack">
              {correlationItems.map((item) => (
                <div key={item.title} className="wm-correlation-card">
                  <div className="wm-correlation-card__top">
                    <strong>{item.title}</strong>
                    <span>{item.score}</span>
                  </div>
                  <div className="wm-country-row__bar">
                    <div style={{ width: `${item.score}%` }} />
                  </div>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </LandingPanel>

          <FeedPanel title="Intel Feed" count="LIVE" items={intelFeedItems} />

          {regionalItems.map((panel) => (
            <FeedPanel key={panel.title} title={panel.title} count={panel.count} items={panel.items} />
          ))}

          <LandingPanel title="Predictions" count="2">
            <div className="wm-prediction-card">
              <div className="wm-prediction-badge">{predictionsData.market}</div>
              <p>{predictionsData.question}</p>
              <div className="wm-prediction-meta">
                <span>Vol: {predictionsData.volume}</span>
                <span>Closes: {predictionsData.closeDate}</span>
                <strong>{predictionsData.badge}</strong>
              </div>
              <div className="wm-yes-no-bar">
                <div className="wm-yes-no-bar__yes" style={{ width: `${predictionsData.yes}%` }}>
                  Yes {predictionsData.yes}%
                </div>
                <div className="wm-yes-no-bar__no" style={{ width: `${predictionsData.no}%` }}>
                  No {predictionsData.no}%
                </div>
              </div>
            </div>
          </LandingPanel>

          <LandingPanel title="Metals & Materials" count="6">
            <div className="wm-commodity-grid">
              {metalsItems.map((item) => (
                <div key={item.name} className="wm-commodity-card">
                  <span>{item.name}</span>
                  <strong>{item.price}</strong>
                  <em>{item.delta}</em>
                  <SignalSparkline values={item.trend} trend={item.delta.startsWith("-") ? "down" : "up"} />
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Energy Complex" count="LIVE">
            <div className="wm-energy-stack">
              {energyItems.map((item) => (
                <div key={item.label} className="wm-energy-row">
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                  <em className={item.tone === "up" ? "positive" : "negative"}>{item.delta}</em>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Markets" count="Watchlist">
            <div className="wm-market-list">
              {equitiesItems.map((item) => (
                <div key={item.ticker} className="wm-market-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.ticker}</span>
                  </div>
                  <div>
                    <strong>{item.price}</strong>
                    <em>{item.delta}</em>
                  </div>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Macro Stress" count="4">
            <div className="wm-mini-metric-list">
              {stressItems.map((item) => (
                <div key={item.label} className="wm-mini-metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Finance Radar" count="7-signal composite">
            <div className="wm-radar-grid">
              <div className="wm-radar-summary">
                <strong>{financeData.compositeScore}</strong>
                <span>Composite</span>
              </div>
              <div className="wm-radar-totals">
                <div><strong>{financeData.stockExchanges}</strong><span>Exchanges</span></div>
                <div><strong>{financeData.commodities}</strong><span>Commodities</span></div>
                <div><strong>{financeData.cryptoPairs}</strong><span>Crypto</span></div>
                <div><strong>{financeData.centralBanks}</strong><span>CBs</span></div>
              </div>
            </div>
            <div className="wm-correlation-stack">
              {financeData.compositeSignals.map((item) => (
                <div key={item.label} className="wm-correlation-card">
                  <div className="wm-correlation-card__top">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                  <div className="wm-country-row__bar">
                    <div style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </LandingPanel>

          <FeedPanel title="World News" count="LIVE" items={worldNewsItems} />
        </section>
      </div>

      <footer className="site-footer">
        <div className="site-footer-brand">
          <img src="/favicon-32x32.png" alt="" width="28" height="28" className="site-footer-icon" />
          <div className="site-footer-brand-text">
            <span className="site-footer-name">WORLD MONITOR</span>
            <span className="site-footer-sub">v2.6.5 • @eliehabib</span>
          </div>
        </div>
        <nav>
          <button type="button">Pro</button>
          <button type="button">Blog</button>
          <button type="button">Docs</button>
          <button type="button">Status</button>
          <button type="button">GitHub</button>
          <button type="button">Discord</button>
          <button type="button">Download App</button>
        </nav>
      </footer>

      <button type="button" className="wm-discord-pill" onClick={onOpenAssistant}>
        Join the Discord Community
      </button>
    </div>
  );
}

function LoginSurface({ onLogin, onBack }) {
  const [email, setEmail] = useState("commander@sentinel.mil");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPage
      email={email}
      password={password}
      error={error}
      loading={loading}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}

function ChatSurface({ onBack, onOpenConsole, prefilledIncident, onPrefillConsumed }) {
  const [placeholders, setPlaceholders] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);
  const lastPrefillKeyRef = useRef(null);

  // Fetch placeholders from backend on mount
  useEffect(() => {
    getPromptPlaceholders()
      .then((data) => {
        const ph = data.placeholders || [];
        setPlaceholders(ph);
        if (ph.length > 0) {
          setMessages([
            { role: "assistant", text: "I'll walk you through the incident details one step at a time. Your answers will fill the backend prompt placeholders for AI analysis." },
            { role: "assistant", text: ph[0].question },
          ]);
        }
      })
      .catch(() => {
        // Fallback if backend is not running
        const fallback = [
          { key: "attacked_site", label: "Attacked site", question: "What site or installation was attacked?", placeholder: "Northern Radar Relay" },
          { key: "location", label: "Location", question: "Where did the incident occur?", placeholder: "Kupwara sector" },
          { key: "owner_country", label: "Owner country", question: "Which country owns or controls the affected site?", placeholder: "India" },
          { key: "actor", label: "Actor", question: "Who is the suspected actor or adversary?", placeholder: "Pakistan-backed proxy network" },
          { key: "attack_type", label: "Attack type", question: "What was the mode of attack?", placeholder: "Drone attack", options: ["Missile strike", "Drone attack", "Militant raid", "Cyber disruption", "Bombing", "Artillery exchange"] },
          { key: "severity", label: "Severity (0-100)", question: "How severe was the incident on a 0-100 scale?", placeholder: "74" },
          { key: "description", label: "Description", question: "Give a short operational description of the incident.", placeholder: "Forward radar relay degraded after a stand-off drone strike." },
        ];
        setPlaceholders(fallback);
        setMessages([
          { role: "assistant", text: "I'll walk you through the incident details one step at a time. Your answers will fill the backend prompt placeholders for AI analysis." },
          { role: "assistant", text: fallback[0].question },
        ]);
      });
  }, []);

  useEffect(() => {
    if (!prefilledIncident || placeholders.length === 0) return;
    if (lastPrefillKeyRef.current === prefilledIncident.key) return;

    const prefilledAnswers = buildChatPrefill(placeholders, prefilledIncident.incident);
    const firstPlaceholder = placeholders[0];
    setAnswers(prefilledAnswers);
    setCurrentStep(0);
    setDraft(firstPlaceholder ? String(prefilledAnswers[firstPlaceholder.key] ?? "") : "");
    setReport(null);
    setError(null);
    setMessages([
      {
        role: "assistant",
        text: "Monitor handoff received. I loaded the incident package from the selected hotspot into the prompt flow.",
      },
      {
        role: "assistant",
        text: `${prefilledIncident.hotspot.title} from ${prefilledIncident.hotspot.source} is loaded and ready for analysis.`,
      },
      {
        role: "assistant",
        text: "Review or edit each response. The current value is prefilled in the input so the chatbot still takes your changes normally.",
      },
      ...(firstPlaceholder ? [{ role: "assistant", text: firstPlaceholder.question }] : []),
    ]);
    lastPrefillKeyRef.current = prefilledIncident.key;
    onPrefillConsumed?.();
  }, [prefilledIncident, placeholders, onPrefillConsumed]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, report]);

  const currentPlaceholder = placeholders[currentStep] || null;
  const allFilled = placeholders.length > 0 && currentStep >= placeholders.length;
  const readyToGenerate = placeholders.length > 0
    && placeholders.every((placeholder) => {
      const value = answers[placeholder.key];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });

  useEffect(() => {
    if (!currentPlaceholder) {
      setDraft("");
      return;
    }
    const currentValue = answers[currentPlaceholder.key];
    setDraft(currentValue === undefined || currentValue === null ? "" : String(currentValue));
  }, [answers, currentPlaceholder]);

  function handleSubmitAnswer(value) {
    if (!value.trim() || !currentPlaceholder) return;
    const key = currentPlaceholder.key;
    const newAnswers = { ...answers, [key]: key === "severity" ? Number(value) || 0 : value };
    setAnswers(newAnswers);

    const newMessages = [
      ...messages,
      { role: "user", text: value },
    ];

    const nextIndex = currentStep + 1;
    setCurrentStep(nextIndex);

    if (nextIndex < placeholders.length) {
      newMessages.push({ role: "assistant", text: placeholders[nextIndex].question });
    } else {
      newMessages.push({ role: "assistant", text: "All placeholders filled. Click \"Generate Report\" to run AI analysis on this incident." });
    }
    setMessages(newMessages);
    setDraft("");
  }

  function handleSelectOption(option) {
    handleSubmitAnswer(option);
  }

  async function handleGenerateReport() {
    setIsLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "assistant", text: "Running AI threat assessment and SITREP generation…" }]);
    try {
      const result = await executePrompt(answers);
      if (result.detail) {
        throw new Error(typeof result.detail === "string" ? result.detail : JSON.stringify(result.detail));
      }
      setReport(result);
      setMessages((prev) => [...prev, { role: "assistant", text: "Analysis complete. The full report is shown below." }]);
    } catch (err) {
      setError(err.message || "Failed to generate report. Make sure the backend is running.");
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message || "Failed to generate report. Is the backend running?"}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    handleSubmitAnswer(draft);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer(draft);
    }
  }

  // Determine which placeholder keys are filled
  const filledKeys = new Set(Object.keys(answers));

  return (
    <div className="wm-shell wm-shell--chat">
      <header className="header">
        <div className="header-left">
          <span className="logo">SENTINEL COPILOT</span>
          <span className="version">prompt surface</span>
        </div>
        <div className="header-right">
          <button type="button" className="search-btn" onClick={onOpenConsole}>
            Strategic console
          </button>
          <button type="button" className="copy-link-btn" onClick={onBack}>
            Back to homepage
          </button>
        </div>
      </header>
      <div className="wm-chat-layout">
        <aside className="wm-chat-sidebar">
          <div className="wm-chat-card">
            <p className="wm-chat-card__eyebrow">Copilot mode</p>
            <h2>Prompt-driven incident workflow</h2>
            <p>
              Answer the questions below to fill backend prompt placeholders. Once complete, generate an AI analysis report.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="wm-chat-card">
            <p className="wm-chat-card__eyebrow">Progress</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: `${placeholders.length ? (Math.min(currentStep, placeholders.length) / placeholders.length) * 100 : 0}%`, height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #22d3ee, #06b6d4)", transition: "width 0.4s ease" }} />
              </div>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{Math.min(currentStep, placeholders.length)}/{placeholders.length}</span>
            </div>
          </div>

          {/* Placeholder chips — show filled state */}
          <div className="wm-chat-card">
            <p className="wm-chat-card__eyebrow">Prompt placeholders</p>
            <div className="wm-chat-chip-list">
              {placeholders.map((ph) => (
                <span
                  key={ph.key}
                  className="wm-chat-chip"
                  style={{
                    borderColor: filledKeys.has(ph.key) ? "rgba(34,211,238,0.5)" : undefined,
                    background: filledKeys.has(ph.key) ? "rgba(34,211,238,0.1)" : undefined,
                  }}
                >
                  {filledKeys.has(ph.key) ? "✓ " : ""}{ph.key}
                </span>
              ))}
            </div>
          </div>

          {CHAT_BRIEFING_MODULES.filter((m) => m.title !== "Prompt placeholders").map((module) => (
            <div key={module.title} className="wm-chat-card">
              <p className="wm-chat-card__eyebrow">{module.title}</p>
              <div className="wm-chat-chip-list">
                {module.items.map((item) => (
                  <span key={item} className="wm-chat-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="wm-chat-main" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "85%",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  padding: "12px 16px",
                  borderRadius: 16,
                  fontSize: 14,
                  lineHeight: 1.6,
                  ...(msg.role === "assistant"
                    ? { border: "1px solid rgba(34,211,238,0.15)", background: "rgba(15,23,42,0.8)", color: "rgba(226,232,240,0.9)" }
                    : { border: "1px solid rgba(251,146,60,0.25)", background: "rgba(251,146,60,0.1)", color: "rgba(255,237,213,0.95)" }),
                }}
              >
                {msg.text}
              </div>
            ))}

            {/* Option buttons (for attack_type etc.) */}
            {currentPlaceholder?.options && !allFilled && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {currentPlaceholder.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(15,23,42,0.7)",
                      color: "rgba(203,213,225,0.9)",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)"; e.currentTarget.style.background = "rgba(34,211,238,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(15,23,42,0.7)"; }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Loading spinner */}
            {isLoading && (
              <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 16, border: "1px solid rgba(34,211,238,0.15)", background: "rgba(15,23,42,0.8)" }}>
                <div style={{ width: 20, height: 20, border: "2px solid rgba(34,211,238,0.3)", borderTopColor: "#22d3ee", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 14, color: "rgba(226,232,240,0.7)" }}>SENTINEL is thinking…</span>
              </div>
            )}

            {/* Generate button */}
            {readyToGenerate && !report && !isLoading && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  style={{
                    padding: "12px 28px",
                    borderRadius: 24,
                    border: "none",
                    background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
                    color: "#0f172a",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 0 30px rgba(34,211,238,0.25)",
                    transition: "all 0.2s",
                  }}
                >
                  ⚡ Generate Report
                </button>
              </div>
            )}

            {/* Report display */}
            {report && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16, width: "100%" }}>

                {/* Scores */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                  {Object.entries(report.scores || {}).map(([key, val]) => {
                    const tones = {
                      threat_score: { bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)", text: "#fda4af" },
                      readiness_score: { bg: "rgba(34,211,238,0.12)", border: "rgba(34,211,238,0.25)", text: "#a5f3fc" },
                      escalation_risk: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", text: "#fde68a" },
                      confidence_score: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)", text: "#c4b5fd" },
                    };
                    const t = tones[key] || tones.confidence_score;
                    return (
                      <div key={key} style={{ borderRadius: 16, border: `1px solid ${t.border}`, background: t.bg, padding: "16px 14px" }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: t.text, opacity: 0.8 }}>{key.replace(/_/g, " ")}</div>
                        <div style={{ fontSize: 28, fontWeight: 600, color: t.text, marginTop: 8 }}>{typeof val === "number" ? val.toFixed(1) : val}</div>
                        <div style={{ fontSize: 11, color: t.text, opacity: 0.6 }}>/100</div>
                      </div>
                    );
                  })}
                </div>

                {/* Assessment */}
                {report.reasoning && (
                  <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.7)", padding: 20 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(34,211,238,0.7)", marginBottom: 12 }}>Threat Assessment</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(226,232,240,0.9)" }}>{report.reasoning.assessment_summary}</p>

                    {report.reasoning.key_risks?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(244,63,94,0.7)", marginBottom: 8 }}>Key Risks</div>
                        {report.reasoning.key_risks.map((risk, i) => (
                          <div key={i} style={{ borderRadius: 12, border: "1px solid rgba(244,63,94,0.15)", background: "rgba(244,63,94,0.06)", padding: "10px 14px", marginBottom: 6, fontSize: 13, color: "rgba(253,164,175,0.9)" }}>{risk}</div>
                        ))}
                      </div>
                    )}

                    {report.reasoning.recommendations?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(34,211,238,0.7)", marginBottom: 8 }}>Recommendations</div>
                        {report.reasoning.recommendations.map((rec, i) => (
                          <div key={i} style={{ borderRadius: 12, border: "1px solid rgba(34,211,238,0.15)", background: "rgba(34,211,238,0.06)", padding: "12px 14px", marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(165,243,252,0.9)" }}>{rec.action}</span>
                              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(34,211,238,0.8)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{rec.priority}</span>
                            </div>
                            <p style={{ fontSize: 12, color: "rgba(203,213,225,0.7)", marginTop: 6 }}>{rec.rationale}</p>
                            {(rec.based_on_threat_ids?.length > 0 || rec.based_on_unit_ids?.length > 0) && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                                {(rec.based_on_threat_ids || []).map((threatId) => (
                                  <span key={`${rec.action_id}-${threatId}`} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(244,63,94,0.15)", background: "rgba(244,63,94,0.08)", color: "rgba(253,164,175,0.92)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                    Threat {threatId}
                                  </span>
                                ))}
                                {(rec.based_on_unit_ids || []).map((unitId) => (
                                  <span key={`${rec.action_id}-${unitId}`} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(34,211,238,0.15)", background: "rgba(34,211,238,0.08)", color: "rgba(165,243,252,0.92)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                    Unit {unitId}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {(report.reasoning.based_on_threat_ids?.length > 0
                      || report.reasoning.based_on_unit_ids?.length > 0
                      || report.reasoning.based_on_event_log?.length > 0
                      || report.reasoning.confidence_drivers?.length > 0) && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(148,163,184,0.75)", marginBottom: 8 }}>Evidence Trace</div>

                        {(report.reasoning.based_on_threat_ids?.length > 0 || report.reasoning.based_on_unit_ids?.length > 0) && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {(report.reasoning.based_on_threat_ids || []).map((threatId) => (
                              <span key={`reasoning-threat-${threatId}`} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(244,63,94,0.15)", background: "rgba(244,63,94,0.08)", color: "rgba(253,164,175,0.92)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                Threat {threatId}
                              </span>
                            ))}
                            {(report.reasoning.based_on_unit_ids || []).map((unitId) => (
                              <span key={`reasoning-unit-${unitId}`} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(34,211,238,0.15)", background: "rgba(34,211,238,0.08)", color: "rgba(165,243,252,0.92)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                Unit {unitId}
                              </span>
                            ))}
                          </div>
                        )}

                        {report.reasoning.based_on_event_log?.length > 0 && (
                          <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                            {report.reasoning.based_on_event_log.map((eventLine, index) => (
                              <div key={`reasoning-event-${index}`} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "10px 12px", fontSize: 12, color: "rgba(203,213,225,0.8)" }}>
                                {eventLine}
                              </div>
                            ))}
                          </div>
                        )}

                        {report.reasoning.confidence_drivers?.length > 0 && (
                          <div style={{ display: "grid", gap: 8 }}>
                            {report.reasoning.confidence_drivers.map((driver, index) => (
                              <div key={`reasoning-driver-${index}`} style={{ borderRadius: 12, border: `1px solid ${driver.impact === "supports" ? "rgba(52,211,153,0.18)" : "rgba(245,158,11,0.18)"}`, background: driver.impact === "supports" ? "rgba(52,211,153,0.06)" : "rgba(245,158,11,0.06)", padding: "10px 12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                  <span style={{ fontSize: 12, color: "rgba(226,232,240,0.92)", fontWeight: 500 }}>{driver.label}</span>
                                  <span style={{ fontSize: 11, color: driver.impact === "supports" ? "rgba(167,243,208,0.92)" : "rgba(253,230,138,0.92)" }}>{driver.score}/100</span>
                                </div>
                                <p style={{ fontSize: 12, color: "rgba(203,213,225,0.72)", marginTop: 6, lineHeight: 1.5 }}>{driver.reason}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(52,211,153,0.7)", marginBottom: 8 }}>Projected Outcome</div>
                      <p style={{ fontSize: 13, color: "rgba(167,243,208,0.85)", lineHeight: 1.6 }}>{report.reasoning.projected_outcome}</p>
                    </div>
                  </div>
                )}

                {/* SITREP */}
                {report.sitrep && (
                  <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.7)", padding: 20 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(34,211,238,0.7)", marginBottom: 12 }}>SITREP</div>
                    {["situation", "threats", "friendly_status", "recommended_action", "projected_outlook"].map((field) => (
                      report.sitrep[field] ? (
                        <div key={field} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(148,163,184,0.6)", marginBottom: 4 }}>{field.replace(/_/g, " ")}</div>
                          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(226,232,240,0.85)" }}>{report.sitrep[field]}</p>
                        </div>
                      ) : null
                    ))}
                  </div>
                )}

                {/* View in console button */}
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={onOpenConsole}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 20,
                      border: "1px solid rgba(34,211,238,0.3)",
                      background: "rgba(34,211,238,0.08)",
                      color: "#a5f3fc",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Open Strategic Console →
                  </button>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {!allFilled && currentPlaceholder && !currentPlaceholder.options && (
            <form onSubmit={handleFormSubmit} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", display: "flex", gap: 10, alignItems: "center" }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentPlaceholder.placeholder || "Type your answer…"}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  fontSize: 14,
                  outline: "none",
                  transition: "border 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(34,211,238,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                autoFocus
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                style={{
                  padding: "12px 20px",
                  borderRadius: 16,
                  border: "none",
                  background: draft.trim() ? "#22d3ee" : "rgba(255,255,255,0.05)",
                  color: draft.trim() ? "#0f172a" : "rgba(255,255,255,0.3)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: draft.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                Send
              </button>
            </form>
          )}
        </main>
      </div>

      {/* Spinner keyframe animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  const { worldState, loading, handleAdvance, handleReset, fetchState } = useSentinelState();
  const [surface, setSurface] = useState(() => (typeof window === "undefined" ? "landing" : getSurfaceFromHash()));
  const [mapMode, setMapMode] = useState("flat");
  const [incident, setIncident] = useState(INITIAL_INCIDENT);
  const [selectedResponsePath, setSelectedResponsePath] = useState(RESPONSE_PATHS[1]);
  const [activeLayerIds, setActiveLayerIds] = useState(DEFAULT_ACTIVE_LAYER_IDS);
  const [selectedMonitorHotspot, setSelectedMonitorHotspot] = useState(MONITOR_HOTSPOTS[0]);
  const [monitorHandoff, setMonitorHandoff] = useState(null);
  const [chatPrefill, setChatPrefill] = useState(null);

  // Auth state
  const [authToken, setAuthToken] = useState(() => sessionStorage.getItem("sentinel_token"));
  const [authUser, setAuthUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("sentinel_user")); } catch { return null; }
  });

  // Sync incident from backend worldState when threats arrive
  useEffect(() => {
    if (monitorHandoff || !worldState?.threats?.[0]) return;
    const t = worldState.threats[0];
    setIncident(prev => ({
      ...prev,
      title: t.label || prev.title,
      location: worldState.theater_name || prev.location,
      severity: t.severity ?? prev.severity,
      description: t.summary || prev.description,
      lat: t.latitude ?? prev.lat,
      lon: t.longitude ?? prev.lon,
      actor: t.actor || prev.actor,
      attackType: t.attack_type || prev.attackType,
      ownerCountry: t.owner_country || prev.ownerCountry,
    }));
  }, [worldState, monitorHandoff]);

  // Computed response paths: backend recommendations first, static fallback
  const responsePaths = useMemo(() => {
    const recs = monitorHandoff ? null : worldState?.reasoning?.recommendations;
    if (!recs || recs.length === 0) return RESPONSE_PATHS;
    return recs.map(rec => ({
      id: rec.action_id,
      title: rec.action,
      summary: rec.rationale,
      ring: rec.priority.toUpperCase(),
      riskBias: Math.round((1 - rec.expected_effectiveness) * 100),
      diplomaticBias: Math.round(rec.resource_cost * 50),
      stabilityBias: Math.round(rec.expected_effectiveness * 100),
    }));
  }, [worldState, monitorHandoff]);

  // Auto-select first recommendation when response paths change
  useEffect(() => {
    if (responsePaths.length > 0 && !responsePaths.find(p => p.id === selectedResponsePath.id)) {
      setSelectedResponsePath(responsePaths[0]);
    }
  }, [responsePaths]);

  // Re-fetch state when navigating to console (picks up chat-persisted state)
  const previousSurfaceRef = useRef(surface);
  useEffect(() => {
    const previousSurface = previousSurfaceRef.current;
    previousSurfaceRef.current = surface;

    if (surface === "console" && previousSurface !== "console" && !monitorHandoff) {
      fetchState();
    }
  }, [surface, fetchState, monitorHandoff]);

  function handleLogin(token, user) {
    setAuthToken(token);
    setAuthUser(user);
    sessionStorage.setItem("sentinel_token", token);
    sessionStorage.setItem("sentinel_user", JSON.stringify(user));
    navigate("console");
  }

  function handleLogout() {
    if (authToken) logoutUser(authToken).catch(() => {});
    setAuthToken(null);
    setAuthUser(null);
    sessionStorage.removeItem("sentinel_token");
    sessionStorage.removeItem("sentinel_user");
    navigate("landing");
  }

  useEffect(() => {
    const syncSurface = () => setSurface(getSurfaceFromHash());
    window.addEventListener("hashchange", syncSurface);
    syncSurface();
    return () => window.removeEventListener("hashchange", syncSurface);
  }, []);

  const navigate = useCallback((nextSurface) => {
    const hash = surfaceToHash(nextSurface);
    if (!hash) {
      window.history.replaceState({}, "", window.location.pathname + window.location.search);
      setSurface("landing");
      return;
    }
    window.location.hash = hash;
    setSurface(nextSurface);
  }, []);

  const openChat = useCallback((prefill = null) => {
    setChatPrefill(prefill);
    navigate("chat");
  }, [navigate]);

  const toggleLayer = useCallback((layerId) => {
    setActiveLayerIds((current) =>
      current.includes(layerId) ? current.filter((value) => value !== layerId) : [...current, layerId],
    );
  }, []);

  const applyMonitorHandoff = useCallback((hotspot, destination) => {
    const nextIncident = hotspotToIncident(hotspot);
    const nextHandoff = {
      key: `${hotspot.id}-${Date.now()}`,
      hotspot,
      incident: nextIncident,
    };
    setSelectedMonitorHotspot(hotspot);
    setIncident(nextIncident);
    setSelectedResponsePath(RESPONSE_PATHS[1]);
    setMonitorHandoff(nextHandoff);
    if (destination === "chat") {
      openChat(nextHandoff);
      return;
    }
    navigate(destination);
  }, [navigate, openChat]);

  const clearMonitorHandoff = useCallback(() => {
    setMonitorHandoff(null);
    setChatPrefill(null);
    fetchState();
  }, [fetchState]);

  const effectiveWorldState = monitorHandoff ? null : worldState;

  const monitorMarkers = useMemo(
    () => [
      ...GLOBE_MARKERS,
      ...MONITOR_HOTSPOTS.map((hotspot) => ({
        id: hotspot.id,
        label: hotspot.title,
        lat: hotspot.lat,
        lon: hotspot.lon,
        color: selectedMonitorHotspot?.id === hotspot.id ? "#fb7185" : "#f97316",
        scale: selectedMonitorHotspot?.id === hotspot.id ? 1.25 : 1.02,
        hotspot,
      })),
    ],
    [selectedMonitorHotspot],
  );

  const handleConsoleReset = useCallback(() => {
    setMonitorHandoff(null);
    setChatPrefill(null);
    handleReset();
  }, [handleReset]);

  const handleConsoleAdvance = useCallback(() => {
    setMonitorHandoff(null);
    setChatPrefill(null);
    handleAdvance();
  }, [handleAdvance]);

  const handleOpenChatFromConsole = useCallback(() => {
    openChat(monitorHandoff || null);
  }, [monitorHandoff, openChat]);

  const consoleModel = useMemo(() => {
    const base = buildConsoleModel(incident, selectedResponsePath);
    if (!effectiveWorldState) return base;
    const r = effectiveWorldState.reasoning;
    const recommendationProvenance = collectRecommendationProvenance(r?.recommendations || []);
    const confidenceDrivers = mergeConfidenceDrivers(r?.confidence_drivers || [], recommendationProvenance.confidenceDrivers);
    return {
      ...base,
      // Intent & site analysis — prefer backend reasoning when available
      primaryIntent: r?.assessment_summary || base.primaryIntent,
      alternateIntents: r?.key_risks?.length > 0 ? r.key_risks : base.alternateIntents,
      whyThisSite: r?.assessment_summary
        ? `${r.assessment_summary.split(".").slice(1).join(".").trim() || base.whyThisSite}`
        : base.whyThisSite,
      implicationSummary: r?.projected_outcome || base.implicationSummary,
      brief: r?.assessment_summary || base.brief,
      timeline: r?.projected_outcome ? [{ window: "Next 24 hours", text: r.projected_outcome }] : base.timeline,
      consequenceHighlights: r?.recommendations?.length > 0 ? r.recommendations.map(rec => rec.action || rec.rationale) : base.consequenceHighlights,
      trust: {
        ...base.trust,
        assumptions: r?.assumptions?.length > 0 ? r.assumptions : base.trust.assumptions,
        weakEvidence: r?.key_risks?.length > 0 ? r.key_risks : base.trust.weakEvidence,
        confidenceBreakdown: confidenceDrivers.length > 0
          ? confidenceDrivers.map((driver) => ({
              label: driver.label,
              value: driver.score,
              detail: driver.reason,
              impact: driver.impact,
            }))
          : base.trust.confidenceBreakdown,
        evidenceTrace: {
          threatIds: uniqueItems([
            ...(r?.based_on_threat_ids || []),
            ...recommendationProvenance.threatIds,
          ]),
          unitIds: uniqueItems([
            ...(r?.based_on_unit_ids || []),
            ...recommendationProvenance.unitIds,
          ]),
          eventLog: uniqueItems([
            ...(r?.based_on_event_log || []),
            ...recommendationProvenance.eventLog,
          ]).slice(0, 4),
          confidenceDrivers: confidenceDrivers.length > 0
            ? confidenceDrivers
            : base.trust.evidenceTrace.confidenceDrivers,
        },
      },
      scores: [
        { label: "Threat score", value: effectiveWorldState?.scorecard?.threat_score || 0, tone: "rose" },
        { label: "Readiness", value: effectiveWorldState?.scorecard?.readiness_score || 0, tone: "cyan" },
        { label: "Escalation risk", value: effectiveWorldState?.scorecard?.escalation_risk || 0, tone: "amber" },
        { label: "System confidence", value: effectiveWorldState?.scorecard?.confidence_score || 0, tone: "emerald" },
      ]
    };
  }, [incident, selectedResponsePath, effectiveWorldState]);

  const counterfactualCompareData = useMemo(
    () => buildCounterfactualCompareData(incident, responsePaths, selectedResponsePath),
    [incident, responsePaths, selectedResponsePath],
  );

  const activeThreat = effectiveWorldState?.threats?.[0];
  const incidentPoint = useMemo(
    () => ({
      lat: activeThreat?.latitude || incident.lat || 34.5261,
      lon: activeThreat?.longitude || incident.lon || 74.2612,
    }),
    [incident, activeThreat],
  );

  const mergedMarkers = useMemo(() => {
    if (!effectiveWorldState) return GLOBE_MARKERS;
    const units = (effectiveWorldState.units || []).map(u => ({
      id: u.unit_id, label: `${u.name} (${u.status})`, lat: u.latitude, lon: u.longitude, color: "#60a5fa", scale: 0.95
    }));
    const threats = (effectiveWorldState.threats || []).map(t => ({
      id: t.threat_id, label: t.label, lat: t.latitude, lon: t.longitude, color: "#fb7185", scale: 1.15
    }));
    return [...units, ...threats];
  }, [effectiveWorldState]);

  const globeArcs = useMemo(
    () => [
      {
        id: "console-arc-1",
        start: incidentPoint,
        end: { lat: 28.6139, lon: 77.209 },
        color: "#fb7185",
      },
      {
        id: "console-arc-2",
        start: incidentPoint,
        end: { lat: 31.1048, lon: 77.1734 },
        color: "#22d3ee",
      },
      {
        id: "console-arc-3",
        start: incidentPoint,
        end: { lat: 19.076, lon: 72.8777 },
        color: "#34d399",
      },
    ],
    [incidentPoint],
  );

  if (surface === "landing") {
    return <LandingPage onNavigate={navigate} />;
  }

  if (surface === "login") {
    return <LoginSurface onLogin={handleLogin} onBack={() => navigate("landing")} />;
  }

  if (surface === "chat") {
    return (
      <ChatSurface
        onBack={() => navigate("landing")}
        onOpenConsole={() => navigate("console")}
        prefilledIncident={chatPrefill}
        onPrefillConsumed={() => setChatPrefill(null)}
      />
    );
  }

  if (surface === "monitor") {
    return (
      <LandingSurface
        onBackToLanding={() => navigate("landing")}
        onEnterConsole={() => navigate("console")}
        onOpenLogin={() => navigate("login")}
        onOpenAssistant={() => openChat(null)}
        onHotspotConsole={(hotspot) => applyMonitorHandoff(hotspot, "console")}
        onHotspotAssistant={(hotspot) => applyMonitorHandoff(hotspot, "chat")}
        incident={incident}
        incidentPoint={incidentPoint}
        selectedResponsePath={selectedResponsePath}
        consoleModel={consoleModel}
        mapMode={mapMode}
        setMapMode={setMapMode}
        globeArcs={globeArcs}
        activeLayerIds={activeLayerIds}
        toggleLayer={toggleLayer}
        monitorMarkers={monitorMarkers}
        selectedMonitorHotspot={selectedMonitorHotspot}
        onSelectMonitorHotspot={setSelectedMonitorHotspot}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0c1c33_0%,#07111f_42%,#020617_100%)] text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 lg:px-6">
        <div className="sentinel-panel flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/68 p-4 shadow-[0_0_70px_rgba(2,6,23,0.56)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">SENTINEL Strategic Console</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Incident-to-decision intelligence surface</h1>
            {monitorHandoff ? (
              <p className="mt-2 text-sm font-medium text-rose-100 border-l-[3px] border-rose-400 pl-3">
                Monitor handoff active &mdash; <span className="text-white">{monitorHandoff.hotspot.title}</span>
              </p>
            ) : effectiveWorldState ? (
              <p className="mt-2 text-sm font-medium text-slate-300 border-l-[3px] border-cyan-400 pl-3">
                Phase {effectiveWorldState.current_phase_index} / {effectiveWorldState.total_phases} &mdash; <span className="text-white">{effectiveWorldState.phase_title}</span>
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {monitorHandoff ? (
              <button
                type="button"
                onClick={clearMonitorHandoff}
                className="rounded-full border border-rose-300/25 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/45 hover:bg-rose-400/15"
              >
                Return to scenario
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleConsoleReset}
              disabled={loading}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-white disabled:opacity-50"
            >
              Reset Scenario
            </button>
            <button
              type="button"
              onClick={handleConsoleAdvance}
              disabled={loading || (effectiveWorldState && effectiveWorldState.current_phase_index >= effectiveWorldState.total_phases - 1)}
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
            >
              Next System Injection
            </button>
            <button
              type="button"
              onClick={() => navigate("landing")}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-white"
            >
              Website
            </button>
            <button
              type="button"
              onClick={handleOpenChatFromConsole}
              className="rounded-full border border-cyan-400/20 bg-slate-900 px-5 py-2 text-sm text-cyan-100 transition hover:bg-slate-800"
            >
              AI Assistant
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Section eyebrow="Surface 01" title="Incident intake">
              <div className="grid gap-3">
                <input
                  value={incident.title}
                  onChange={(event) => setIncident((current) => ({ ...current, title: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  placeholder="Attacked site / incident title"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={incident.location}
                    onChange={(event) => setIncident((current) => ({ ...current, location: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Location"
                  />
                  <input
                    value={incident.ownerCountry}
                    onChange={(event) => setIncident((current) => ({ ...current, ownerCountry: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Country / owner"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={incident.actor}
                    onChange={(event) => setIncident((current) => ({ ...current, actor: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Actor / adversary"
                  />
                  <select
                    value={incident.attackType}
                    onChange={(event) => setIncident((current) => ({ ...current, attackType: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  >
                    {Object.keys(ATTACK_PROFILES).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    value={incident.severity}
                    onChange={(event) =>
                      setIncident((current) => ({ ...current, severity: Number(event.target.value) || 0 }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Severity"
                    type="number"
                    min="0"
                    max="100"
                  />
                  <input
                    value={incident.lat}
                    onChange={(event) =>
                      setIncident((current) => ({ ...current, lat: Number(event.target.value) || 0 }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Latitude"
                    type="number"
                    step="0.0001"
                  />
                  <input
                    value={incident.lon}
                    onChange={(event) =>
                      setIncident((current) => ({ ...current, lon: Number(event.target.value) || 0 }))
                    }
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    placeholder="Longitude"
                    type="number"
                    step="0.0001"
                  />
                </div>
                <textarea
                  value={incident.description}
                  onChange={(event) => setIncident((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-[120px] rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  placeholder="Short incident description"
                />
              </div>
            </Section>

            <Section eyebrow="Surface 02" title="Intent analysis">
              <p className="text-base leading-7 text-white">{consoleModel.primaryIntent}</p>
              <div className="mt-4 space-y-3">
                {consoleModel.alternateIntents.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </Section>

            <Section eyebrow="Surface 03" title="Why this site?">
              <p className="text-sm leading-7 text-slate-300">{consoleModel.whyThisSite}</p>
            </Section>
          </div>

          <div className="space-y-4">
            <TheatreBoard
              units={effectiveWorldState?.units || []}
              threats={effectiveWorldState?.threats || []}
              incident={{
                lat: incidentPoint?.lat ?? 34.5261,
                lon: incidentPoint?.lon ?? 74.2612,
                label: incident.title || "INCIDENT",
                location: incident.location,
                attackType: incident.attackType,
                severity: incident.severity,
                description: incident.description,
              }}
              title={incident.title || activeThreat?.label}
              phase={effectiveWorldState?.phase_title || (monitorHandoff ? "Monitor handoff" : "")}
              phaseIndex={effectiveWorldState?.current_phase_index}
              totalPhases={effectiveWorldState?.total_phases}
              onAdvancePhase={effectiveWorldState ? handleConsoleAdvance : undefined}
              analysis={{
                cause: consoleModel.primaryIntent,
                projection: consoleModel.implicationSummary,
                risk: consoleModel.trust.weakEvidence?.[0] || consoleModel.alternateIntents?.[0],
                actions: responsePaths.slice(0, 3).map((path) => path.title),
              }}
            />

            <StrategicGlobe
              title={incident.title || activeThreat?.label}
              subtitle="The globe acts as the main analysis surface: attacked site, risk corridors, and the consequence spread of the chosen response path."
              incidentPoint={incidentPoint}
              markers={mergedMarkers}
              arcs={globeArcs}
            />

            <Section eyebrow="Surface 04" title="Response path selector">
              <div className="grid gap-3 xl:grid-cols-2">
                {responsePaths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelectedResponsePath(path)}
                    className={`rounded-[24px] border px-4 py-4 text-left transition ${
                      selectedResponsePath.id === path.id
                        ? "border-cyan-300/55 bg-cyan-400/10"
                        : "border-white/10 bg-slate-900/60 hover:border-cyan-300/25 hover:bg-cyan-400/6"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{path.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{path.summary}</p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-cyan-200">
                        {path.ring}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            <CounterfactualCompareSection compareData={counterfactualCompareData} />

            <Section eyebrow="Surface 05" title="Consequence engine">
              <p className="text-sm leading-7 text-slate-300">{consoleModel.implicationSummary}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {consoleModel.consequenceHighlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-sm leading-6 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="space-y-4">
            <Section eyebrow="Surface 06" title="Scorecards">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {consoleModel.scores.map((score) => (
                  <ScorePill key={score.label} score={score} />
                ))}
              </div>
            </Section>

            <Section eyebrow="Surface 07" title="Trust panel">
              <div className="space-y-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Top assumptions</p>
                  <div className="mt-3 space-y-2">
                    {consoleModel.trust.assumptions.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Weak evidence areas</p>
                  <div className="mt-3 space-y-2">
                    {consoleModel.trust.weakEvidence.map((item) => (
                      <div key={item} className="rounded-2xl border border-amber-400/15 bg-amber-400/7 px-4 py-3 text-sm leading-6 text-amber-50">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Evidence trace</p>
                  <div className="mt-3 space-y-3">
                    {(consoleModel.trust.evidenceTrace?.threatIds?.length > 0 || consoleModel.trust.evidenceTrace?.unitIds?.length > 0) && (
                      <div className="flex flex-wrap gap-2">
                        {(consoleModel.trust.evidenceTrace?.threatIds || []).map((threatId) => (
                          <span
                            key={`trust-threat-${threatId}`}
                            className="rounded-full border border-rose-400/15 bg-rose-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-rose-100"
                          >
                            Threat {threatId}
                          </span>
                        ))}
                        {(consoleModel.trust.evidenceTrace?.unitIds || []).map((unitId) => (
                          <span
                            key={`trust-unit-${unitId}`}
                            className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-cyan-100"
                          >
                            Unit {unitId}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      {(consoleModel.trust.evidenceTrace?.eventLog || []).map((eventLine) => (
                        <div key={eventLine} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm leading-6 text-slate-200">
                          {eventLine}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Confidence breakdown</p>
                  <div className="mt-3 space-y-3">
                    {consoleModel.trust.confidenceBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/6">
                          <div
                            className={`h-full rounded-full ${item.impact === "limits" ? "bg-amber-400" : "bg-cyan-400"}`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                        {item.detail ? <p className="mt-2 text-xs leading-5 text-slate-400">{item.detail}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section eyebrow="Surface 08" title="Executive brief">
              <p className="text-sm leading-7 text-slate-300">{consoleModel.brief}</p>
              <div className="mt-4 space-y-2">
                {consoleModel.timeline.map((item) => (
                  <div key={item.window} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-cyan-300/80">{item.window}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("chat")}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-cyan-300/30 bg-slate-950/85 px-5 py-3 text-sm text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur transition hover:border-cyan-300/55 hover:bg-slate-900"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-base font-semibold text-slate-950">
          AI
        </span>
        Open chatbot page
      </button>
    </div>
  );
}

export default App;
