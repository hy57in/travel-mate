import { useState, useMemo, useCallback } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { S, T, TYPE_EMOJI } from "../tokens";
import { glass, inputStyle } from "../styles";
import { geocodeBatch, geocodePlace } from "../utils/geocode";
import { MapMarkers } from "./ui/MapOverlays";
import type { Trip } from "../types";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];
const TOKYO = { lat: 35.6812, lng: 139.7671 };

interface MapTabProps {
  trip: Trip;
  updateTrip: (updates: Partial<Trip>) => void;
}

export default function MapTab({ trip, updateTrip }: MapTabProps) {
  const [selectedDay, setSelectedDay] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [selected, setSelected] = useState<{ type: string; di?: number; i?: number; id?: string } | null>(null);

  const dayData = useMemo(() =>
    trip.days.map((day, di) => ({
      day, di,
      color: DAY_COLORS[di % DAY_COLORS.length],
      items: day.items.filter(it => it.lat && it.lng),
    })), [trip.days]);

  const hasAnyCoords = dayData.some(d => d.items.length > 0);
  const missingCoords = trip.days.some(d => d.items.some(it => !it.lat));
  const visibleDays = selectedDay === -1 ? dayData : dayData.filter(d => d.di === selectedDay);

  const selectedItem = selected?.type === "item" && selected.i !== undefined ? visibleDays.find(d => d.di === selected.di)?.items[selected.i] ?? null : null;
  const selectedDayData = selected?.type === "item" ? visibleDays.find(d => d.di === selected.di) ?? null : null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const result = await geocodePlace(searchQuery.trim());
    if (result) { setSearchResult({ ...result, name: searchQuery.trim() }); setSelected({ type: "search" }); }
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

  const handleAddToDay = useCallback((dayIdx: number) => {
    if (!searchResult) return;
    const nextDays = [...trip.days];
    nextDays[dayIdx] = { ...nextDays[dayIdx], items: [...nextDays[dayIdx].items, { time: "00:00", text: searchResult.name, type: "activity", lat: searchResult.lat, lng: searchResult.lng }] };
    updateTrip({ days: nextDays });
    setSearchResult(null);
    setSearchQuery("");
    setSelected(null);
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
      {/* Map */}
      <div style={{ borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.glassBorder}`, boxShadow: T.shadow, position: "relative" }}>
        <APIProvider apiKey={MAPS_KEY} language="ko" region="KR">
          <Map
            defaultCenter={TOKYO} defaultZoom={12}
            style={{ height: 420, width: "100%" }}
            mapId="travel-mate-map"
            gestureHandling="greedy"
            disableDefaultUI={true}
            zoomControl={true}
            onClick={() => setSelected(null)}
          >
            <MapMarkers visibleDays={visibleDays} searchResult={searchResult} onSelect={setSelected} selectedId={selected?.id ?? null} selectedDay={selectedDay} />
          </Map>
        </APIProvider>

        {/* Overlay: search */}
        <div style={{ position: "absolute", top: S.sm, left: S.sm, right: S.sm, display: "flex", gap: S.xs }}>
          <input
            style={{ ...inputStyle, flex: 1, fontSize: 12, background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "none" }}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="장소 검색..." onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
          />
          <button onClick={handleSearch} disabled={searching} style={{ padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, border: "none", background: "rgba(255,255,255,0.95)", fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            {searching ? "..." : "🔍"}
          </button>
        </div>

        {/* Overlay: Day filter */}
        <div style={{ position: "absolute", bottom: S.sm, left: S.sm, right: S.sm, display: "flex", gap: S.xs, overflow: "auto" }}>
          <button style={{ padding: "5px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", flexShrink: 0, background: selectedDay === -1 ? T.coral : "rgba(255,255,255,0.9)", color: selectedDay === -1 ? "#fff" : T.text, boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} onClick={() => { setSelectedDay(-1); setSelected(null); }}>전체</button>
          {trip.days.map((day, di) => (
            <button key={di} onClick={() => { setSelectedDay(di); setSelected(null); }} style={{
              padding: "5px 12px", borderRadius: 50, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "none", flexShrink: 0,
              background: selectedDay === di ? DAY_COLORS[di % DAY_COLORS.length] : "rgba(255,255,255,0.9)",
              color: selectedDay === di ? "#fff" : DAY_COLORS[di % DAY_COLORS.length],
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}>D{di + 1}</button>
          ))}
        </div>
      </div>

      {/* Detail card — item */}
      {selected?.type === "item" && selectedItem && (
        <div className="slide-in" style={{ ...glass, padding: S.lg, display: "flex", alignItems: "center", gap: S.md }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: selectedDayData!.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{selected!.i! + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: selectedDayData!.color }}>Day {selected!.di! + 1} · {selectedDayData!.day.title}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 2 }}>{selectedItem.text}</div>
            <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2 }}>{selectedItem.time} · {TYPE_EMOJI[selectedItem.type] || "📍"}</div>
          </div>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedItem.text)}`} target="_blank" rel="noopener noreferrer" style={{ padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, background: T.coral, color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>구글맵</a>
        </div>
      )}

      {/* Detail card — search result */}
      {selected?.type === "search" && searchResult && (
        <div className="slide-in" style={{ ...glass, padding: S.lg }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: S.sm }}>{searchResult.name}</div>
          <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
            {trip.days.map((d, di) => (
              <button key={di} onClick={() => handleAddToDay(di)} style={{
                padding: `${S.sm}px ${S.md}px`, borderRadius: 50, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${DAY_COLORS[di % DAY_COLORS.length]}`, background: "transparent",
                color: DAY_COLORS[di % DAY_COLORS.length],
              }}>+ D{di + 1}</button>
            ))}
          </div>
        </div>
      )}

      {/* Geocode all */}
      {missingCoords && (
        <button style={{ ...glass, width: "100%", padding: `${S.sm}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, border: `1.5px solid ${T.mint}33`, cursor: "pointer", borderRadius: T.rSm }} onClick={handleGeocodeAll} disabled={geocoding}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "left" }}>{geocoding ? "장소를 찾는 중..." : "모든 일정의 장소 자동 찾기"}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.mint }}>{geocoding ? "⏳" : "실행"}</span>
        </button>
      )}

      {/* Legend */}
      {hasAnyCoords && !selected && (
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
