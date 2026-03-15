import { S, T, fmt } from "../../tokens";
import { glass } from "../../styles";

export default function TripRecap({ trip, budgetSummary, checklistSummary }) {
  const totalPlaces = trip.days.reduce((sum, d) => sum + d.items.length, 0);
  const totalDays = trip.days.length;
  const { total, perPerson, confirmedAmount, estimatedAmount } = budgetSummary;
  const { done, total: checkTotal, percent } = checklistSummary;

  const stats = [
    { emoji: "📅", label: "여행 기간", value: `${totalDays}일` },
    { emoji: "📍", label: "방문 장소", value: `${totalPlaces}곳` },
    { emoji: "💰", label: "총 경비", value: `₩${fmt(total)}` },
    { emoji: "👤", label: "1인당", value: `₩${fmt(perPerson)}` },
    { emoji: "✅", label: "준비 완료", value: `${percent}%` },
  ];

  return (
    <div style={{ ...glass, padding: S.xl, overflow: "hidden", position: "relative" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${T.coral}22, ${T.amber}22)` }} />
      <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${T.mint}22, ${T.violet}22)` }} />

      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: S.md }}>
          {trip.emoji} {trip.name} 요약
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: S.md }}>
          {stats.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: S.sm, gridColumn: i === stats.length - 1 && stats.length % 2 !== 0 ? "1 / -1" : undefined }}>
              <div style={{ width: 36, height: 36, borderRadius: T.rSm, background: T.itemBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{s.emoji}</div>
              <div>
                <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div style={{ marginTop: S.lg }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textSoft, marginBottom: S.xs }}>
            <span>확정 ₩{fmt(confirmedAmount)}</span>
            <span>예상 ₩{fmt(estimatedAmount)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: T.divider, overflow: "hidden", display: "flex" }}>
            <div style={{ height: "100%", background: T.mint, width: total > 0 ? `${(confirmedAmount / total) * 100}%` : "0%" }} />
            <div style={{ height: "100%", background: T.amber, width: total > 0 ? `${(estimatedAmount / total) * 100}%` : "0%" }} />
          </div>
        </div>

        {/* Checklist progress */}
        <div style={{ marginTop: S.md }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textSoft, marginBottom: S.xs }}>
            <span>준비 체크리스트</span>
            <span>{done}/{checkTotal}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: T.divider, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.coral}, ${T.amber})`, width: `${percent}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
