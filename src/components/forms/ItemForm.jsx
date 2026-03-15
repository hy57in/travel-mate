import { useState } from "react";
import { S, T, TYPES } from "../../tokens";
import { pill, inputStyle, btnPrimary } from "../../styles";

export default function ItemForm({ item, onSave, onDelete }) {
  const [time, setTime] = useState(item?.time || "");
  const [text, setText] = useState(item?.text || "");
  const [type, setType] = useState(item?.type || "activity");
  const [url, setUrl] = useState(item?.url || "");
  const [lat, setLat] = useState(item?.lat || null);
  const [lng, setLng] = useState(item?.lng || null);
  const [hl, setHl] = useState(item?.hl || false);
  const [skip, setSkip] = useState(item?.skip || false);
  const [pend, setPend] = useState(item?.pend || false);
  const [searching, setSearching] = useState(false);

  const searchPlace = () => {
    const query = text.replace(/[#\d]+$/, "").trim();
    if (!query) return;
    setSearching(true);
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " Tokyo Japan")}&format=json&limit=1`, {
      headers: { "Accept-Language": "ko" },
    })
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          setLat(Number(data[0].lat));
          setLng(Number(data[0].lon));
        }
      })
      .catch(() => {})
      .finally(() => setSearching(false));
  };

  const statusPill = (active, label, color) => ({
    padding: `${S.sm}px ${S.md}px`, borderRadius: 50, fontSize: 12, fontWeight: 600,
    cursor: "pointer", border: active ? `1.5px solid ${color}` : `1.5px solid ${T.inputBorder}`,
    background: active ? color : "transparent",
    color: active ? "#fff" : T.textSoft,
    transition: "all 0.15s", flex: 1, textAlign: "center",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md, marginTop: S.md }}>
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ width: 80 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>시간</label>
          <input style={inputStyle} value={time} onChange={e => setTime(e.target.value)} placeholder="09:00" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>내용</label>
          <input style={inputStyle} value={text} onChange={e => setText(e.target.value)} placeholder="장소/활동" />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>장소 링크</label>
        <input style={inputStyle} value={url} onChange={e => setUrl(e.target.value)} placeholder="구글맵 또는 장소 URL" />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.xs }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft }}>📍 지도 위치</label>
          <button
            style={{ ...pill(false), fontSize: 10, padding: "3px 10px", border: `1.5px solid ${T.mint}`, color: T.mint }}
            onClick={searchPlace}
            disabled={searching || !text}
          >
            {searching ? "검색중..." : lat ? "재검색" : "장소 검색"}
          </button>
        </div>
        {lat ? (
          <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
            <span style={{ fontSize: 11, color: T.textSoft, flex: 1 }}>📍 {lat.toFixed(4)}, {lng.toFixed(4)}</span>
            <button style={{ background: "none", border: "none", fontSize: 11, color: T.textMuted, cursor: "pointer" }} onClick={() => { setLat(null); setLng(null); }}>삭제</button>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: T.textMuted }}>내용 입력 후 "장소 검색"을 누르면 지도에 표시됩니다</div>
        )}
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>유형</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: S.xs }}>
          {TYPES.map(t => (
            <button key={t.v} style={{ ...pill(type === t.v), fontSize: 11, padding: `${S.sm}px ${S.xs}px`, textAlign: "center" }} onClick={() => setType(t.v)}>
              {t.emoji} {t.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>상태</label>
        <div style={{ display: "flex", gap: S.sm }}>
          <button style={statusPill(hl, "핵심", T.coral)} onClick={() => { setHl(!hl); if (!hl) { setSkip(false); setPend(false); } }}>핵심</button>
          <button style={statusPill(skip, "스킵", T.textMuted)} onClick={() => { setSkip(!skip); if (!skip) { setHl(false); setPend(false); } }}>스킵</button>
          <button style={statusPill(pend, "미정", T.amber)} onClick={() => { setPend(!pend); if (!pend) { setHl(false); setSkip(false); } }}>미정</button>
        </div>
      </div>
      <button style={btnPrimary} disabled={!time || !text} onClick={() => onSave({ time, text, type, url: url || undefined, lat: lat || undefined, lng: lng || undefined, hl, skip, pend })}>
        {item ? "수정" : "추가"}
      </button>
      {onDelete && (
        <button style={{ background: "none", border: "none", fontSize: 12, color: T.danger, cursor: "pointer", textAlign: "center" }} onClick={onDelete}>
          삭제하기
        </button>
      )}
    </div>
  );
}
