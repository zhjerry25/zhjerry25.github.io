import type { Ref } from "preact";
import type { Labels } from "./copy";
import { equation, numberText, type Curve, type Point } from "./graph";

type Line = { curve: Curve; kind: "best" | "min" | "max" };
const styles = {
  best: { color: "#20649d", dash: undefined },
  min: { color: "#108477", dash: "15 9" },
  max: { color: "#bc551d", dash: "7 7" },
};
const ink = "#182c39";
const box = { left: 113, right: 802, top: 122, bottom: 598 };

function axis(low: number, high: number, intervals: number) {
  if (low === high) {
    const pad = Math.abs(low) * 0.1 || 1;
    low -= pad;
    high += pad;
  }
  const raw = (high - low) / intervals;
  const power = 10 ** Math.floor(Math.log10(raw));
  const multiple = [1, 2, 2.5, 4, 5, 10].find(n => n >= raw / power) ?? 10;
  const step = power * multiple;
  const first = Math.floor(low / step);
  const count = Math.ceil(high / step) - first;
  if (!Number.isFinite(count) || count < 1 || count > 20) return null;
  const ticks = Array.from({ length: count + 1 }, (_, i) => (first + i) * step);
  return { ticks, min: ticks[0], max: ticks[count], step };
}

function tickText(n: number, step: number) {
  if (step < 0.0001 || Math.abs(n) >= 1e6) return numberText(n);
  const digits = Math.max(0, -Math.floor(Math.log10(step)));
  const extra = Math.abs(step * 10 ** digits % 1) > 1e-8 ? 1 : 0;
  return n.toFixed(digits + extra).replace(/^-/, "−");
}

function fitSize(text: string, size: number, width: number) {
  const units = Array.from(text).reduce((sum, c) => sum + (c.charCodeAt(0) > 255 ? 1 : 0.59), 0);
  return Math.min(size, width / (units || 1));
}

export function Figure({ svgRef, t, title, xLabel, yLabel, ySymbol, xUnit, yUnit, points, lines, bars }: {
  svgRef: Ref<SVGSVGElement>; t: Labels; title: string; xLabel: string; yLabel: string; ySymbol: string;
  xUnit: string; yUnit: string; points: Point[]; lines: Line[]; bars: boolean;
}) {
  let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
  const showXRange = bars || lines.some(line => line.kind !== "best");
  for (const p of points) {
    xMin = Math.min(xMin, p.x - (showXRange ? p.dx : 0));
    xMax = Math.max(xMax, p.x + (showXRange ? p.dx : 0));
    yMin = Math.min(yMin, p.y - (bars ? p.dy : 0));
    yMax = Math.max(yMax, p.y + (bars ? p.dy : 0));
  }
  const domain = points.reduce(([min, max], p) => [Math.min(min, p.x), Math.max(max, p.x)], [Infinity, -Infinity]);
  const sampled = lines.map(line => {
    const [lo, hi] = line.curve.model === "linear" ? [xMin, xMax] : domain;
    const segments = line.curve.model === "linear" ? 1 : 160;
    const samples = Array.from({ length: segments + 1 }, (_, i) => {
      const x = lo + (hi - lo) * i / segments;
      return { x, y: line.curve.at(x) };
    });
    for (const { y } of samples) {
      if (Number.isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    }
    return { ...line, samples };
  });
  const xa = axis(xMin, xMax, 6), ya = axis(yMin, yMax, 5);
  const plotted = points.length > 0 && xa && ya;
  const px = (x: number) => box.left + (x - xa!.min) / (xa!.max - xa!.min) * (box.right - box.left);
  const py = (y: number) => box.bottom - (y - ya!.min) / (ya!.max - ya!.min) * (box.bottom - box.top);
  const uncertainty = (key: "dx" | "dy", unit: string) => {
    const value = points[0]?.[key];
    return points.every(p => p[key] === value) ? "±" + numberText(value) + (unit ? " " + unit : "") : t.perPoint;
  };
  const fullX = xLabel + (xUnit ? " (" + xUnit + ")" : "");
  const fullY = yLabel + (yUnit ? " (" + yUnit + ")" : "");
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="1200" height="710"
    viewBox="0 0 1200 710" role="img" aria-label={title || t.preview} font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif" fill={ink}>
    <title>{title || t.preview}</title>
    <rect width="1200" height="710" fill="white" />
    <text x="600" y="65" textAnchor="middle" fontWeight="700" fontSize={fitSize(title, 33, 1110)}>{title}</text>
    {plotted ? <>
      {xa.ticks.map(v => <g key={v}>
        <path d={`M${px(v)} ${box.top}V${box.bottom}`} stroke="#e1e7ea" />
        <text x={px(v)} y={box.bottom + 27} textAnchor="middle" fontSize="17">{tickText(v, xa.step)}</text>
      </g>)}
      {ya.ticks.map(v => <g key={v}>
        <path d={`M${box.left} ${py(v)}H${box.right}`} stroke="#e1e7ea" />
        <text x={box.left - 11} y={py(v) + 6} textAnchor="end" fontSize="17">{tickText(v, ya.step)}</text>
      </g>)}
      <path d={`M${box.left} ${box.top}V${box.bottom}H${box.right}`} fill="none" stroke="#81949e" />
      <text x="458" y="654" textAnchor="middle" fontSize={fitSize(fullX, 21, 680)}>{fullX}</text>
      <text transform="translate(42 360) rotate(-90)" textAnchor="middle" fontSize={fitSize(fullY, 21, 460)}>{fullY}</text>
      <defs><clipPath id="ib-plot"><rect x={box.left - 4} y={box.top - 4} width={box.right - box.left + 8} height={box.bottom - box.top + 8} /></clipPath></defs>
      <g clipPath="url(#ib-plot)">
        {sampled.map(({ samples, kind }) => {
          let path = "", move = true;
          for (const { x, y } of samples) {
            if (!Number.isFinite(y)) { move = true; continue; }
            path += (move ? "M" : "L") + px(x) + " " + py(y);
            move = false;
          }
          return <path key={kind} d={path} fill="none" stroke={styles[kind].color} strokeWidth="3.3" strokeDasharray={styles[kind].dash} />;
        })}
        {points.map((p, i) => {
          const x = px(p.x), y = py(p.y);
          const left = px(p.x - p.dx), right = px(p.x + p.dx), top = py(p.y + p.dy), bottom = py(p.y - p.dy);
          return <g key={i}>
            {bars && p.dx > 0 && <path stroke={ink} strokeWidth="1.8" fill="none" d={`M${left} ${y}H${right} M${left} ${y-6}v12 M${right} ${y-6}v12`} />}
            {bars && p.dy > 0 && <path stroke={ink} strokeWidth="1.8" fill="none" d={`M${x} ${top}V${bottom} M${x-6} ${top}h12 M${x-6} ${bottom}h12`} />}
            <circle cx={x} cy={y} r="4.1" />
          </g>;
        })}
      </g>
      {lines.map(({ curve, kind }, i) => {
        const label = kind === "best" ? t.best + " · " + points.length + " " + t.points : t[kind];
        const formula = ySymbol + " = " + equation(curve);
        return <g key={kind} transform={`translate(850 ${188 + i * 100})`}>
          <path d="M0 0h47" stroke={styles[kind].color} strokeWidth="3.5" strokeDasharray={styles[kind].dash} />
          <text x="59" y="5" fontWeight="700" fontSize={fitSize(label, 18, 274)}>{label}</text>
          <text x="59" y="38" fill={styles[kind].color} fontSize={fitSize(formula, 20, 270)}>{formula}</text>
        </g>;
      })}
      {bars && points.some(p => p.dx || p.dy) && <g transform={`translate(850 ${202 + lines.length * 100})`}>
        <text fontSize="17.5" fontWeight="700">{t.uncertainty}</text>
        {(["dx", "dy"] as const).map((key, i) => {
          const label = (i ? "Δ" + ySymbol : "Δx") + " = " + uncertainty(key, i ? yUnit : xUnit);
          return <text key={key} y={34 + 30*i} fontSize={fitSize(label, 17, 320)}>{label}</text>;
        })}
      </g>}
    </> : <text x="600" y="355" textAnchor="middle" fontSize="25">{points.length ? t.range : t.empty}</text>}
  </svg>;
}

export async function downloadPng(svg: SVGSVGElement, title: string) {
  const source = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1420;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG encoding failed");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (title.replace(/[\\/:*?"<>|]/g, "-").trim().slice(0, 100) || "ib-graph") + ".png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 30000);
  } finally {
    URL.revokeObjectURL(source);
  }
}
