import { useState } from "react";
import { S, EC, toY, toK } from "../../tokens";
import { pill, inputStyle, btnPrimary, btnOutline } from "../../styles";
import type { Expense, Day } from "../../types";

interface ExpInlineProps {
  e: Expense;
  rate: number;
  days: Day[];
  travelerNames: string[];
  onSave: (upd: Partial<Expense>) => void;
  onCancel: () => void;
}

export default function ExpInline({ e, rate, days, travelerNames, onSave, onCancel }: ExpInlineProps) {
  const [name, setName] = useState(e.name);
  const [amt, setAmt] = useState(String(e.amt));
  const [yen, setYen] = useState(String(toY(e.amt, rate)));
  const [cat, setCat] = useState(e.cat);
  const [mode, setMode] = useState("krw");
  const [day, setDay] = useState(e.day ?? null);
  const [paidBy, setPaidBy] = useState(e.paidBy ?? 0);

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
      {days?.length > 0 && (
        <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
          <button style={{ ...pill(day === null), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(null)}>공통</button>
          {days.map((d, i) => <button key={i} style={{ ...pill(day === i), fontSize: 11, padding: "4px 10px" }} onClick={() => setDay(i)}>D{i + 1}</button>)}
        </div>
      )}
      {travelerNames?.length > 1 && (
        <div style={{ display: "flex", gap: S.xs }}>
          {travelerNames.map((n, i) => <button key={i} style={{ ...pill(paidBy === i), fontSize: 11, padding: "4px 10px" }} onClick={() => setPaidBy(i)}>{n}</button>)}
        </div>
      )}
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={{ ...btnOutline, flex: 1 }} onClick={onCancel}>취소</button>
        <button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave({ name, amt: Number(amt), cat, day, paidBy })}>저장</button>
      </div>
    </div>
  );
}
