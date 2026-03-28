import * as React from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { ArrowDownRight, ArrowUpRight, Crosshair, Layers3, Play, Search, Satellite } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

type Trend = "up" | "down" | "flat";
type MarkerStatus = "normal" | "warning" | "critical" | "incident";

export interface TheatreMapMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  status: MarkerStatus;
  kind?: string;
  description?: string;
  dependencies?: string[];
  linkIds?: string[];
  meta?: string;
  trend?: Trend;
  cascadeLevel?: number;
}

export interface TheatreMapCircle {
  id: string;
  lat: number;
  lon: number;
  radius: number;
  tone?: MarkerStatus;
  label?: string;
}

export interface TheatreMapPolygon {
  id: string;
  positions: [number, number][];
  tone?: MarkerStatus;
}

export interface TheatreMapPolyline {
  id: string;
  positions: [number, number][];
  tone?: MarkerStatus;
  trafficLoad?: number;
  fromId?: string;
  toId?: string;
}

export interface IncidentOverlay {
  title: string;
  description: string;
  tags: string[];
  severity: number;
  confidence: number;
}

export interface BoardReadoutItem {
  label: string;
  value: string;
  trend?: Trend;
}

export interface AssessmentOverlay {
  cause: string;
  projection: string;
  risk: string;
  actions: string[];
}

interface InteractiveMapProps {
  markers: TheatreMapMarker[];
  circles: TheatreMapCircle[];
  polygons: TheatreMapPolygon[];
  polylines: TheatreMapPolyline[];
  incident: IncidentOverlay;
  readout: BoardReadoutItem[];
  assessment: AssessmentOverlay;
  phaseLabel?: string;
  phaseIndex?: number;
  totalPhases?: number;
  onAdvancePhase?: () => void;
  className?: string;
}

const BASE_TILES = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
} as const;

const STATUS_STYLES: Record<MarkerStatus, { stroke: string; fill: string; glow: string; text: string }> = {
  normal: {
    stroke: "#38bdf8",
    fill: "rgba(34,211,238,0.26)",
    glow: "rgba(34,211,238,0.16)",
    text: "#bae6fd",
  },
  warning: {
    stroke: "#facc15",
    fill: "rgba(250,204,21,0.24)",
    glow: "rgba(250,204,21,0.15)",
    text: "#fde68a",
  },
  critical: {
    stroke: "#fb7185",
    fill: "rgba(244,63,94,0.26)",
    glow: "rgba(244,63,94,0.18)",
    text: "#fecdd3",
  },
  incident: {
    stroke: "#f43f5e",
    fill: "rgba(244,63,94,0.28)",
    glow: "rgba(244,63,94,0.2)",
    text: "#ffe4e6",
  },
};

function getTrendIcon(trend?: Trend) {
  if (trend === "down") {
    return <ArrowDownRight className="h-3.5 w-3.5 text-emerald-300" />;
  }
  if (trend === "up") {
    return <ArrowUpRight className="h-3.5 w-3.5 text-rose-300" />;
  }
  return <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />;
}

function getMapCenter(markers: TheatreMapMarker[], circles: TheatreMapCircle[]) {
  const points = [
    ...markers.map((marker) => [marker.lat, marker.lon] as [number, number]),
    ...circles.map((circle) => [circle.lat, circle.lon] as [number, number]),
  ];

  if (points.length === 0) {
    return [25.1264, 62.3228] as [number, number];
  }

  const [latSum, lonSum] = points.reduce(
    (accumulator, [lat, lon]) => [accumulator[0] + lat, accumulator[1] + lon],
    [0, 0],
  );

  return [latSum / points.length, lonSum / points.length] as [number, number];
}

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function truncateCopy(value: string, maxLength: number) {
  if (!value) return "";
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function fitSearchResult(searchValue: string, markers: TheatreMapMarker[]) {
  if (!searchValue.trim()) return null;
  const lower = searchValue.trim().toLowerCase();
  return markers.find((marker) => marker.name.toLowerCase().includes(lower) || (marker.kind || "").toLowerCase().includes(lower)) || null;
}

function formatStatusLabel(status: MarkerStatus) {
  if (status === "incident") return "incident";
  if (status === "critical") return "failed";
  if (status === "warning") return "degraded";
  return "normal";
}

function MapController({
  focusTarget,
  onMapClick,
}: {
  focusTarget: [number, number] | null;
  onMapClick: () => void;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (!focusTarget) return;
    map.flyTo(focusTarget, Math.max(map.getZoom(), 8), {
      animate: true,
      duration: 1.1,
    });
  }, [focusTarget, map]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(timer);
  }, [map]);

  useMapEvents({
    click() {
      onMapClick();
    },
  });

  return null;
}

function AnimatedThreatRadius({ circle }: { circle: TheatreMapCircle }) {
  const [pulse, setPulse] = React.useState(0);
  const tone = circle.tone || "critical";
  const style = STATUS_STYLES[tone];

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPulse((current) => (current + 0.08) % 1.2);
    }, 180);
    return () => window.clearInterval(intervalId);
  }, []);

  const radii = [
    circle.radius * (0.82 + pulse * 0.18),
    circle.radius * (1.05 + pulse * 0.22),
    circle.radius * (1.28 + pulse * 0.28),
  ];

  return (
    <>
      {radii.map((radius, index) => (
        <Circle
          key={`${circle.id}-${index}`}
          center={[circle.lat, circle.lon]}
          radius={radius}
          pathOptions={{
            color: style.stroke,
            weight: index === 0 ? 1.2 : 0.8,
            opacity: Math.max(0.08, 0.22 - index * 0.05 - pulse * 0.03),
            fillColor: style.stroke,
            fillOpacity: Math.max(0.04, 0.12 - index * 0.03 - pulse * 0.02),
          }}
        />
      ))}
    </>
  );
}

function PulsingIncidentHalo({ marker }: { marker: TheatreMapMarker }) {
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPulse((current) => (current + 0.08) % 1.16);
    }, 150);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <CircleMarker
        center={[marker.lat, marker.lon]}
        radius={8.5}
        bubblingMouseEvents={false}
        pathOptions={{
          color: "#ffd0d7",
          weight: 1.4,
          fillColor: "#f43f5e",
          fillOpacity: 0.94,
          opacity: 0.95,
        }}
      />
      <CircleMarker
        center={[marker.lat, marker.lon]}
        radius={14 + pulse * 6}
        bubblingMouseEvents={false}
        pathOptions={{
          color: "#f43f5e",
          weight: 1.2,
          opacity: Math.max(0.12, 0.28 - pulse * 0.1),
          fillColor: "#f43f5e",
          fillOpacity: Math.max(0.04, 0.12 - pulse * 0.05),
        }}
      />
      <CircleMarker
        center={[marker.lat, marker.lon]}
        radius={18 + pulse * 10}
        bubblingMouseEvents={false}
        pathOptions={{
          color: "#f43f5e",
          weight: 1.1,
          opacity: Math.max(0.08, 0.24 - pulse * 0.12),
          fillOpacity: 0,
        }}
      />
      <CircleMarker
        center={[marker.lat, marker.lon]}
        radius={27 + pulse * 14}
        bubblingMouseEvents={false}
        pathOptions={{
          color: "#fb7185",
          weight: 0.8,
          opacity: Math.max(0.04, 0.12 - pulse * 0.07),
          fillOpacity: 0,
        }}
      />
      <CircleMarker
        center={[marker.lat, marker.lon]}
        radius={38 + pulse * 18}
        bubblingMouseEvents={false}
        pathOptions={{
          color: "#fb7185",
          weight: 0.7,
          opacity: Math.max(0.02, 0.08 - pulse * 0.05),
          fillOpacity: 0,
        }}
      />
    </>
  );
}

function MarkerLayer({
  markers,
  selectedNodeId,
  onMarkerSelect,
  hoveredNodeId,
  onHoverChange,
  searchValue,
  cascadeTick,
}: {
  markers: TheatreMapMarker[];
  selectedNodeId: string | null;
  onMarkerSelect: (marker: TheatreMapMarker) => void;
  hoveredNodeId: string | null;
  onHoverChange: (nodeId: string | null) => void;
  searchValue: string;
  cascadeTick: number;
}) {
  return (
    <>
      {markers.map((marker) => {
        const isDimmed =
          searchValue.trim().length > 0 &&
          !marker.name.toLowerCase().includes(searchValue.trim().toLowerCase()) &&
          !(marker.kind || "").toLowerCase().includes(searchValue.trim().toLowerCase());

        let displayStatus = marker.status;
        if (marker.status === "warning" && typeof marker.cascadeLevel === "number" && cascadeTick >= marker.cascadeLevel) {
          displayStatus = "critical";
        }

        const style = STATUS_STYLES[displayStatus];
        const isSelected = selectedNodeId === marker.id;
        const isHovered = hoveredNodeId === marker.id;
        const radius = marker.status === "incident" ? 9 : marker.kind === "force" ? 7 : 6.5;

        return (
          <React.Fragment key={marker.id}>
            {marker.status === "incident" ? <PulsingIncidentHalo marker={marker} /> : null}
            <CircleMarker
              center={[marker.lat, marker.lon]}
              radius={radius + (isHovered ? 11 : 8)}
              bubblingMouseEvents={false}
              pathOptions={{
                color: style.stroke,
                opacity: isDimmed ? 0.08 : 0,
                fillColor: style.glow,
                fillOpacity: isDimmed ? 0.04 : displayStatus === "incident" ? 0.38 : isHovered ? 0.28 : 0.18,
              }}
            />
            <CircleMarker
              center={[marker.lat, marker.lon]}
              radius={radius + (isHovered && marker.status !== "incident" ? 0.8 : 0)}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: () => onMarkerSelect(marker),
                mouseover: () => onHoverChange(marker.id),
                mouseout: () => onHoverChange(null),
              }}
              pathOptions={{
                color: style.stroke,
                weight: isSelected || isHovered ? 2 : 1.2,
                opacity: isDimmed ? 0.32 : 0.9,
                fillColor: style.fill,
                fillOpacity: isDimmed ? 0.16 : isHovered ? 0.88 : 0.76,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} className="theatre-map-tooltip">
                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-white">{marker.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300">
                    {(marker.kind || "node").replace(/_/g, " ")} · {formatStatusLabel(displayStatus)}
                  </div>
                </div>
              </Tooltip>
              {isSelected ? (
                <Popup closeButton={false} autoPan={false} className="theatre-map-popup" offset={[0, -18]}>
                  <div className="min-w-[210px] space-y-3">
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.24em] text-cyan-300/70">Node</div>
                      <div className="mt-1 text-sm font-semibold text-white">{marker.name}</div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300">
                      <span>{formatStatusLabel(displayStatus)}</span>
                      <span>{marker.dependencies?.length || 0} deps</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">
                      {truncateCopy(marker.description || "Live node selected for local dependency review.", 116)}
                    </p>
                    {(marker.dependencies || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {marker.dependencies?.slice(0, 3).map((dependency) => (
                          <span
                            key={dependency}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-slate-300"
                          >
                            {dependency}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </Popup>
              ) : null}
            </CircleMarker>
          </React.Fragment>
        );
      })}
    </>
  );
}

function OverlayCard({
  title,
  eyebrow,
  className,
  children,
}: {
  title: string;
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "theatre-ui-fade pointer-events-auto rounded-[20px] border border-white/8 bg-slate-950/46 p-3 shadow-[0_16px_40px_rgba(2,6,23,0.28)] backdrop-blur-xl",
        className,
      )}
    >
      {eyebrow ? <p className="text-[0.62rem] uppercase tracking-[0.28em] text-cyan-300/72">{eyebrow}</p> : null}
      <h3 className={cn("mt-2 text-sm font-semibold text-white", eyebrow ? "" : "mt-0")}>{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function InteractiveMap({
  markers,
  circles,
  polygons,
  polylines,
  incident,
  readout,
  assessment,
  phaseLabel,
  phaseIndex,
  totalPhases,
  onAdvancePhase,
  className,
}: InteractiveMapProps) {
  const [baseLayer, setBaseLayer] = React.useState<keyof typeof BASE_TILES>("dark");
  const [trafficEnabled, setTrafficEnabled] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedNode, setSelectedNode] = React.useState<TheatreMapMarker | null>(markers[0] || null);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [focusTarget, setFocusTarget] = React.useState<[number, number] | null>(null);
  const [cascadeTick, setCascadeTick] = React.useState(0);
  const [flowOffset, setFlowOffset] = React.useState(0);

  React.useEffect(() => {
    setSelectedNode((current) => {
      if (!current) return markers[0] || null;
      return markers.find((marker) => marker.id === current.id) || markers[0] || null;
    });
  }, [markers]);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCascadeTick((current) => (current + 1) % 4);
    }, 1900);
    return () => window.clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFlowOffset((current) => (current + 3) % 48);
    }, 120);
    return () => window.clearInterval(intervalId);
  }, []);

  const center = React.useMemo(() => getMapCenter(markers, circles), [markers, circles]);
  const searchResult = React.useMemo(() => fitSearchResult(searchValue, markers), [searchValue, markers]);
  const phaseProgress = typeof phaseIndex === "number" && typeof totalPhases === "number" && totalPhases > 0
    ? ((phaseIndex + 1) / totalPhases) * 100
    : null;
  const compactIncidentDescription = truncateCopy(incident.description, 132);
  const compactCause = truncateCopy(assessment.cause, 128);
  const compactRisk = truncateCopy(assessment.risk, 118);

  return (
    <div
      className={cn(
        "relative h-[780px] overflow-hidden rounded-[34px] border border-cyan-400/10 bg-[#040814] shadow-[0_35px_120px_rgba(2,6,23,0.6)]",
        className,
      )}
    >
      <MapContainer center={center} zoom={8} zoomControl={false} className="h-full w-full bg-[#020612]">
        <TileLayer attribution={BASE_TILES[baseLayer].attribution} url={BASE_TILES[baseLayer].url} />

        <MapController
          focusTarget={focusTarget}
          onMapClick={() => {
            setSelectedNode(null);
            setFocusTarget(null);
          }}
        />

        {polygons.map((polygon) => {
          const tone = STATUS_STYLES[polygon.tone || "warning"];
          return (
            <Polygon
              key={polygon.id}
              positions={polygon.positions}
              pathOptions={{
                color: tone.stroke,
                weight: 1.1,
                opacity: 0.45,
                fillColor: tone.stroke,
                fillOpacity: 0.08,
              }}
            />
          );
        })}

        {circles.map((circle) => <AnimatedThreatRadius key={circle.id} circle={circle} />)}

        {polylines.map((line) => {
          const tone = STATUS_STYLES[line.tone || "warning"];
          const isActiveConnection = selectedNode
            ? line.fromId === selectedNode.id || line.toId === selectedNode.id || selectedNode.status === "incident"
            : line.fromId === "incident-core" || line.toId === "incident-core";
          return (
            <React.Fragment key={line.id}>
              <Polyline
                positions={line.positions}
                pathOptions={{
                  color: tone.stroke,
                  weight: isActiveConnection ? 2.1 : 1.1,
                  opacity: isActiveConnection ? 0.11 : 0.04,
                }}
              />
              <Polyline
                positions={line.positions}
                pathOptions={{
                  color: isActiveConnection ? (trafficEnabled ? "#f59e0b" : tone.stroke) : "rgba(148,163,184,0.4)",
                  weight: isActiveConnection ? (trafficEnabled ? 1.25 + (line.trafficLoad || 0) * 0.015 : 0.95) : 0.8,
                  opacity: isActiveConnection ? (trafficEnabled ? 0.58 : 0.3) : 0.1,
                  dashArray: trafficEnabled && isActiveConnection ? "8 12" : undefined,
                  dashOffset: trafficEnabled && isActiveConnection ? `${-flowOffset}` : undefined,
                }}
              />
            </React.Fragment>
          );
        })}

        <MarkerLayer
          markers={markers}
          selectedNodeId={selectedNode?.id || null}
          onMarkerSelect={(marker) => {
            setSelectedNode(marker);
            setFocusTarget([marker.lat, marker.lon]);
          }}
          hoveredNodeId={hoveredNodeId}
          onHoverChange={setHoveredNodeId}
          searchValue={searchValue}
          cascadeTick={cascadeTick}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(19,36,69,0.28),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.18),rgba(2,6,23,0.3))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(2,6,23,0.68)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_62%,rgba(244,63,94,0.12),transparent_18%)]" />

      <div className="pointer-events-none absolute inset-0 p-4 lg:p-5">
        <OverlayCard title={incident.title} eyebrow="Current Incident" className="absolute left-5 top-5 z-[900] w-[232px] lg:w-[248px]">
          <p className="text-[0.92rem] leading-5 text-slate-300">{truncateCopy(compactIncidentDescription, 102)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {incident.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-3">
            <div className="inline-flex rounded-full border border-rose-400/12 bg-rose-500/10 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] text-rose-100">
              SEV {incident.severity}
            </div>
          </div>
        </OverlayCard>

        <div className="theatre-ui-fade theatre-ui-fade--center pointer-events-auto absolute left-1/2 top-5 z-[900] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/8 bg-slate-950/42 px-3 py-2 shadow-[0_14px_32px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search nodes"
              aria-label="Search nodes"
              title="Search nodes"
              className="h-8 w-[140px] border-0 bg-transparent px-1 text-sm text-white shadow-none focus-visible:ring-0 lg:w-[170px]"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]"
            onClick={() => setFocusTarget(center)}
            aria-label="Recenter map"
            title="Recenter map"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]",
              baseLayer === "satellite" ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-100" : "",
            )}
            onClick={() => setBaseLayer((current) => (current === "dark" ? "satellite" : "dark"))}
            aria-label="Toggle base layer"
            title="Toggle base layer"
          >
            <Satellite className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]",
              trafficEnabled ? "border-amber-400/30 bg-amber-400/12 text-amber-100" : "",
            )}
            onClick={() => setTrafficEnabled((current) => !current)}
            aria-label="Toggle traffic"
            title="Toggle traffic"
          >
            <Layers3 className="h-4 w-4" />
          </Button>
          {searchResult ? (
            <button
              type="button"
              onClick={() => {
                setSelectedNode(searchResult);
                setFocusTarget([searchResult.lat, searchResult.lon]);
              }}
              className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-400/16 lg:inline-flex"
            >
              Jump
            </button>
          ) : null}
        </div>

        <OverlayCard title="Board Readout" className="absolute right-5 top-5 z-[900] w-[210px]">
          <div className="grid grid-cols-2 gap-2">
            {readout.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-white/7 bg-white/[0.025] px-2.5 py-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[0.54rem] uppercase tracking-[0.2em] text-slate-500">{item.label}</div>
                  {getTrendIcon(item.trend)}
                </div>
                <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </OverlayCard>

        <OverlayCard title="AI Assessment" className="absolute bottom-5 right-5 z-[900] w-[252px]">
          <div className="space-y-3 text-sm leading-6 text-slate-300">
            <div className="pb-2 border-b border-white/8">
              <p className="text-[0.58rem] uppercase tracking-[0.22em] text-slate-500">Cause</p>
              <p className="mt-1">{truncateCopy(compactCause, 88)}</p>
            </div>
            <div className="pb-2 border-b border-white/8">
              <p className="text-[0.58rem] uppercase tracking-[0.22em] text-slate-500">Risk</p>
              <p className="mt-1">{truncateCopy(compactRisk, 86)}</p>
            </div>
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.22em] text-slate-500">Suggested Actions</p>
              <ul className="mt-2 grid gap-2">
                {assessment.actions.slice(0, 2).map((action) => (
                  <li key={action} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-slate-200">
                    {truncateCopy(action, 68)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </OverlayCard>

        {(phaseLabel || onAdvancePhase) ? (
          <div className="theatre-ui-fade theatre-ui-fade--center pointer-events-auto absolute bottom-5 left-1/2 z-[900] flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/8 bg-slate-950/42 px-3 py-2 shadow-[0_14px_32px_rgba(2,6,23,0.24)] backdrop-blur-xl">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.22em] text-slate-300">
              {phaseLabel || "Live theater"}
            </div>
            {phaseProgress !== null ? (
              <div className="hidden min-w-[110px] lg:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-rose-400" style={{ width: `${phaseProgress}%` }} />
                </div>
              </div>
            ) : null}
            {onAdvancePhase ? (
              <Button
                variant="outline"
                className="h-9 rounded-full border-cyan-400/25 bg-cyan-400/10 px-4 text-cyan-50 hover:bg-cyan-400/18"
                onClick={onAdvancePhase}
              >
                <Play className="mr-2 h-4 w-4" />
                Advance Phase
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
