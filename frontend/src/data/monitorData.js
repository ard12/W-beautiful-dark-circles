export const MAP_LAYER_GROUPS = [
  {
    title: "Strategic",
    items: [
      { id: "iranAttacks", label: "Iran attacks", icon: "🎯", kind: "scatter", color: "#ff6b6b", defaultEnabled: true },
      { id: "hotspots", label: "Intel hotspots", icon: "🛰", kind: "scatter", color: "#4dd9ff", defaultEnabled: true },
      { id: "conflicts", label: "Conflict zones", icon: "⚔", kind: "zone", color: "#d45757", defaultEnabled: true },
      { id: "bases", label: "Military bases", icon: "🏛", kind: "scatter", color: "#5aa2ff", defaultEnabled: true },
      { id: "nuclear", label: "Nuclear sites", icon: "☢", kind: "scatter", color: "#f5f5f5", defaultEnabled: true },
      { id: "irradiators", label: "Gamma irradiators", icon: "△", kind: "scatter", color: "#ffd166" },
      { id: "radiationWatch", label: "Radiation watch", icon: "⚠", kind: "scatter", color: "#9affc4" },
      { id: "spaceports", label: "Spaceports", icon: "🚀", kind: "scatter", color: "#ffb95c" },
      { id: "satellites", label: "Orbital surveillance", icon: "🛰", kind: "path", color: "#7c8dff" },
    ],
  },
  {
    title: "Activity",
    items: [
      { id: "military", label: "Military activity", icon: "✈", kind: "scatter", color: "#ff8c61", defaultEnabled: true },
      { id: "ais", label: "Ship traffic", icon: "⛴", kind: "path", color: "#38bdf8" },
      { id: "tradeRoutes", label: "Trade routes", icon: "➝", kind: "path", color: "#67e8f9" },
      { id: "flights", label: "Aviation", icon: "✈", kind: "path", color: "#94a3ff" },
      { id: "protests", label: "Protests", icon: "📣", kind: "scatter", color: "#f87171" },
      { id: "ucdpEvents", label: "Armed conflict events", icon: "⚑", kind: "scatter", color: "#fb7185" },
      { id: "displacement", label: "Displacement flows", icon: "👥", kind: "path", color: "#c4b5fd" },
      { id: "cyberThreats", label: "Cyber threats", icon: "🛡", kind: "scatter", color: "#8b5cf6" },
      { id: "gpsJamming", label: "GPS jamming", icon: "📡", kind: "zone", color: "#f97316" },
      { id: "webcams", label: "Live webcams", icon: "📷", kind: "scatter", color: "#facc15" },
      { id: "diseaseOutbreaks", label: "Disease outbreaks", icon: "✚", kind: "scatter", color: "#fb7185" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { id: "cables", label: "Undersea cables", icon: "⌇", kind: "path", color: "#60a5fa" },
      { id: "pipelines", label: "Pipelines", icon: "🛢", kind: "path", color: "#f59e0b" },
      { id: "datacenters", label: "AI data centers", icon: "🖧", kind: "scatter", color: "#818cf8" },
      { id: "climate", label: "Climate anomalies", icon: "🌪", kind: "zone", color: "#38bdf8" },
      { id: "weather", label: "Weather alerts", icon: "☁", kind: "zone", color: "#60a5fa", defaultEnabled: true },
      { id: "natural", label: "Natural events", icon: "🌋", kind: "zone", color: "#f97316", defaultEnabled: true },
      { id: "fires", label: "Fires", icon: "🔥", kind: "zone", color: "#ef4444" },
      { id: "waterways", label: "Strategic waterways", icon: "⚓", kind: "path", color: "#06b6d4", defaultEnabled: true },
      { id: "economic", label: "Economic centers", icon: "💵", kind: "scatter", color: "#34d399", defaultEnabled: true },
      { id: "minerals", label: "Critical minerals", icon: "⛏", kind: "scatter", color: "#f59e0b" },
      { id: "ciiChoropleth", label: "Country instability", icon: "🌐", kind: "zone", color: "#22c55e", defaultEnabled: true },
      { id: "weatherRadar", label: "Weather radar", icon: "🌀", kind: "zone", color: "#38bdf8" },
      { id: "sanctions", label: "Sanctions", icon: "⛔", kind: "zone", color: "#f87171", defaultEnabled: true },
    ],
  },
  {
    title: "Finance + Tech",
    items: [
      { id: "stockExchanges", label: "Stock exchanges", icon: "🏦", kind: "scatter", color: "#f97316", defaultEnabled: true },
      { id: "financialCenters", label: "Financial centers", icon: "💳", kind: "scatter", color: "#10b981", defaultEnabled: true },
      { id: "centralBanks", label: "Central banks", icon: "🏛", kind: "scatter", color: "#fde047" },
      { id: "commodityHubs", label: "Commodity hubs", icon: "📦", kind: "scatter", color: "#fb923c", defaultEnabled: true },
      { id: "gulfInvestments", label: "GCC investments", icon: "🌍", kind: "scatter", color: "#a78bfa" },
      { id: "startupHubs", label: "Startup hubs", icon: "🚀", kind: "scatter", color: "#38bdf8" },
      { id: "techHQs", label: "Tech HQs", icon: "🧠", kind: "scatter", color: "#60a5fa" },
      { id: "cloudRegions", label: "Cloud regions", icon: "☁", kind: "scatter", color: "#67e8f9" },
      { id: "accelerators", label: "Accelerators", icon: "⚡", kind: "scatter", color: "#facc15" },
      { id: "techEvents", label: "Tech events", icon: "📅", kind: "scatter", color: "#e879f9" },
      { id: "outages", label: "Internet disruptions", icon: "📵", kind: "scatter", color: "#94a3b8", defaultEnabled: true },
      { id: "renewableInstallations", label: "Clean energy", icon: "♻", kind: "scatter", color: "#4ade80" },
    ],
  },
];

export const MAP_LAYER_ITEMS = MAP_LAYER_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title })),
);

export const DEFAULT_ACTIVE_LAYER_IDS = MAP_LAYER_ITEMS.filter((item) => item.defaultEnabled).map((item) => item.id);

export const MAP_STATS = [
  { label: "Dual engines", value: "2", detail: "globe.gl + deck.gl" },
  { label: "Data layers", value: "45", detail: "strategic, finance, environment" },
  { label: "Signal streams", value: "12", detail: "used in CII scoring" },
  { label: "Finance nodes", value: "92", detail: "exchanges tracked in radar" },
];

export const LIVE_NEWS_FEEDS = ["Bloomberg", "Skynews", "Euronews", "DW", "CNBC", "CNN", "France 24", "Al Arabiya"];

export const LIVE_NEWS_ITEMS = [
  {
    source: "Bloomberg",
    tags: ["ALERT", "CONFLICT"],
    headline: "Iran war rages, Strait of Hormuz still blocked as pressure rises across shipping lanes",
    age: "1 hour ago",
  },
  {
    source: "Le Monde",
    tags: ["ALERT", "MARKETS"],
    headline: "Europe starts repricing energy risk after renewed Gulf disruption warnings",
    age: "3 hours ago",
  },
  {
    source: "ABC News",
    tags: ["ALERT", "CYBER"],
    headline: "Regional cyber disruption campaign widens to logistics providers and port operators",
    age: "7 hours ago",
  },
];

export const LIVE_INTELLIGENCE_ITEMS = [
  { source: "pakobserver.net", headline: "Pakistan, China hold joint naval exercise Sea Guardian", age: "1d ago" },
  { source: "punchng.com", headline: "Army urges calm during shooting exercise in Gombe State", age: "1d ago" },
  { source: "slguardian.org", headline: "Has Sri Lanka sold its sovereignty to the United States.", age: "1d ago" },
  { source: "vietnamnews.vn", headline: "Chinese warship Da Qing arrives in Karachi to join Sea Guardian IV", age: "2d ago" },
];

export const WEBCAM_TABS = ["Iran attacks", "All", "Mideast", "Europe", "Americas", "Asia", "Space"];

export const WEBCAM_TILES = [
  "Tehran",
  "Tel Aviv",
  "Jerusalem",
  "Middle East",
  "Dubai",
  "Space",
];

export const AI_INSIGHT_BRIEF = {
  title: "World Brief",
  text:
    "US Senator Rubio stated that the United States anticipates concluding the Iran crisis window within the next couple of weeks. Strait of Hormuz disruption remains the anchor risk and keeps military, commodity, and diplomatic signals converged.",
};

export const STRATEGIC_POSTURE = [
  { label: "Iran Theater", level: "CRIT", air: 12, sea: 31, direction: "stable → Iran" },
  { label: "Taiwan Strait", level: "CRIT", air: 9, sea: 46, direction: "stable → Taiwan" },
  { label: "Baltic Theater", level: "ELEV", air: 5, sea: 18, direction: "stable → Baltic" },
];

export const FORECAST_FILTERS = ["All", "Conflict", "Market", "Supply Chain", "Political", "Military", "Cyber", "Infra"];

export const FORECAST_ITEMS = [
  { channel: "Military Activity", headline: "Proxy force reshaping across the frontier corridor remains the most likely next step", age: "1d ago" },
  { channel: "Cyber Threats", headline: "Follow-on disruption is more likely to target logistics and public messaging systems than core command sites", age: "1d ago" },
  { channel: "Supply Strain", headline: "Energy and insurance repricing continues to pull macro risk into the same escalation window", age: "1d ago" },
];

export const COUNTRY_INTELLIGENCE_SIGNALS = [
  "military",
  "economic",
  "cyber",
  "diplomatic",
  "civil",
  "infrastructure",
  "maritime",
  "space",
  "market",
  "climate",
  "narrative",
  "supply",
];

export const COUNTRY_INTELLIGENCE_INDEX = [
  { country: "Iran", score: 100, breakdown: "MIL 18 ECO 9 CYB 7 DIP 10 CIV 8 INF 10 MAR 10 SPC 5 MKT 8 CLM 4 NAR 6 SUP 5" },
  { country: "Russia", score: 86, breakdown: "MIL 16 ECO 6 CYB 8 DIP 9 CIV 5 INF 8 MAR 6 SPC 4 MKT 7 CLM 4 NAR 7 SUP 6" },
  { country: "Pakistan", score: 81, breakdown: "MIL 15 ECO 7 CYB 6 DIP 8 CIV 7 INF 7 MAR 5 SPC 3 MKT 6 CLM 4 NAR 7 SUP 6" },
  { country: "Israel", score: 74, breakdown: "MIL 16 ECO 4 CYB 8 DIP 8 CIV 4 INF 6 MAR 5 SPC 4 MKT 5 CLM 3 NAR 6 SUP 5" },
  { country: "India", score: 66, breakdown: "MIL 13 ECO 7 CYB 5 DIP 7 CIV 4 INF 6 MAR 5 SPC 5 MKT 4 CLM 4 NAR 3 SUP 3" },
  { country: "Brazil", score: 42, breakdown: "MIL 5 ECO 5 CYB 3 DIP 4 CIV 4 INF 4 MAR 3 SPC 2 MKT 3 CLM 4 NAR 3 SUP 2" },
];

export const CROSS_STREAM_CORRELATION = [
  {
    title: "Military ↔ Economic",
    score: 87,
    description: "Naval signaling, shipping risk, and insurance repricing are moving in the same direction.",
  },
  {
    title: "Disaster ↔ Infrastructure",
    score: 48,
    description: "Heat and grid fragility are relevant, but still secondary to coercive signaling.",
  },
  {
    title: "Cyber ↔ Escalation",
    score: 78,
    description: "Narrative amplification and digital disruption are likely to precede or accompany the next kinetic beat.",
  },
  {
    title: "Markets ↔ Diplomacy",
    score: 71,
    description: "Energy and safe-haven flows are reacting faster than formal diplomatic de-escalation messaging.",
  },
];

export const STRATEGIC_RISK = {
  score: 64,
  band: "Elevated",
  trend: "Stable",
  infrastructureLinks: 1453,
  composite: [
    { label: "Escalation velocity", value: 74 },
    { label: "Market stress", value: 66 },
    { label: "Civilian spillover", value: 41 },
    { label: "Alliance signaling", value: 58 },
  ],
};

export const INTEL_FEED_ITEMS = [
  {
    source: "Atlantic Council",
    tags: ["ALERT", "MILITARY"],
    headline: "Why US strategic nuclear forces must expand after New START",
    age: "3 hours ago",
  },
  {
    source: "Military Times",
    tags: ["ALERT", "CONFLICT"],
    headline: "Donbas-for-peace offer raises fears over escalation management",
    age: "8 hours ago",
  },
  {
    source: "Al Jazeera",
    tags: ["CAUTION", "ALERT"],
    headline: "How close is the US to a quagmire in Iran?",
    age: "2 hours ago",
  },
];

export const REGIONAL_NEWS_PANELS = [
  {
    title: "Latin America",
    count: "LIVE",
    items: [
      { source: "Insight Crime", tags: ["ALERT", "CONFLICT"], headline: "Map: Military strikes target complex criminal landscape on Colombia-Ecuador border", age: "2 days ago" },
      { source: "BBC Latin America", tags: ["ALERT", "DISASTER"], headline: "Death toll from Colombian military operation sparks fresh political backlash", age: "1 day ago" },
    ],
  },
  {
    title: "Asia-Pacific",
    count: "LIVE",
    items: [
      { source: "CNA", tags: ["DIPLOMATIC"], headline: "Mongolian PM resigns after months of upheaval", age: "3 hours ago" },
      { source: "CNA", tags: ["ALERT", "MARKETS"], headline: "Ashes controversy spills into broader governance and national sentiment debate", age: "6 hours ago" },
    ],
  },
  {
    title: "Government",
    count: "LIVE",
    items: [
      { source: "DOJ", tags: ["ALERT", "TERRORISM"], headline: "Explosive device case at MacDill Air Force Base highlights domestic force protection concerns", age: "3 hours ago" },
      { source: "FEMA", tags: ["NOTICE"], headline: "Resilience funding targets port, grid, and continuity weaknesses across at-risk metros", age: "9 hours ago" },
    ],
  },
  {
    title: "Think Tanks",
    count: "LIVE",
    items: [
      { source: "Atlantic Council", tags: ["ALERT", "MILITARY"], headline: "Why US strategic nuclear forces must expand after New START", age: "3 hours ago" },
      { source: "Foreign Policy", tags: ["ALERT", "ECONOMIC"], headline: "The Iran War's economic winners and losers", age: "7 hours ago" },
    ],
  },
];

export const PREDICTIONS_PANEL = {
  market: "Polymarket",
  question: "Will Mojtaba Khamenei be head of state in Iran by the end of 2026?",
  volume: "$4.7M",
  closeDate: "31 Dec 2026",
  yes: 49,
  no: 51,
  badge: "TOSS-UP",
};

export const METALS_AND_MATERIALS = [
  { name: "Gold", price: "$4,534", delta: "+2.82%", trend: [40, 52, 48, 61, 73, 68, 74] },
  { name: "Silver", price: "$69.89", delta: "+2.87%", trend: [28, 34, 38, 46, 43, 49, 55] },
  { name: "Copper", price: "$5.46", delta: "-0.24%", trend: [63, 61, 58, 54, 52, 50, 49] },
  { name: "Platinum", price: "$1,196", delta: "+1.11%", trend: [31, 35, 37, 41, 43, 46, 51] },
  { name: "Palladium", price: "$1,044", delta: "-0.89%", trend: [72, 68, 64, 60, 55, 52, 48] },
  { name: "Aluminum", price: "$2,582", delta: "+0.63%", trend: [41, 45, 44, 49, 53, 57, 59] },
];

export const ENERGY_COMPLEX = [
  { label: "US crude inventories (mb)", value: "871627.0 Mb", delta: "+6926.0", tone: "down" },
  { label: "US nat gas storage (bcf)", value: "1829 Bcf", delta: "-54", tone: "up" },
  { label: "Tanker insurance stress", value: "74/100", delta: "+12", tone: "down" },
];

export const MARKETS_PANEL = [
  { name: "Apple", ticker: "AAPL", price: "$249.01", delta: "-1.53%" },
  { name: "Amazon", ticker: "AMZN", price: "$199.32", delta: "-3.96%" },
  { name: "Broadcom", ticker: "AVGO", price: "$301.09", delta: "-2.69%" },
  { name: "Reliance", ticker: "RELIANCE", price: "₹3,148", delta: "+0.91%" },
];

export const MACRO_STRESS = [
  { label: "Energy shock", value: 72 },
  { label: "Shipping pressure", value: 81 },
  { label: "Dollar squeeze", value: 58 },
  { label: "Sanctions drag", value: 64 },
];

export const FINANCE_RADAR = {
  stockExchanges: 92,
  commodities: 18,
  cryptoPairs: 64,
  centralBanks: 21,
  compositeScore: 71,
  compositeSignals: [
    { label: "Liquidity", value: 76 },
    { label: "Volatility", value: 68 },
    { label: "Energy beta", value: 82 },
    { label: "Shipping risk", value: 79 },
    { label: "Sanctions drag", value: 61 },
    { label: "Credit spread", value: 57 },
    { label: "Crypto reflexivity", value: 54 },
  ],
};

export const WORLD_NEWS_ITEMS = [
  {
    source: "BBC World",
    tags: ["ALERT", "CYBER"],
    headline: "Iran-backed hackers breach senior US official accounts as crisis narrative intensifies",
    age: "1 hour ago",
  },
  {
    source: "Premium Times",
    tags: ["ALERT", "POLITICS"],
    headline: "2027: PDP will be on the ballot, Tinubu assures members",
    age: "1 hour ago",
  },
  {
    source: "Premium Times",
    tags: ["ALERT", "ECONOMIC"],
    headline: "Why Nigeria fell short of Iran under sanctions, by Gimba Kakanda",
    age: "1 hour ago",
  },
];

export const CHAT_BRIEFING_MODULES = [
  {
    title: "Prompt placeholders",
    items: [
      "attacked_site",
      "attack_type",
      "actor",
      "why_this_site",
      "possible_retaliation",
      "implication_scope",
    ],
  },
  {
    title: "Agent chain",
    items: ["incident normalizer", "intent analyst", "response comparator", "brief generator"],
  },
  {
    title: "Output blocks",
    items: ["intent answer", "score rationale", "response path risk", "executive brief"],
  },
];
