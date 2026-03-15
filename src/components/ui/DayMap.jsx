import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { S, T, TYPE_EMOJI } from "../../tokens";

// Custom numbered marker
const createIcon = (idx, emoji) => L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#E07460,#E89B52);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff">${idx + 1}</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

export default function DayMap({ items }) {
  const points = items.filter(it => it.lat && it.lng).map(it => [it.lat, it.lng]);
  if (points.length === 0) return null;

  const bounds = L.latLngBounds(points);

  return (
    <div style={{ borderRadius: T.rSm, overflow: "hidden", marginBottom: S.md, border: `1px solid ${T.glassBorder}` }}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        style={{ height: 200, width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {items.filter(it => it.lat && it.lng).map((it, i) => (
          <Marker key={i} position={[it.lat, it.lng]} icon={createIcon(i, TYPE_EMOJI[it.type])}>
            <Popup>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{it.time} {it.text}</div>
            </Popup>
          </Marker>
        ))}
        {points.length > 1 && (
          <Polyline positions={points} pathOptions={{ color: "#E07460", weight: 3, opacity: 0.7, dashArray: "8 6" }} />
        )}
      </MapContainer>
    </div>
  );
}
