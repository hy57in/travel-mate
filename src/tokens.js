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
  --c-coral: #E07460; --c-coral-lt: #FDE8E4; --c-peach: #FFF5F0;
  --c-indigo: #2D3561; --c-indigo-lt: #E8EAF6;
  --c-mint: #3EBCB4; --c-mint-lt: #E0F5F3;
  --c-amber: #E89B52; --c-amber-lt: #FFF2E0;
  --c-violet: #7056E0; --c-violet-lt: #EDE7FF;
  --c-sand: #FAF6F1; --c-cream: #FFFCF9;
  --c-text: #1A1A2E; --c-text-soft: #636A78; --c-text-muted: #9CA3AF;
  --c-glass: rgba(255,255,255,0.82); --c-glass-border: rgba(0,0,0,0.06);
  --c-shadow: 0 2px 12px rgba(45,53,97,0.07);
  --c-shadow-lg: 0 8px 28px rgba(45,53,97,0.10);
  --c-input-border: #E5E7EB; --c-input-bg: rgba(255,255,255,0.85);
  --c-card-bg: #fff; --c-divider: #eee; --c-item-bg: #f3f3f3;
  --c-budget-grad: #4A3F8F; --c-pill-bg: rgba(255,255,255,0.7);
  --c-danger: #EF4444; --c-danger-border: #FCA5A5; --c-switch-off: #ccc;
`;

export const THEME_DARK = `
  --c-coral: #F08878; --c-coral-lt: #2D1A18; --c-peach: #161218;
  --c-indigo: #7B8AC4; --c-indigo-lt: #1A1D30;
  --c-mint: #4ECEC6; --c-mint-lt: #142825;
  --c-amber: #F0A862; --c-amber-lt: #2D2418;
  --c-violet: #8A72F0; --c-violet-lt: #201A30;
  --c-sand: #12101A; --c-cream: #161220;
  --c-text: #E8E6F0; --c-text-soft: #A0A0B8; --c-text-muted: #6B6B80;
  --c-glass: rgba(28,24,40,0.85); --c-glass-border: rgba(255,255,255,0.08);
  --c-shadow: 0 2px 12px rgba(0,0,0,0.25);
  --c-shadow-lg: 0 8px 28px rgba(0,0,0,0.35);
  --c-input-border: #3A3850; --c-input-bg: rgba(40,36,56,0.85);
  --c-card-bg: #1E1A2E; --c-divider: #2A2838; --c-item-bg: #2A2838;
  --c-budget-grad: #1A1530; --c-pill-bg: rgba(40,36,56,0.7);
  --c-danger: #F87171; --c-danger-border: #7F1D1D; --c-switch-off: #4A4860;
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
