import React, { useEffect, useMemo, useRef } from "react";
import Globe from "globe.gl";

function buildPointData(incidentPoint, markers) {
  const points = markers.map((marker) => ({
    lat: marker.lat,
    lng: marker.lon,
    color: marker.color || "#44ff88",
    radius: 0.2 * (marker.scale || 1),
    altitude: 0.08,
    label: marker.label,
    marker,
  }));

  if (incidentPoint) {
    points.unshift({
      lat: incidentPoint.lat,
      lng: incidentPoint.lon,
      color: "#ff667d",
      radius: 0.32,
      altitude: 0.12,
    });
  }

  return points;
}

function buildArcData(arcs) {
  return arcs.map((arc) => ({
    startLat: arc.start.lat,
    startLng: arc.start.lon,
    endLat: arc.end.lat,
    endLng: arc.end.lon,
    color: arc.color || "#44ff88",
  }));
}

export default function WorldMonitorGlobe({ incidentPoint, markers = [], arcs = [], onMarkerClick }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);

  const pointData = useMemo(() => buildPointData(incidentPoint, markers), [incidentPoint, markers]);
  const arcData = useMemo(() => buildArcData(arcs), [arcs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || globeRef.current) return undefined;

    const globe = Globe()(container)
      .backgroundColor("rgba(0,0,0,0)")
      .backgroundImageUrl("/textures/night-sky.png")
      .globeImageUrl("/textures/earth-topo-bathy.jpg")
      .bumpImageUrl("/textures/earth-water.png")
      .showAtmosphere(true)
      .atmosphereColor("#4466cc")
      .atmosphereAltitude(0.18)
      .pointsMerge(false)
      .pointAltitude("altitude")
      .pointRadius("radius")
      .pointColor("color")
      .pointLabel((datum) => datum.label || "")
      .onPointClick((datum) => {
        if (datum?.marker?.hotspot) {
          onMarkerClick?.(datum.marker.hotspot);
        }
      })
      .arcColor((d) => d.color)
      .arcAltitude(0.2)
      .arcStroke(0.4)
      .arcDashLength(0.5)
      .arcDashGap(0.9)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(3000)
      .ringsData(incidentPoint ? [{ lat: incidentPoint.lat, lng: incidentPoint.lon, color: "#ff667d" }] : [])
      .ringColor(() => "#ff667d")
      .ringMaxRadius(4)
      .ringPropagationSpeed(2.8)
      .ringRepeatPeriod(1200);

    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);

    if (typeof globe.controls === "function") {
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enablePan = false;
      controls.minDistance = 170;
      controls.maxDistance = 350;
    }

    const resize = () => {
      globe.width(container.clientWidth);
      globe.height(container.clientHeight);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    globeRef.current = { instance: globe, resizeObserver };

    return () => {
      resizeObserver.disconnect();
      globe.pauseAnimation?.();
      container.innerHTML = "";
      globeRef.current = null;
    };
  }, [onMarkerClick]);

  useEffect(() => {
    const globe = globeRef.current?.instance;
    if (!globe) return;

    globe.pointsData(pointData);
    globe.arcsData(arcData);
    globe.ringsData(incidentPoint ? [{ lat: incidentPoint.lat, lng: incidentPoint.lon, color: "#ff667d" }] : []);
  }, [arcData, incidentPoint, pointData]);

  return <div ref={containerRef} className="wm-globe-canvas" />;
}
