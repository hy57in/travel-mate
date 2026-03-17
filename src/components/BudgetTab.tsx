import { S, T, EC, CAT, fmt, toY } from "../tokens";
import { glass, pill, btnOutline } from "../styles";
import Donut from "./ui/Donut";
import Empty from "./ui/Empty";
import ExpInline from "./forms/ExpInline";
import BarChart from "./ui/BarChart";
import { Trip, Expense, DonutDataItem, SettlementItem, DialogState, ConfirmDeleteState } from "../types";

interface BudgetTabProps {
  trip: Trip;
  expenseFilter: string;
  setExpenseFilter: (f: string) => void;
  filteredExpenses: Expense[];
  confirmedAmount: number;
  estimatedAmount: number;
  total: number;
  perPerson: number;
  categoryTotals: Record<string, number>;
  donutData: DonutDataItem[];
  settlement: SettlementItem[];
  editingExpenseId: number | null;
  setEditingExpenseId: (id: number | null) => void;
  setDialog: (d: DialogState) => void;
  setConfirmDelete: (d: ConfirmDeleteState | null) => void;
  updateTrip: (updates: Partial<Trip>) => void;
  exportCSV: () => void;
}

export default function BudgetTab({
  trip, expenseFilter, setExpenseFilter, filteredExpenses, confirmedAmount, estimatedAmount, total, perPerson,
  categoryTotals, donutData, settlement, editingExpenseId, setEditingExpenseId,
  setDialog, setConfirmDelete, updateTrip, exportCSV,
}: BudgetTabProps) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
      {/* Summary card */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo}, ${T.budgetGrad})`, borderRadius: T.r, padding: S.xl, color: "#fff", boxShadow: T.shadowLg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>총 예상 경비</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: S.xs, fontVariantNumeric: "tabular-nums" }}>₩{fmt(total)}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: S.xs }}>¥{fmt(toY(total, trip.rate))}</div>
          </div>
          <Donut data={donutData} size={72} />
        </div>
        <div style={{ display: "flex", gap: S.lg, marginTop: S.md, fontSize: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.mint, display: "inline-block" }} />확정 ₩{fmt(confirmedAmount)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.amber, display: "inline-block" }} />예상 ₩{fmt(estimatedAmount)}</span>
        </div>
        <div style={{ marginTop: S.md, background: "rgba(255,255,255,0.12)", borderRadius: S.sm, padding: `${S.sm}px ${S.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>1인당</span>
          <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>₩{fmt(perPerson)}</span>
        </div>
      </div>

      {/* Category legend */}
      <div style={{ display: "flex", gap: S.sm, overflow: "hidden" }}>
        {Object.entries(categoryTotals).map(([c, a]) => {
          const ct = CAT[c] || CAT["기타"];
          const pct = total > 0 ? Math.round((a / total) * 100) : 0;
          return <span key={c} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ct.bg, color: ct.color, border: `1px solid ${ct.color}22`, whiteSpace: "nowrap" }}>{ct.emoji} {c} {pct}%</span>;
        })}
      </div>

      {/* Day별 경비 차트 */}
      {trip.days.length > 0 && trip.expenses.length > 0 && (
        <div style={{ ...glass, padding: S.lg }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: S.sm }}>📊 Day별 경비</div>
          <BarChart days={trip.days} expenses={trip.expenses} />
        </div>
      )}

      {/* Day별 소계 */}
      {trip.days.length > 0 && (() => {
        const dayTotals = trip.days.map((d, i) => ({
          label: `D${i + 1}`,
          title: d.title,
          amt: trip.expenses.filter(e => e.day === i).reduce((s, e) => s + e.amt, 0),
        }));
        const commonAmt = trip.expenses.filter(e => e.day == null).reduce((s, e) => s + e.amt, 0);
        return (
          <div style={{ ...glass, padding: S.lg }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: S.sm }}>📊 Day별 경비</div>
            <div style={{ display: "flex", flexDirection: "column", gap: S.xs }}>
              {dayTotals.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: `${S.xs}px 0` }}>
                  <span style={{ color: T.textSoft }}><span style={{ fontWeight: 700, color: T.coral }}>{d.label}</span> {d.title}</span>
                  <span style={{ fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums" }}>₩{fmt(d.amt)}</span>
                </div>
              ))}
              {commonAmt > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: `${S.xs}px 0`, borderTop: `1px solid ${T.glassBorder}`, marginTop: S.xs }}>
                  <span style={{ color: T.textSoft }}><span style={{ fontWeight: 700, color: T.indigo }}>공통</span> 미배정</span>
                  <span style={{ fontWeight: 700, color: T.text, fontVariantNumeric: "tabular-nums" }}>₩{fmt(commonAmt)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Settlement */}
      {settlement?.length > 1 && (() => {
        const overpaid = settlement.filter(s => s.diff > 0);
        const underpaid = settlement.filter(s => s.diff < 0);
        return (
          <div style={{ ...glass, padding: S.lg }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: S.sm }}>💸 정산</div>
            <div style={{ display: "flex", flexDirection: "column", gap: S.xs }}>
              {settlement.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: `${S.xs}px 0` }}>
                  <span style={{ color: T.textSoft }}>{s.name}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    <span style={{ color: T.textMuted, marginRight: S.sm }}>지출 ₩{fmt(s.paid)}</span>
                    <span style={{ fontWeight: 700, color: s.diff > 0 ? T.mint : s.diff < 0 ? T.coral : T.text }}>
                      {s.diff > 0 ? `+₩${fmt(s.diff)}` : s.diff < 0 ? `-₩${fmt(Math.abs(s.diff))}` : "±0"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            {overpaid.length > 0 && underpaid.length > 0 && (
              <div style={{ marginTop: S.sm, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, background: T.mintLight, fontSize: 12, fontWeight: 600, color: T.mint, textAlign: "center" }}>
                {underpaid.map(u => `${u.name}`).join(", ")} → {overpaid.map(o => `${o.name}`).join(", ")}에게 ₩{fmt(Math.abs(underpaid[0].diff))} 보내기
              </div>
            )}
          </div>
        );
      })()}

      {/* Filter + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>
          {["전체", ...EC].map(c => <button key={c} style={pill(expenseFilter === c)} onClick={() => setExpenseFilter(c)}>{c}</button>)}
        </div>
        <div style={{ display: "flex", gap: S.sm, flexShrink: 0 }}>
          <button onClick={exportCSV} style={{ ...btnOutline, padding: "6px 10px", fontSize: 12 }}>📥</button>
          <button onClick={() => setDialog({ type: "addExp" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral }}>＋ 추가</button>
        </div>
      </div>

      {/* Expense list */}
      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {filteredExpenses.map(e => {
          const ct = CAT[e.cat] || CAT["기타"];
          if (editingExpenseId === e.id) {
            return (
              <div key={e.id} style={{ ...glass, padding: S.lg }}>
                <ExpInline
                  e={e}
                  rate={trip.rate}
                  days={trip.days}
                  travelerNames={trip.travelerNames}
                  onSave={upd => { updateTrip({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ...upd } : x) }); setEditingExpenseId(null); }}
                  onCancel={() => setEditingExpenseId(null)}
                />
              </div>
            );
          }
          return (
            <div key={e.id} style={{ ...glass, padding: `${S.sm}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, borderLeft: `3px solid ${ct.color}`, cursor: "pointer", transition: "background 0.15s" }} onClick={() => setEditingExpenseId(e.id)}>
              <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", flexShrink: 0, padding: 0 }} onClick={ev => { ev.stopPropagation(); updateTrip({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ok: !x.ok } : x) }); }}>
                {e.ok ? "✅" : "⭕"}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.xs }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: S.xs, marginTop: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 6, background: ct.bg, color: ct.color, border: `1px solid ${ct.color}22`, flexShrink: 0 }}>{ct.emoji} {e.cat}</span>
                  {e.day != null && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: T.coralLight, color: T.coral, flexShrink: 0 }}>D{e.day + 1}</span>}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>₩{fmt(e.amt)}</div>
                <div style={{ fontSize: 9, color: T.textMuted }}>¥{fmt(toY(e.amt, trip.rate))}</div>
              </div>
            </div>
          );
        })}
      </div>
      {!filteredExpenses.length && <Empty emoji="💰" text="경비가 없어요" action="＋ 추가" onAction={() => setDialog({ type: "addExp" })} />}
    </div>
  );
}
