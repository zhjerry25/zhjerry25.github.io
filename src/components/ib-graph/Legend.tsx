import { UnitText } from "./UnitText";
import type { Labels } from "./copy";

import { legendSizes, titleSizes, positions, type Appearance, type LegendKey, type Position, type Typography } from "./project";
export const fonts = {
  sans: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  serif: "'Times New Roman', 'Songti SC', SimSun, serif",
};
export function presetType(appearance: Appearance, key: "title" | "axes") {
  const origin = appearance.preset === "origin";
  const above = appearance.titlePosition === "canvas" || appearance.titlePosition === "plot";
  const font = origin ? "serif" : "sans";
  if (key === "axes") return { size: 21, font, weight: "400" } as const;
  return { size: above ? (origin ? 31 : 33) : appearance.size, font, weight: origin || !above ? "600" : "700" } as const;
}
export type Entry = {
  key: LegendKey | "title"; position: Position; label: string; values: string[];
  textStyle?: { size: number; font: string; weight: string };
  stroke?: { color: string; dash?: string };
};
export function textWidth(text: string, size: number) {
  return Array.from(text).reduce((width, c) => width + (c.charCodeAt(0) > 255 ? 1 : /[MW@]/.test(c) ? .95 : .64), 0) * size;
}
export function fitSize(text: string, size: number, width: number) {
  return Math.min(size, width / (textWidth(text, 1) || 1));
}

const insideScale = 0.88;

export function layoutLegend(entries: Entry[], size: number, margin: number, top: number) {
  const groups = (position: Position) => entries.filter(e => e.position === position);
  const gap = 12, pad = 12;
  const rowHeight = size * 1.38;
  const entryHeight = (e: Entry) => (e.textStyle?.size ?? size) * 1.38 + e.values.length * rowHeight;
  const stackHeight = (items: Entry[]) => items.length
    ? 2 * pad + items.reduce((h, e) => h + entryHeight(e), 0) + gap * (items.length - 1) : 0;
  const side = groups("right"), below = groups("below");
  const left = margin, right = side.length ? 805 : 1200 - margin;
  const bottom = Math.max(600, top + 24 + Math.max(
    stackHeight(side), stackHeight(groups("topLeft")) * insideScale,
    (stackHeight(groups("topRight")) + stackHeight(groups("bottomRight"))) * insideScale + 12,
  ));
  const blocks: {position: Position; scale: number; x: number; y: number; width: number; height: number; items: Entry[]}[] = [];
  for (const position of positions) {
    if (position === "below") continue;
    const items = groups(position);
    if (!items.length) continue;
    const height = stackHeight(items);
    const desiredWidth = Math.max(...items.flatMap(e => [e.label, ...e.values].map(s => textWidth(s, e.textStyle?.size ?? size) + (e.stroke ? 44 : 0)))) + pad * 2;
    // Render the whole inset at one scale, including the frame, type and line sample.
    // Cap its unscaled width at the sidebar width so a long equation stays smaller inside.
    const scale = position === "right" ? 1 : insideScale;
    const width = position === "right" ? 355 : Math.min(desiredWidth, 355, ((right - left) / 2 - 18) / scale);
    const x = position === "right" ? 830 : position === "topLeft" ? left + 10 : right - width * scale - 10;
    const y = position === "right" ? (top + bottom - height) / 2 : position === "bottomRight" ? bottom - height * scale - 10 : top + 10;
    blocks.push({ position, items, x, y, width, height, scale });
  }
  let canvasHeight = bottom + 110;
  // Lay out the lower legend in rows, below both the x title and any axis offset.
  for (let i = 0; i < below.length; i += 3) {
    const row = below.slice(i, i + 3);
    const width = Math.min(550, 1120 / row.length);
    const height = Math.max(...row.map(e => stackHeight([e])));
    row.forEach((entry, j) => blocks.push({ position: "below", items: [entry], width, height, scale: 1,
      x: (1200 - row.length * width) / 2 + j * width, y: canvasHeight - 12 }));
    canvasHeight += height;
  }
  return { left, right, top, bottom, canvasHeight, blocks, rowHeight, gap, pad, entryHeight };
}

export function Legend({ layout, appearance, font, lineWidth, ink }: {
  layout: ReturnType<typeof layoutLegend>; appearance: Appearance; font: string; lineWidth: number; ink: string;
}) {
  const { blocks, rowHeight, gap, pad, entryHeight } = layout;
  const { size, weight } = appearance;
  return <g font-family={font} fill={ink}>
    {blocks.map(block => {
      const inside = block.position !== "right" && block.position !== "below";
      let nextY = pad;
      return <g key={block.position + block.items[0].key} data-position={block.position} transform={`translate(${block.x} ${block.y}) scale(${block.scale})`}>
        {inside && <rect width={block.width} height={block.height} fill="white" stroke={appearance.preset === "origin" ? ink : "#aab8bf"} stroke-width="1" />}
        {block.items.map(entry => {
          const labelSize = entry.textStyle?.size ?? size;
          const y = nextY + labelSize;
          nextY += entryHeight(entry) + gap;
          const x = pad + (entry.stroke ? 44 : 0), available = block.width - x - pad;
          return <g key={entry.key} data-legend={entry.key}>
            {entry.stroke && <path d={`M${pad} ${y-size*.32}h34`} stroke={entry.stroke.color} stroke-width={lineWidth} stroke-dasharray={entry.stroke.dash} />}
            <text x={x} y={y} font-family={entry.textStyle?.font} font-size={fitSize(entry.label, labelSize, available)} font-weight={entry.textStyle?.weight ?? (weight === "auto" ? "600" : weight)}>{entry.label}</text>
            {entry.values.map((v, i) => <text key={i} x={x} y={y + (i+1)*rowHeight}
              fill={entry.stroke?.color ?? ink} font-size={fitSize(v, size, available)} font-weight={weight === "auto" ? "400" : weight}>{entry.key === "uncertainty" ? <UnitText value={v} /> : v}</text>)}
          </g>;
        })}
      </g>;
    })}
  </g>;
}

export function AdvancedSettings({ t, value, onChange, keys }: {
  t: Labels; value: Appearance; onChange: (v: Appearance) => void; keys: LegendKey[];
}) {
  return <details class="ib-line-styles">
    <summary>{t.advanced}</summary>
    <fieldset class="ib-advanced"><legend>{t.placement}</legend>
      <label class="ib-field">{t.title}<select value={value.titlePosition} onChange={e => onChange({ ...value, titlePosition: e.currentTarget.value as Appearance["titlePosition"] })}>
        <option value="canvas">{t.canvasTop}</option><option value="plot">{t.plotTop}</option>
        {positions.map(p => <option key={p} value={p}>{t.positions[p]}</option>)}
      </select></label>
      {keys.map(key => <label class="ib-field" key={key}>{t[key]}<select value={value.positions[key]}
        onChange={e => onChange({ ...value, positions: { ...value.positions, [key]: e.currentTarget.value as Position } })}>
        {positions.map(p => <option key={p} value={p}>{t.positions[p]}</option>)}
      </select></label>)}
    </fieldset>
    <TypeControls t={t} label={t.legendType} style={value} sizes={legendSizes} defaults={{ font: presetType(value, "axes").font }}
      onChange={style => onChange({ ...value, ...style, size: style.size as Appearance["size"] })} />
    {(["title", "axes"] as const).map(key =>
      <TypeControls key={key} t={t} label={t.typeLabels[key]} style={value.typography[key]} defaults={presetType(value, key)}
        sizes={titleSizes} onChange={style => onChange({
          ...value, typography: { ...value.typography, [key]: style },
        })} />)}
  </details>;
}

function TypeControls({ t, label, style, sizes, defaults, onChange }: {
  t: Labels; label: string; style: Typography; sizes: readonly number[]; defaults: { size?: number; font: "serif" | "sans"; weight?: "400" | "600" | "700" };
  onChange: (style: Typography) => void;
}) {
  const weights = { "400": t.regular, "600": t.semibold, "700": t.bold };
  const presetLabel = (value: string | number) => value + " (" + t.presetValue + ")";
  return <fieldset class="ib-advanced"><legend>{label}</legend>
      <label class="ib-field">{t.fontSize}<select value={style.size} onChange={e => onChange({ ...style, size: e.currentTarget.value === "auto" ? "auto" : Number(e.currentTarget.value) as Typography["size"] })}>
        {defaults.size !== undefined && <option value="auto">{presetLabel(defaults.size)}</option>}
        {sizes.map(n => <option key={n} value={n}>{n}</option>)}</select></label>
      <label class="ib-field">{t.fontFamily}<select value={style.font} onChange={e => onChange({ ...style, font: e.currentTarget.value as Appearance["font"] })}>
        <option value="auto">{presetLabel(t[defaults.font])}</option><option value="serif">{t.serif}</option><option value="sans">{t.sans}</option></select></label>
      <label class="ib-field">{t.fontWeight}<select value={style.weight} onChange={e => onChange({ ...style, weight: e.currentTarget.value as Appearance["weight"] })}>
        <option value="auto">{presetLabel(defaults.weight ? weights[defaults.weight] + " " + defaults.weight : t.legendWeights)}</option><option value="400">{t.regular}</option><option value="600">{t.semibold}</option><option value="700">{t.bold}</option></select></label>
    </fieldset>;
}
