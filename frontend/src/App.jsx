import React, { useEffect, useMemo, useState } from "react";
import StrategicGlobe from "./components/StrategicGlobe";
import WorldMonitorGlobe from "./components/WorldMonitorGlobe";
import WorldMonitorMap from "./components/WorldMonitorMap";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";

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
];

const HOMEPAGE_LAYERS = [
  { icon: "🍎", label: "Iran attacks", enabled: true },
  { icon: "🛰️", label: "Intel hotspots", enabled: true },
  { icon: "⚠️", label: "Conflict zones", enabled: true },
  { icon: "🏛️", label: "Military bases", enabled: true },
  { icon: "☢️", label: "Nuclear sites", enabled: true },
  { icon: "△", label: "Gamma irradiators", enabled: false },
  { icon: "☢", label: "Radiation watch", enabled: false },
  { icon: "🚀", label: "Spaceports", enabled: false },
  { icon: "⌇", label: "Undersea cables", enabled: false },
];

const LIVE_NEWS_FEEDS = ["Bloomberg", "Skynews", "Euronews", "DW", "CNBC", "CNN", "France 24", "Al Arabiya"];

const LIVE_INTEL_ITEMS = [
  "Pakistan, China hold joint naval exercise Sea Guardian",
  "Army urges calm during shooting exercise in Gombe State",
  "Sri Lanka sold its sovereignty to the United States.",
  "Chinese warship Da Qing arrives in Karachi to join Sea Guardian IV…",
];

const WEBCAM_TABS = ["Iran attacks", "All", "Mideast", "Europe", "Americas", "Asia", "Space"];

const POSTURE_THEATERS = [
  { label: "Iran Theater", level: "CRIT", air: 12, sea: 31 },
  { label: "Taiwan Strait", level: "CRIT", air: 9, sea: 46 },
  { label: "Baltic Theater", level: "ELEV", air: 5, sea: 18 },
];

const FORECAST_FILTERS = ["All", "Conflict", "Market", "Supply Chain", "Political", "Military", "Cyber", "Infra"];

const COUNTRY_INSTABILITY = [
  { country: "Iran", score: 100, breakdown: "U:82 C:100 S:20 I:80" },
  { country: "Russia", score: 86, breakdown: "U:68 C:0 S:45 I:80" },
  { country: "Ukraine", score: 70, breakdown: "U:13 C:5 S:10 I:40" },
  { country: "Israel", score: 70, breakdown: "U:17 C:45 S:40 I:32" },
  { country: "Brazil", score: 70, breakdown: "U:12 C:0 S:5 I:18" },
];

const INTEL_FEED_ITEMS = [
  "Why US strategic nuclear forces must expand after New START",
  "Donbas-for-peace offer raises fears",
  "How close is the US to a quagmire in Iran?",
];

const WORLD_NEWS_ITEMS = [
  "Iran-backed hackers breach FBI director Kash Patel's personal emails",
  "Rubio says US expects to finish Iran war within weeks",
  "2027: PDP will be on the ballot, Tinubu assures members",
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
    defensiveMeasures: [
      "Harden adjacent sensing and relay infrastructure.",
      "Surge ISR and anomaly monitoring around the affected corridor.",
      "Prepare executive brief and narrative line before follow-on media cycle.",
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

function Section({ eyebrow, title, children, actions }) {
  return (
    <section className="sentinel-panel rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/75">{eyebrow}</p>
          ) : null}
          <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function useHeaderClock() {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
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

function projectToMap(lat, lon) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function projectToStyle(lat, lon, extra = {}) {
  const { x, y } = projectToMap(lat, lon);
  return {
    left: `${x}%`,
    top: `${y}%`,
    ...extra,
  };
}

function WorldMonitorFlatMap({ incidentPoint, markers, arcs }) {
  return (
    <div className="wm-flat-map">
      <div className="wm-flat-map__texture" />
      <div className="wm-flat-map__vignette" />
      <div className="wm-flat-map__grid" />
      <svg className="wm-flat-map__svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {arcs.map((arc) => {
          const start = projectToMap(arc.start.lat, arc.start.lon);
          const end = projectToMap(arc.end.lat, arc.end.lon);
          const midX = (start.x + end.x) / 2;
          const midY = Math.min(start.y, end.y) - 12;
          const path = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

          return <path key={arc.id} d={path} className="wm-flat-map__arc" style={{ stroke: arc.color }} />;
        })}
      </svg>

      {incidentPoint ? (
        <div
          className="wm-flat-map__marker wm-flat-map__marker--incident"
          style={projectToStyle(incidentPoint.lat, incidentPoint.lon)}
        >
          <span />
        </div>
      ) : null}

      {markers.map((marker) => (
        <div
          key={marker.id}
          className="wm-flat-map__marker"
          style={projectToStyle(marker.lat, marker.lon, { "--marker-color": marker.color })}
        >
          <span />
        </div>
      ))}

      <div className="wm-flat-map__legend">
        <div>
          <span className="wm-flat-map__legend-dot wm-flat-map__legend-dot--incident" />
          Attacked site
        </div>
        <div>
          <span className="wm-flat-map__legend-dot" />
          Pressure node
        </div>
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

function LandingScoreRow({ label, value }) {
  return (
    <div className="wm-score-row">
      <div className="wm-score-row__meta">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="wm-score-row__track">
        <div className="wm-score-row__fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function LandingSurface({
  onEnterConsole,
  onOpenLogin,
  onOpenAssistant,
  incident,
  incidentPoint,
  setIncident,
  selectedResponsePath,
  setSelectedResponsePath,
  consoleModel,
  mapMode,
  setMapMode,
  globeArcs,
}) {
  const clock = useHeaderClock();

  return (
    <div className="wm-shell wm-shell--homepage">
      <div className="wm-promo-bar">
        <div className="wm-promo-pill">PRO</div>
        <p>Pro is coming — More Signal, Less Noise. More AI Briefings. A geopolitical & equity researcher just for you.</p>
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
              <button type="button" className="wm-icon-square">
                ⛶
              </button>
              <button type="button" className="wm-icon-square" onClick={onOpenAssistant}>
                ⚙
              </button>
            </div>
          </div>

          <div className="map-container wm-map-home">
            <div className="wm-map-layer-rail">
              {HOMEPAGE_LAYERS.map((layer) => (
                <button key={layer.label} type="button" className={`wm-map-layer ${layer.enabled ? "active" : ""}`.trim()}>
                  <span className="wm-map-layer__check">{layer.enabled ? "✓" : "○"}</span>
                  <span className="wm-map-layer__icon">{layer.icon}</span>
                  <span>{layer.label}</span>
                </button>
              ))}
              <div className="wm-map-layer-rail__credit">© Elie Habib • Someone™</div>
            </div>

            {mapMode === "globe" ? (
              <WorldMonitorGlobe incidentPoint={incidentPoint} markers={GLOBE_MARKERS} arcs={globeArcs} />
            ) : (
              <WorldMonitorMap incidentPoint={incidentPoint} markers={GLOBE_MARKERS} />
            )}

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
                <span>Sounds like a great Saturday.</span>
                <strong>TIM.</strong>
              </div>
            </div>
            <div className="wm-live-intel-list">
              {LIVE_INTEL_ITEMS.map((item, index) => (
                <div key={item} className="wm-live-intel-item">
                  <div>
                    <strong>{["pakobserver.net", "punchng.com", "slguardian.org", "pakobserver.net"][index]}</strong>
                    <p>{item}</p>
                  </div>
                  <span>{index + 1}d ago</span>
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
              {["Tehran", "Tel Aviv", "Jerusalem", "Middle East", "Dubai", "Space"].map((tile, index) => (
                <div key={tile} className={`wm-webcam-tile wm-webcam-tile--${index + 1}`.trim()}>
                  <span>{tile}</span>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="AI Insights" count="LIVE" className="wm-home-panel wm-home-panel--insights">
            <div className="wm-insights-card">
              <div className="wm-insights-card__eyebrow">World Brief</div>
              <p>
                US Senator Rubio stated that the United States anticipates concluding the war with Iran within
                the next couple of weeks. This comes as the Strait of Hormuz remains blocked despite renewed
                diplomatic signals.
              </p>
            </div>
            <div className="wm-posture-list">
              {POSTURE_THEATERS.map((item) => (
                <div key={item.label} className="wm-posture-item">
                  <div className="wm-posture-item__header">
                    <strong>{item.label}</strong>
                    <span>{item.level}</span>
                  </div>
                  <div className="wm-posture-item__meta">
                    <span>AIR {item.air}</span>
                    <span>SEA {item.sea}</span>
                  </div>
                </div>
              ))}
            </div>
          </LandingPanel>
        </section>

        <section className="wm-secondary-grid">
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
              {LIVE_INTEL_ITEMS.slice(0, 3).map((item, index) => (
                <div key={item} className="wm-live-intel-item">
                  <div>
                    <strong>{["Military Activity", "Cyber Threats", "Supply Strain"][index]}</strong>
                    <p>{item}</p>
                  </div>
                  <span>1d ago</span>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="Country Instability" count="">
            <div className="wm-country-list">
              {COUNTRY_INSTABILITY.map((row) => (
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
                  <strong>64</strong>
                  <span>Elevated</span>
                </div>
              </div>
              <div className="wm-risk-gauge__trend">
                <span>Trend</span>
                <strong>Stable</strong>
              </div>
            </div>
            <div className="wm-cascade-bar">
              <span>Infrastructure cascade</span>
              <strong>1453 links</strong>
            </div>
          </LandingPanel>

          <LandingPanel title="Intel Feed" count="LIVE">
            <div className="wm-feed-stack">
              {INTEL_FEED_ITEMS.map((item) => (
                <div key={item} className="wm-feed-item">
                  <div className="wm-feed-item__tags">
                    <span>ALERT</span>
                    <span>MILITARY</span>
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </LandingPanel>

          <LandingPanel title="World News" count="LIVE">
            <div className="wm-feed-stack">
              {WORLD_NEWS_ITEMS.map((item) => (
                <div key={item} className="wm-feed-item">
                  <div className="wm-feed-item__tags">
                    <span>ALERT</span>
                    <span>CONFLICT</span>
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </LandingPanel>
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

      <button type="button" className="wm-assistant-fab" onClick={onOpenAssistant}>
        <span className="wm-assistant-fab__badge">AI</span>
        Open strategic copilot
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

function App() {
  const [surface, setSurface] = useState("landing");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mapMode, setMapMode] = useState("flat");
  const [incident, setIncident] = useState(INITIAL_INCIDENT);
  const [selectedResponsePath, setSelectedResponsePath] = useState(RESPONSE_PATHS[1]);

  const consoleModel = useMemo(
    () => buildConsoleModel(incident, selectedResponsePath),
    [incident, selectedResponsePath],
  );

  const globeArcs = useMemo(
    () => [
      {
        id: "console-arc-1",
        start: { lat: incident.lat || 34.5261, lon: incident.lon || 74.2612 },
        end: { lat: 28.6139, lon: 77.209 },
        color: "#fb7185",
      },
      {
        id: "console-arc-2",
        start: { lat: incident.lat || 34.5261, lon: incident.lon || 74.2612 },
        end: { lat: 31.1048, lon: 77.1734 },
        color: "#22d3ee",
      },
      {
        id: "console-arc-3",
        start: { lat: incident.lat || 34.5261, lon: incident.lon || 74.2612 },
        end: { lat: 26.9124, lon: 75.7873 },
        color: "#60a5fa",
      },
    ],
    [incident.lat, incident.lon],
  );

  const incidentPoint = useMemo(
    () => ({
      lat: incident.lat || 34.5261,
      lon: incident.lon || 74.2612,
    }),
    [incident.lat, incident.lon],
  );

  const assistantOverlay = assistantOpen ? (
    <div className="fixed inset-0 z-50 bg-slate-950/78 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setAssistantOpen(false)}
        className="absolute right-5 top-5 z-[60] rounded-full border border-white/10 bg-slate-950/85 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/35 hover:text-white"
      >
        Close assistant
      </button>
      <AnimatedAIChat />
    </div>
  ) : null;

  if (surface === "landing") {
    return (
      <>
        <LandingSurface
          onEnterConsole={() => setSurface("console")}
          onOpenLogin={() => setSurface("login")}
          onOpenAssistant={() => setAssistantOpen(true)}
          incident={incident}
          incidentPoint={incidentPoint}
          setIncident={setIncident}
          selectedResponsePath={selectedResponsePath}
          setSelectedResponsePath={setSelectedResponsePath}
          consoleModel={consoleModel}
          mapMode={mapMode}
          setMapMode={setMapMode}
          globeArcs={globeArcs}
        />
        {assistantOverlay}
      </>
    );
  }

  if (surface === "login") {
    return <LoginSurface onLogin={() => setSurface("console")} onBack={() => setSurface("landing")} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0c1c33_0%,#07111f_42%,#020617_100%)] text-white">
      <div className="mx-auto max-w-[1520px] px-4 py-4 lg:px-6">
        <div className="sentinel-panel flex flex-col gap-4 rounded-[32px] border border-white/10 bg-slate-950/68 p-4 shadow-[0_0_70px_rgba(2,6,23,0.56)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">SENTINEL Strategic Console</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Incident-to-decision intelligence surface</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSurface("landing")}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-white"
            >
              Website
            </button>
            <button
              type="button"
              onClick={() => setSurface("login")}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-white"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Open prompt assistant
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
              title={incident.title}
              subtitle="The globe acts as the main analysis surface: attacked site, risk corridors, and the consequence spread of the chosen response path."
              incidentPoint={{ lat: incident.lat || 34.5261, lon: incident.lon || 74.2612 }}
              markers={GLOBE_MARKERS}
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
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-cyan-300/30 bg-slate-950/85 px-5 py-3 text-sm text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur transition hover:border-cyan-300/55 hover:bg-slate-900"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400 text-base font-semibold text-slate-950">
          AI
        </span>
        Open chatbot prompt flow
      </button>

      {assistantOverlay}
    </div>
  );
}

export default App;
