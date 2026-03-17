import { useEffect } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Day, ItineraryItem } from "../../types";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface VisibleDay {
  day: Day;
  di: number;
  color: string;
  items: ItineraryItem[];
}

interface RouteLineProps {
  points: number[][];
  color: string;
  animate: boolean;
}

interface AutoBoundsProps {
  points: number[][];
  searchPos: number[] | null;
}

interface SearchResult {
  lat: number;
  lng: number;
  name?: string;
}

interface SelectionItem {
  type: string;
  di?: number;
  i?: number;
  id?: string;
}

interface MapMarkersProps {
  visibleDays: VisibleDay[];
  searchResult: SearchResult | null;
  onSelect: (item: SelectionItem) => void;
  selectedId: string | null;
  selectedDay: number;
}

export function RouteLine({ points, color, animate }: RouteLineProps) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google || points.length < 2) return;
    const fullPath = points.map(p => ({ lat: p[0], lng: p[1] }));

    const line = new window.google.maps.Polyline({
      path: animate ? [] : fullPath,
      strokeColor: color, strokeOpacity: 0.8, strokeWeight: 3, geodesic: true,
      icons: [{ icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: color, fillOpacity: 0.9, strokeWeight: 1, strokeColor: "#fff" }, offset: "50%" }],
    });
    line.setMap(map);

    if (animate) {
      let step = 0;
      const totalSteps = fullPath.length * 15;
      const timer = setInterval(() => {
        step++;
        const progress = step / totalSteps;
        const pointIdx = Math.min(Math.floor(progress * (fullPath.length - 1)), fullPath.length - 2);
        const segProgress = (progress * (fullPath.length - 1)) - pointIdx;
        const path = fullPath.slice(0, pointIdx + 1);
        if (pointIdx < fullPath.length - 1) {
          const from = fullPath[pointIdx];
          const to = fullPath[pointIdx + 1];
          path.push({ lat: from.lat + (to.lat - from.lat) * segProgress, lng: from.lng + (to.lng - from.lng) * segProgress });
        }
        line.setPath(path);
        if (step >= totalSteps) { line.setPath(fullPath); clearInterval(timer); }
      }, 40);
      return () => { clearInterval(timer); line.setMap(null); };
    }

    return () => line.setMap(null);
  }, [map, points, color, animate]);
  return null;
}

export function AutoBounds({ points, searchPos }: AutoBoundsProps) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google) return;
    const all = [...points];
    if (searchPos) all.push(searchPos);
    if (all.length === 0) return;
    if (all.length === 1) { map.panTo({ lat: all[0][0], lng: all[0][1] }); map.setZoom(15); return; }
    const bounds = new window.google.maps.LatLngBounds();
    all.forEach(p => bounds.extend({ lat: p[0], lng: p[1] }));
    map.fitBounds(bounds, 50);
  }, [map, points, searchPos]);
  return null;
}

export function MapMarkers({ visibleDays, searchResult, onSelect, selectedId, selectedDay }: MapMarkersProps) {
  const allPoints = visibleDays.flatMap(d => d.items.map(it => [it.lat!, it.lng!]));
  const searchPos = searchResult ? [searchResult.lat, searchResult.lng] : null;

  return (
    <>
      <AutoBounds points={allPoints} searchPos={searchPos} />
      {visibleDays.map(({ di, color, items }) =>
        items.length > 1 ? <RouteLine key={`r-${di}-${selectedDay}`} points={items.map(it => [it.lat!, it.lng!])} color={color} animate={selectedDay !== -1} /> : null
      )}
      {searchResult && (
        <AdvancedMarker position={{ lat: searchResult.lat, lng: searchResult.lng }} onClick={() => onSelect({ type: "search" })}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4ECDC4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 3px 10px rgba(0,0,0,0.3)", border: "3px solid #fff" }}>📍</div>
        </AdvancedMarker>
      )}
      {visibleDays.map(({ day, di, color, items }) =>
        items.map((it, i) => {
          const id = `${di}-${i}`;
          const isActive = selectedId === id;
          return (
            <AdvancedMarker key={id} position={{ lat: it.lat!, lng: it.lng! }} onClick={() => onSelect({ type: "item", di, i, id })} zIndex={isActive ? 100 : 1}>
              <div style={{
                width: isActive ? 36 : 28, height: isActive ? 36 : 28, borderRadius: "50%",
                background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: isActive ? 15 : 12, fontWeight: 800, boxShadow: isActive ? `0 4px 14px ${color}88` : "0 2px 6px rgba(0,0,0,0.3)",
                border: isActive ? "3px solid #fff" : "2px solid #fff", cursor: "pointer", transition: "all 0.2s",
              }}>{i + 1}</div>
            </AdvancedMarker>
          );
        })
      )}
    </>
  );
}
