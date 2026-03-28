import React, { useMemo } from "react";

/* ─── Icon shapes ──────────────────────────────────────────────── */

const ROLE_ICONS = {
  infantry: "⬡",
  armor: "◆",
  medical: "+",
  logistics: "◫",
  cas: "✈",
  recon: "◉",
};

const ROLE_COLORS = {
  infantry: "#22d3ee",
  armor: "#38bdf8",
  medical: "#34d399",
  logistics: "#a78bfa",
  cas: "#f59e0b",
  recon: "#818cf8",
};

/* ─── Coordinate → board-pixel mapper ──────────────────────────── */

function useProjection(units, threats, incident, padding = 48) {
  return useMemo(() => {
    const W = 640;
    const H = 440;
    const points = [
      ...units.map((u) => ({ lat: u.latitude, lon: u.longitude })),
      ...threats.map((t) => ({ lat: t.latitude, lon: t.longitude })),
    ];
    if (incident) points.push(incident);
    if (points.length === 0) return { project: () => ({ x: W / 2, y: H / 2 }), W, H };

    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const p of points) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lon < minLon) minLon = p.lon;
      if (p.lon > maxLon) maxLon = p.lon;
    }
    // Pad extent to avoid edge-placed markers
    const latPad = (maxLat - minLat) * 0.15 || 0.02;
    const lonPad = (maxLon - minLon) * 0.15 || 0.02;
    minLat -= latPad; maxLat += latPad;
    minLon -= lonPad; maxLon += lonPad;

    const project = ({ lat, lon }) => ({
      x: padding + ((lon - minLon) / (maxLon - minLon)) * (W - 2 * padding),
      y: padding + ((maxLat - lat) / (maxLat - minLat)) * (H - 2 * padding),
    });
    return { project, W, H, bounds: { minLat, maxLat, minLon, maxLon } };
  }, [units, threats, incident, padding]);
}

/* ─── Grid background ──────────────────────────────────────────── */

function GridLines({ W, H }) {
  const lines = [];
  const gap = 40;
  for (let x = gap; x < W; x += gap) {
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} stroke="rgba(148,163,184,0.07)" strokeWidth={0.5} />);
  }
  for (let y = gap; y < H; y += gap) {
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} stroke="rgba(148,163,184,0.07)" strokeWidth={0.5} />);
  }
  return <>{lines}</>;
}

/* ─── Pulse animation ──────────────────────────────────────────── */

function PulseRing({ cx, cy, color, r = 18 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4}>
        <animate attributeName="r" from={r} to={r + 16} dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from={0.5} to={0} dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={r * 0.6} fill="none" stroke={color} strokeWidth={1} opacity={0.25}>
        <animate attributeName="r" from={r * 0.6} to={r + 10} dur="2.5s" begin="0.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from={0.35} to={0} dur="2.5s" begin="0.5s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

/* ─── Main component ──────────────────────────────────────────── */

export default function TheatreBoard({ units = [], threats = [], incident, title, phase }) {
  const incidentPt = incident ? { lat: incident.lat, lon: incident.lon } : null;
  const { project, W, H } = useProjection(units, threats, incidentPt);

  const projectedUnits = units.map((u) => ({ ...u, ...project({ lat: u.latitude, lon: u.longitude }) }));
  const projectedThreats = threats.map((t) => ({ ...t, ...project({ lat: t.latitude, lon: t.longitude }) }));
  const projectedIncident = incidentPt ? project(incidentPt) : null;

  return (
    <div
      className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 backdrop-blur"
      style={{ contain: "layout" }}
    >
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-cyan-300/70">Theatre Board</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{title || "Regional Operations"}</h3>
        </div>
        {phase && (
          <span className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[0.62rem] uppercase tracking-widest text-slate-400">
            {phase}
          </span>
        )}
      </div>

      {/* SVG board */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 440, background: "radial-gradient(ellipse at 50% 40%,rgba(8,17,31,0.95),rgba(2,6,23,1))" }}
      >
        <defs>
          <radialGradient id="tb-glow-incident" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="tb-glow-cas" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </radialGradient>
          <filter id="tb-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <GridLines W={W} H={H} />

        {/* Incident marker (if present) */}
        {projectedIncident && (
          <g>
            <circle cx={projectedIncident.x} cy={projectedIncident.y} r={36} fill="url(#tb-glow-incident)" filter="url(#tb-blur)" />
            <PulseRing cx={projectedIncident.x} cy={projectedIncident.y} color="#f43f5e" r={14} />
            <polygon
              points={`${projectedIncident.x},${projectedIncident.y - 10} ${projectedIncident.x + 8},${projectedIncident.y + 4} ${projectedIncident.x - 8},${projectedIncident.y + 4}`}
              fill="#f43f5e"
              stroke="#fda4af"
              strokeWidth={0.8}
            />
            <text x={projectedIncident.x} y={projectedIncident.y + 24} textAnchor="middle" fill="#fda4af" fontSize={9} fontWeight={600}>
              {incident?.label || "INCIDENT"}
            </text>
          </g>
        )}

        {/* Response arc from CAS to incident */}
        {projectedIncident && projectedUnits.filter((u) => u.role === "cas").map((cas) => (
          <g key={`arc-${cas.unit_id}`}>
            <line
              x1={cas.x} y1={cas.y} x2={projectedIncident.x} y2={projectedIncident.y}
              stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="6 4" opacity={0.5}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.5s" repeatCount="indefinite" />
            </line>
          </g>
        ))}

        {/* Threats */}
        {projectedThreats.map((t) => (
          <g key={t.threat_id}>
            <PulseRing cx={t.x} cy={t.y} color="#ef4444" r={10} />
            <rect x={t.x - 7} y={t.y - 7} width={14} height={14} rx={2}
              fill="#ef4444" fillOpacity={0.25} stroke="#ef4444" strokeWidth={1.2}
              transform={`rotate(45,${t.x},${t.y})`}
            />
            <text x={t.x} y={t.y + 22} textAnchor="middle" fill="#fca5a5" fontSize={8} fontWeight={500}>
              {t.label.length > 20 ? t.label.slice(0, 18) + "…" : t.label}
            </text>
            <text x={t.x} y={t.y + 32} textAnchor="middle" fill="#fca5a5" fontSize={7} opacity={0.7}>
              SEV {t.severity} · CONF {t.confidence}%
            </text>
          </g>
        ))}

        {/* Friendly units */}
        {projectedUnits.map((u) => {
          const color = ROLE_COLORS[u.role] || "#94a3b8";
          const icon = ROLE_ICONS[u.role] || "●";
          const isCas = u.role === "cas";
          return (
            <g key={u.unit_id}>
              {isCas && <circle cx={u.x} cy={u.y} r={20} fill="url(#tb-glow-cas)" filter="url(#tb-blur)" />}
              <circle cx={u.x} cy={u.y} r={13} fill="rgba(2,6,23,0.8)" stroke={color} strokeWidth={1.5} />
              <text x={u.x} y={u.y + 4} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>
                {icon}
              </text>
              <text x={u.x} y={u.y - 18} textAnchor="middle" fill={color} fontSize={8.5} fontWeight={600}>
                {u.name}
              </text>
              <text x={u.x} y={u.y + 28} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize={7}>
                {u.grid_ref || u.role.toUpperCase()} · {u.status.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[0.62rem] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-cyan-400/80" /> Friendly
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500/80" /> Threat
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-400/80" /> Incident
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 bg-amber-400/80" style={{ clipPath: "polygon(50% 0%,100% 100%,0% 100%)" }} /> CAS route
        </span>
        {Object.entries(ROLE_ICONS).map(([role, icon]) => (
          <span key={role} className="flex items-center gap-1" style={{ color: ROLE_COLORS[role] }}>
            <span className="text-[0.7rem]">{icon}</span>{" "}
            <span className="text-slate-500">{role}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
