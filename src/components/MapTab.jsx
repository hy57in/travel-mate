import { useState, useMemo, useCallback, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { S, T } from "../tokens";
import { pill, glass, inputStyle } from "../styles";
import { geocodeBatch, geocodePlace } from "../utils/geocode";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];
const TOKYO = { lat: 35.6812, lng: 139.7671 };

// Draw polyline route on map
function RouteLine({ points, color }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !window.google || points.length < 2) return;
    const line = new window.google.maps.Polyline({
      path: points.map(p => ({ lat: p[0], lng: p[1] })),
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      geodesic: true,
      icons: [{ icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: color, fillOpacity: 0.8, strokeWeight: 1, strokeColor: "#fff" }, offset: "50%" }],
    });
    line.setMap(map);
    return () => line.setMap(null);
  }, [map, points, color]);
  return null;
}

// Fit map bounds to visible points
function AutoBounds({ points, searchPos }) {
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

function MapContent({ visibleDays, searchResult, trip, onAddToDay }) {
  const [activeMarker, setActiveMarker] = useState(null);

  const allPoints = visibleDays.flatMap(d => d.items.map(it => [it.lat, it.lng]));
  const searchPos = searchResult ? [searchResult.lat, searchResult.lng] : null;

  return (
    <>
      <AutoBounds points={allPoints} searchPos={searchPos} />

      {/* Route lines per Day */}
      {visibleDays.map(({ di, color, items }) =>
        items.length > 1 ? <RouteLine key={`route-${di}`} points={items.map(it => [it.lat, it.lng])} color={color} /> : null
      )}

      {/* Search result */}
      {searchResult && (
        <AdvancedMarker position={{ lat: searchResult.lat, lng: searchResult.lng }} onClick={() => setActiveMarker("search")}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#4ECDC4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 3px 10px rgba(0,0,0,0.3)", border: "3px solid #fff" }}>📍</div>
        </AdvancedMarker>
      )}
      {activeMarker === "search" && searchResult && (
        <InfoWindow position={{ lat: searchResult.lat, lng: searchResult.lng }} onCloseClick={() => setActiveMarker(null)}>
          <div style={{ fontSize: 12, fontWeight: 600, minWidth: 170, lineHeight: 1.6, padding: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{searchResult.name}</div>
            {trip.days.map((d, di) => (
              <button key={di} onClick={() => { onAddToDay(di); setActiveMarker(null); }} style={{ display: "block", width: "100%", fontSize: 11, padding: "5px 8px", marginBottom: 3, borderRadius: 6, border: `1.5px solid ${DAY_COLORS[di % DAY_COLORS.length]}`, background: "white", color: DAY_COLORS[di % DAY_COLORS.length], cursor: "pointer", fontWeight: 700, textAlign: "left" }}>
                + D{di + 1} {d.title}에 추가
              </button>
            ))}
          </div>
        </InfoWindow>
      )}

      {/* Day markers */}
      {visibleDays.map(({ day, di, color, items }) =>
        items.map((it, i) => {
          const markerId = `${di}-${i}`;
          return (
            <span key={markerId}>
              <AdvancedMarker position={{ lat: it.lat, lng: it.lng }} onClick={() => setActiveMarker(markerId)}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", border: "2.5px solid #fff", cursor: "pointer" }}>{i + 1}</div>
              </AdvancedMarker>
              {activeMarker === markerId && (
                <InfoWindow position={{ lat: it.lat, lng: it.lng }} onCloseClick={() => setActiveMarker(null)}>
                  <div style={{ fontSize: 12, fontWeight: 600, minWidth: 160, lineHeight: 1.6, padding: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>Day {di + 1} · {day.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{it.text}</div>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{it.time}</div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ECDC4", textDecoration: "none", fontWeight: 700 }}>📍 구글맵 열기</a>
                  </div>
                </InfoWindow>
              )}
            </span>
          );
        })
      )}
    </>
  );
}

export default function MapTab({ trip, updateTrip }) {
  const [selectedDay, setSelectedDay] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const dayData = useMemo(() =>
    trip.days.map((day, di) => ({
      day, di,
      color: DAY_COLORS[di % DAY_COLORS.length],
      items: day.items.filter(it => it.lat && it.lng),
    })), [trip.days]);

  const hasAnyCoords = dayData.some(d => d.items.length > 0);
  const missingCoords = trip.days.some(d => d.items.some(it => !it.lat));
  const visibleDays = selectedDay === -1 ? dayData : dayData.filter(d => d.di === selectedDay);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const result = await geocodePlace(searchQuery.trim());
    if (result) setSearchResult({ ...result, name: searchQuery.trim() });
    setSearching(false);
  };

  const handleGeocodeAll = async () => {
    setGeocoding(true);
    const nextDays = [...trip.days];
    for (let di = 0; di < nextDays.length; di++) {
      if (nextDays[di].items.some(it => !it.lat)) {
        nextDays[di] = { ...nextDays[di], items: await geocodeBatch(nextDays[di].items, "Japan") };
      }
    }
    updateTrip({ days: nextDays });
    setGeocoding(false);
  };

  const handleAddToDay = useCallback((dayIdx) => {
    if (!searchResult) return;
    const nextDays = [...trip.days];
    nextDays[dayIdx] = { ...nextDays[dayIdx], items: [...nextDays[dayIdx].items, { time: "00:00", text: searchResult.name, type: "activity", lat: searchResult.lat, lng: searchResult.lng }] };
    updateTrip({ days: nextDays });
    setSearchResult(null);
    setSearchQuery("");
  }, [searchResult, trip.days, updateTrip]);

  if (!MAPS_KEY) {
    return (
      <div className="fade-in" style={{ textAlign: "center", padding: `${S.xxl * 2}px 0`, color: T.textMuted }}>
        <div style={{ fontSize: 40, marginBottom: S.md }}>🗺️</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Google Maps API 키가 필요합니다</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
      {/* Map with overlay controls */}
      <div style={{ borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.glassBorder}`, boxShadow: T.shadow, position: "relative" }}>
        <APIProvider apiKey={MAPS_KEY} language="ko" region="KR">
          <Map defaultCenter={TOKYO} defaultZoom={12} style={{ height: 460, width: "100%" }} mapId="travel-mate-map" gestureHandling="greedy" disableDefaultUI={true} zoomControl={true}>
            <MapContent visibleDays={visibleDays} searchResult={searchResult} trip={trip} onAddToDay={handleAddToDay} />
          </Map>
        </APIProvider>

        {/* Overlay: search bar */}
        <div style={{ position: "absolute", top: S.sm, left: S.sm, right: S.sm, display: "flex", gap: S.xs }}>
          <input
            style={{ ...inputStyle, flex: 1, fontSize: 12, background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", border: "none" }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="장소 검색..."
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
          />
          <button onClick={handleSearch} disabled={searching} style={{ padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, border: "none", background: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700, color: T.coral, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            {searching ? "..." : "🔍"}
          </button>
        </div>

        {/* Overlay: Day filter */}
        <div style={{ position: "absolute", bottom: S.sm, left: S.sm, right: S.sm, display: "flex", gap: S.xs, overflow: "auto" }}>
          <button style={{ ...pill(selectedDay === -1), fontSize: 10, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} onClick={() => setSelectedDay(-1)}>전체</button>
          {trip.days.map((day, di) => (
            <button key={di} onClick={() => setSelectedDay(di)} style={{
              padding: "5px 10px", borderRadius: 50, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", flexShrink: 0,
              background: selectedDay === di ? DAY_COLORS[di % DAY_COLORS.length] : "rgba(255,255,255,0.9)",
              color: selectedDay === di ? "#fff" : DAY_COLORS[di % DAY_COLORS.length],
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}>D{di + 1}</button>
          ))}
        </div>
      </div>

      {/* Geocode all */}
      {missingCoords && (
        <button style={{ ...glass, width: "100%", padding: `${S.sm}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, border: `1.5px solid ${T.mint}33`, cursor: "pointer", borderRadius: T.rSm }} onClick={handleGeocodeAll} disabled={geocoding}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "left" }}>{geocoding ? "장소를 찾는 중..." : "모든 일정의 장소 자동 찾기"}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.mint }}>{geocoding ? "⏳" : "실행"}</span>
        </button>
      )}

      {/* Legend */}
      {hasAnyCoords && (
        <div style={{ ...glass, padding: S.md, display: "flex", gap: S.sm, flexWrap: "wrap" }}>
          {dayData.filter(d => d.items.length > 0).map(({ day, di, color, items }) => (
            <span key={di} style={{ display: "flex", alignItems: "center", gap: S.xs, fontSize: 11 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span style={{ fontWeight: 700, color: T.text }}>D{di + 1}</span>
              <span style={{ color: T.textMuted }}>{items.length}곳</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
