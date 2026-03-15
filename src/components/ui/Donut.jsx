export default function Donut({ data, size = 72 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const r = size / 2, ir = r - 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const pct = total > 0 ? d.value / total : 0;
        const start = cum * 2 * Math.PI - Math.PI / 2;
        cum += pct;
        const end = cum * 2 * Math.PI - Math.PI / 2;
        const large = pct > 0.5 ? 1 : 0;
        const x1 = r + ir * Math.cos(start), y1 = r + ir * Math.sin(start);
        const x2 = r + ir * Math.cos(end), y2 = r + ir * Math.sin(end);
        return pct > 0.001 ? (
          <path key={i} d={`M${r},${r} L${x1},${y1} A${ir},${ir} 0 ${large} 1 ${x2},${y2} Z`} fill={d.color} opacity={0.85} />
        ) : null;
      })}
      <circle cx={r} cy={r} r={ir - 5} fill="white" />
    </svg>
  );
}
