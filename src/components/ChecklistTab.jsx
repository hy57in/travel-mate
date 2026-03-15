import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { S, T, CC } from "../tokens";
import { glass, pill } from "../styles";
import Empty from "./ui/Empty";
import ChkInline from "./forms/ChkInline";

function SortableCheckItem({ id, item, editingCheckId, setEditingCheckId, setConfirmDelete, updateTrip, trip }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.done ? 0.5 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  if (editingCheckId === item.id) {
    return (
      <div ref={setNodeRef} style={{ ...style, ...glass, padding: S.lg }}>
        <ChkInline
          c={item}
          onSave={upd => { updateTrip({ checklist: trip.checklist.map(x => x.id === item.id ? { ...x, ...upd } : x) }); setEditingCheckId(null); }}
          onCancel={() => setEditingCheckId(null)}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={{ ...style, ...glass, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, boxShadow: isDragging ? T.shadowLg : undefined }}>
      <div {...attributes} {...listeners} style={{ cursor: "grab", touchAction: "none", fontSize: 14, color: T.textMuted, flexShrink: 0, padding: `${S.xs}px`, lineHeight: 1, userSelect: "none" }}>⠿</div>
      <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0 }} onClick={() => updateTrip({ checklist: trip.checklist.map(x => x.id === item.id ? { ...x, done: !x.done } : x) })}>
        {item.done ? "☑️" : "⬜"}
      </button>
      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setEditingCheckId(item.id)}>
        <span style={{ fontSize: 13, fontWeight: 600, color: item.done ? T.textMuted : T.text, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: S.sm, fontWeight: 600 }}>{item.cat}</span>
      </div>
      <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted }} onClick={() => setConfirmDelete({ msg: `"${item.text}" 삭제?`, onOk: () => updateTrip({ checklist: trip.checklist.filter(x => x.id !== item.id) }) })}>🗑</button>
    </div>
  );
}

export default function ChecklistTab({
  trip, checklistFilter, setChecklistFilter, filteredChecklist, checkDone, checkTotal, checkPercent,
  editingCheckId, setEditingCheckId, setDialog, setConfirmDelete, updateTrip,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = filteredChecklist.findIndex(c => `chk-${c.id}` === active.id);
    const newIdx = filteredChecklist.findIndex(c => `chk-${c.id}` === over.id);
    if (oldIdx < 0 || newIdx < 0) return;

    // Reorder within the full checklist array
    const movedItem = filteredChecklist[oldIdx];
    const targetItem = filteredChecklist[newIdx];
    const fullList = [...trip.checklist];
    const fromFull = fullList.findIndex(c => c.id === movedItem.id);
    const toFull = fullList.findIndex(c => c.id === targetItem.id);
    const [removed] = fullList.splice(fromFull, 1);
    fullList.splice(toFull, 0, removed);
    updateTrip({ checklist: fullList });
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
      {/* Progress */}
      <div style={{ ...glass, padding: S.xl }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: S.sm }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: T.text }}>{checkPercent}%</span>
          <span style={{ fontSize: 12, color: T.textSoft }}>{checkDone}/{checkTotal} 완료</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: T.divider, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.coral}, ${T.amber})`, width: `${checkPercent}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>
          {CC.map(c => <button key={c} style={pill(checklistFilter === c)} onClick={() => setChecklistFilter(c)}>{c}</button>)}
        </div>
        <button onClick={() => setDialog({ type: "addChk" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral, flexShrink: 0 }}>＋</button>
      </div>

      {/* Items */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredChecklist.map(c => `chk-${c.id}`)} strategy={verticalListSortingStrategy}>
          <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
            {filteredChecklist.map(c => (
              <SortableCheckItem
                key={c.id}
                id={`chk-${c.id}`}
                item={c}
                editingCheckId={editingCheckId}
                setEditingCheckId={setEditingCheckId}
                setConfirmDelete={setConfirmDelete}
                updateTrip={updateTrip}
                trip={trip}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {!filteredChecklist.length && <Empty emoji="✅" text="체크리스트 비어있어요" />}
    </div>
  );
}
