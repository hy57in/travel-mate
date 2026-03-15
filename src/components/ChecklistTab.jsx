import { S, T, CC } from "../tokens";
import { glass, pill } from "../styles";
import Empty from "./ui/Empty";
import ChkInline from "./forms/ChkInline";

export default function ChecklistTab({
  trip, ckF, setCkF, fChk, ckDone, ckTot, ckPct,
  editChk, setEditChk, setDlg, setConfirmDel, ut,
}) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
      {/* Progress */}
      <div style={{ ...glass, padding: S.xl }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: S.sm }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: T.text }}>{ckPct}%</span>
          <span style={{ fontSize: 12, color: T.textSoft }}>{ckDone}/{ckTot} 완료</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "#eee", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.coral}, ${T.amber})`, width: `${ckPct}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>
          {CC.map(c => <button key={c} style={pill(ckF === c)} onClick={() => setCkF(c)}>{c}</button>)}
        </div>
        <button onClick={() => setDlg({ type: "addChk" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral, flexShrink: 0 }}>＋</button>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
        {fChk.map(c => {
          if (editChk === c.id) {
            return (
              <div key={c.id} style={{ ...glass, padding: S.lg }}>
                <ChkInline
                  c={c}
                  onSave={upd => { ut({ checklist: trip.checklist.map(x => x.id === c.id ? { ...x, ...upd } : x) }); setEditChk(null); }}
                  onCancel={() => setEditChk(null)}
                />
              </div>
            );
          }
          return (
            <div key={c.id} style={{ ...glass, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, opacity: c.done ? 0.5 : 1 }}>
              <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }} onClick={() => ut({ checklist: trip.checklist.map(x => x.id === c.id ? { ...x, done: !x.done } : x) })}>
                {c.done ? "☑️" : "⬜"}
              </button>
              <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setEditChk(c.id)}>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.done ? T.textMuted : T.text, textDecoration: c.done ? "line-through" : "none" }}>{c.text}</span>
                <span style={{ fontSize: 10, color: T.textMuted, marginLeft: S.sm, fontWeight: 600 }}>{c.cat}</span>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted }} onClick={() => setConfirmDel({ msg: `"${c.text}" 삭제?`, onOk: () => ut({ checklist: trip.checklist.filter(x => x.id !== c.id) }) })}>🗑</button>
            </div>
          );
        })}
      </div>
      {!fChk.length && <Empty emoji="✅" text="체크리스트 비어있어요" />}
    </div>
  );
}
