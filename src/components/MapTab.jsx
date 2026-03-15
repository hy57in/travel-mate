import { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { S, T } from "../tokens";
import { pill, glass } from "../styles";

const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];

const createIcon = (idx, color) => L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff">${idx + 1}</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

function FitBounds({ bounds }) {
  const map = useMap();
  if (bounds?.isValid()) map.fitBounds(bounds, { padding: [40, 40], animate: true });
  return null;
}

export default function MapTab({ trip }) {
  const [selectedDay, setSelectedDay] = useState(-1); // -1 = all

  const dayData = useMemo(() => {
    return trip.days.map((day, di) => ({
      day,
      di,
      color: DAY_COLORS[di % DAY_COLORS.length],
      items: day.items.filter(it => it.lat && it.lng),
    }));
  }, [trip.days]);

  const visibleDays = selectedDay === -1 ? dayData : dayData.filter(d => d.di === selectedDay);
  const allPoints = visibleDays.flatMap(d => d.items.map(it => [it.lat, it.lng]));

  if (allPoints.length === 0) {
    return (
      <div className="fade-in" style={{ textAlign: "center", padding: `${S.xxl * 2}px 0`, color: T.textMuted }}>
        <div style={{ fontSize: 40, marginBottom: S.md }}>🗺️</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>장소 좌표가 없어요</div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: S.sm }}>일정 탭에서 "📍 장소찾기"를 눌러주세요</div>
      </div>
    );
  }

  const bounds = L.latLngBounds(allPoints);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      {/* Day filter */}
      <div style={{ display: "flex", gap: S.xs, overflow: "auto", paddingBottom: S.xs }}>
        <button style={{ ...pill(selectedDay === -1), fontSize: 11, flexShrink: 0 }} onClick={() => setSelectedDay(-1)}>전체</button>
        {trip.days.map((day, di) => (
          <button key={di} style={{ ...pill(selectedDay === di), fontSize: 11, flexShrink: 0, borderLeft: selectedDay === di ? "none" : `3px solid ${DAY_COLORS[di % DAY_COLORS.length]}` }} onClick={() => setSelectedDay(di)}>
            D{di + 1}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ borderRadius: T.r, overflow: "hidden", border: `1px solid ${T.glassBorder}`, boxShadow: T.shadow }}>
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [40, 40] }}
          style={{ height: 400, width: "100%" }}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          dragging={true}
        >
          <ZoomControl position="bottomright" />
          <FitBounds bounds={L.latLngBounds(allPoints)} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
      <div style={{ ...glass, padding: S.md, display: "flex", flexDirection: "column", gap: S.sm }}>
        {visibleDays.map(({ day, di, color, items }) => (
          <div key={di} style={{ display: "flex", alignItems: "center", gap: S.sm }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>D{di + 1}</span>
            <span style={{ fontSize: 12, color: T.textSoft, flex: 1 }}>{day.title}</span>
            <span style={{ fontSize: 11, color: T.textMuted }}>{items.length}곳</span>
          </div>
        ))}
      </div>
    </div>
  );
}
