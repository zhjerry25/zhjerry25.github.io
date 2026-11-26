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
  typography: z.object({ title: typeStyle, xName: typeStyle, yName: typeStyle }),
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
  positions: { best: "right", min: "right", max: "right", uncertainty: "right", rSquared: "right" },
  font: "auto", size: 18, weight: "auto",
  typography: { title: defaultType, xName: defaultType, yName: defaultType },
};

const projectSchema = z.object({
  format: z.literal("ib-graph"), version: z.literal(1),
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
  return { format: "ib-graph", version: 1, figureLang, isExample: true,
    rows: example.map(([x,y]) => [x,y,"",""]), shared: ["0.001","0.05"], custom: {}, model: "linear",
    bars: true, bounds: true, showScore: true, showUncertainties: false, significantFigures: 3,
    appearance: defaultAppearance, grids: { matplotlib: true, origin: false }, customStyles: {},
  };
}
export function readProject(text: string): Project {
  return projectSchema.parse(JSON.parse(text));
}
