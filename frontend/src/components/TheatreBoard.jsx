import React, { useMemo } from "react";
import InteractiveMap from "@/components/ui/interactive-map";

const DEFAULT_COORDINATES = {
  lat: 25.1264,
  lon: 62.3228,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatRole(role) {
  return role ? role.replace(/_/g, " ") : "system";
}

function shortenText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function resolveConfidence(threats) {
  if (!threats?.length) return 65;
  return Math.round(
    threats.reduce((total, threat) => total + (Number(threat.confidence) || 0), 0) / threats.length,
  );
}

function buildInfrastructureMarkers(incident, units, threats) {
  const lat = Number(incident?.lat) || DEFAULT_COORDINATES.lat;
  const lon = Number(incident?.lon) || DEFAULT_COORDINATES.lon;
  const severity = Number(incident?.severity) || 61;
  const criticalThreats = threats.filter((threat) => (Number(threat.severity) || 0) >= 60).length;
  const warningTrigger = severity >= 45 || criticalThreats > 0;

  const incidentName = incident?.label || incident?.title || "Incident node";
  const locationName = incident?.location || "Gwadar";
  const attackType = incident?.attackType || "Cyber disruption";

  const incidentMarker = {
    id: "incident-core",
    name: incidentName,
    lat,
    lon,
    status: "incident",
    kind: "incident",
    description:
      incident?.description ||
      "Primary disruption node. Traffic and dependent services are already showing service degradation.",
    dependencies: ["Port operations core", "Customs exchange", "Power relay"],
    trend: "up",
  };

  const infrastructure = [
    {
      id: "port-ops-core",
      name: `${locationName} Port Ops Core`,
      lat: lat + 0.016,
      lon: lon + 0.022,
      status: severity >= 55 ? "critical" : "warning",
      kind: "port core",
      description: "Supervises berth assignments, dock movement, and scheduling for inbound cargo traffic.",
      dependencies: ["Customs exchange", "Fuel dispatch relay", "Yard sensor mesh"],
      trend: "up",
      cascadeLevel: 1,
    },
    {
      id: "customs-exchange",
      name: "Customs Exchange",
      lat: lat - 0.012,
      lon: lon + 0.03,
      status: warningTrigger ? "warning" : "normal",
      kind: "data exchange",
      description: "Manages manifests, clearance workflows, and operator access for logistics systems.",
      dependencies: ["Port ops core", "Satellite uplink"],
      trend: warningTrigger ? "up" : "flat",
      cascadeLevel: 1,
    },
    {
      id: "fuel-dispatch",
      name: "Fuel Dispatch Relay",
      lat: lat + 0.022,
      lon: lon - 0.02,
      status: severity >= 58 ? "warning" : "normal",
      kind: "infrastructure",
      description: "Coordinates fueling windows and dispatch routing for dockside support vehicles.",
      dependencies: ["Port ops core", "Power relay"],
      trend: severity >= 58 ? "up" : "flat",
      cascadeLevel: 2,
    },
    {
      id: "power-relay",
      name: "Power Distribution Node",
      lat: lat - 0.018,
      lon: lon - 0.024,
      status: severity >= 62 ? "warning" : "normal",
      kind: "power",
      description: "Maintains current to scheduling systems, sensors, and comms racks across the harbor zone.",
      dependencies: ["Port ops core", "Yard sensor mesh"],
      trend: severity >= 62 ? "up" : "flat",
      cascadeLevel: 2,
    },
    {
      id: "satcom-uplink",
      name: "Satellite Uplink",
      lat: lat + 0.028,
      lon: lon + 0.05,
      status: severity >= 70 ? "critical" : "warning",
      kind: "comms",
      description: `${attackType} is likely attempting to sever remote coordination and situational reporting.`,
      dependencies: ["Customs exchange", "Quick reaction force"],
      trend: severity >= 70 ? "up" : "flat",
      cascadeLevel: 3,
    },
    {
      id: "yard-sensors",
      name: "Yard Sensor Mesh",
      lat: lat - 0.028,
      lon: lon + 0.008,
      status: warningTrigger ? "warning" : "normal",
      kind: "sensor grid",
      description: "Telemetry backbone for cargo movement, access gates, and dockside camera feeds.",
      dependencies: ["Power relay", "Port ops core"],
      trend: warningTrigger ? "up" : "flat",
      cascadeLevel: 2,
    },
  ];

  const unitMarkers = (units || []).map((unit, index) => ({
    id: unit.unit_id,
    name: unit.name,
    lat: Number(unit.latitude) || lat + 0.035 + index * 0.01,
    lon: Number(unit.longitude) || lon + 0.12 + index * 0.02,
    status:
      unit.status === "engaged"
        ? "critical"
        : unit.status === "moving" || unit.status === "retasking"
          ? "warning"
          : "normal",
    kind: "force",
    description: `${formatRole(unit.role)} unit. ${unit.status?.toUpperCase() || "READY"} with grid reference ${unit.grid_ref || "unassigned"}.`,
    dependencies: [incidentName, "Port ops core"],
    meta: unit.grid_ref || formatRole(unit.role).toUpperCase(),
    trend: unit.status === "moving" ? "up" : "flat",
  }));

  return [incidentMarker, ...infrastructure, ...unitMarkers];
}

function buildThreatCircles(incident, threats) {
  const fallbackLat = Number(incident?.lat) || DEFAULT_COORDINATES.lat;
  const fallbackLon = Number(incident?.lon) || DEFAULT_COORDINATES.lon;
  const fallbackSeverity = Number(incident?.severity) || 61;

  const sources = threats?.length
    ? threats
    : [
        {
          threat_id: "fallback-threat",
          latitude: fallbackLat,
          longitude: fallbackLon,
          severity: fallbackSeverity,
        },
      ];

  return sources.map((threat, index) => {
    const severity = Number(threat.severity) || fallbackSeverity;
    return {
      id: threat.threat_id || `threat-${index}`,
      lat: Number(threat.latitude) || fallbackLat,
      lon: Number(threat.longitude) || fallbackLon,
      radius: clamp(1800 + severity * 70 + index * 900, 2200, 8600),
      tone: severity >= 70 ? "critical" : "warning",
    };
  });
}

function buildZones(incident) {
  const lat = Number(incident?.lat) || DEFAULT_COORDINATES.lat;
  const lon = Number(incident?.lon) || DEFAULT_COORDINATES.lon;
  const severity = Number(incident?.severity) || 61;
  const latSpread = 0.028 + severity * 0.00018;
  const lonSpread = 0.04 + severity * 0.00024;

  return [
    {
      id: "service-degradation-zone",
      tone: "critical",
      positions: [
        [lat - latSpread, lon - lonSpread],
        [lat - latSpread * 0.34, lon + lonSpread * 1.06],
        [lat + latSpread * 0.5, lon + lonSpread * 0.92],
        [lat + latSpread, lon - lonSpread * 0.24],
        [lat + latSpread * 0.18, lon - lonSpread * 1.05],
      ],
    },
    {
      id: "containment-corridor",
      tone: "warning",
      positions: [
        [lat - latSpread * 1.55, lon - lonSpread * 1.3],
        [lat - latSpread * 0.85, lon + lonSpread * 1.46],
        [lat + latSpread * 1.2, lon + lonSpread * 1.16],
        [lat + latSpread * 1.52, lon - lonSpread * 0.82],
        [lat + latSpread * 0.1, lon - lonSpread * 1.52],
      ],
    },
  ];
}

function buildPolylines(markers) {
  const markerLookup = Object.fromEntries(markers.map((marker) => [marker.id, marker]));
  const connections = [
    ["incident-core", "port-ops-core", "critical", 92],
    ["incident-core", "customs-exchange", "critical", 88],
    ["incident-core", "power-relay", "warning", 64],
    ["port-ops-core", "fuel-dispatch", "warning", 53],
    ["port-ops-core", "yard-sensors", "warning", 58],
    ["customs-exchange", "satcom-uplink", "warning", 44],
    ["power-relay", "yard-sensors", "warning", 38],
  ];

  const unitConnections = markers
    .filter((marker) => marker.kind === "force")
    .map((marker) => ["satcom-uplink", marker.id, marker.status === "normal" ? "normal" : "warning", 22]);

  return [...connections, ...unitConnections]
    .map(([fromId, toId, tone, trafficLoad], index) => {
      const from = markerLookup[fromId];
      const to = markerLookup[toId];
      if (!from || !to) return null;
      return {
        id: `link-${index}-${fromId}-${toId}`,
        fromId,
        toId,
        positions: [
          [from.lat, from.lon],
          [to.lat, to.lon],
        ],
        tone,
        trafficLoad,
      };
    })
    .filter(Boolean);
}

function buildReadout(markers) {
  const degradedNodes = markers.filter((marker) => marker.status === "critical" || marker.status === "incident").length;
  const casRoutes = markers.filter((marker) => marker.kind === "force" && marker.name.toLowerCase().includes("viper")).length;

  return [
    { label: "Incident node", value: "Pinned", trend: "flat" },
    { label: "Threat proximity", value: "Close", trend: "up" },
    { label: "CAS routes", value: `${casRoutes}`, trend: casRoutes > 0 ? "down" : "flat" },
    { label: "Nodes degraded", value: `${degradedNodes}/${markers.length}`, trend: degradedNodes > 2 ? "up" : "flat" },
  ];
}

function buildAssessment(incident, analysis, threats, markers) {
  return {
    cause:
      analysis?.cause ||
      `Primary assessment indicates ${incident?.attackType || "cyber disruption"} aimed at paralyzing coordination rather than destroying physical assets outright.`,
    projection:
      analysis?.projection ||
      "Without containment, failure is likely to spread from the incident node into customs, routing, and comms systems over the next operating cycle.",
    risk:
      analysis?.risk ||
      (threats?.[0]?.summary
        ? shortenText(threats[0].summary, 150)
        : `${markers.filter((marker) => marker.status !== "normal").length} nodes are already showing degraded or unstable behavior.`),
    actions:
      analysis?.actions?.length
        ? analysis.actions.slice(0, 3)
        : [
            "Isolate affected routing and customs workloads.",
            "Re-segment satellite and sensor uplink paths.",
            "Move quick reaction support closer to the incident node.",
          ],
  };
}

export default function TheatreBoard({
  units = [],
  threats = [],
  incident,
  title,
  phase,
  phaseIndex,
  totalPhases,
  onAdvancePhase,
  analysis,
}) {
  const markers = useMemo(
    () =>
      buildInfrastructureMarkers(
        {
          ...incident,
          title,
        },
        units,
        threats,
      ),
    [incident, title, units, threats],
  );

  const circles = useMemo(() => buildThreatCircles(incident, threats), [incident, threats]);
  const polygons = useMemo(() => buildZones(incident), [incident]);
  const polylines = useMemo(() => buildPolylines(markers), [markers]);
  const incidentOverlay = useMemo(
    () => ({
      title: title || incident?.label || "Cyber disruption on Gwadar logistics port",
      description:
        incident?.description ||
        "Port scheduling, customs exchange, and dockside telemetry are degrading in parallel. Operators are seeing cascading infrastructure failures across dependent logistics systems.",
      tags: [incident?.attackType || "Cyber disruption", incident?.location || "Gwadar", "Severity"],
      severity: Number(incident?.severity) || 61,
      confidence: resolveConfidence(threats),
    }),
    [incident, title, threats],
  );

  const readout = useMemo(() => buildReadout(markers), [markers]);
  const assessmentOverlay = useMemo(
    () => buildAssessment(incident, analysis, threats, markers),
    [incident, analysis, threats, markers],
  );

  return (
    <InteractiveMap
      markers={markers}
      circles={circles}
      polygons={polygons}
      polylines={polylines}
      incident={incidentOverlay}
      readout={readout}
      assessment={assessmentOverlay}
      phaseLabel={phase}
      phaseIndex={phaseIndex}
      totalPhases={totalPhases}
      onAdvancePhase={onAdvancePhase}
    />
  );
}
