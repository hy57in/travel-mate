import { useState } from "react";
import { S, T } from "../../tokens";
import { inputStyle, btnPrimary } from "../../styles";

export default function LoginForm({ onLogin }) {
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
        이메일을 입력하면 로그인 링크를 보내드립니다.
        로그인하면 여행 데이터가 클라우드에 저장되고, 동행자와 실시간 공유할 수 있습니다.
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
