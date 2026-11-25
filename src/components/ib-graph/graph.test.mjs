import { test } from "node:test";
import assert from "node:assert/strict";
import { endpointSlopes, example, fit, parseCell } from "./graph.ts";

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

test("spring example reproduces the three reference slopes in either row order", () => {
  const points = example.map(([x,y]) => point(+x,+y,0.002,0.01)).reverse();
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
