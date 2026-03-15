import { useState } from "react";
import { S, T, EC, CAT, fmt, toY, toK } from "../../tokens";
import { pill, inputStyle, btnPrimary } from "../../styles";
import ToggleSwitch from "../ui/ToggleSwitch";

export default function AddExpForm({ rate, days, travelerNames, onAdd }) {
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [yen, setYen] = useState("");
  const [cat, setCat] = useState("식비");
  const [ok, setOk] = useState(false);
  const [mode, setMode] = useState("krw");
  const [day, setDay] = useState(null);
  const [paidBy, setPaidBy] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>항목명</label>
        <input style={inputStyle} placeholder="라멘 점심" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.sm }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft }}>금액</label>
          <button style={{ ...pill(mode === "krw"), fontSize: 10 }} onClick={() => setMode("krw")}>₩</button>
          <button style={{ ...pill(mode === "yen"), fontSize: 10 }} onClick={() => setMode("yen")}>¥</button>
        </div>
        {mode === "krw"
          ? <input type="number" style={inputStyle} placeholder="10000" value={amt} onChange={e => { setAmt(e.target.value); setYen(String(toY(Number(e.target.value), rate))); }} />
          : <input type="number" style={inputStyle} placeholder="1000" value={yen} onChange={e => { setYen(e.target.value); setAmt(String(toK(Number(e.target.value), rate))); }} />
        }
        {amt && <div style={{ fontSize: 10, color: T.textMuted, marginTop: S.xs }}>₩{fmt(Number(amt))} ≈ ¥{fmt(toY(Number(amt), rate))}</div>}
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        {EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11 }} onClick={() => setCat(c)}>{(CAT[c]||{}).emoji} {c}</button>)}
      </div>
      {days?.length > 0 && (
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>Day 태그</label>
          <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
            <button style={{ ...pill(day === null), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(null)}>공통</button>
            {days.map((d, i) => <button key={i} style={{ ...pill(day === i), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(i)}>D{i + 1}</button>)}
          </div>
        </div>
      )}
      {travelerNames?.length > 1 && (
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>결제자</label>
          <div style={{ display: "flex", gap: S.xs }}>
            {travelerNames.map((n, i) => <button key={i} style={{ ...pill(paidBy === i), fontSize: 11, padding: "4px 10px" }} onClick={() => setPaidBy(i)}>{n}</button>)}
          </div>
        </div>
      )}
      <label style={{ display: "flex", alignItems: "center", gap: S.sm, fontSize: 12, color: T.textSoft }}>
        <ToggleSwitch checked={ok} onCheckedChange={setOk} />확정 비용
      </label>
      <button style={btnPrimary} disabled={!name || (!amt && !yen)} onClick={() => onAdd({ name, amt: Number(amt), cat, ok, day, paidBy })}>추가하기</button>
    </div>
  );
}
