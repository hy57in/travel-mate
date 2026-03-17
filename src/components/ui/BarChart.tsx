import { S, T, fmt } from "../../tokens";

const DAY_COLORS = ["#F47B6E", "#FFAD6B", "#4ECDC4", "#8B5CF6", "#2B2D42", "#FF6B6B", "#38D9A9"];

interface BarChartProps {
  days: Array<{ items: unknown[] }>;
  expenses: Array<{ day?: number | null; amt: number }>;
}

interface DayTotal {
  label: string;
  amt: number;
  color: string;
}

export default function BarChart({ days, expenses }: BarChartProps) {
  const dayTotals: DayTotal[] = days.map((d, i) => ({
    label: `D${i + 1}`,
    amt: expenses.filter(e => e.day === i).reduce((s, e) => s + e.amt, 0),
    color: DAY_COLORS[i % DAY_COLORS.length],
  }));
  const commonAmt = expenses.filter(e => e.day == null).reduce((s, e) => s + e.amt, 0);
  if (commonAmt > 0) dayTotals.push({ label: "공통", amt: commonAmt, color: T.textMuted });

  const maxAmt = Math.max(...dayTotals.map(d => d.amt), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: S.sm, height: 100, padding: `0 ${S.xs}px` }}>
      {dayTotals.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: S.xs }}>
          <span style={{ fontSize: 9, color: T.textMuted, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {d.amt > 0 ? `${Math.round(d.amt / 10000)}만` : ""}
          </span>
          <div style={{
            width: "100%", maxWidth: 32, borderRadius: `${S.xs}px ${S.xs}px 0 0`,
            background: d.color, height: `${Math.max((d.amt / maxAmt) * 70, 4)}px`,
            transition: "height 0.3s ease",
          }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: T.textSoft }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}
