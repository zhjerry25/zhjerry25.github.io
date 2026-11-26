import { test } from "node:test";
import assert from "node:assert/strict";
import { endpointSlopes, equation, example, fit, parseCell, rSquared } from "./graph.ts";

import { makeAxis } from "./axis.ts";

const point = (x, y, dx = 0, dy = 0) => ({ x, y, dx, dy });
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9 * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);
}

for (const [model, target, coefficients] of [
  ["linear", x => -3*x + 7, [-3, 7]],
  ["quadratic", x => 2*x*x - 4*x + 3, [2, -4, 3]],
  ["exponential", x => 3*Math.exp(-0.4*x), [3, -0.4]],
  ["power", x => 2*x**1.5, [2, 1.5]],
  ["logarithmic", x => 4*Math.log(x) - 2, [4, -2]],
]) {
  test(model + " recovers a known equation", () => {
    const { curve } = fit([1, 2, 4, 5].map(x => point(x, target(x))), model);
    curve.coefficients.forEach((v, i) => close(v, coefficients[i]));
    close(curve.at(3.5), target(3.5));
  });
}

test("endpoint method matches the reference experiment with reversed data", () => {
  const points = [[.003,.49],[.004,.97],[.008,1.44],[.009,1.45],[.020,1.82]].map(([x,y]) => point(x,y,.002,.01)).reverse();
  const {min,max} = endpointSlopes(points);
  assert.deepEqual([fit(points, "linear").curve, min, max].map(line => line.coefficients[0].toFixed(2)), ["65.78","62.38","103.85"]);
  assert.deepEqual([min,max].map(line => line.coefficients[1].toFixed(3)), ["0.438","-0.039"]);
});
test("negative endpoint slopes use the signed extremes", () => {
  const { min, max } = endpointSlopes([point(1, 5, 0.2, 0.1), point(4, 1, 0.1, 0.2)]);
  close(min.coefficients[0], -4.3/2.7);
  close(max.coefficients[0], -3.7/3.3);
});
test("degenerate endpoints and fits return actionable errors", () => {
  assert.equal(endpointSlopes([point(0, 2, 1), point(2, 4, 1)]).error, "overlap");
  assert.equal(endpointSlopes([point(0, 1, 1), point(0, 2), point(5, 3)]).error, "tied");
  assert.equal(fit([point(0, 1)], "linear").error, "few");
  assert.equal(fit([point(1, 2), point(2, 4)], "quadratic").error, "fewQuadratic");
  assert.equal(fit([point(1, 2), point(1, 3)], "linear").error, "singular");
  assert.equal(fit([point(1, 2), point(2, 3), point(1, 3)], "quadratic").error, "singular");
  for (const [model, message] of [["logarithmic","positiveX"], ["power","positiveXY"], ["exponential","positiveY"]])
    assert.equal(fit([point(-1, -1), point(2, 3)], model).error, message);
});
test("measurement cells accept scientific notation and reject non-decimal inputs", () => {
  close(parseCell(" -2.1e-3 "), -.0021);
  for (const value of ["", "0x10", "NaN", "Infinity", "12 m", "1.2.3"]) assert.ok(Number.isNaN(parseCell(value)));
});

test("default measurements illustrate a 50 N/m spring with visible slope bounds", () => {
  const p = example.map(([x,y]) => point(+x,+y,.001,.05));
  const best = fit(p, "linear").curve;
  assert.equal(equation(best, 3), "50.0x + 0.0100");
  const bounds = endpointSlopes(p);
  assert.ok(bounds.min.coefficients[0] < 50 && bounds.max.coefficients[0] > 50);
});

test("offset fits retain small differences in both axes across row orders", () => {
  const p = [0,1,2,3].map(i => point(1e15 + i * .125, 1 + i));
  for (const rows of [p, p.toReversed()]) {
    const curve = fit(rows, "linear").curve;
    assert.equal(equation(curve, 2), "8.0(x − 1000000000000000) + 1.0");
    for (const {x,y} of rows) close(curve.at(x), y);
  }
});

test("axes cover constant, signed, microscopic, large and tightly clustered values", () => {
  for (const [low, high] of [[0,0],[3,3],[-9,-2],[-1,1],[1e-15,5e-15],[-2e9,3e9],[1e15,1e15+.5],[-1e308,1e308]]) {
    const axis = makeAxis(low, high, 5);
    const labels = axis.ticks.map(t => t.label);
    assert.equal(labels.length, new Set(labels).size);
    assert.ok(axis.position(low) >= -1e-12 && axis.position(high) <= 1 + 1e-12);
    assert.ok(axis.position(high) >= axis.position(low));
  }
  assert.equal(makeAxis(1e15,1e15+.5,5).note, "+1000000000000000");
  assert.equal(makeAxis(1e-8,4e-8,5).note, "×10⁻⁸");
  assert.equal(makeAxis(0,Infinity,5), null);
});

test("equation precision preserves significant zeros, signs and powers of ten", () => {
  const curve = { model: "quadratic", coefficients: [50, -0.003009, 0] };
  assert.equal(equation(curve, 2), "5.0×10¹x² − 0.0030x + 0.0");
  assert.equal(equation(curve, 4), "50.00x² − 0.003009x + 0.000");
  for (const [model, expected] of [
    ["linear", "1.20×10⁻⁹x − 2.00"],
    ["exponential", "1.20×10⁻⁹ exp(−2.00x)"],
    ["power", "1.20×10⁻⁹ x^(−2.00)"],
    ["logarithmic", "1.20×10⁻⁹ ln(x) − 2.00"],
  ]) assert.equal(equation({ model, coefficients: [1.2e-9, -2] }, 3), expected);
});

test("R² uses unrounded predictions on the original response scale", () => {
  const p = [point(1,1),point(2,2),point(3,4)];
  close(rSquared(p, fit(p, "linear").curve), 27/28);
  close(rSquared(p, fit(p, "exponential").curve), 1);
  const noisy = [point(1,1), point(2,2), point(3,8)];
  const curve = fit(noisy, "exponential").curve;
  const mean = 11/3;
  const residual = noisy.reduce((sum, {x,y}) => sum + (y-curve.at(x))**2, 0);
  close(rSquared(noisy, curve), 1 - residual / noisy.reduce((sum,p) => sum + (p.y-mean)**2, 0));
  assert.ok(rSquared(p, { at: () => 9 }) < 0);
  assert.equal(rSquared([point(1,7),point(2,7)], { at: () => 7 }), null);
});
