import React, { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DEFAULT_VIEW = {
  center: [20, 28],
  zoom: 1.62,
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function createScatterCluster({ lat, lon, count, spreadLat, spreadLon, palette, radius = 4 }) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.3999632297;
    const magnitude = 0.25 + ((index % 7) + 1) / 8;

    return {
      lat: lat + Math.sin(angle) * spreadLat * magnitude,
      lon: lon + Math.cos(angle) * spreadLon * magnitude,
      color: palette[index % palette.length],
      radius: radius + (index % 3),
      intensity: index % 5,
    };
  });
}

const SYNTHETIC_POINTS = [
  ...createScatterCluster({
    lat: 41.2,
    lon: 14.5,
    count: 52,
    spreadLat: 10,
    spreadLon: 18,
    palette: ["#ff6b6b", "#f7b84b", "#f0e24a", "#52b4ff"],
    radius: 4,
  }),
  ...createScatterCluster({
    lat: 35.4,
    lon: 51.3,
    count: 26,
    spreadLat: 8,
    spreadLon: 11,
    palette: ["#ff6b6b", "#ff8a3d", "#f7b84b"],
    radius: 5,
  }),
  ...createScatterCluster({
    lat: 37.5,
    lon: -96.5,
    count: 18,
    spreadLat: 10,
    spreadLon: 22,
    palette: ["#ff6b6b", "#f7b84b"],
    radius: 4,
  }),
  ...createScatterCluster({
    lat: 35.7,
    lon: 139.6,
    count: 12,
    spreadLat: 6,
    spreadLon: 7,
    palette: ["#ff6b6b", "#52b4ff"],
    radius: 4,
  }),
  ...createScatterCluster({
    lat: 14.6,
    lon: 104.2,
    count: 10,
    spreadLat: 8,
    spreadLon: 9,
    palette: ["#ff6b6b", "#ff8a3d"],
    radius: 4,
  }),
];

const ZONE_POLYGONS = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { color: "#b35a1f", opacity: 0.34 },
      geometry: {
        type: "Polygon",
        coordinates: [[[44, 40], [64, 40], [64, 24], [44, 24], [44, 40]]],
      },
    },
    {
      type: "Feature",
      properties: { color: "#9b2d30", opacity: 0.28 },
      geometry: {
        type: "Polygon",
        coordinates: [[[28, 52], [42, 52], [42, 44], [28, 44], [28, 52]]],
      },
    },
    {
      type: "Feature",
      properties: { color: "#b4482d", opacity: 0.3 },
      geometry: {
        type: "Polygon",
        coordinates: [[[94, 28], [102, 28], [102, 10], [94, 10], [94, 28]]],
      },
    },
  ],
};

function buildPointCollection(incidentPoint, markers) {
  const features = SYNTHETIC_POINTS.concat(
    markers.map((marker) => ({
      lat: marker.lat,
      lon: marker.lon,
      color: marker.color || "#52b4ff",
      radius: 6,
      intensity: 5,
    })),
  ).map((point, index) => ({
    type: "Feature",
    properties: {
      color: point.color,
      radius: point.radius,
      intensity: point.intensity,
      incident: false,
      id: `synthetic-${index}`,
    },
    geometry: {
      type: "Point",
      coordinates: [point.lon, point.lat],
    },
  }));

  if (incidentPoint) {
    features.push({
      type: "Feature",
      properties: {
        color: "#f97316",
        radius: 10,
        intensity: 8,
        incident: true,
        id: "incident",
      },
      geometry: {
        type: "Point",
        coordinates: [incidentPoint.lon, incidentPoint.lat],
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export default function WorldMonitorMap({ incidentPoint, markers = [] }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  const pointCollection = useMemo(
    () => buildPointCollection(incidentPoint, markers),
    [incidentPoint, markers],
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
      minZoom: 1.35,
      maxZoom: 5.4,
      renderWorldCopies: true,
    });

    map.on("load", () => {
      map.addSource("wm-zones", {
        type: "geojson",
        data: ZONE_POLYGONS,
      });

      map.addLayer({
        id: "wm-zones-fill",
        type: "fill",
        source: "wm-zones",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      });

      map.addLayer({
        id: "wm-zones-line",
        type: "line",
        source: "wm-zones",
        paint: {
          "line-color": ["get", "color"],
          "line-opacity": 0.8,
          "line-width": 1.1,
        },
      });

      map.addSource("wm-points", {
        type: "geojson",
        data: pointCollection,
      });

      map.addLayer({
        id: "wm-points-glow",
        type: "circle",
        source: "wm-points",
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["*", ["get", "radius"], 1.7],
          "circle-opacity": 0.16,
          "circle-blur": 0.7,
        },
      });

      map.addLayer({
        id: "wm-points-core",
        type: "circle",
        source: "wm-points",
        paint: {
          "circle-color": ["get", "color"],
          "circle-stroke-color": "#f5f5f5",
          "circle-stroke-width": [
            "case",
            ["boolean", ["get", "incident"], false],
            2.2,
            0.8,
          ],
          "circle-radius": ["get", "radius"],
          "circle-opacity": 0.92,
        },
      });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const pointSource = map.getSource("wm-points");
    if (pointSource) {
      pointSource.setData(pointCollection);
    }
  }, [pointCollection]);

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
      <div className="wm-map-attribution">© Protomaps © OpenStreetMap</div>
    </div>
  );
}
