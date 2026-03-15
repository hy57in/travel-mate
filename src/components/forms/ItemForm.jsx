import { useState } from "react";
import { S, T, TYPES } from "../../tokens";
import { pill, inputStyle, btnPrimary, btnOutline } from "../../styles";
import ToggleSwitch from "../ui/ToggleSwitch";

export default function ItemForm({ item, onSave, onDelete }) {
  const [time, setTime] = useState(item?.time || "");
  const [text, setText] = useState(item?.text || "");
  const [type, setType] = useState(item?.type || "activity");
  const [url, setUrl] = useState(item?.url || "");
  const [hl, setHl] = useState(item?.hl || false);
  const [skip, setSkip] = useState(item?.skip || false);
  const [pend, setPend] = useState(item?.pend || false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
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
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>📍 장소 링크</label>
        <input style={inputStyle} value={url} onChange={e => setUrl(e.target.value)} placeholder="구글맵 또는 장소 URL" />
      </div>
      <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
        {TYPES.map(t => (
          <button key={t.v} style={{ ...pill(type === t.v), fontSize: 12, padding: "5px 10px" }} onClick={() => setType(t.v)}>
            {t.emoji} {t.l}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: S.lg, fontSize: 12, color: T.textSoft }}>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={hl} onCheckedChange={setHl} />핵심</label>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={skip} onCheckedChange={setSkip} />스킵</label>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={pend} onCheckedChange={setPend} />미정</label>
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={{ ...btnPrimary, flex: 1 }} disabled={!time || !text} onClick={() => onSave({ time, text, type, url: url || undefined, hl, skip, pend })}>
          {item ? "수정" : "추가"}
        </button>
        {onDelete && <button style={{ ...btnOutline, color: "#EF4444", borderColor: "#FCA5A5" }} onClick={onDelete}>삭제</button>}
      </div>
    </div>
  );
}
