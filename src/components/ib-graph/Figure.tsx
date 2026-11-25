import type { Ref } from "preact";
import { makeAxis } from "./axis";
import type { Labels } from "./copy";
import { equation, numberText, type Curve, type Point } from "./graph";

type Line = { curve: Curve; kind: "best" | "min" | "max" };
export const dashPatterns = {
  solid: undefined,
  longDash: "15 9",
  shortDash: "7 7",
  dashDot: "14 5 3 5",
};
export type LineStyle = { color: string; pattern: keyof typeof dashPatterns };
export const defaultStyles: Record<Line["kind"], LineStyle> = {
  best: { color: "#20649d", pattern: "solid" },
  min: { color: "#108477", pattern: "longDash" },
  max: { color: "#bc551d", pattern: "shortDash" },
};
const ink = "#182c39";
function fitSize(text: string, size: number, width: number) {
  const units = Array.from(text).reduce((sum, c) => sum + (c.charCodeAt(0) > 255 ? 1 : 0.59), 0);
  return Math.min(size, width / (units || 1));
}

export function Figure({ svgRef, t, title, xLabel, yLabel, ySymbol, xUnit, yUnit, points, lines, styles, bars }: {
  svgRef: Ref<SVGSVGElement>; t: Labels; title: string; xLabel: string; yLabel: string; ySymbol: string;
  xUnit: string; yUnit: string; points: Point[]; lines: Line[]; styles: typeof defaultStyles; bars: boolean;
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
      const x = i === 0 ? lo : i === segments ? hi : lo * (1 - i / segments) + hi * (i / segments);
      return { x, y: line.curve.at(x) };
    });
    for (const { y } of samples) {
      if (Number.isFinite(y)) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    }
    return { ...line, samples };
  });
  const xa = makeAxis(xMin, xMax, 6), ya = makeAxis(yMin, yMax, 5);
  const plotted = points.length > 0 && xa && ya;
  const uncertainties: string[] = [];
  if (bars && points.length) {
    for (const key of ["dx", "dy"] as const) {
      const value = points[0][key];
      if (value <= 0 || !points.every(p => p[key] === value)) continue;
      const unit = key === "dx" ? xUnit : yUnit;
      const symbol = key === "dx" ? "x" : ySymbol;
      uncertainties.push("Δ" + symbol + " = ±" + numberText(value) + (unit ? " " + unit : ""));
    }
  }
  const hasLegend = lines.length > 0 || uncertainties.length > 0;
  const fullX = xLabel + (xUnit ? " (" + xUnit + ")" : "");
  const fullY = yLabel + (yUnit ? " (" + yUnit + ")" : "");
  const tickWidth = Math.max(0, ...(ya?.ticks.map(tick => tick.label.length) ?? [])) * 11;
  const margin = Math.max(78, (fullY ? 68 : 30) + tickWidth);
  const box = { left: margin, right: hasLegend ? 805 : 1200 - margin, top: title ? 120 : 68, bottom: 600 };
  const width = box.right - box.left, height = box.bottom - box.top;
  const px = (x: number) => box.left + xa!.position(x) * width;
  const py = (y: number) => box.bottom - ya!.position(y) * height;
  const legendHeight = lines.length * 85 + (uncertainties.length ? 26 + uncertainties.length * 27 : 0);
  const legendTop = box.top + (height - legendHeight) / 2 + 17;
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="1200" height="710"
    viewBox="0 0 1200 710" role="img" font-weight="400" aria-label={title || t.preview} font-family="Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif" fill={ink}>
    <title>{title || t.preview}</title>
    <rect width="1200" height="710" fill="white" />
    <text x="600" y="65" text-anchor="middle" font-weight="700" font-size={fitSize(title, 33, 1110)}>{title}</text>
    {plotted ? <>
      {xa.ticks.map(({position, label}) => {
        const x = box.left + position * width;
        return <g key={label}>
          <path d={`M${x} ${box.top}V${box.bottom}`} stroke="#e1e7ea" />
          <text x={x} y={box.bottom + 26} text-anchor="middle" font-size="17">{label}</text>
        </g>;
      })}
      {ya.ticks.map(({position, label}) => {
        const y = box.bottom - position * height;
        return <g key={label}>
          <path d={`M${box.left} ${y}H${box.right}`} stroke="#e1e7ea" />
          <text x={box.left - 12} y={y + 5} text-anchor="end" font-size="17">{label}</text>
        </g>;
      })}
      {ya.note && <text x={box.left} y={box.top - 11} font-size="16">{ya.note}</text>}
      {xa.note && <text x={box.right} y={box.bottom + 50} text-anchor="end" font-size="16">{xa.note}</text>}
      <path d={`M${box.left} ${box.top}V${box.bottom}H${box.right}`} fill="none" stroke="#81949e" />
      <text x={box.left + width / 2} y={box.bottom + (xa.note ? 79 : 61)} text-anchor="middle" font-size={fitSize(fullX, 21, width)}>{fullX}</text>
      <text transform={`translate(${box.left - tickWidth - 31} ${box.top + height / 2}) rotate(-90)`} text-anchor="middle" font-size={fitSize(fullY, 21, height)}>{fullY}</text>
      <defs><clipPath id="ib-plot"><rect x={box.left - 4} y={box.top - 4} width={box.right - box.left + 8} height={box.bottom - box.top + 8} /></clipPath></defs>
      <g clip-path="url(#ib-plot)">
        {sampled.map(({ samples, kind }) => {
          let path = "", move = true;
          for (const { x, y } of samples) {
            if (!Number.isFinite(y)) { move = true; continue; }
            path += (move ? "M" : "L") + px(x) + " " + py(y);
            move = false;
          }
          return <path key={kind} d={path} fill="none" stroke={styles[kind].color} stroke-width="3.3" stroke-dasharray={dashPatterns[styles[kind].pattern]} />;
        })}
        {points.map((p, i) => {
          const x = px(p.x), y = py(p.y);
          const left = px(p.x - p.dx), right = px(p.x + p.dx), top = py(p.y + p.dy), bottom = py(p.y - p.dy);
          return <g key={i}>
            {bars && p.dx > 0 && <path stroke={ink} stroke-width="1.8" fill="none" d={`M${left} ${y}H${right} M${left} ${y-6}v12 M${right} ${y-6}v12`} />}
            {bars && p.dy > 0 && <path stroke={ink} stroke-width="1.8" fill="none" d={`M${x} ${top}V${bottom} M${x-6} ${top}h12 M${x-6} ${bottom}h12`} />}
            <circle cx={x} cy={y} r="4.1" />
          </g>;
        })}
      </g>
      {lines.map(({ curve, kind }, i) => {
        const formula = ySymbol + " = " + equation(curve);
        return <g key={kind} transform={`translate(850 ${legendTop + i * 85})`}>
          <path d="M0 0h47" stroke={styles[kind].color} stroke-width="3.5" stroke-dasharray={dashPatterns[styles[kind].pattern]} />
          <text x="59" y="5" font-size="18" font-weight="600">{t[kind]}</text>
          <text x="59" y="34" fill={styles[kind].color} font-size={fitSize(formula, 20, 270)}>{formula}</text>
        </g>;
      })}
      {uncertainties.length > 0 && <g transform={`translate(850 ${legendTop + lines.length * 85})`}>
        <text font-size="18" font-weight="600">{t.uncertainty}</text>
        {uncertainties.map((label, i) =>
          <text key={label} y={29 + 27*i} font-size={fitSize(label, 17, 320)}>{label}</text>)}
      </g>}
    </> : <text x="600" y="355" text-anchor="middle" font-size="25">{points.length ? t.range : t.empty}</text>}
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
