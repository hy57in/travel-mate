import * as Dialog from "@radix-ui/react-dialog";
import { S, T } from "../tokens";
import { pill, btnPrimary, btnOutline } from "../styles";

import ItemForm from "./forms/ItemForm";
import AddExpForm from "./forms/AddExpForm";
import AddChkForm from "./forms/AddChkForm";
import AddTripForm from "./forms/AddTripForm";
import SettingsForm from "./forms/SettingsForm";
import AITripForm from "./forms/AITripForm";
import LoginForm from "./forms/LoginForm";

import type { Trip, DialogState, ConfirmDeleteState } from "../types";
import type { User } from "@supabase/supabase-js";

interface AppDialogsProps {
  dialog: DialogState;
  setDialog: (d: DialogState) => void;
  confirmDelete: ConfirmDeleteState | null;
  setConfirmDelete: (d: ConfirmDeleteState | null) => void;
  trip: Trip;
  trips: Trip[];
  user: User | null;
  theme: string;
  setTheme: (theme: string) => void;
  updateTrip: (updates: Partial<Trip>) => void;
  persist: (trips: Trip[], activeId?: string) => void;
  reset: () => void;
  nextId: (arr: Array<{ id: number }>) => number;
  showToast: (msg: string) => void;
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => void;
  signOut: () => void;
  createInvite: (tripId: string) => Promise<string | null>;
}

export default function AppDialogs({ dialog, setDialog, confirmDelete, setConfirmDelete, trip, trips, user, theme, setTheme, updateTrip, persist, reset, nextId, showToast, signInWithEmail, signInWithGoogle, signOut, createInvite }: AppDialogsProps) {
  return (
    <>
      <Dialog.Root open={!!dialog} onOpenChange={() => setDialog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
          <Dialog.Content style={{ maxWidth: 380, borderRadius: T.r + 4, padding: S.xxl, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: T.cardBg, zIndex: 1000, width: "90vw", animation: "dialogIn 0.2s ease-out" }}>
            <Dialog.Close asChild><button style={{ position: "absolute", top: S.md, right: S.md, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: T.textMuted, padding: S.xs, lineHeight: 1 }}>✕</button></Dialog.Close>
            {dialog?.type === "item" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{dialog.isNew ? "📌 일정 추가" : "✏️ 일정 수정"}</Dialog.Title></div>
                <ItemForm
                  item={dialog.isNew ? null : trip.days[dialog.dayIdx]?.items[dialog.itemIdx!]}
                  onSave={(item) => {
                    const nextDays = [...trip.days];
                    if (dialog.isNew) {
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: [...nextDays[dialog.dayIdx].items, item] };
                    } else {
                      const nextItems = [...nextDays[dialog.dayIdx].items];
                      nextItems[dialog.itemIdx!] = item;
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: nextItems };
                    }
                    updateTrip({ days: nextDays });
                    setDialog(null);
                    showToast(dialog.isNew ? "일정이 추가되었습니다" : "일정이 수정되었습니다");
                  }}
                  onDelete={dialog.isNew ? null : () => setConfirmDelete({
                    msg: "삭제할까요?",
                    onOk: () => {
                      const nextDays = [...trip.days];
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: nextDays[dialog.dayIdx].items.filter((_: unknown, i: number) => i !== dialog.itemIdx) };
                      updateTrip({ days: nextDays });
                      setDialog(null);
                      showToast("삭제되었습니다");
                    },
                  })}
                />
              </>
            )}
            {dialog?.type === "addExp" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>💰 경비 추가</Dialog.Title></div>
                <AddExpForm rate={trip.rate} days={trip.days} travelerNames={trip.travelerNames} onAdd={(exp) => { updateTrip({ expenses: [...trip.expenses, { ...exp, id: nextId(trip.expenses) }] }); setDialog(null); showToast("경비가 추가되었습니다"); }} />
              </>
            )}
            {dialog?.type === "addChk" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>✅ 체크리스트 추가</Dialog.Title></div>
                <AddChkForm onAdd={(item) => { updateTrip({ checklist: [...trip.checklist, { ...item, id: nextId(trip.checklist), done: false }] }); setDialog(null); showToast("체크리스트에 추가되었습니다"); }} />
              </>
            )}
            {dialog?.type === "settings" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>⚙️ 여행 설정</Dialog.Title></div>
                <SettingsForm trip={trip} theme={theme} setTheme={setTheme} user={user} onSave={(upd) => { updateTrip(upd); setDialog(null); showToast("설정이 저장되었습니다"); }} onReset={() => setConfirmDelete({ msg: "모든 데이터가 삭제되고 초기 상태로 돌아갑니다. 정말 초기화하시겠습니까?", onOk: () => { reset(); setDialog(null); showToast("초기화되었습니다"); } })} onSignOut={user ? () => { signOut(); setDialog(null); showToast("로그아웃되었습니다"); } : null} />
              </>
            )}
            {dialog?.type === "trip" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🌏 여행 관리</Dialog.Title></div>
                <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                  {trips.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}>
                      <span>{t.emoji} {t.name}</span>
                      <div style={{ display: "flex", gap: S.xs }}>
                        {user && (
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13 }} onClick={async () => {
                            const url = await createInvite(t.id);
                            if (url) { navigator.clipboard.writeText(url); showToast("초대 링크가 복사되었습니다"); }
                            else showToast("초대 링크 생성 실패");
                          }}>🔗</button>
                        )}
                        {trips.length > 1 && (
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} onClick={() => { const remaining = trips.filter((x) => x.id !== t.id); persist(remaining, t.id === trip.id ? remaining[0].id : trip.id); }}>🗑</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: T.divider }} />
                  <AddTripForm onAdd={(t) => { const newTrip = { ...t, id: `trip-${Date.now()}`, days: [] as Trip["days"], expenses: [] as Trip["expenses"], checklist: [] as Trip["checklist"], memo: "", rate: t.rate || 9.29, travelerNames: [] as string[] }; persist([...trips, newTrip], newTrip.id); setDialog(null); }} />
                  <div style={{ height: 1, background: T.divider }} />
                  <button style={{ ...pill(false), border: `1.5px dashed ${T.violet}`, color: T.violet, width: "100%", textAlign: "center", padding: `${S.sm}px 0` }} onClick={() => setDialog({ type: "ai" })}>✨ AI 일정 생성</button>
                </div>
              </>
            )}
            {dialog?.type === "ai" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>✨ AI 일정 생성</Dialog.Title></div>
                <AITripForm onGenerate={(result) => {
                  const newTrip = { id: `trip-${Date.now()}`, name: result.days[0]?.title?.split(" ")[0] || "AI 여행", emoji: "✨", dates: "", startDate: "", travelers: 2, travelerNames: [], rate: 9.29, days: result.days, expenses: [], checklist: [], memo: "" };
                  persist([...trips, newTrip], newTrip.id);
                  setDialog(null);
                  showToast("AI 일정이 생성되었습니다");
                }} />
              </>
            )}
            {dialog?.type === "login" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🔐 로그인</Dialog.Title></div>
                <LoginForm
                  onLogin={async (email) => {
                    const { error } = await signInWithEmail(email);
                    if (error) { showToast(error); return; }
                    showToast("이메일을 확인해 주세요!");
                    setDialog(null);
                  }}
                  onGoogle={() => { signInWithGoogle(); setDialog(null); }}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
          <Dialog.Content style={{ maxWidth: 300, borderRadius: T.r + 4, padding: S.xxl, textAlign: "center", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: T.cardBg, zIndex: 1000, width: "90vw" }}>
            <p style={{ fontSize: 14, color: T.text, margin: `${S.md}px 0 ${S.xl}px` }}>{confirmDelete?.msg}</p>
            <div style={{ display: "flex", gap: S.sm }}>
              <button style={{ ...btnOutline, flex: 1 }} onClick={() => setConfirmDelete(null)}>취소</button>
              <button style={{ ...btnPrimary, flex: 1, background: T.danger }} onClick={() => { confirmDelete?.onOk(); setConfirmDelete(null); }}>삭제</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
