import { useState } from "react";
import { S, T } from "../../tokens";
import { inputStyle, btnPrimary, btnOutline } from "../../styles";

interface LoginFormProps {
  onLogin: (email: string) => Promise<void>;
  onGoogle?: () => void;
}

export default function LoginForm({ onLogin, onGoogle }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setSending(true);
    await onLogin(email);
    setSending(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md, marginTop: S.md }}>
      <div style={{ fontSize: 12, color: T.textSoft, lineHeight: 1.6 }}>
        로그인하면 여행 데이터가 클라우드에 저장되고, 동행자와 실시간 공유할 수 있습니다.
      </div>

      {onGoogle && (
        <button
          style={{ ...btnOutline, display: "flex", alignItems: "center", justifyContent: "center", gap: S.sm, padding: `${S.md}px ${S.lg}px`, fontWeight: 700, width: "100%" }}
          onClick={onGoogle}
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"/><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Google로 로그인
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
        <div style={{ flex: 1, height: 1, background: T.divider }} />
        <span style={{ fontSize: 11, color: T.textMuted }}>또는</span>
        <div style={{ flex: 1, height: 1, background: T.divider }} />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>이메일</label>
        <input
          type="email"
          style={inputStyle}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
        />
      </div>
      <button style={btnPrimary} disabled={!email || sending} onClick={handleSubmit}>
        {sending ? "전송 중..." : "매직 링크 보내기"}
      </button>
    </div>
  );
}
