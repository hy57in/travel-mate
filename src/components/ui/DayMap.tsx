import { MapContainer, TileLayer, Marker, Polyline, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { S, T } from "../../tokens";
import type { ItineraryItem } from "../../types";

interface DayMapProps {
  items: ItineraryItem[];
}

const createIcon = (idx: number) => L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#F47B6E,#FFAD6B);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff">${idx + 1}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

export default function DayMap({ items }: DayMapProps) {
  const withCoords = items.filter(it => it.lat && it.lng);
  if (withCoords.length === 0) return null;

  const points: [number, number][] = withCoords.map(it => [it.lat!, it.lng!]);

  const isSingle = points.length === 1;
  const mapProps = isSingle
    ? { center: points[0], zoom: 14 }
    : { bounds: L.latLngBounds(points), boundsOptions: { padding: [40, 40] as [number, number] } };

  return (
    <div style={{ borderRadius: T.rSm, overflow: "hidden", marginBottom: S.md, border: `1px solid ${T.glassBorder}` }}>
      <MapContainer
        {...mapProps}
        style={{ height: 220, width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        dragging={true}
      >
        <ZoomControl position="bottomright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {withCoords.map((it, i) => (
          <Marker key={i} position={[it.lat!, it.lng!]} icon={createIcon(i)}>
            <Popup>
              <div style={{ fontSize: 12, fontWeight: 600, minWidth: 140, lineHeight: 1.5 }}>
                <div><span style={{ color: "#F47B6E", fontWeight: 800 }}>{i + 1}.</span> {it.text}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{it.time}</div>
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
        {points.length > 1 && (
          <Polyline positions={points} pathOptions={{ color: "#F47B6E", weight: 3, opacity: 0.7, dashArray: "8 6" }} />
        )}
      </MapContainer>
    </div>
  );
}
