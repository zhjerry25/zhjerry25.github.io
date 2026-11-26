import { z } from "astro/zod";

export const presets = ["matplotlib", "origin"] as const;
export type Preset = typeof presets[number];
export const lineKinds = ["best", "min", "max"] as const;
export const patterns = ["solid", "longDash", "shortDash", "dashDot"] as const;
export const legendSizes = [12,14,16,18,20,22,24] as const;
export const titleSizes = [12,14,16,18,20,21,22,24,28,31,32,33,36,40] as const;
export const widths = [0.5,0.8,1,1.1,1.5,1.8,1.9,2,2.5,3,3.3,4,5] as const;
export const markerSizes = [3,4,6,8,8.2,10,12] as const;
export const weights = ["400","600","700"] as const;
const font = z.enum(["sans","serif"]), weight = z.enum(weights);
const color = z.string().regex(/^#[\da-f]{6}$/i).transform(s => s.toLowerCase());
const width = z.literal(widths);
export const lineStyle = z.object({ color, pattern: z.enum(patterns) });
const typography = z.object({ font, weight, size: z.literal(titleSizes) });
export const visualSchema = z.object({
  frame: z.enum(["axes","box"]), frameColor: color, frameWidth: width,
  majorTicks: z.boolean(), minorTicks: z.boolean(), tickFont: font, ink: color, tickColor: color, markerColor: color, errorColor: color,
  grid: z.boolean(), gridColor: color, gridWidth: width,
  marker: z.enum(["circle","square"]), markerSize: z.literal(markerSizes),
  lineWidth: width, errorWidth: width, legendBorder: color,
  title: typography, axes: typography,
  legend: z.object({ font, size: z.literal(legendSizes), weight, detailWeight: weight }),
  lines: z.record(z.enum(lineKinds), lineStyle),
});
export type Visual = z.infer<typeof visualSchema>;
export type Typography = z.infer<typeof typography>;
export type LineStyle = z.infer<typeof lineStyle>;

export function presetVisual(preset: Preset): Visual {
  const origin = preset === "origin";
  const family = origin ? "serif" : "sans";
  const ink = origin ? "#111111" : "#182c39";
  return {
    frame: origin ? "box" : "axes", frameColor: origin ? "#111111" : "#81949e", frameWidth: origin ? 1.5 : 1,
    majorTicks: origin, minorTicks: origin, tickFont: family, ink, tickColor: ink, markerColor: ink, errorColor: ink,
    grid: !origin, gridColor: origin ? "#dedede" : "#e1e7ea", gridWidth: origin ? 0.8 : 1,
    marker: origin ? "square" : "circle", markerSize: origin ? 6 : 8.2,
    lineWidth: origin ? 1.9 : 3.3, errorWidth: origin ? 1.1 : 1.8, legendBorder: origin ? "#111111" : "#aab8bf",
    title: { size: origin ? 31 : 33, font: family, weight: origin ? "600" : "700" },
    axes: { size: 21, font: family, weight: "400" },
    legend: { size: 18, font: family, weight: "600", detailWeight: "400" },
    lines: {
      best: { color: origin ? "#222222" : "#20649d", pattern: "solid" },
      min: { color: origin ? "#25579d" : "#108477", pattern: "longDash" },
      max: { color: origin ? "#b63632" : "#bc551d", pattern: "shortDash" },
    },
  };
}

// Normalize property order so reordered fields in an imported file still match.
const signatures = presets.map(preset => JSON.stringify(visualSchema.parse(presetVisual(preset))));
export function matchingPreset(visual: Visual) {
  const index = signatures.indexOf(JSON.stringify(visualSchema.parse(visual)));
  return index < 0 ? "custom" : presets[index];
}
