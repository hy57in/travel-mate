/* === DESIGN TOKENS (CSS Custom Properties) === */
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

export const T = {
  coral: "var(--c-coral)", coralLight: "var(--c-coral-lt)", peach: "var(--c-peach)",
  indigo: "var(--c-indigo)", indigoLight: "var(--c-indigo-lt)",
  mint: "var(--c-mint)", mintLight: "var(--c-mint-lt)",
  amber: "var(--c-amber)", amberLight: "var(--c-amber-lt)",
  violet: "var(--c-violet)", violetLight: "var(--c-violet-lt)",
  sand: "var(--c-sand)", cream: "var(--c-cream)",
  text: "var(--c-text)", textSoft: "var(--c-text-soft)", textMuted: "var(--c-text-muted)",
  glass: "var(--c-glass)", glassBorder: "var(--c-glass-border)",
  shadow: "var(--c-shadow)", shadowLg: "var(--c-shadow-lg)",
  r: 14, rSm: 10,
  // dark mode support tokens
  inputBorder: "var(--c-input-border)", inputBg: "var(--c-input-bg)",
  cardBg: "var(--c-card-bg)", divider: "var(--c-divider)", itemBg: "var(--c-item-bg)",
  budgetGrad: "var(--c-budget-grad)", pillBg: "var(--c-pill-bg)",
  danger: "var(--c-danger)", dangerBorder: "var(--c-danger-border)",
  switchOff: "var(--c-switch-off)",
};

export const THEME_LIGHT = `
  --c-coral: #F47B6E; --c-coral-lt: #FDE9E6; --c-peach: #FFF8F6;
  --c-indigo: #2B2D42; --c-indigo-lt: #E6E7F0;
  --c-mint: #4ECDC4; --c-mint-lt: #E2F7F5;
  --c-amber: #FFAD6B; --c-amber-lt: #FFF4E8;
  --c-violet: #8B5CF6; --c-violet-lt: #EDE5FF;
  --c-sand: #FAF5EF; --c-cream: #FFFDF9;
  --c-text: #2B2D42; --c-text-soft: #5C6178; --c-text-muted: #9CA0B0;
  --c-glass: rgba(255,255,255,0.84); --c-glass-border: rgba(0,0,0,0.05);
  --c-shadow: 0 2px 12px rgba(43,45,66,0.06);
  --c-shadow-lg: 0 8px 28px rgba(43,45,66,0.09);
  --c-input-border: #E2E4EA; --c-input-bg: rgba(255,255,255,0.88);
  --c-card-bg: #fff; --c-divider: #ECEDF2; --c-item-bg: #F5F4F8;
  --c-budget-grad: #3D3870; --c-pill-bg: rgba(255,255,255,0.72);
  --c-danger: #EF4444; --c-danger-border: #FCA5A5; --c-switch-off: #ccc;
`;

export const THEME_DARK = `
  --c-coral: #F49488; --c-coral-lt: #3A2222; --c-peach: #14121A;
  --c-indigo: #A0A8CC; --c-indigo-lt: #232538;
  --c-mint: #62DDD4; --c-mint-lt: #1A3533;
  --c-amber: #FFB878; --c-amber-lt: #3A2E1E;
  --c-violet: #A78BFA; --c-violet-lt: #28203E;
  --c-sand: #111018; --c-cream: #141220;
  --c-text: #EEEFF5; --c-text-soft: #B5B8CC; --c-text-muted: #7E82A0;
  --c-glass: rgba(22,20,36,0.90); --c-glass-border: rgba(255,255,255,0.08);
  --c-shadow: 0 2px 12px rgba(0,0,0,0.28);
  --c-shadow-lg: 0 8px 28px rgba(0,0,0,0.38);
  --c-input-border: #3E3C58; --c-input-bg: rgba(38,36,58,0.88);
  --c-card-bg: #1C1A2C; --c-divider: #282640; --c-item-bg: #302E46;
  --c-budget-grad: #181430; --c-pill-bg: rgba(46,42,68,0.78);
  --c-danger: #F87171; --c-danger-border: #7F1D1D; --c-switch-off: #484660;
`;

export const CAT = {
  "\uAD50\uD1B5": { color: T.indigo, bg: T.indigoLight, emoji: "\uD83D\uDE83" },
  "\uC219\uC18C": { color: T.amber, bg: T.amberLight, emoji: "\uD83C\uDFE8" },
  "\uC2DD\uBE44": { color: T.mint, bg: T.mintLight, emoji: "\uD83C\uDF7D\uFE0F" },
  "\uD65C\uB3D9": { color: T.violet, bg: T.violetLight, emoji: "\u2B50" },
  "\uAE30\uD0C0": { color: T.textSoft, bg: T.itemBg, emoji: "\uD83D\uDCE6" },
};
export const EC = Object.keys(CAT);
export const CC = ["\uC804\uCCB4", "\uC608\uC57D", "\uC11C\uB958", "\uC900\uBE44", "\uC9D0\uC2F8\uAE30"];
export const TYPES = [
  { v: "flight", emoji: "\u2708\uFE0F", l: "\uD56D\uACF5" }, { v: "transit", emoji: "\uD83D\uDE83", l: "\uAD50\uD1B5" },
  { v: "car", emoji: "\uD83D\uDE97", l: "\uCC28\uB7C9" }, { v: "hotel", emoji: "\uD83C\uDFE8", l: "\uC219\uC18C" },
  { v: "food", emoji: "\uD83C\uDF7D\uFE0F", l: "\uC2DD\uC0AC" }, { v: "activity", emoji: "\u2B50", l: "\uD65C\uB3D9" },
  { v: "cherry", emoji: "\uD83C\uDF38", l: "\uBC9A\uAF43" },
];
export const TYPE_EMOJI = Object.fromEntries(TYPES.map(t => [t.v, t.emoji]));
export const fmt = n => n.toLocaleString("ko-KR");
export const toY = (k, r) => Math.round(k / r);
export const toK = (y, r) => Math.round(y * r);
