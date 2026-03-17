import { useState } from "react";
import { S, T, CC } from "../../tokens";
import { pill, inputStyle, btnPrimary } from "../../styles";

interface AddChkFormProps {
  onAdd: (item: { text: string; cat: string }) => void;
}

export default function AddChkForm({ onAdd }: AddChkFormProps) {
  const [text, setText] = useState("");
  const [cat, setCat] = useState("준비");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>할 일</label>
        <input style={inputStyle} placeholder="여행자보험" value={text} onChange={e => setText(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        {CC.filter(c => c !== "전체").map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11 }} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <button style={btnPrimary} disabled={!text} onClick={() => onAdd({ text, cat })}>추가하기</button>
    </div>
  );
}
