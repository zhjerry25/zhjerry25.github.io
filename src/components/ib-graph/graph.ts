export type Model = "linear" | "quadratic" | "exponential" | "power" | "logarithmic";
export type Point = { x: number; y: number; dx: number; dy: number };
export type Curve = { model: Model; origin?: number; coefficients: number[]; at: (x: number) => number };
type FitError = "few" | "fewQuadratic" | "singular" | "positiveX" | "positiveY" | "positiveXY" | "range";
export type Fit = { curve: Curve; error?: never } | { error: FitError; curve?: never };

export const example = [
  ["0.010", "0.52"], ["0.020", "0.99"], ["0.030", "1.52"],
  ["0.040", "2.02"], ["0.050", "2.49"], ["0.060", "3.02"],
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
  // Subtract a measured value before taking the mean. At large offsets,
  // the mean itself can fall between two representable floating-point values.
  const xBase = xs.reduce((a, b) => Math.min(a, b));
  const yBase = ys.reduce((a, b) => Math.min(a, b));
  const localX = xs.map(x => x - xBase), localY = ys.map(y => y - yBase);
  if (!localX.every(Number.isFinite) || !localY.every(Number.isFinite)) return { error: "range" };
  const center = mean(localX), baseline = mean(localY);
  const scale = localX.reduce((max, x) => Math.max(max, Math.abs(x - center)), 0);
  if (!scale) return { error: "singular" };
  const z = localX.map(x => (x - center) / scale);
  const square = mean(z.map(v => v * v));
  const slope = mean(z.map((v, i) => v * (localY[i] - baseline))) / square;
  let a = 0, b = slope, c = baseline;
  if (model === "quadratic") {
    const skew = mean(z.map(v => v ** 3)) / square;
    const residual = z.map(v => v * v - square - skew * v);
    const norm = mean(residual.map(v => v * v));
    if (norm < 1e-24 || new Set(xs).size < 3) return { error: "singular" };
    a = mean(residual.map((v, i) => v * (localY[i] - baseline))) / norm;
    b -= a * skew;
    c -= a * square;
  }
  // For tightly spaced x values, show the polynomial in (x − origin)
  // so rounding a large intercept in the legend cannot erase the whole signal.
  const polynomial = model === "linear" || model === "quadratic";
  const origin = polynomial && Math.abs(xBase) / scale > 10000 ? xBase : 0;
  const offset = ((xBase - origin) + center) / scale;
  const intercept = yBase + (c - b * offset + a * offset * offset);
  const gradient = (b - 2 * a * offset) / scale;
  let coefficients = [gradient, intercept];
  if (model === "quadratic") coefficients = [a / scale / scale, gradient, intercept];
  if (logY) coefficients = [Math.exp(intercept), gradient];
  const at = (x: number) => {
    const t = (((logX ? Math.log(x) : x) - xBase) - center) / scale;
    const y = yBase + ((a * t + b) * t + c);
    return logY ? Math.exp(y) : y;
  };
  if (!coefficients.every(Number.isFinite) || !points.every(p => Number.isFinite(at(p.x))))
    return { error: "range" };
  return { curve: { model, origin, coefficients, at } };
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
      const origin = Math.abs(left.x) / (right.x - left.x) > 10000 ? left.x : 0;
      const intercept = left.y - m * (left.x - origin);
      if (!Number.isFinite(m) || !Number.isFinite(intercept)) return { error: "range" };
      lines.push({ model: "linear", origin, coefficients: [m, intercept], at: x => left.y + m * (x - left.x) });
    }
  }
  lines.sort((a, b) => a.coefficients[0] - b.coefficients[0]);
  return { min: lines[0], max: lines[lines.length - 1] };
}

export const numberText = (n: number) => String(Number(n.toPrecision(5))).replace(/^-/, "−");

export function equation({ model, origin, coefficients: [a, b, c] }: Curve, significantFigures: number, variable = "x") {
  const coefficient = (value: number) => {
    let text = value.toPrecision(significantFigures);
    // A trailing zero in a whole number is ambiguous without a decimal point.
    if (/^-?\d+0$/.test(text)) text = value.toExponential(significantFigures - 1);
    return text.replace(/^-/, "−").replace(/e([+-]?)(\d+)/, (_, sign, digits: string) =>
      "×10" + (sign === "-" ? "⁻" : "") + [...digits].map(d => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]).join(""));
  };
  const term = (n: number) => (n < 0 ? " − " : " + ") + coefficient(Math.abs(n));
  const x = origin ? "(" + variable + " " + (origin < 0 ? "+ " : "− ") + String(Math.abs(origin)) + ")" : variable;
  switch (model) {
    case "linear": return coefficient(a) + x + term(b);
    case "quadratic": return coefficient(a) + x + "²" + term(b) + x + term(c);
    case "exponential": return coefficient(a) + " exp(" + coefficient(b) + x + ")";
    case "power": return coefficient(a) + " " + x + "^(" + coefficient(b) + ")";
    case "logarithmic": return coefficient(a) + " ln(" + x + ")" + term(b);
  }
}

// Score predictions on the displayed y scale, including log-transformed fits.
// Scale deviations before squaring to avoid overflow and underflow.
export function rSquared(points: Point[], curve: Curve): number | null {
  if (points.length < 2) return null;
  const base = points[0].y;
  const deviations = points.map(p => p.y - base);
  const scale = deviations.reduce((max, d) => Math.max(max, Math.abs(d)), 0);
  if (!scale || !Number.isFinite(scale)) return null;
  const normalized = deviations.map(d => d / scale);
  const mean = normalized.reduce((sum, d) => sum + d / points.length, 0);
  const total = normalized.reduce((sum, d) => sum + (d - mean) ** 2, 0);
  const residual = points.reduce((sum, p) => sum + ((p.y - curve.at(p.x)) / scale) ** 2, 0);
  const score = 1 - residual / total;
  return Number.isFinite(score) ? score : null;
}
