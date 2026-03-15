import { useState } from "react";
import { S, EC, toY, toK } from "../../tokens";
import { pill, inputStyle, btnPrimary, btnOutline } from "../../styles";

export default function ExpInline({ e, rate, onSave, onCancel }) {
  const [name, setName] = useState(e.name);
  const [amt, setAmt] = useState(String(e.amt));
  const [yen, setYen] = useState(String(toY(e.amt, rate)));
  const [cat, setCat] = useState(e.cat);
  const [mode, setMode] = useState("krw");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <input style={inputStyle} value={name} onChange={ev => setName(ev.target.value)} />
      <div style={{ display: "flex", gap: S.sm, alignItems: "center" }}>
        <button style={pill(mode === "krw")} onClick={() => setMode("krw")}>₩</button>
        <button style={pill(mode === "yen")} onClick={() => setMode("yen")}>¥</button>
        {mode === "krw"
          ? <input type="number" style={{ ...inputStyle, flex: 1 }} value={amt} onChange={ev => { setAmt(ev.target.value); setYen(String(toY(Number(ev.target.value), rate))); }} />
          : <input type="number" style={{ ...inputStyle, flex: 1 }} value={yen} onChange={ev => { setYen(ev.target.value); setAmt(String(toK(Number(ev.target.value), rate))); }} />
        }
      </div>
      <div style={{ display: "flex", gap: S.xs }}>
        {EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave({ name, amt: Number(amt), cat })}>저장</button>
        <button style={{ ...btnOutline, flex: 0 }} onClick={onCancel}>취소</button>
      </div>
    </div>
  );
}
