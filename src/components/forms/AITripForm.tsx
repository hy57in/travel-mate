import { useState } from "react";
import { S, T } from "../../tokens";
import { pill, inputStyle, btnPrimary } from "../../styles";
import useAI from "../../hooks/useAI";
import type { Day } from "../../types";

interface AITripFormProps {
  onGenerate: (result: { days: Day[] }) => void;
}

const STYLES = [
  { v: "balanced", l: "균형", emoji: "⚖️" },
  { v: "food", l: "맛집", emoji: "🍽️" },
  { v: "sightseeing", l: "관광", emoji: "📸" },
  { v: "activity", l: "액티비티", emoji: "🎯" },
  { v: "relaxing", l: "힐링", emoji: "🧘" },
];

export default function AITripForm({ onGenerate }: AITripFormProps) {
  const [dest, setDest] = useState("");
  const [days, setDays] = useState("3");
  const [trav, setTrav] = useState("2");
  const [style, setStyle] = useState("balanced");
  const { generate, loading, error } = useAI();

  const handleGenerate = async () => {
    const result = await generate({
      destination: dest,
      days: Number(days),
      travelers: Number(trav),
      style: STYLES.find(s => s.v === style)?.l || style,
    });
    if (result?.days) onGenerate(result);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.5 }}>
        목적지와 일수를 입력하면 AI가 일정을 생성합니다.
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>목적지</label>
        <input style={inputStyle} value={dest} onChange={e => setDest(e.target.value)} placeholder="도쿄, 오사카, 방콕..." />
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>일수</label>
          <input type="number" style={inputStyle} value={days} onChange={e => setDays(e.target.value)} min="1" max="14" />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>인원</label>
          <input type="number" style={inputStyle} value={trav} onChange={e => setTrav(e.target.value)} min="1" />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>여행 스타일</label>
        <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>
          {STYLES.map(s => (
            <button key={s.v} style={{ ...pill(style === s.v), fontSize: 11, padding: `${S.sm}px ${S.md}px` }} onClick={() => setStyle(s.v)}>
              {s.emoji} {s.l}
            </button>
          ))}
        </div>
      </div>
      {error && <div style={{ fontSize: 11, color: T.danger, padding: `${S.sm}px ${S.md}px`, background: T.coralLight, borderRadius: T.rSm }}>{error}</div>}
      <button
        style={btnPrimary}
        disabled={!dest || !days || loading}
        onClick={handleGenerate}
      >
        {loading ? "✨ AI가 일정을 만들고 있어요..." : "✨ AI 일정 생성"}
      </button>
    </div>
  );
}
