import React, { useMemo } from "react";
import InteractiveMap from "@/components/ui/interactive-map";

const DEFAULT_COORDINATES = {
  lat: 25.1264,
  lon: 62.3228,
};

const DEFAULT_SEVERITY = 61;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toFiniteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
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
    threats.reduce((total, threat) => total + toFiniteNumber(threat.confidence, 0), 0) / threats.length,
  );
}

function resolveSiteType(incident, attackType, locationName) {
  const scenarioText = [
    incident?.title,
    incident?.label,
    incident?.description,
    locationName,
    attackType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(port|harbor|harbour|dock|berth|customs|cargo|logistics)/.test(scenarioText)) return "port";
  if (/(missile|air\s?defen|air corridor|airbase|interceptor|sam)/.test(scenarioText)) return "air";
  if (/(radar|relay|drone|isr|surveillance|border|sector)/.test(scenarioText)) return "radar";
  if (/(militant|raid|artillery|checkpoint|frontier|ground|convoy)/.test(scenarioText)) return "land";
  return "neutral";
}

function buildSiteTemplates(siteType, context) {
  const { lat, lon, severity, warningTrigger, locationName, attackType } = context;

  if (siteType === "port") {
    return [
      {
        id: "port-ops-core",
        name: `${locationName} Port Ops Core`,
        lat: lat + 0.016,
        lon: lon + 0.022,
        status: severity >= 55 ? "critical" : "warning",
        kind: "port core",
        description: "Supervises berth assignments, dock movement, and scheduling for inbound cargo traffic.",
        trend: "up",
        cascadeLevel: 1,
        linkIds: ["incident-core", "customs-exchange", "fuel-dispatch", "yard-sensors"],
      },
      {
        id: "customs-exchange",
        name: "Customs Exchange",
        lat: lat - 0.012,
        lon: lon + 0.03,
        status: warningTrigger ? "warning" : "normal",
        kind: "data exchange",
        description: "Manages manifests, clearance workflows, and operator access for logistics systems.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 1,
        linkIds: ["incident-core", "port-ops-core", "satcom-uplink"],
      },
      {
        id: "fuel-dispatch",
        name: "Fuel Dispatch Relay",
        lat: lat + 0.022,
        lon: lon - 0.02,
        status: severity >= 58 ? "warning" : "normal",
        kind: "infrastructure",
        description: "Coordinates fueling windows and dispatch routing for dockside support vehicles.",
        trend: severity >= 58 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["port-ops-core", "power-relay"],
      },
      {
        id: "power-relay",
        name: "Power Distribution Node",
        lat: lat - 0.018,
        lon: lon - 0.024,
        status: severity >= 62 ? "warning" : "normal",
        kind: "power",
        description: "Maintains current to scheduling systems, sensors, and comms racks across the harbor zone.",
        trend: severity >= 62 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["incident-core", "fuel-dispatch", "yard-sensors"],
      },
      {
        id: "satcom-uplink",
        name: "Satellite Uplink",
        lat: lat + 0.028,
        lon: lon + 0.05,
        status: severity >= 70 ? "critical" : "warning",
        kind: "comms",
        description: `${attackType} is likely attempting to sever remote coordination and situational reporting.`,
        trend: severity >= 70 ? "up" : "flat",
        cascadeLevel: 3,
        linkIds: ["customs-exchange"],
      },
      {
        id: "yard-sensors",
        name: "Yard Sensor Mesh",
        lat: lat - 0.028,
        lon: lon + 0.008,
        status: warningTrigger ? "warning" : "normal",
        kind: "sensor grid",
        description: "Telemetry backbone for cargo movement, access gates, and dockside camera feeds.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["port-ops-core", "power-relay"],
      },
    ];
  }

  if (siteType === "radar") {
    return [
      {
        id: "radar-relay-core",
        name: `${locationName} Radar Relay`,
        lat: lat + 0.014,
        lon: lon + 0.018,
        status: severity >= 58 ? "critical" : "warning",
        kind: "sensor relay",
        description: "Fuses local track data and hands the picture to the wider surveillance grid.",
        trend: "up",
        cascadeLevel: 1,
        linkIds: ["incident-core", "air-picture-cell", "comms-backhaul", "border-sensor-mesh"],
      },
      {
        id: "air-picture-cell",
        name: "Air Picture Cell",
        lat: lat - 0.01,
        lon: lon + 0.026,
        status: warningTrigger ? "warning" : "normal",
        kind: "command analytics",
        description: "Correlates radar tracks, drone sightings, and alert thresholds into a single recognized air picture.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 1,
        linkIds: ["incident-core", "radar-relay-core", "quick-reaction-net"],
      },
      {
        id: "comms-backhaul",
        name: "Comms Backhaul",
        lat: lat + 0.024,
        lon: lon - 0.018,
        status: severity >= 62 ? "warning" : "normal",
        kind: "communications",
        description: "Carries relay output to sector command posts and downstream warning nets.",
        trend: severity >= 62 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["radar-relay-core", "power-relay"],
      },
      {
        id: "power-relay",
        name: "Power Relay Shelter",
        lat: lat - 0.02,
        lon: lon - 0.022,
        status: severity >= 66 ? "warning" : "normal",
        kind: "power",
        description: "Stabilizes power for tracking racks, microwave links, and relay shelters.",
        trend: severity >= 66 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["incident-core", "comms-backhaul", "border-sensor-mesh"],
      },
      {
        id: "border-sensor-mesh",
        name: "Border Sensor Mesh",
        lat: lat - 0.028,
        lon: lon + 0.01,
        status: warningTrigger ? "warning" : "normal",
        kind: "sensor grid",
        description: "Provides forward ISR cues from observation posts and unattended sensors along the sector.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["radar-relay-core", "power-relay"],
      },
      {
        id: "quick-reaction-net",
        name: "Quick Reaction Network",
        lat: lat + 0.03,
        lon: lon + 0.042,
        status: severity >= 72 ? "critical" : "warning",
        kind: "response coordination",
        description: `${attackType} is compressing response timing and forcing manual coordination across the sector defense net.`,
        trend: severity >= 72 ? "up" : "flat",
        cascadeLevel: 3,
        linkIds: ["air-picture-cell"],
      },
    ];
  }

  if (siteType === "air") {
    return [
      {
        id: "air-defense-core",
        name: `${locationName} Defense Core`,
        lat: lat + 0.014,
        lon: lon + 0.024,
        status: severity >= 72 ? "critical" : "warning",
        kind: "air defense",
        description: "Coordinates interceptor, warning, and targeting decisions for the defended air corridor.",
        trend: "up",
        cascadeLevel: 1,
        linkIds: ["incident-core", "track-fusion-node", "interceptor-battery", "civil-air-cell"],
      },
      {
        id: "track-fusion-node",
        name: "Track Fusion Node",
        lat: lat - 0.012,
        lon: lon + 0.028,
        status: severity >= 60 ? "warning" : "normal",
        kind: "sensor fusion",
        description: "Merges radar, missile warning, and decoy data into the live engagement picture.",
        trend: severity >= 60 ? "up" : "flat",
        cascadeLevel: 1,
        linkIds: ["incident-core", "air-defense-core", "missile-warning-net"],
      },
      {
        id: "interceptor-battery",
        name: "Interceptor Battery",
        lat: lat + 0.026,
        lon: lon - 0.02,
        status: severity >= 76 ? "critical" : "warning",
        kind: "air defense battery",
        description: "Launch and readiness control node for short-notice interceptor sorties and SAM tasking.",
        trend: severity >= 76 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["air-defense-core", "power-control-node"],
      },
      {
        id: "civil-air-cell",
        name: "Civil Air Coordination",
        lat: lat - 0.02,
        lon: lon - 0.018,
        status: warningTrigger ? "warning" : "normal",
        kind: "airspace control",
        description: "Coordinates civilian reroutes, runway advisories, and deconfliction across the corridor.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["air-defense-core", "communications-uplink"],
      },
      {
        id: "communications-uplink",
        name: "Communications Uplink",
        lat: lat + 0.03,
        lon: lon + 0.046,
        status: severity >= 68 ? "critical" : "warning",
        kind: "communications",
        description: `${attackType} is attempting to fracture warning dissemination and reporting discipline across the corridor.`,
        trend: severity >= 68 ? "up" : "flat",
        cascadeLevel: 3,
        linkIds: ["civil-air-cell", "missile-warning-net"],
      },
      {
        id: "missile-warning-net",
        name: "Missile Warning Net",
        lat: lat - 0.028,
        lon: lon + 0.008,
        status: severity >= 64 ? "warning" : "normal",
        kind: "warning network",
        description: "Provides early warning cues and automated alert fan-out to defensive crews.",
        trend: severity >= 64 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["track-fusion-node", "communications-uplink", "power-control-node"],
      },
      {
        id: "power-control-node",
        name: "Power Control Node",
        lat: lat - 0.026,
        lon: lon - 0.034,
        status: severity >= 63 ? "warning" : "normal",
        kind: "power",
        description: "Maintains stable power and fallback load balancing for tracking arrays and interceptor systems.",
        trend: severity >= 63 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["interceptor-battery", "missile-warning-net"],
      },
    ];
  }

  if (siteType === "land") {
    return [
      {
        id: "sector-ops-center",
        name: `${locationName} Sector Ops Center`,
        lat: lat + 0.014,
        lon: lon + 0.022,
        status: severity >= 58 ? "critical" : "warning",
        kind: "operations",
        description: "Coordinates local force posture, patrol routing, and incident reporting for the affected ground sector.",
        trend: "up",
        cascadeLevel: 1,
        linkIds: ["incident-core", "forward-observer-post", "comms-repeater", "mobility-hub"],
      },
      {
        id: "forward-observer-post",
        name: "Forward Observer Post",
        lat: lat - 0.012,
        lon: lon + 0.026,
        status: warningTrigger ? "warning" : "normal",
        kind: "surveillance",
        description: "Feeds line-of-sight observations and local ISR cues into the sector command picture.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 1,
        linkIds: ["incident-core", "sector-ops-center"],
      },
      {
        id: "comms-repeater",
        name: "Comms Repeater",
        lat: lat + 0.022,
        lon: lon - 0.018,
        status: severity >= 61 ? "warning" : "normal",
        kind: "communications",
        description: "Extends radio coverage for dispersed patrols, checkpoints, and quick-reaction elements.",
        trend: severity >= 61 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["sector-ops-center", "medical-staging"],
      },
      {
        id: "mobility-hub",
        name: "Mobility Staging Area",
        lat: lat - 0.02,
        lon: lon - 0.02,
        status: severity >= 56 ? "warning" : "normal",
        kind: "mobility",
        description: "Controls vehicle dispatch, route allocation, and local maneuver support.",
        trend: severity >= 56 ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["sector-ops-center", "support-cell"],
      },
      {
        id: "medical-staging",
        name: "Medical Staging",
        lat: lat + 0.03,
        lon: lon + 0.044,
        status: severity >= 68 ? "critical" : "warning",
        kind: "medical",
        description: `${attackType} is beginning to stress casualty handling and response timing inside the local ground network.`,
        trend: severity >= 68 ? "up" : "flat",
        cascadeLevel: 3,
        linkIds: ["comms-repeater"],
      },
      {
        id: "support-cell",
        name: "Support Cell",
        lat: lat - 0.03,
        lon: lon + 0.006,
        status: warningTrigger ? "warning" : "normal",
        kind: "logistics",
        description: "Handles sustainment, spare parts, and field resupply into the affected operating area.",
        trend: warningTrigger ? "up" : "flat",
        cascadeLevel: 2,
        linkIds: ["mobility-hub"],
      },
    ];
  }

  return [
    {
      id: "ops-coordination-node",
      name: `${locationName} Operations Node`,
      lat: lat + 0.014,
      lon: lon + 0.022,
      status: severity >= 58 ? "critical" : "warning",
      kind: "operations",
      description: "Primary coordination node for the affected site and its dependent systems.",
      trend: "up",
      cascadeLevel: 1,
      linkIds: ["incident-core", "telemetry-exchange", "communications-gateway", "sensor-array"],
    },
    {
      id: "telemetry-exchange",
      name: "Telemetry Exchange",
      lat: lat - 0.012,
      lon: lon + 0.028,
      status: warningTrigger ? "warning" : "normal",
      kind: "data exchange",
      description: "Aggregates status, diagnostics, and event signals from surrounding infrastructure.",
      trend: warningTrigger ? "up" : "flat",
      cascadeLevel: 1,
      linkIds: ["incident-core", "ops-coordination-node"],
    },
    {
      id: "communications-gateway",
      name: "Communications Gateway",
      lat: lat + 0.026,
      lon: lon - 0.018,
      status: severity >= 66 ? "critical" : "warning",
      kind: "communications",
      description: `${attackType} is degrading the site's ability to coordinate and broadcast a consistent operational picture.`,
      trend: severity >= 66 ? "up" : "flat",
      cascadeLevel: 2,
      linkIds: ["ops-coordination-node", "power-control-node"],
    },
    {
      id: "power-control-node",
      name: "Power Control Node",
      lat: lat - 0.018,
      lon: lon - 0.024,
      status: severity >= 62 ? "warning" : "normal",
      kind: "power",
      description: "Maintains stable power distribution across the affected service cluster.",
      trend: severity >= 62 ? "up" : "flat",
      cascadeLevel: 2,
      linkIds: ["incident-core", "communications-gateway", "sensor-array"],
    },
    {
      id: "sensor-array",
      name: "Sensor Array",
      lat: lat - 0.028,
      lon: lon + 0.008,
      status: warningTrigger ? "warning" : "normal",
      kind: "sensor grid",
      description: "Provides environmental, telemetry, and access-state awareness around the disrupted site.",
      trend: warningTrigger ? "up" : "flat",
      cascadeLevel: 2,
      linkIds: ["ops-coordination-node", "power-control-node"],
    },
    {
      id: "support-cell",
      name: "Support Cell",
      lat: lat + 0.03,
      lon: lon + 0.046,
      status: severity >= 64 ? "warning" : "normal",
      kind: "support",
      description: "Maintains local continuity actions while primary systems are degraded.",
      trend: severity >= 64 ? "up" : "flat",
      cascadeLevel: 2,
      linkIds: ["ops-coordination-node"],
    },
  ];
}

function buildInfrastructureMarkers(incident, units, threats) {
  const lat = toFiniteNumber(incident?.lat, DEFAULT_COORDINATES.lat);
  const lon = toFiniteNumber(incident?.lon, DEFAULT_COORDINATES.lon);
  const severity = toFiniteNumber(incident?.severity, DEFAULT_SEVERITY);
  const criticalThreats = threats.filter((threat) => toFiniteNumber(threat.severity, 0) >= 60).length;
  const warningTrigger = severity >= 45 || criticalThreats > 0;

  const incidentName = incident?.label || incident?.title || "Incident node";
  const locationName = incident?.location || "Operational site";
  const attackType = incident?.attackType || "Cyber disruption";
  const siteType = resolveSiteType(incident, attackType, locationName);

  const infrastructure = buildSiteTemplates(siteType, {
    lat,
    lon,
    severity,
    warningTrigger,
    locationName,
    attackType,
  }).map((node) => ({ ...node }));

  const infrastructureLookup = Object.fromEntries(infrastructure.map((node) => [node.id, node]));
  const anchorLinkIds = infrastructure.slice(0, 3).map((node) => node.id);

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
    dependencies: anchorLinkIds.map((id) => infrastructureLookup[id]?.name).filter(Boolean),
    linkIds: anchorLinkIds,
    trend: "up",
  };

  const enrichedInfrastructure = infrastructure.map((node) => ({
    ...node,
    dependencies: (node.linkIds || []).map((id) => (id === "incident-core" ? incidentName : infrastructureLookup[id]?.name)).filter(Boolean),
  }));

  const unitAnchorIds = [infrastructure[0]?.id, infrastructure[infrastructure.length - 1]?.id].filter(Boolean);
  const unitMarkers = (units || []).map((unit, index) => ({
    id: unit.unit_id,
    name: unit.name,
    lat: toFiniteNumber(unit.latitude, lat + 0.035 + index * 0.01),
    lon: toFiniteNumber(unit.longitude, lon + 0.12 + index * 0.02),
    status:
      unit.status === "engaged"
        ? "critical"
        : unit.status === "moving" || unit.status === "retasking"
          ? "warning"
          : "normal",
    kind: "force",
    description: `${formatRole(unit.role)} unit. ${unit.status?.toUpperCase() || "READY"} with grid reference ${unit.grid_ref || "unassigned"}.`,
    dependencies: unitAnchorIds.map((id) => infrastructureLookup[id]?.name).filter(Boolean),
    linkIds: unitAnchorIds,
    meta: unit.grid_ref || formatRole(unit.role).toUpperCase(),
    trend: unit.status === "moving" ? "up" : "flat",
  }));

  return [incidentMarker, ...enrichedInfrastructure, ...unitMarkers];
}

function buildThreatCircles(incident, threats) {
  const fallbackLat = toFiniteNumber(incident?.lat, DEFAULT_COORDINATES.lat);
  const fallbackLon = toFiniteNumber(incident?.lon, DEFAULT_COORDINATES.lon);
  const fallbackSeverity = toFiniteNumber(incident?.severity, DEFAULT_SEVERITY);

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
    const severity = toFiniteNumber(threat.severity, fallbackSeverity);
    return {
      id: threat.threat_id || `threat-${index}`,
      lat: toFiniteNumber(threat.latitude, fallbackLat),
      lon: toFiniteNumber(threat.longitude, fallbackLon),
      radius: clamp(1800 + severity * 70 + index * 900, 2200, 8600),
      tone: severity >= 70 ? "critical" : "warning",
    };
  });
}

function buildZones(incident) {
  const lat = toFiniteNumber(incident?.lat, DEFAULT_COORDINATES.lat);
  const lon = toFiniteNumber(incident?.lon, DEFAULT_COORDINATES.lon);
  const severity = toFiniteNumber(incident?.severity, DEFAULT_SEVERITY);
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
  const connectionMap = new Map();

  markers.forEach((marker) => {
    (marker.linkIds || []).forEach((targetId) => {
      const target = markerLookup[targetId];
      if (!target) return;

      const key = [marker.id, targetId].sort().join("::");
      if (connectionMap.has(key)) return;

      const statuses = [marker.status, target.status];
      const tone = statuses.some((status) => status === "incident" || status === "critical")
        ? "critical"
        : statuses.includes("warning")
          ? "warning"
          : "normal";
      const trafficLoad = marker.kind === "force" || target.kind === "force"
        ? 28
        : statuses.includes("incident")
          ? 86
          : statuses.includes("critical")
            ? 62
            : 36;

      connectionMap.set(key, {
        id: `link-${marker.id}-${targetId}`,
        fromId: marker.id,
        toId: targetId,
        positions: [
          [marker.lat, marker.lon],
          [target.lat, target.lon],
        ],
        tone,
        trafficLoad,
      });
    });
  });

  return Array.from(connectionMap.values());
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
      severity: toFiniteNumber(incident?.severity, DEFAULT_SEVERITY),
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
