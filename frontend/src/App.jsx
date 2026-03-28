import React, { useCallback, useEffect, useMemo, useState } from "react";
import StrategicGlobe from "./components/StrategicGlobe";
import WorldMonitorGlobe from "./components/WorldMonitorGlobe";
import WorldMonitorMap from "./components/WorldMonitorMap";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
import { useSentinelState } from "./hooks/useSentinelState";
import { useLandingData } from "./hooks/useLandingData";
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
  if (value === "login" || value === "console" || value === "chat") {
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
  onEnterConsole,
  onOpenLogin,
  onOpenAssistant,
  incident,
  incidentPoint,
  selectedResponsePath,
  consoleModel,
  mapMode,
  setMapMode,
  globeArcs,
  activeLayerIds,
  toggleLayer,
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
              <WorldMonitorGlobe incidentPoint={incidentPoint} markers={GLOBE_MARKERS} arcs={globeArcs} />
            ) : (
              <WorldMonitorMap incidentPoint={incidentPoint} markers={GLOBE_MARKERS} activeLayerIds={activeLayerIds} />
            )}

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
                <div key={tile} className={`wm-webcam-tile wm-webcam-tile--${index + 1}`.trim()}>
                  <span>{tile}</span>
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
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#13294c_0%,#08111f_50%,#020617_100%)] px-6 py-10 text-white lg:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/65 p-8 shadow-[0_0_60px_rgba(2,6,23,0.5)] backdrop-blur">
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">Secure Entry</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Access SENTINEL</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            A clean, premium login surface for judges and operators before entering the console.
          </p>

          <div className="mt-8 space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/40"
              placeholder="Operator email"
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm text-white outline-none transition focus:border-cyan-300/40"
              placeholder="Access token"
              type="password"
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onLogin}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Continue to console
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/10 px-6 py-3 text-sm text-slate-200 transition hover:border-cyan-300/35"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/55 p-8 backdrop-blur">
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">Product promise</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">One coherent incident-to-decision path</h2>
            <div className="mt-6 grid gap-3 text-sm leading-7 text-slate-300">
              {[
                "Capture the incident with structured fields.",
                "Explain likely intent and why the site matters.",
                "Compare strategic response paths.",
                "Surface trust, assumptions, and briefing output.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <StrategicGlobe
            title="Operator preview"
            subtitle="The main console uses the globe as an analysis surface, not a decorative widget."
            incidentPoint={{ lat: 34.5261, lon: 74.2612 }}
            markers={GLOBE_MARKERS}
            arcs={[
              {
                id: "login-arc-1",
                start: { lat: 34.5261, lon: 74.2612 },
                end: { lat: 28.6139, lon: 77.209 },
                color: "#22d3ee",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ChatSurface({ onBack, onOpenConsole }) {
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
              The chat now lives on its own page and acts as the operator surface for filling backend prompt placeholders before execution.
            </p>
          </div>
          {CHAT_BRIEFING_MODULES.map((module) => (
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
        <main className="wm-chat-main">
          <AnimatedAIChat />
        </main>
      </div>
    </div>
  );
}

function App() {
  const { worldState, loading, handleAdvance, handleReset } = useSentinelState();
  const [surface, setSurface] = useState(() => (typeof window === "undefined" ? "landing" : getSurfaceFromHash()));
  const [mapMode, setMapMode] = useState("flat");
  const [incident, setIncident] = useState(INITIAL_INCIDENT);
  const [selectedResponsePath, setSelectedResponsePath] = useState(RESPONSE_PATHS[1]);
  const [activeLayerIds, setActiveLayerIds] = useState(DEFAULT_ACTIVE_LAYER_IDS);

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

  const toggleLayer = useCallback((layerId) => {
    setActiveLayerIds((current) =>
      current.includes(layerId) ? current.filter((value) => value !== layerId) : [...current, layerId],
    );
  }, []);

  const consoleModel = useMemo(() => {
    const base = buildConsoleModel(incident, selectedResponsePath);
    if (!worldState) return base;
    return {
      ...base,
      brief: worldState?.reasoning?.assessment_summary || base.brief,
      timeline: worldState?.reasoning?.projected_outcome ? [{ window: "Next 24 hours", text: worldState.reasoning.projected_outcome }] : base.timeline,
      consequenceHighlights: worldState?.reasoning?.recommendations?.length > 0 ? worldState.reasoning.recommendations.map(r => r.action || r.rationale) : base.consequenceHighlights,
      trust: {
        ...base.trust,
        assumptions: worldState?.reasoning?.assumptions?.length > 0 ? worldState.reasoning.assumptions : base.trust.assumptions,
        weakEvidence: worldState?.reasoning?.key_risks?.length > 0 ? worldState.reasoning.key_risks : base.trust.weakEvidence,
      },
      scores: [
        { label: "Threat score", value: worldState?.scorecard?.threat_score || 0, tone: "rose" },
        { label: "Readiness", value: worldState?.scorecard?.readiness_score || 0, tone: "cyan" },
        { label: "Escalation risk", value: worldState?.scorecard?.escalation_risk || 0, tone: "amber" },
        { label: "System confidence", value: worldState?.scorecard?.confidence_score || 0, tone: "emerald" },
      ]
    };
  }, [incident, selectedResponsePath, worldState]);

  const activeThreat = worldState?.threats?.[0];
  const incidentPoint = useMemo(
    () => ({
      lat: activeThreat?.latitude || incident.lat || 34.5261,
      lon: activeThreat?.longitude || incident.lon || 74.2612,
    }),
    [incident, activeThreat],
  );

  const mergedMarkers = useMemo(() => {
    if (!worldState) return GLOBE_MARKERS;
    const units = (worldState.units || []).map(u => ({
      id: u.unit_id, label: `${u.name} (${u.status})`, lat: u.latitude, lon: u.longitude, color: "#60a5fa", scale: 0.95
    }));
    const threats = (worldState.threats || []).map(t => ({
      id: t.threat_id, label: t.label, lat: t.latitude, lon: t.longitude, color: "#fb7185", scale: 1.15
    }));
    return [...units, ...threats];
  }, [worldState]);

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
    return (
      <LandingSurface
        onEnterConsole={() => navigate("console")}
        onOpenLogin={() => navigate("login")}
        onOpenAssistant={() => navigate("chat")}
        incident={incident}
        incidentPoint={incidentPoint}
        selectedResponsePath={selectedResponsePath}
        consoleModel={consoleModel}
        mapMode={mapMode}
        setMapMode={setMapMode}
        globeArcs={globeArcs}
        activeLayerIds={activeLayerIds}
        toggleLayer={toggleLayer}
      />
    );
  }

  if (surface === "login") {
    return <LoginSurface onLogin={() => navigate("console")} onBack={() => navigate("landing")} />;
  }

  if (surface === "chat") {
    return <ChatSurface onBack={() => navigate("landing")} onOpenConsole={() => navigate("console")} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0c1c33_0%,#07111f_42%,#020617_100%)] text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 lg:px-6">
        <div className="sentinel-panel flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/68 p-4 shadow-[0_0_70px_rgba(2,6,23,0.56)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">SENTINEL Strategic Console</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Incident-to-decision intelligence surface</h1>
            {worldState && (
              <p className="mt-2 text-sm font-medium text-slate-300 border-l-[3px] border-cyan-400 pl-3">
                Phase {worldState.current_phase_index} / {worldState.total_phases} &mdash; <span className="text-white">{worldState.phase_title}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-white disabled:opacity-50"
            >
              Reset Scenario
            </button>
            <button
              type="button"
              onClick={handleAdvance}
              disabled={loading || (worldState && worldState.current_phase_index >= worldState.total_phases - 1)}
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
              onClick={() => navigate("chat")}
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
            <StrategicGlobe
              title={activeThreat ? activeThreat.type : incident.title}
              subtitle="The globe acts as the main analysis surface: attacked site, risk corridors, and the consequence spread of the chosen response path."
              incidentPoint={incidentPoint}
              markers={mergedMarkers}
              arcs={globeArcs}
            />

            <Section eyebrow="Surface 04" title="Response path selector">
              <div className="grid gap-3 xl:grid-cols-2">
                {RESPONSE_PATHS.map((path) => (
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
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">Confidence breakdown</p>
                  <div className="mt-3 space-y-3">
                    {consoleModel.trust.confidenceBreakdown.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>{item.label}</span>
                          <span>{item.value}</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/6">
                          <div className="h-full rounded-full bg-cyan-400" style={{ width: `${item.value}%` }} />
                        </div>
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
