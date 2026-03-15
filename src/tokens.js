/* === DESIGN TOKENS === */
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const T = {
  coral: "#E07460", coralLight: "#FDE8E4", peach: "#FFF5F0",
  indigo: "#2D3561", indigoLight: "#E8EAF6",
  mint: "#3EBCB4", mintLight: "#E0F5F3",
  amber: "#E89B52", amberLight: "#FFF2E0",
  violet: "#7056E0", violetLight: "#EDE7FF",
  sand: "#FAF6F1", cream: "#FFFCF9",
  text: "#1A1A2E", textSoft: "#636A78", textMuted: "#9CA3AF",
  glass: "rgba(255,255,255,0.82)", glassBorder: "rgba(0,0,0,0.06)",
  shadow: "0 2px 12px rgba(45,53,97,0.07)",
  shadowLg: "0 8px 28px rgba(45,53,97,0.10)",
  r: 14, rSm: 10,
};

export const CAT = {
  "교통": { color: T.indigo, bg: T.indigoLight, emoji: "🚃" },
  "숙소": { color: T.amber, bg: T.amberLight, emoji: "🏨" },
  "식비": { color: T.mint, bg: T.mintLight, emoji: "🍽️" },
  "활동": { color: T.violet, bg: T.violetLight, emoji: "⭐" },
  "기타": { color: T.textSoft, bg: "#F3F4F6", emoji: "📦" },
};
export const EC = Object.keys(CAT);
export const CC = ["전체", "예약", "서류", "준비", "짐싸기"];
export const TYPES = [
  { v: "flight", emoji: "✈️", l: "항공" }, { v: "transit", emoji: "🚃", l: "교통" },
  { v: "car", emoji: "🚗", l: "차량" }, { v: "hotel", emoji: "🏨", l: "숙소" },
  { v: "food", emoji: "🍽️", l: "식사" }, { v: "activity", emoji: "⭐", l: "활동" },
  { v: "cherry", emoji: "🌸", l: "벚꽃" },
];
export const TYPE_EMOJI = Object.fromEntries(TYPES.map(t => [t.v, t.emoji]));
export const fmt = n => n.toLocaleString("ko-KR");
export const toY = (k, r) => Math.round(k / r);
export const toK = (y, r) => Math.round(y * r);
