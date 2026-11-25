export type Model = "linear" | "quadratic" | "exponential" | "power" | "logarithmic";
export type Point = { x: number; y: number; dx: number; dy: number };
export type Curve = { model: Model; coefficients: number[]; at: (x: number) => number };
type FitError = "few" | "fewQuadratic" | "singular" | "positiveX" | "positiveY" | "positiveXY" | "range";
export type Fit = { curve: Curve; error?: never } | { error: FitError; curve?: never };

export const example = [
  ["0.003", "0.49"], ["0.004", "0.97"], ["0.008", "1.44"],
  ["0.009", "1.45"], ["0.020", "1.82"],
];

export function parseCell(value: string) {
  const trimmed = value.trim();
  return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(trimmed)
    ? Number(trimmed) : NaN;
}

// Center and scale x before solving. For quadratics, orthogonalize x²
// against both 1 and x so the small least-squares system stays well scaled.
export function fit(points: Point[], model: Model): Fit {
  if (points.length < (model === "quadratic" ? 3 : 2))
    return { error: model === "quadratic" ? "fewQuadratic" : "few" };
  const logX = model === "power" || model === "logarithmic";
  const logY = model === "power" || model === "exponential";
  if (model === "power" && points.some(p => p.x <= 0 || p.y <= 0)) return { error: "positiveXY" };
  if (logX && points.some(p => p.x <= 0)) return { error: "positiveX" };
  if (logY && points.some(p => p.y <= 0)) return { error: "positiveY" };

  const xs = points.map(p => logX ? Math.log(p.x) : p.x);
  const ys = points.map(p => logY ? Math.log(p.y) : p.y);
  const mean = (v: number[]) => v.reduce((a, b) => a + b / v.length, 0);
  const center = mean(xs), baseline = mean(ys);
  const scale = xs.reduce((max, x) => Math.max(max, Math.abs(x - center)), 0);
  if (!scale || xs.every(x => x === xs[0])) return { error: "singular" };
  const z = xs.map(x => (x - center) / scale);
  const square = mean(z.map(v => v * v));
  const slope = mean(z.map((v, i) => v * (ys[i] - baseline))) / square;
  let a = 0, b = slope, c = baseline;
  if (model === "quadratic") {
    const skew = mean(z.map(v => v ** 3)) / square;
    const residual = z.map(v => v * v - square - skew * v);
    const norm = mean(residual.map(v => v * v));
    if (norm < 1e-24 || new Set(xs).size < 3) return { error: "singular" };
    a = mean(residual.map((v, i) => v * (ys[i] - baseline))) / norm;
    b -= a * skew;
    c -= a * square;
  }
  const offset = center / scale;
  const intercept = c - b * offset + a * offset * offset;
  const gradient = (b - 2 * a * offset) / scale;
  let coefficients = [gradient, intercept];
  if (model === "quadratic") coefficients = [a / scale / scale, gradient, intercept];
  if (logY) coefficients = [Math.exp(intercept), gradient];
  const at = (x: number) => {
    const t = ((logX ? Math.log(x) : x) - center) / scale;
    const y = (a * t + b) * t + c;
    return logY ? Math.exp(y) : y;
  };
  if (!coefficients.every(Number.isFinite) || !points.every(p => Number.isFinite(at(p.x))))
    return { error: "range" };
  return { curve: { model, coefficients, at } };
}

function corners(p: Point) {
  return [-p.dx, p.dx].flatMap(dx => [-p.dy, p.dy].map(dy => ({ x: p.x + dx, y: p.y + dy })));
}

export function endpointSlopes(points: Point[]): { min?: Curve; max?: Curve; error?: "overlap" | "tied" | "range" } {
  if (points.length < 2) return {};
  const sorted = [...points].sort((a, b) => a.x - b.x);
  const first = sorted[0], last = sorted[sorted.length - 1];
  if (!(first.dx || first.dy || last.dx || last.dy)) return {};
  if (first.x === sorted[1].x || last.x === sorted[sorted.length - 2].x) return { error: "tied" };
  if (first.x + first.dx >= last.x - last.dx) return { error: "overlap" };
  const lines: Curve[] = [];
  for (const left of corners(first)) {
    for (const right of corners(last)) {
      const m = (right.y - left.y) / (right.x - left.x);
      const intercept = left.y - m * left.x;
      if (!Number.isFinite(m) || !Number.isFinite(intercept)) return { error: "range" };
      lines.push({ model: "linear", coefficients: [m, intercept], at: x => left.y + m * (x - left.x) });
    }
  }
  lines.sort((a, b) => a.coefficients[0] - b.coefficients[0]);
  return { min: lines[0], max: lines[lines.length - 1] };
}

export const numberText = (n: number) => String(Number(n.toPrecision(5))).replace(/^-/, "−");

export function equation({ model, coefficients: [a, b, c] }: Curve) {
  const term = (n: number) => (n < 0 ? " − " : " + ") + numberText(Math.abs(n));
  switch (model) {
    case "linear": return numberText(a) + "x" + term(b);
    case "quadratic": return numberText(a) + "x²" + term(b) + "x" + term(c);
    case "exponential": return numberText(a) + " exp(" + numberText(b) + "x)";
    case "power": return numberText(a) + " x^(" + numberText(b) + ")";
    case "logarithmic": return numberText(a) + " ln(x)" + term(b);
  }
}
