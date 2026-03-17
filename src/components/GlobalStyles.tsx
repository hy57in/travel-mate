import { T, THEME_LIGHT, THEME_DARK } from "../tokens";

export default function GlobalStyles() {
  return (
    <style>{`
      :root { ${THEME_LIGHT} }
      :root[data-theme="dark"] { ${THEME_DARK} }
      @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${THEME_DARK} } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 4px 16px rgba(224,116,96,0.25); } 50% { transform: scale(1.04); box-shadow: 0 6px 24px rgba(224,116,96,0.4); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      @keyframes dialogIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
      @keyframes checkPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
      .fade-in { animation: fadeIn 0.25s ease-out; }
      .slide-in { animation: slideIn 0.2s ease-out; }
      .scale-in { animation: scaleIn 0.2s ease-out; }
      .check-pop { animation: checkPop 0.25s ease-out; }
      input:focus, textarea:focus { border-color: ${T.coral} !important; outline: none; box-shadow: 0 0 0 3px ${T.coralLight}; }
      :root[data-theme="dark"] input, :root[data-theme="dark"] textarea, :root[data-theme="dark"] select { color-scheme: dark; }
      @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) input, :root:not([data-theme="light"]) textarea, :root:not([data-theme="light"]) select { color-scheme: dark; } }
      button:disabled { opacity: 0.4; cursor: not-allowed; }
      button:active:not(:disabled) { transform: scale(0.97); }
      .day-header:active { background: ${T.glassBorder} !important; }
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      html { scroll-behavior: smooth; overscroll-behavior: contain; }
    `}</style>
  );
}
