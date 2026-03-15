import { S, T, EC, CAT, fmt, toY } from "../tokens";
import { glass, pill, btnOutline } from "../styles";
import Donut from "./ui/Donut";
import Empty from "./ui/Empty";
import ExpInline from "./forms/ExpInline";

export default function BudgetTab({
  trip, exF, setExF, fExp, okAmt, estAmt, tot, pp,
  catT, donutData, editExp, setEditExp,
  setDlg, setConfirmDel, ut, exportCSV,
}) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
      {/* Summary card */}
      <div style={{ background: `linear-gradient(135deg, ${T.indigo}, ${T.budgetGrad})`, borderRadius: T.r, padding: S.xl, color: "#fff", boxShadow: T.shadowLg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>총 예상 경비</div>
            <div style={{ fontSize: 26, fontWeight: 800, marginTop: S.xs, fontVariantNumeric: "tabular-nums" }}>₩{fmt(tot)}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: S.xs }}>¥{fmt(toY(tot, trip.rate))}</div>
          </div>
          <Donut data={donutData} size={72} />
        </div>
        <div style={{ display: "flex", gap: S.lg, marginTop: S.md, fontSize: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.mint, display: "inline-block" }} />확정 ₩{fmt(okAmt)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.amber, display: "inline-block" }} />예상 ₩{fmt(estAmt)}</span>
        </div>
        <div style={{ marginTop: S.md, background: "rgba(255,255,255,0.12)", borderRadius: S.sm, padding: `${S.sm}px ${S.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>1인당</span>
          <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>₩{fmt(pp)}</span>
        </div>
      </div>

      {/* Category legend */}
      <div style={{ display: "flex", gap: S.sm, overflow: "hidden" }}>
        {Object.entries(catT).map(([c, a]) => {
          const ct = CAT[c] || CAT["기타"];
          const pct = tot > 0 ? Math.round((a / tot) * 100) : 0;
          return <span key={c} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ct.bg, color: ct.color, whiteSpace: "nowrap" }}>{ct.emoji} {c} {pct}%</span>;
        })}
      </div>

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

      {/* Filter + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>
          {["전체", ...EC].map(c => <button key={c} style={pill(exF === c)} onClick={() => setExF(c)}>{c}</button>)}
        </div>
        <div style={{ display: "flex", gap: S.sm, flexShrink: 0 }}>
          <button onClick={exportCSV} style={{ ...btnOutline, padding: "6px 10px", fontSize: 12 }}>📥</button>
          <button onClick={() => setDlg({ type: "addExp" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral }}>＋ 추가</button>
        </div>
      </div>

      {/* Expense list */}
      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {fExp.map(e => {
          const ct = CAT[e.cat] || CAT["기타"];
          if (editExp === e.id) {
            return (
              <div key={e.id} style={{ ...glass, padding: S.lg }}>
                <ExpInline
                  e={e}
                  rate={trip.rate}
                  days={trip.days}
                  onSave={upd => { ut({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ...upd } : x) }); setEditExp(null); }}
                  onCancel={() => setEditExp(null)}
                />
              </div>
            );
          }
          return (
            <div key={e.id} style={{ ...glass, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, borderLeft: `4px solid ${ct.color}`, cursor: "pointer" }} onClick={() => setEditExp(e.id)}>
              <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0 }} onClick={ev => { ev.stopPropagation(); ut({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ok: !x.ok } : x) }); }}>
                {e.ok ? "✅" : "⭕"}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: ct.bg, color: ct.color, flexShrink: 0 }}>{ct.emoji} {e.cat}</span>
                  {e.day != null && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: T.coralLight, color: T.coral, flexShrink: 0 }}>D{e.day + 1}</span>}
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>₩{fmt(e.amt)}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>¥{fmt(toY(e.amt, trip.rate))}</div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted, flexShrink: 0 }} onClick={ev => { ev.stopPropagation(); setConfirmDel({ msg: `"${e.name}" 삭제?`, onOk: () => ut({ expenses: trip.expenses.filter(x => x.id !== e.id) }) }); }}>🗑</button>
            </div>
          );
        })}
      </div>
      {!fExp.length && <Empty emoji="💰" text="경비가 없어요" />}
    </div>
  );
}
