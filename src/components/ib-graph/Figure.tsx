import { memo } from "preact/compat";
import { useMemo } from "preact/hooks";
import type { Ref } from "preact";
import { Legend, fitSize, fonts, layoutLegend, presetType, type Entry } from "./Legend";
import { UnitText } from "./UnitText";
import type { Appearance } from "./project";
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
function preparePlot(points: Point[], lines: Line[], bars: boolean) {
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
  return { xa, ya, sampled };
}

export function Figure({ svgRef, t, title, xLabel, yLabel, ySymbol, xUnit, yUnit, points, lines, styles, bars, showUncertainties, significantFigures, appearance, score, showGrid }: {
  svgRef: Ref<SVGSVGElement>; t: Labels; title: string; xLabel: string; yLabel: string; ySymbol: string;
  xUnit: string; yUnit: string; points: Point[]; lines: Line[]; styles: typeof defaultStyles; bars: boolean;
  showUncertainties: boolean; significantFigures: number; appearance: Appearance; showGrid: boolean; score: number | null | undefined;
}) {
  const plot = useMemo(() => preparePlot(points, lines, bars), [points, lines, bars]);
  const { xa, ya } = plot;
  const plotted = points.length > 0 && xa && ya;
  const uncertainties: string[] = [];
  if (showUncertainties && points.length) {
    for (const key of ["dx", "dy"] as const) {
      const value = points[0][key];
      if (value <= 0 || !points.every(p => p[key] === value)) continue;
      const unit = key === "dx" ? xUnit : yUnit;
      const symbol = key === "dx" ? "x" : ySymbol;
      uncertainties.push("Δ" + symbol + " = ±" + numberText(value) + (unit ? " " + unit : ""));
    }
  }
  const origin = appearance.preset === "origin";
  const ink = origin ? "#111111" : "#182c39";
  const lineWidth = origin ? 1.9 : 3.3;
  const family = origin ? "serif" : "sans";
  const topTitle = appearance.titlePosition === "canvas" || appearance.titlePosition === "plot";
  function resolveType(key: "title" | "axes") {
    const style = appearance.typography[key], defaults = presetType(appearance, key);
    return {
      size: style.size === "auto" ? defaults.size : style.size,
      weight: style.weight === "auto" ? defaults.weight : style.weight,
      font: fonts[style.font === "auto" ? defaults.font : style.font],
    };
  }
  const titleStyle = resolveType("title"), axisStyle = resolveType("axes");
  const entries: Entry[] = [];
  if (title && appearance.titlePosition !== "plot" && appearance.titlePosition !== "canvas") {
    entries.push({ key: "title", position: appearance.titlePosition, label: title, values: [], textStyle: titleStyle });
  }
  for (const { kind, curve } of lines) {
    const style = styles[kind];
    entries.push({ key: kind, position: appearance.positions[kind], label: t[kind],
      values: [ySymbol + " = " + equation(curve, significantFigures)],
      stroke: { color: style.color, dash: dashPatterns[style.pattern] } });
  }
  if (score !== undefined) {
    const value = score === null ? t.undefinedValue : numberText(score);
    const roundedToOne = value === "1" && score !== 1;
    entries.push({ key: "rSquared", position: appearance.positions.rSquared,
      label: "R² " + (roundedToOne ? "≈ " : "= ") + value, values: [] });
  }
  if (uncertainties.length) entries.push({ key: "uncertainty", position: appearance.positions.uncertainty,
    label: t.uncertainty, values: uncertainties });
  const fullX = xLabel + (xUnit ? " (" + xUnit + ")" : "");
  const fullY = yLabel + (yUnit ? " (" + yUnit + ")" : "");
  const tickWidth = Math.max(0, ...(ya?.ticks.map(tick => tick.label.length) ?? [])) * 11;
  const margin = Math.max(78, (fullY ? 68 + Math.max(0, axisStyle.size - 21) : 30) + tickWidth);
  const box = layoutLegend(entries, appearance.size, margin, title && topTitle ? 120 : 68);
  const width = box.right - box.left, height = box.bottom - box.top;
  const abovePlot = appearance.titlePosition === "plot";
  const titleX = abovePlot ? box.left + width / 2 : 600;
  return <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" width="1200" height={box.canvasHeight}
    viewBox={`0 0 1200 ${box.canvasHeight}`} role="img" font-weight="400" aria-label={title || t.preview} font-family={fonts[family]} fill={ink}>
    <title>{title || t.preview}</title>
    <rect width="1200" height={box.canvasHeight} fill="white" />
    {topTitle && <text x={titleX} y={abovePlot ? box.top - (ya?.note ? 49 : 28) : 65} text-anchor="middle"
      font-family={titleStyle.font} font-weight={titleStyle.weight} font-size={fitSize(title, titleStyle.size, abovePlot ? width : 1110)}>{title}</text>}
    {plotted ? <>
      {showGrid && <g data-grid="" stroke={origin ? "#dedede" : "#e1e7ea"} stroke-width={origin ? 0.8 : 1}>
        {xa.ticks.map(({position}) => <path key={"x" + position} d={`M${box.left + position * width} ${box.top}v${height}`} />)}
        {ya.ticks.map(({position}) => <path key={"y" + position} d={`M${box.left} ${box.bottom - position * height}h${width}`} />)}
      </g>}
      {xa.ticks.map(({position, label}) => {
        const x = box.left + position * width;
        return <g key={label}>
          {origin && <path d={`M${x} ${box.top}v8 M${x} ${box.bottom}v-8`} stroke={ink} stroke-width="1.3" />}
          <text x={x} y={box.bottom + 26} text-anchor="middle" font-size="17">{label}</text>
        </g>;
      })}
      {ya.ticks.map(({position, label}) => {
        const y = box.bottom - position * height;
        return <g key={label}>
          {origin && <path d={`M${box.left} ${y}h8 M${box.right} ${y}h-8`} stroke={ink} stroke-width="1.3" />}
          <text x={box.left - 12} y={y + 5} text-anchor="end" font-size="17">{label}</text>
        </g>;
      })}
      {origin && <g stroke={ink} stroke-width="0.9">
        {xa.ticks.slice(1).map((tick, i) => {
          const x = box.left + width * (tick.position + xa.ticks[i].position) / 2;
          return <path key={i} d={`M${x} ${box.top}v4 M${x} ${box.bottom}v-4`} />;
        })}
        {ya.ticks.slice(1).map((tick, i) => {
          const y = box.bottom - height * (tick.position + ya.ticks[i].position) / 2;
          return <path key={i} d={`M${box.left} ${y}h4 M${box.right} ${y}h-4`} />;
        })}
      </g>}
      {ya.note && <text x={box.left} y={box.top - 11} font-size="16">{ya.note}</text>}
      {xa.note && <text x={box.right} y={box.bottom + 50} text-anchor="end" font-size="16">{xa.note}</text>}
      {origin ? <rect x={box.left} y={box.top} width={width} height={height} fill="none" stroke={ink} stroke-width="1.5" />
        : <path d={`M${box.left} ${box.top}V${box.bottom}H${box.right}`} fill="none" stroke="#81949e" />}
      <text x={box.left + width / 2} y={box.bottom + (xa.note ? 79 : 61) + Math.max(0, axisStyle.size - 21) * .7} text-anchor="middle" font-family={axisStyle.font} font-weight={axisStyle.weight} font-size={fitSize(fullX, axisStyle.size, width)}>{xLabel}{xUnit && <> (<UnitText value={xUnit} />)</>}</text>
      <text transform={`translate(${box.left - tickWidth - 31 - Math.max(0, axisStyle.size - 21) * .4} ${box.top + height / 2}) rotate(-90)`} text-anchor="middle" font-family={axisStyle.font} font-weight={axisStyle.weight} font-size={fitSize(fullY, axisStyle.size, height)}>{yLabel}{yUnit && <> (<UnitText value={yUnit} />)</>}</text>
      <defs><clipPath id="ib-plot"><rect x={box.left - 4} y={box.top - 4} width={box.right - box.left + 8} height={box.bottom - box.top + 8} /></clipPath></defs>
      <DataMarks plot={plot} points={points} styles={styles} bars={bars} origin={origin} ink={ink} lineWidth={lineWidth}
        left={box.left} bottom={box.bottom} width={width} height={height} />
      <Legend layout={box} appearance={appearance} ink={ink} lineWidth={lineWidth}
        font={fonts[appearance.font === "auto" ? family : appearance.font]} />
    </> : <text x="600" y="355" text-anchor="middle" font-size="25">{points.length ? t.range : t.empty}</text>}
  </svg>;
}

const DataMarks = memo(function DataMarks({ plot, points, styles, bars, origin, ink, lineWidth, left, bottom, width, height }: {
  plot: ReturnType<typeof preparePlot>; points: Point[]; styles: typeof defaultStyles; bars: boolean; origin: boolean;
  ink: string; lineWidth: number; left: number; bottom: number; width: number; height: number;
}) {
  const { xa, ya, sampled } = plot;
  if (!xa || !ya) return null;
  const px = (x: number) => left + xa.position(x) * width;
  const py = (y: number) => bottom - ya.position(y) * height;
  return <g clip-path="url(#ib-plot)">
        {sampled.map(({ samples, kind }) => {
          let path = "", move = true;
          for (const { x, y } of samples) {
            if (!Number.isFinite(y)) { move = true; continue; }
            path += (move ? "M" : "L") + px(x) + " " + py(y);
            move = false;
          }
          return <path key={kind} d={path} fill="none" stroke={styles[kind].color} stroke-width={lineWidth} stroke-dasharray={dashPatterns[styles[kind].pattern]} />;
        })}
        {points.map((p, i) => {
          const x = px(p.x), y = py(p.y);
          const left = px(p.x - p.dx), right = px(p.x + p.dx), top = py(p.y + p.dy), bottom = py(p.y - p.dy);
          return <g key={i}>
            {bars && p.dx > 0 && <path stroke={ink} stroke-width={origin ? 1.1 : 1.8} fill="none" d={`M${left} ${y}H${right} M${left} ${y-6}v12 M${right} ${y-6}v12`} />}
            {bars && p.dy > 0 && <path stroke={ink} stroke-width={origin ? 1.1 : 1.8} fill="none" d={`M${x} ${top}V${bottom} M${x-6} ${top}h12 M${x-6} ${bottom}h12`} />}
            {origin ? <rect x={x-3} y={y-3} width="6" height="6" /> : <circle cx={x} cy={y} r="4.1" />}
          </g>;
        })}
      </g>;
});

export async function downloadPng(svg: SVGSVGElement, title: string) {
  const source = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = svg.viewBox.baseVal.width * 2;
    canvas.height = Math.ceil(image.naturalHeight * 2);
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
