import { test } from "node:test";
import assert from "node:assert/strict";
import { newProject, readProject } from "./project.ts";
import { matchingPreset, presetVisual } from "./visual.ts";

function oldProject() {
  const { symbols, visual, basePreset, ...project } = newProject("en");
  const auto = { size: "auto", weight: "auto", font: "auto" };
  return { ...project, version: 2, appearance: { ...project.appearance, preset: "matplotlib",
    font: "auto", size: 18, weight: "auto", typography: { title: auto, axes: auto } },
    grids: { matplotlib: true, origin: false }, customStyles: {} };
}
test("project files preserve entered cells, symbols and custom visual settings", () => {
  const project = newProject("zh");
  project.rows = [["1e-", "0.0200", "", "0"], ["", "", "", ""]];
  project.custom.title = "实验 A";
  project.custom.yName = "速度";
  project.symbols = { x: "t", y: "v_0" };
  project.visual.axes = { size: 28, font: "serif", weight: "700" };
  project.visual.lines.best.color = "#12ab56";
  assert.deepEqual(readProject(JSON.stringify(project)), project);
});
test("a preset can be reconstructed or mixed using only its individual settings", () => {
  const visual = presetVisual("matplotlib");
  const target = presetVisual("origin");
  assert.equal(matchingPreset(visual), "matplotlib");
  visual.marker = "square";
  assert.equal(matchingPreset(visual), "custom");
  for (const [key, value] of Object.entries(target)) visual[key] = value;
  assert.equal(matchingPreset(visual), "origin");
  visual.legend.detailWeight = "600";
  assert.equal(matchingPreset(visual), "custom");
  visual.legend.detailWeight = "400";
  assert.equal(matchingPreset(visual), "origin");
});
test("older projects keep their visible symbols and default style", () => {
  for (const [isExample, custom, y] of [[true, {}, "F"], [true, { yName: "Load" }, "y"], [false, {}, "y"]]) {
    const restored = readProject(JSON.stringify({ ...oldProject(), isExample, custom }));
    assert.deepEqual(restored.symbols, { x: "x", y });
    assert.deepEqual(restored.visual, presetVisual("matplotlib"));
  }
});
test("v2 resolves explicit overrides and position-dependent title defaults", () => {
  const p = oldProject();
  Object.assign(p.appearance, { preset: "origin", titlePosition: "below", size: 14, weight: "700" });
  p.grids.origin = true;
  p.customStyles.min = { pattern: "dashDot" };
  const g = readProject(JSON.stringify(p));
  assert.equal(g.basePreset, "origin");
  assert.deepEqual(g.visual.title, { font:"serif", size:14, weight:"600" });
  assert.deepEqual(g.visual.legend, { font:"serif", size:14, weight:"700", detailWeight:"700" });
  assert.equal(g.visual.grid, true);
  assert.deepEqual(g.visual.lines.min, { color:"#25579d", pattern:"dashDot" });
  assert.equal(g.appearance.titlePosition, "below");
  assert.deepEqual(readProject(JSON.stringify(g)), g);
});
test("invalid or unsupported files are rejected before replacing a graph", () => {
  const p = newProject("en");
  for (const invalid of ["{}", "bad json", JSON.stringify({ ...p, version: 4 }),
    JSON.stringify({ ...p, rows: [["1", "2"]] }), JSON.stringify({ ...p, significantFigures: 0 }),
    JSON.stringify({ ...p, visual: { ...p.visual, marker: "bad" } }),
    JSON.stringify({ ...p, appearance: { ...p.appearance, positions: {} } })])
    assert.throws(() => readProject(invalid));
});
test("v1 drafts keep their positions and combine explicit axis settings", () => {
  const p = oldProject();
  p.version = 1;
  p.appearance.positions.best = "right";
  p.appearance.typography = { title: p.appearance.typography.title, xName: { size: 28, font: "auto", weight: "600" },
    yName: { size: 24, font: "serif", weight: "auto" } };
  const migrated = readProject(JSON.stringify(p));
  assert.equal(migrated.version, 3);
  assert.deepEqual(migrated.symbols, { x: "x", y: "F" });
  assert.equal(migrated.appearance.positions.best, "right");
  assert.deepEqual(migrated.visual.axes, { size: 28, font: "serif", weight: "600" });
});
