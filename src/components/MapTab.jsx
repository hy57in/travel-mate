import { useState, useMemo, useCallback } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { S, T } from "../tokens";
import { pill, glass, inputStyle } from "../styles";
import { geocodeBatch, geocodePlace } from "../utils/geocode";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];
const TOKYO = { lat: 35.6812, lng: 139.7671 };

function RouteLine({ points, color }) {
  const map = useMap();
  if (!map || points.length < 2) return null;

  const path = points.map(p => ({ lat: p[0], lng: p[1] }));

  // Use google.maps.Polyline directly
  const line = useMemo(() => {
    if (!window.google) return null;
    return new window.google.maps.Polyline({
      path,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 3,
    });
  }, [path.map(p => `${p.lat},${p.lng}`).join("|"), color]);

  useMemo(() => {
    if (line) {
      line.setMap(map);
      return () => line.setMap(null);
    }
  }, [line, map]);

  return null;
}

function MapContent({ visibleDays, searchResult, trip, onAddToDay }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const map = useMap();

  // Fit bounds
  useMemo(() => {
    if (!map || !window.google) return;
    const allPoints = visibleDays.flatMap(d => d.items.map(it => ({ lat: it.lat, lng: it.lng })));
    if (searchResult) allPoints.push({ lat: searchResult.lat, lng: searchResult.lng });
    if (allPoints.length === 0) return;
    if (allPoints.length === 1) {
      map.panTo(allPoints[0]);
      map.setZoom(15);
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    allPoints.forEach(p => bounds.extend(p));
    map.fitBounds(bounds, 50);
  }, [visibleDays, searchResult, map]);

  return (
    <>
      {/* Search result */}
      {searchResult && (
        <AdvancedMarker position={{ lat: searchResult.lat, lng: searchResult.lng }} onClick={() => setActiveMarker("search")}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#4ECDC4", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", border: "2px solid #fff" }}>📍</div>
        </AdvancedMarker>
      )}
      {activeMarker === "search" && searchResult && (
        <InfoWindow position={{ lat: searchResult.lat, lng: searchResult.lng }} onCloseClick={() => setActiveMarker(null)}>
          <div style={{ fontSize: 12, fontWeight: 600, minWidth: 160, lineHeight: 1.6, padding: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{searchResult.name}</div>
            {trip.days.map((d, di) => (
              <button key={di} onClick={() => { onAddToDay(di); setActiveMarker(null); }} style={{ display: "block", width: "100%", fontSize: 11, padding: "4px 8px", marginBottom: 3, borderRadius: 6, border: `1px solid ${DAY_COLORS[di % DAY_COLORS.length]}`, background: "white", color: DAY_COLORS[di % DAY_COLORS.length], cursor: "pointer", fontWeight: 600, textAlign: "left" }}>
                + D{di + 1} {d.title}에 추가
              </button>
            ))}
          </div>
        </InfoWindow>
      )}

      {/* Day markers */}
      {visibleDays.map(({ day, di, color, items }) => (
        <span key={di}>
          {items.map((it, i) => {
            const markerId = `${di}-${i}`;
            return (
              <span key={markerId}>
                <AdvancedMarker position={{ lat: it.lat, lng: it.lng }} onClick={() => setActiveMarker(markerId)}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, boxShadow: "0 2px 6px rgba(0,0,0,0.3)", border: "2px solid #fff" }}>{i + 1}</div>
                </AdvancedMarker>
                {activeMarker === markerId && (
                  <InfoWindow position={{ lat: it.lat, lng: it.lng }} onCloseClick={() => setActiveMarker(null)}>
                    <div style={{ fontSize: 12, fontWeight: 600, minWidth: 150, lineHeight: 1.6, padding: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>Day {di + 1} · {day.title}</div>
                      <div>{it.time} {it.text}</div>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4ECDC4", textDecoration: "none", fontWeight: 600 }}>📍 구글맵에서 보기</a>
                    </div>
                  </InfoWindow>
                )}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

export default function MapTab({ trip, updateTrip }) {
  const [selectedDay, setSelectedDay] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const dayData = useMemo(() => {
    return trip.days.map((day, di) => ({
      day, di,
      color: DAY_COLORS[di % DAY_COLORS.length],
      items: day.items.filter(it => it.lat && it.lng),
    }));
  }, [trip.days]);

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
      const day = nextDays[di];
      if (day.items.some(it => !it.lat)) {
        const updated = await geocodeBatch(day.items, "Japan");
        nextDays[di] = { ...day, items: updated };
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
        <div style={{ fontSize: 13, fontWeight: 600 }}>Google Maps API 키가 설정되지 않았습니다</div>
        <div style={{ fontSize: 11, marginTop: S.sm }}>.env.local에 VITE_GOOGLE_MAPS_KEY를 추가해주세요</div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      {/* Search */}
      <div style={{ display: "flex", gap: S.sm }}>
        <input style={{ ...inputStyle, flex: 1, fontSize: 12 }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="장소 검색 (예: 신주쿠교엔, 하코네신사...)" onKeyDown={e => { if (e.key === "Enter") handleSearch(); }} />
        <button style={{ ...pill(true), flexShrink: 0, padding: `${S.sm}px ${S.md}px` }} onClick={handleSearch} disabled={searching}>{searching ? "..." : "검색"}</button>
      </div>

      {/* Geocode all */}
      {missingCoords && (
        <button style={{ ...glass, width: "100%", padding: `${S.sm}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, border: `1.5px solid ${T.mint}33`, cursor: "pointer", borderRadius: T.rSm }} onClick={handleGeocodeAll} disabled={geocoding}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "left" }}>{geocoding ? "장소를 찾는 중..." : "모든 일정의 장소 자동 찾기"}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.mint }}>{geocoding ? "⏳" : "실행"}</span>
        </button>
      )}

      {/* Day filter */}
      <div style={{ display: "flex", gap: S.xs, overflow: "auto", paddingBottom: S.xs }}>
        <button style={{ ...pill(selectedDay === -1), fontSize: 11, flexShrink: 0 }} onClick={() => setSelectedDay(-1)}>전체</button>
        {trip.days.map((day, di) => (
          <button key={di} style={{ ...pill(selectedDay === di), fontSize: 11, flexShrink: 0, borderLeft: selectedDay !== di ? `3px solid ${DAY_COLORS[di % DAY_COLORS.length]}` : "none" }} onClick={() => setSelectedDay(di)}>D{di + 1}</button>
        ))}
      </div>

      {/* Google Map */}
      <div style={{ borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.glassBorder}`, boxShadow: T.shadow }}>
        <APIProvider apiKey={MAPS_KEY} language="ko" region="KR">
          <Map defaultCenter={TOKYO} defaultZoom={12} style={{ height: 420, width: "100%" }} mapId="travel-mate-map" gestureHandling="greedy" disableDefaultUI={true} zoomControl={true}>
            <MapContent visibleDays={visibleDays} searchResult={searchResult} trip={trip} onAddToDay={handleAddToDay} />
          </Map>
        </APIProvider>
      </div>

      {/* Legend */}
      {hasAnyCoords && (
        <div style={{ ...glass, padding: S.md, display: "flex", flexDirection: "column", gap: S.sm }}>
          {visibleDays.filter(d => d.items.length > 0).map(({ day, di, color, items }) => (
            <div key={di} style={{ display: "flex", alignItems: "center", gap: S.sm }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>D{di + 1}</span>
              <span style={{ fontSize: 12, color: T.textSoft, flex: 1 }}>{day.title}</span>
              <span style={{ fontSize: 11, color: T.textMuted }}>{items.length}곳</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
