import React, { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GeoJsonLayer, PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { MAP_LAYER_ITEMS } from "../data/monitorData";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_VIEW = {
  center: [18, 24],
  zoom: 1.58,
};

const MAP_STYLE = {
  version: 8,
  sources: {
    darkmatter: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    },
  },
  layers: [
    {
      id: "darkmatter",
      type: "raster",
      source: "darkmatter",
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

const GROUP_ANCHORS = {
  Strategic: [
    { lat: 35.6895, lon: 51.389 },
    { lat: 48.8566, lon: 2.3522 },
    { lat: 41.0082, lon: 28.9784 },
    { lat: 24.7136, lon: 46.6753 },
    { lat: 32.0853, lon: 34.7818 },
    { lat: 34.0837, lon: 74.7973 },
  ],
  Activity: [
    { lat: 31.2304, lon: 121.4737 },
    { lat: 25.2048, lon: 55.2708 },
    { lat: 19.076, lon: 72.8777 },
    { lat: 1.3521, lon: 103.8198 },
    { lat: 35.6762, lon: 139.6503 },
    { lat: 37.5665, lon: 126.978 },
  ],
  Infrastructure: [
    { lat: 29.7604, lon: -95.3698 },
    { lat: 51.5072, lon: -0.1276 },
    { lat: 52.3676, lon: 4.9041 },
    { lat: 25.2854, lon: 51.531 },
    { lat: -33.8688, lon: 151.2093 },
    { lat: 35.6762, lon: 139.6503 },
  ],
  "Finance + Tech": [
    { lat: 40.7128, lon: -74.006 },
    { lat: 51.5072, lon: -0.1276 },
    { lat: 22.3193, lon: 114.1694 },
    { lat: 19.076, lon: 72.8777 },
    { lat: 1.3521, lon: 103.8198 },
    { lat: 25.2048, lon: 55.2708 },
    { lat: 35.6762, lon: 139.6503 },
  ],
};

const LAYER_LOOKUP = Object.fromEntries(MAP_LAYER_ITEMS.map((item) => [item.id, item]));

function hashString(value) {
  return value.split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const safe = normalized.length === 3
    ? normalized
        .split("")
        .map((character) => character + character)
        .join("")
    : normalized;

  const parsed = Number.parseInt(safe, 16);
  return [
    (parsed >> 16) & 255,
    (parsed >> 8) & 255,
    parsed & 255,
  ];
}

function buildScatterData(layer, index) {
  const anchors = GROUP_ANCHORS[layer.group] || GROUP_ANCHORS.Strategic;
  const seed = hashString(layer.id);
  const count = 8 + (seed % 11);

  return Array.from({ length: count }, (_, itemIndex) => {
    const anchor = anchors[(itemIndex + index + seed) % anchors.length];
    const phase = itemIndex * 2.39996323 + seed / 40;
    const spread = 1.2 + ((itemIndex + seed) % 5) * 0.5;
    const position = [
      anchor.lon + Math.cos(phase) * spread * (layer.group === "Finance + Tech" ? 1.1 : 1.7),
      anchor.lat + Math.sin(phase) * spread * (layer.group === "Infrastructure" ? 1.2 : 0.95),
    ];

    return {
      position,
      fillColor: hexToRgb(layer.color),
      radius: 4 + ((itemIndex + seed) % 4),
      category: layer.id,
    };
  });
}

function buildPathData(layer, index) {
  const anchors = GROUP_ANCHORS[layer.group] || GROUP_ANCHORS.Activity;
  const seed = hashString(layer.id);

  return Array.from({ length: Math.min(anchors.length - 1, 4) }, (_, pathIndex) => {
    const start = anchors[(pathIndex + index) % anchors.length];
    const mid = anchors[(pathIndex + 2 + (seed % 3)) % anchors.length];
    const end = anchors[(pathIndex + 3 + (seed % 5)) % anchors.length];

    return {
      category: layer.id,
      color: hexToRgb(layer.color),
      path: [
        [start.lon, start.lat],
        [(start.lon + mid.lon) / 2, Math.max(start.lat, mid.lat) + 6 - pathIndex * 1.4],
        [mid.lon, mid.lat],
        [end.lon, end.lat],
      ],
    };
  });
}

function buildZoneData(layer, index) {
  const anchors = GROUP_ANCHORS[layer.group] || GROUP_ANCHORS.Infrastructure;
  const seed = hashString(layer.id);
  return {
    type: "FeatureCollection",
    features: anchors.slice(0, 3).map((anchor, featureIndex) => {
      const latSpread = 4 + ((seed + featureIndex) % 4);
      const lonSpread = 6 + ((seed + featureIndex) % 5);
      return {
        type: "Feature",
        properties: {
          category: layer.id,
          color: hexToRgb(layer.color),
          opacity: 0.18 + (((index + featureIndex) % 4) * 0.04),
        },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [anchor.lon - lonSpread, anchor.lat - latSpread],
            [anchor.lon + lonSpread, anchor.lat - latSpread],
            [anchor.lon + lonSpread, anchor.lat + latSpread],
            [anchor.lon - lonSpread, anchor.lat + latSpread],
            [anchor.lon - lonSpread, anchor.lat - latSpread],
          ]],
        },
      };
    }),
  };
}

const GENERATED_LAYER_DATA = MAP_LAYER_ITEMS.reduce((accumulator, layer, index) => {
  accumulator[layer.id] = layer.kind === "path"
    ? buildPathData(layer, index)
    : layer.kind === "zone"
      ? buildZoneData(layer, index)
      : buildScatterData(layer, index);
  return accumulator;
}, {});

function buildDynamicPoints(incidentPoint, markers) {
  const dynamic = markers.map((marker) => ({
    id: marker.id,
    label: marker.label,
    position: [marker.lon, marker.lat],
    fillColor: marker.hotspot ? [251, 113, 133] : [96, 165, 250],
    radius: marker.hotspot ? 9 : 7,
    category: "dynamic-marker",
    hotspot: marker.hotspot,
  }));

  if (incidentPoint) {
    dynamic.push({
      position: [incidentPoint.lon, incidentPoint.lat],
      fillColor: [249, 115, 22],
      radius: 13,
      category: "dynamic-incident",
      incident: true,
    });
  }

  return dynamic;
}

function createDeckLayers(incidentPoint, markers, activeLayerIds, onMarkerClick) {
  const dynamicPoints = buildDynamicPoints(incidentPoint, markers);

  const layers = activeLayerIds.flatMap((layerId) => {
    const definition = LAYER_LOOKUP[layerId];
    const data = GENERATED_LAYER_DATA[layerId];
    if (!definition || !data) return [];

    if (definition.kind === "path") {
      return [
        new PathLayer({
          id: `${layerId}-path`,
          data,
          getPath: (datum) => datum.path,
          getColor: (datum) => datum.color,
          widthUnits: "pixels",
          getWidth: layerId === "ais" || layerId === "tradeRoutes" ? 2.2 : 1.5,
          opacity: 0.72,
        }),
      ];
    }

    if (definition.kind === "zone") {
      return [
        new GeoJsonLayer({
          id: `${layerId}-zone`,
          data,
          pickable: false,
          stroked: true,
          filled: true,
          getLineColor: (feature) => [...feature.properties.color, 210],
          getLineWidth: 1,
          getFillColor: (feature) => [
            ...feature.properties.color,
            Math.round(feature.properties.opacity * 255),
          ],
        }),
      ];
    }

    return [
      new ScatterplotLayer({
        id: `${layerId}-glow`,
        data,
        getPosition: (datum) => datum.position,
        getFillColor: (datum) => datum.fillColor,
        getRadius: (datum) => datum.radius * 22000,
        opacity: 0.1,
        stroked: false,
        radiusUnits: "meters",
      }),
      new ScatterplotLayer({
        id: `${layerId}-core`,
        data,
        getPosition: (datum) => datum.position,
        getFillColor: (datum) => datum.fillColor,
        getRadius: (datum) => datum.radius * 8200,
        getLineColor: [245, 245, 245],
        lineWidthUnits: "pixels",
        getLineWidth: 1,
        stroked: true,
        opacity: 0.9,
        radiusUnits: "meters",
      }),
    ];
  });

  if (dynamicPoints.length) {
    layers.push(
      new ScatterplotLayer({
        id: "dynamic-points",
        data: dynamicPoints,
        pickable: true,
        getPosition: (datum) => datum.position,
        getFillColor: (datum) => datum.fillColor,
        getRadius: (datum) => datum.radius * 9000,
        getLineColor: [255, 255, 255],
        getLineWidth: (datum) => (datum.incident ? 2 : 1),
        stroked: true,
        opacity: 0.95,
        radiusUnits: "meters",
        onClick: (info) => {
          if (info.object?.hotspot) {
            onMarkerClick?.(info.object.hotspot);
          }
        },
      }),
    );
  }

  return layers;
}

export default function WorldMonitorMap({ incidentPoint, markers = [], activeLayerIds = [], onMarkerClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  const activeCount = activeLayerIds.length;
  const liveLayers = useMemo(
    () => createDeckLayers(incidentPoint, markers, activeLayerIds, onMarkerClick),
    [incidentPoint, markers, activeLayerIds, onMarkerClick],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: false,
      minZoom: 1.28,
      maxZoom: 5.4,
      renderWorldCopies: true,
    });

    map.on("load", () => {
      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: liveLayers,
      });

      map.addControl(overlay);
      overlayRef.current = overlay;
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (overlayRef.current) {
        map.removeControl(overlayRef.current);
        overlayRef.current.finalize?.();
        overlayRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [liveLayers]);

  useEffect(() => {
    if (!overlayRef.current) return;

    try {
      overlayRef.current.setProps({ layers: liveLayers });
    } catch (error) {
      console.warn("deck.gl overlay update skipped during map transition", error);
    }
  }, [liveLayers]);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const resetView = () =>
    mapRef.current?.flyTo({
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      speed: 0.9,
    });

  return (
    <div className="wm-map-frame">
      <div ref={containerRef} className="wm-map-canvas" />
      <div className="wm-map-right-controls">
        <button type="button" onClick={zoomIn}>
          +
        </button>
        <button type="button" onClick={zoomOut}>
          -
        </button>
        <button type="button" onClick={resetView}>
          ⌂
        </button>
      </div>
      <div className="wm-map-badge">WEBGL</div>
      <div className="wm-map-active-pill">{activeCount} layers</div>
      <div className="wm-map-attribution">deck.gl · MapLibre · CARTO basemap</div>
    </div>
  );
}
