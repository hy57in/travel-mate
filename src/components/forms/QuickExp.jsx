import { useState, useEffect, useRef } from "react";
import { S, T, EC, CAT, fmt, toY, toK } from "../../tokens";
import { pill, inputStyle, btnPrimary } from "../../styles";

export default function QuickExp({ rate, days, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [val, setVal] = useState("");
  const [mode, setMode] = useState("yen");
  const [cat, setCat] = useState("식비");
  const [day, setDay] = useState(null);
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (!name || !val) return;
    onAdd({ name, amt: mode === "yen" ? toK(Number(val), rate) : Number(val), cat, ok: true, day });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>⚡ 빠른 입력</span>
        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} onClick={onClose}>✕</button>
      </div>
      <input ref={ref} style={inputStyle} placeholder="뭐 샀어요?" value={name} onChange={e => setName(e.target.value)} />
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={pill(mode === "yen")} onClick={() => setMode("yen")}>¥ 엔</button>
        <button style={pill(mode === "krw")} onClick={() => setMode("krw")}>₩ 원</button>
        <input type="number" style={{ ...inputStyle, flex: 1 }} placeholder="금액" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
      </div>
      {val && (
        <div style={{ fontSize: 11, color: T.textSoft, marginTop: -S.xs }}>
          {mode === "yen" ? `≈ ₩${fmt(toK(Number(val), rate))}` : `≈ ¥${fmt(toY(Number(val), rate))}`}
        </div>
      )}
      <div style={{ display: "flex", gap: S.xs }}>
        {EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{(CAT[c]||{}).emoji} {c}</button>)}
      </div>
      {days?.length > 0 && (
        <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
          <button style={{ ...pill(day === null), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(null)}>공통</button>
          {days.map((d, i) => <button key={i} style={{ ...pill(day === i), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(i)}>D{i + 1}</button>)}
        </div>
      )}
      <button style={btnPrimary} disabled={!name || !val} onClick={submit}>추가</button>
    </div>
  );
}
