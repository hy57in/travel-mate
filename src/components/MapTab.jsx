import { useState, useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { S, T } from "../tokens";
import { pill, glass, inputStyle, btnPrimary } from "../styles";
import { geocodeBatch, geocodePlace } from "../utils/geocode";

const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];

const createIcon = (idx, color) => L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff">${idx + 1}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

const searchIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#4ECDC4;color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid #fff">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
});

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds?.isValid()) map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [bounds, map]);
  return null;
}

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 15, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function MapTab({ trip, updateTrip }) {
  const [selectedDay, setSelectedDay] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [addToDay, setAddToDay] = useState(null);

  const dayData = useMemo(() => {
    return trip.days.map((day, di) => ({
      day,
      di,
      color: DAY_COLORS[di % DAY_COLORS.length],
      items: day.items.filter(it => it.lat && it.lng),
    }));
  }, [trip.days]);

  const hasAnyCoords = dayData.some(d => d.items.length > 0);
  const missingCoords = trip.days.some(d => d.items.some(it => !it.lat));

  const visibleDays = selectedDay === -1 ? dayData : dayData.filter(d => d.di === selectedDay);
  const allPoints = visibleDays.flatMap(d => d.items.map(it => [it.lat, it.lng]));

  const bounds = allPoints.length > 1 ? L.latLngBounds(allPoints) : null;
  const center = allPoints.length === 1 ? allPoints[0] : searchResult ? [searchResult.lat, searchResult.lng] : [35.6812, 139.7671]; // default: Tokyo
  const zoom = allPoints.length === 1 ? 14 : 12;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const result = await geocodePlace(searchQuery.trim());
    if (result) {
      setSearchResult({ ...result, name: searchQuery.trim() });
    }
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

  const handleAddToDay = (dayIdx) => {
    if (!searchResult) return;
    const nextDays = [...trip.days];
    const newItem = {
      time: "00:00",
      text: searchResult.name,
      type: "activity",
      lat: searchResult.lat,
      lng: searchResult.lng,
    };
    nextDays[dayIdx] = { ...nextDays[dayIdx], items: [...nextDays[dayIdx].items, newItem] };
    updateTrip({ days: nextDays });
    setSearchResult(null);
    setSearchQuery("");
    setAddToDay(null);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      {/* Search bar */}
      <div style={{ display: "flex", gap: S.sm }}>
        <input
          style={{ ...inputStyle, flex: 1, fontSize: 12 }}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="장소 검색 (예: 신주쿠교엔, 하코네신사...)"
          onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
        />
        <button
          style={{ ...pill(true), flexShrink: 0, padding: `${S.sm}px ${S.md}px` }}
          onClick={handleSearch}
          disabled={searching}
        >{searching ? "..." : "검색"}</button>
      </div>

      {/* Geocode all button */}
      {missingCoords && (
        <button
          style={{ ...glass, width: "100%", padding: `${S.sm}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, border: `1.5px solid ${T.mint}33`, cursor: "pointer", borderRadius: T.rSm }}
          onClick={handleGeocodeAll}
          disabled={geocoding}
        >
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "left" }}>
            {geocoding ? "장소를 찾는 중... (잠시 기다려주세요)" : "모든 일정의 장소 자동 찾기"}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.mint }}>{geocoding ? "⏳" : "실행"}</span>
        </button>
      )}

      {/* Day filter */}
      <div style={{ display: "flex", gap: S.xs, overflow: "auto", paddingBottom: S.xs }}>
        <button style={{ ...pill(selectedDay === -1), fontSize: 11, flexShrink: 0 }} onClick={() => setSelectedDay(-1)}>전체</button>
        {trip.days.map((day, di) => (
          <button key={di} style={{ ...pill(selectedDay === di), fontSize: 11, flexShrink: 0, borderLeft: selectedDay !== di ? `3px solid ${DAY_COLORS[di % DAY_COLORS.length]}` : "none" }} onClick={() => setSelectedDay(di)}>
            D{di + 1}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.glassBorder}`, boxShadow: T.shadow }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: 400, width: "100%" }}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          dragging={true}
        >
          <ZoomControl position="bottomright" />
          {bounds ? <FitBounds bounds={bounds} /> : allPoints.length === 1 ? <FlyTo center={allPoints[0]} zoom={14} /> : null}
          {searchResult && <FlyTo center={[searchResult.lat, searchResult.lng]} zoom={15} />}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Search result marker */}
          {searchResult && (
            <Marker position={[searchResult.lat, searchResult.lng]} icon={searchIcon}>
              <Popup>
                <div style={{ fontSize: 12, fontWeight: 600, minWidth: 160, lineHeight: 1.6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{searchResult.name}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {trip.days.map((d, di) => (
                      <button key={di} onClick={() => handleAddToDay(di)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 6, border: `1px solid ${DAY_COLORS[di % DAY_COLORS.length]}`, background: "white", color: DAY_COLORS[di % DAY_COLORS.length], cursor: "pointer", fontWeight: 600 }}>
                        + D{di + 1} {d.title}에 추가
                      </button>
                    ))}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${searchResult.lat},${searchResult.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: "#4ECDC4", textDecoration: "none", fontWeight: 600, display: "block", marginTop: 4 }}
                  >📍 구글맵에서 보기</a>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Day markers and routes */}
          {visibleDays.map(({ day, di, color, items }) => (
            <span key={di}>
              {items.map((it, i) => (
                <Marker key={`${di}-${i}`} position={[it.lat, it.lng]} icon={createIcon(i, color)}>
                  <Popup>
                    <div style={{ fontSize: 12, fontWeight: 600, minWidth: 160, lineHeight: 1.6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>Day {di + 1} · {day.title}</div>
                      <div>{it.time} {it.text}</div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 11, color: "#4ECDC4", textDecoration: "none", fontWeight: 600 }}
                      >📍 구글맵에서 보기</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {items.length > 1 && (
                <Polyline
                  positions={items.map(it => [it.lat, it.lng])}
                  pathOptions={{ color, weight: 3, opacity: 0.7, dashArray: "8 6" }}
                />
              )}
            </span>
          ))}
        </MapContainer>
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
