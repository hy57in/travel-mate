import { useState, useEffect, useRef, useCallback } from "react";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { S, T, TYPE_EMOJI } from "../tokens";
import { glass, inputStyle } from "../styles";
import Empty from "./ui/Empty";
import DayMap from "./ui/DayMap";
import { geocodeBatch } from "../utils/geocode";

function SortableItem({ id, di, ii, item, isNext, setDialog }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.skip ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={{ ...style, display: "flex", alignItems: "center", gap: S.sm, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, transition: "all 0.15s", background: isDragging ? "rgba(255,255,255,0.95)" : isNext ? T.mintLight : item.hl ? T.coralLight : item.pend ? T.amberLight : "transparent", borderLeft: isNext ? `3px solid ${T.mint}` : item.hl ? `3px solid ${T.coral}` : item.pend ? `3px solid ${T.amber}` : "3px solid transparent", boxShadow: isDragging ? T.shadowLg : isNext ? `0 0 0 1px ${T.mint}33` : "none" }}>
      <div {...attributes} {...listeners} style={{ cursor: "grab", touchAction: "none", fontSize: 14, color: T.textMuted, flexShrink: 0, padding: `${S.xs}px`, lineHeight: 1, userSelect: "none" }}>⠿</div>
      <div style={{ display: "flex", alignItems: "center", gap: S.sm, flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setDialog({ type: "item", dayIdx: di, itemIdx: ii })}>
        <div style={{ width: 34, height: 34, borderRadius: S.sm, background: item.hl ? `linear-gradient(135deg, ${T.coral}, ${T.amber})` : T.itemBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
          {TYPE_EMOJI[item.type] || "📍"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: item.pend ? T.amber : item.skip ? T.textMuted : T.text, textDecoration: item.skip ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</div>
        </div>
        {item.url && (
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 16, textDecoration: "none", flexShrink: 0, lineHeight: 1 }}>📍</a>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{item.time}</span>
      </div>
    </div>
  );
}

export default function ItineraryTab({ trip, expandedDay, setExpandedDay, sortDayItems, reorderItems, addDay, deleteDay, updateDay, todayDayIndex, weather, setDialog }) {
  const [editingDay, setEditingDay] = useState(null);
  const [geocoding, setGeocoding] = useState(-1);
  const todayRef = useRef(null);

  useEffect(() => {
    if (todayDayIndex >= 0 && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [todayDayIndex]);

  // 오늘 Day의 "다음 일정" 인덱스 계산
  const nextItemIdx = (() => {
    if (todayDayIndex < 0) return -1;
    const day = trip.days[todayDayIndex];
    if (!day?.items.length) return -1;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    for (let i = 0; i < day.items.length; i++) {
      const m = day.items[i].time.match(/(\d{1,2}):(\d{2})/);
      if (m && parseInt(m[1]) * 60 + parseInt(m[2]) >= nowMin) return i;
    }
    return -1;
  })();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = (di) => (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = parseInt(active.id.split("-")[1]);
    const newIdx = parseInt(over.id.split("-")[1]);
    reorderItems(di, oldIdx, newIdx);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      {trip.days.map((day, di) => {
        const open = expandedDay === di;
        const isEditing = editingDay === di;
        return (
          <div key={di} ref={todayDayIndex === di ? todayRef : null} style={{ ...glass, overflow: "hidden", transition: "all 0.2s" }}>
            <button className="day-header" onClick={() => setExpandedDay(open ? -1 : di)} style={{ width: "100%", textAlign: "left", padding: `${S.lg}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.md, border: "none", background: "transparent", cursor: "pointer", borderRadius: T.r, transition: "background 0.15s" }}>
              <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, minWidth: 44, height: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, letterSpacing: 0.5 }}>DAY</span>
                <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{di + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{day.title}</span>
                  {todayDayIndex === di && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", flexShrink: 0 }}>오늘</span>}
                </div>
                <div style={{ fontSize: 11, color: T.textSoft, marginTop: S.xs }}>
                  {day.date}
                  {(() => { const w = weather?.find(f => { const sd = new Date(trip.startDate); sd.setDate(sd.getDate() + di); return f.date === sd.toISOString().slice(0, 10); }); return w ? <span style={{ marginLeft: S.sm }}>{w.icon} {w.minC}~{w.maxC}°C</span> : null; })()}
                </div>
              </div>
              <span style={{ fontSize: 18, color: T.textMuted, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </button>

            {open && (
              <div style={{ padding: `0 ${S.lg}px ${S.lg}px` }}>
                {/* Day 편집 영역 */}
                {isEditing ? (
                  <div style={{ display: "flex", gap: S.sm, marginBottom: S.md }}>
                    <div style={{ width: 100 }}>
                      <input style={{ ...inputStyle, fontSize: 12, padding: `${S.sm}px ${S.md}px` }} value={day.date} onChange={e => updateDay(di, { date: e.target.value })} placeholder="3/26 (목)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input style={{ ...inputStyle, fontSize: 12, padding: `${S.sm}px ${S.md}px` }} value={day.title} onChange={e => updateDay(di, { title: e.target.value })} placeholder="Day 제목" />
                    </div>
                    <button onClick={() => setEditingDay(null)} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", flexShrink: 0, color: T.coral }}>✓</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: S.sm, marginBottom: S.md }}>
                    <button onClick={() => setEditingDay(di)} style={{ flex: 1, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, border: `1.5px dashed ${T.inputBorder}`, background: T.glass, fontSize: 11, color: T.textSoft, cursor: "pointer", textAlign: "left" }}>✏️ 제목·날짜 편집</button>
                    <button onClick={() => deleteDay(di)} style={{ padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, border: `1.5px solid ${T.dangerBorder}`, background: T.glass, fontSize: 11, color: T.danger, cursor: "pointer", flexShrink: 0 }}>🗑</button>
                  </div>
                )}

                {day.memo && (
                  <div style={{ fontSize: 11, color: T.textSoft, background: T.peach, borderRadius: T.rSm, padding: `${S.sm}px ${S.md}px`, marginBottom: S.md, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {day.memo}
                  </div>
                )}

                <DayMap items={day.items} />

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd(di)}>
                  <SortableContext items={day.items.map((_, ii) => `item-${ii}`)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: "flex", flexDirection: "column", gap: S.xs }}>
                      {day.items.map((item, ii) => (
                        <SortableItem key={ii} id={`item-${ii}`} di={di} ii={ii} item={item} isNext={todayDayIndex === di && nextItemIdx === ii} setDialog={setDialog} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div style={{ display: "flex", gap: S.sm, marginTop: S.md }}>
                  <button onClick={() => sortDayItems(di)} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px solid ${T.inputBorder}`, background: T.glass, fontSize: 12, fontWeight: 600, color: T.textSoft, cursor: "pointer" }}>⏱ 시간순</button>
                  {day.items.some(it => !it.lat) && (
                    <button
                      disabled={geocoding === di}
                      onClick={async () => {
                        setGeocoding(di);
                        const updated = await geocodeBatch(day.items, "Tokyo Japan");
                        updateDay(di, { items: updated });
                        setGeocoding(-1);
                      }}
                      style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px solid ${T.mint}`, background: T.mintLight, fontSize: 12, fontWeight: 600, color: T.mint, cursor: "pointer" }}
                    >{geocoding === di ? "검색중..." : "📍 장소찾기"}</button>
                  )}
                  <button onClick={() => setDialog({ type: "item", dayIdx: di, isNew: true })} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px dashed ${T.coral}`, background: T.coralLight, fontSize: 12, fontWeight: 600, color: T.coral, cursor: "pointer" }}>＋ 추가</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {!trip.days.length && <Empty emoji="📅" text="일정이 없어요" action="＋ Day 추가" onAction={addDay} />}
      <button onClick={addDay} style={{ width: "100%", padding: `${S.md}px 0`, borderRadius: T.r, border: `1.5px dashed ${T.coral}`, background: T.coralLight, fontSize: 13, fontWeight: 600, color: T.coral, cursor: "pointer" }}>＋ Day 추가</button>
    </div>
  );
}
