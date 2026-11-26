import { test } from "node:test";
import assert from "node:assert/strict";
import { newProject, readProject } from "./project.ts";

test("project files preserve entered cells, overrides and typography", () => {
  const project = newProject("zh");
  project.rows = [["1e-", "0.0200", "", "0"], ["", "", "", ""]];
  project.custom.title = "实验 A";
  project.appearance = { ...project.appearance, typography: {
    ...project.appearance.typography, axes: { size: 28, font: "serif", weight: "700" },
  }};
  project.customStyles.best = { color: "#12ab56" };
  assert.deepEqual(readProject(JSON.stringify(project)), project);
});
test("invalid or unsupported files are rejected before replacing a graph", () => {
  const p = newProject("en");
  for (const invalid of ["{}", "bad json", JSON.stringify({ ...p, version: 3 }),
    JSON.stringify({ ...p, rows: [["1", "2"]] }), JSON.stringify({ ...p, significantFigures: 0 }),
    JSON.stringify({ ...p, appearance: { ...p.appearance, positions: {} } })])
    assert.throws(() => readProject(invalid));
});

test("v1 drafts keep their positions and combine explicit axis settings", () => {
  const p = newProject("en");
  p.version = 1;
  p.appearance = { ...p.appearance, positions: { ...p.appearance.positions, best: "right" },
    typography: { title: p.appearance.typography.title, xName: { size: 28, font: "auto", weight: "600" },
      yName: { size: 24, font: "serif", weight: "auto" } } };
  const migrated = readProject(JSON.stringify(p));
  assert.equal(migrated.version, 2);
  assert.equal(migrated.appearance.positions.best, "right");
  assert.deepEqual(migrated.appearance.typography.axes, { size: 28, font: "serif", weight: "600" });
});
