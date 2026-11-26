import { z } from "astro/zod";
import { example } from "./graph.ts";
import { legendSizes, lineKinds, lineStyle, presets, presetVisual, titleSizes, visualSchema, type Typography } from "./visual.ts";

export const draftKey = "ib-graph.project.v1";
export const positions = ["right", "below", "topLeft", "topRight", "bottomRight"] as const;
export const models = ["linear", "quadratic", "exponential", "power", "logarithmic"] as const;
const legendKey = z.enum(["best", "min", "max", "uncertainty", "rSquared"]);
const textField = z.enum(["title", "xName", "yName", "xUnit", "yUnit"]);
const layout = z.object({ titlePosition: z.enum(["canvas","plot", ...positions]), positions: z.record(legendKey, z.enum(positions)) });
export type Appearance = z.infer<typeof layout>;
export type LegendKey = z.infer<typeof legendKey>;
export type Field = z.infer<typeof textField>;
export type Position = typeof positions[number];

const common = z.object({
  format: z.literal("ib-graph"), figureLang: z.enum(["en","zh"]), isExample: z.boolean(),
  rows: z.array(z.array(z.string()).length(4)).min(1), shared: z.array(z.string()).length(2),
  symbols: z.object({ x: z.string(), y: z.string() }),
  custom: z.partialRecord(textField, z.string()), model: z.enum(["none", ...models]),
  bars: z.boolean(), bounds: z.boolean(), showScore: z.boolean(), showUncertainties: z.boolean(),
  significantFigures: z.number().int().min(1).max(8),
});
const projectSchema = common.extend({ version: z.literal(3), appearance: layout, visual: visualSchema, basePreset: z.enum(presets) });
export type Project = z.infer<typeof projectSchema>;
export function newProject(figureLang: Project["figureLang"]): Project {
  return { format: "ib-graph", version: 3, figureLang, isExample: true,
    rows: example.map(([x,y]) => [x,y,"",""]), shared: ["0.001","0.05"], symbols: { x: "x", y: "F" }, custom: {}, model: "linear",
    bars: true, bounds: true, showScore: true, showUncertainties: false, significantFigures: 3,
    appearance: { titlePosition: "canvas", positions: { best: "topLeft", min: "topLeft", max: "topLeft", uncertainty: "topLeft", rSquared: "topLeft" } },
    basePreset: "matplotlib", visual: presetVisual("matplotlib"),
  };
}

const font = z.enum(["auto","serif","sans"]), weight = z.enum(["auto","400","600","700"]);
const oldType = z.object({ font, weight, size: z.union([z.literal(titleSizes), z.literal("auto")]) });
const oldAppearance = layout.extend({ preset: z.enum(presets), font, weight, size: z.literal(legendSizes) });
const oldProject = common.extend({
  grids: z.object({ matplotlib: z.boolean(), origin: z.boolean() }),
  customStyles: z.partialRecord(z.enum(lineKinds), lineStyle.partial()),
});
const version1 = oldProject.extend({ version: z.literal(1), appearance: oldAppearance.extend({
  typography: z.object({ title: oldType, xName: oldType, yName: oldType }),
}) });
const version2 = oldProject.extend({ version: z.literal(2), appearance: oldAppearance.extend({
  typography: z.object({ title: oldType, axes: oldType }),
}) });
function resolveType(style: z.infer<typeof oldType>, fallback: Typography): Typography {
  return { size: style.size === "auto" ? fallback.size : style.size,
    font: style.font === "auto" ? fallback.font : style.font, weight: style.weight === "auto" ? fallback.weight : style.weight };
}

export function readProject(text: string): Project {
  const data = JSON.parse(text);
  if (data?.version !== 1 && data?.version !== 2) return projectSchema.parse(data);
  data.symbols ??= { x: "x", y: data.isExample && data.custom?.yName === undefined ? "F" : "y" };
  const { appearance, grids, customStyles, ...rest } = z.discriminatedUnion("version", [version1, version2]).parse(data);
  const { preset, titlePosition, positions, typography, font, weight, size } = appearance;
  const visual = presetVisual(preset);
  visual.grid = grids[preset];
  for (const kind of lineKinds) Object.assign(visual.lines[kind], customStyles[kind]);
  visual.legend.size = size;
  if (font !== "auto") visual.legend.font = font;
  if (weight !== "auto") visual.legend.weight = visual.legend.detailWeight = weight;
  if (titlePosition !== "canvas" && titlePosition !== "plot") {
    visual.title.size = size;
    visual.title.weight = "600";
  }
  visual.title = resolveType(typography.title, visual.title);
  visual.axes = "axes" in typography ? resolveType(typography.axes, visual.axes)
    : resolveType(typography.xName, resolveType(typography.yName, visual.axes));
  return { ...rest, version: 3, appearance: { titlePosition, positions }, basePreset: preset, visual };
}
