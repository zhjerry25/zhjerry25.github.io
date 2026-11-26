import { z } from "astro/zod";
import { example } from "./graph.ts";

export const draftKey = "ib-graph.project.v1";
export const positions = ["right", "below", "topLeft", "topRight", "bottomRight"] as const;
export const models = ["linear", "quadratic", "exponential", "power", "logarithmic"] as const;
const font = z.enum(["auto", "serif", "sans"]);
const weight = z.enum(["auto", "400", "600", "700"]);
export const legendSizes = [12,14,16,18,20,22,24] as const;
export const titleSizes = [12,14,16,18,20,21,22,24,28,32,36,40] as const;
const typeStyle = z.object({ font, weight, size: z.union([z.literal(titleSizes), z.literal("auto")]) });
const legendKey = z.enum(["best", "min", "max", "uncertainty", "rSquared"]);
const textField = z.enum(["title", "xName", "yName", "xUnit", "yUnit"]);

const appearanceSchema = z.object({
  preset: z.enum(["matplotlib", "origin"]),
  titlePosition: z.enum(["canvas", "plot", ...positions]),
  positions: z.record(legendKey, z.enum(positions)),
  font, weight, size: z.literal(legendSizes),
  typography: z.object({ title: typeStyle, axes: typeStyle }),
});
export type Appearance = z.infer<typeof appearanceSchema>;
export type Typography = z.infer<typeof typeStyle>;
export type LegendKey = z.infer<typeof legendKey>;
export type Field = z.infer<typeof textField>;
export type Position = typeof positions[number];
export type Preset = Appearance["preset"];

const defaultType: Typography = { size: "auto", font: "auto", weight: "auto" };
export const defaultAppearance: Appearance = {
  preset: "matplotlib", titlePosition: "canvas",
  positions: { best: "topLeft", min: "topLeft", max: "topLeft", uncertainty: "topLeft", rSquared: "topLeft" },
  font: "auto", size: 18, weight: "auto",
  typography: { title: defaultType, axes: defaultType },
};

const projectSchema = z.object({
  format: z.literal("ib-graph"), version: z.literal(2),
  figureLang: z.enum(["en","zh"]), isExample: z.boolean(),
  rows: z.array(z.array(z.string()).length(4)).min(1), shared: z.array(z.string()).length(2),
  custom: z.partialRecord(textField, z.string()), model: z.enum(["none", ...models]),
  bars: z.boolean(), bounds: z.boolean(), showScore: z.boolean(), showUncertainties: z.boolean(),
  significantFigures: z.number().int().min(1).max(8),
  appearance: appearanceSchema, grids: z.object({ matplotlib: z.boolean(), origin: z.boolean() }),
  customStyles: z.partialRecord(z.enum(["best","min","max"]), z.object({
    color: z.string().regex(/^#[a-f\d]{6}$/i).optional(),
    pattern: z.enum(["solid","longDash","shortDash","dashDot"]).optional(),
  })),
});
export type Project = z.infer<typeof projectSchema>;
export function newProject(figureLang: Project["figureLang"]): Project {
  return { format: "ib-graph", version: 2, figureLang, isExample: true,
    rows: example.map(([x,y]) => [x,y,"",""]), shared: ["0.001","0.05"], custom: {}, model: "linear",
    bars: true, bounds: true, showScore: true, showUncertainties: false, significantFigures: 3,
    appearance: defaultAppearance, grids: { matplotlib: true, origin: false }, customStyles: {},
  };
}
const legacyProject = projectSchema.extend({
  version: z.literal(1),
  appearance: appearanceSchema.extend({
    typography: z.object({ title: typeStyle, xName: typeStyle, yName: typeStyle }),
  }),
});

export function readProject(text: string): Project {
  const data = JSON.parse(text);
  if (data?.version !== 1) return projectSchema.parse(data);
  const old = legacyProject.parse(data);
  const { title, xName, yName } = old.appearance.typography;
  // Keep explicit settings from either axis; prefer x when both were set.
  const axes = {
    size: xName.size === "auto" ? yName.size : xName.size,
    font: xName.font === "auto" ? yName.font : xName.font,
    weight: xName.weight === "auto" ? yName.weight : xName.weight,
  };
  return { ...old, version: 2, appearance: { ...old.appearance, typography: { title, axes } } };
}
