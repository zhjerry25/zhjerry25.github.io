// Work in scaled coordinates so very small measurements and large offsets
// get distinct ticks without printing the same long number at every gridline.
export function makeAxis(low: number, high: number, intervals: number) {
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high) return null;
  const span = high - low;
  const offset = span > 0 && Math.abs(low) / span > 10000 ? low : 0;
  const magnitude = Math.max(Math.abs(low - offset), Math.abs(high - offset));
  const order = magnitude ? Math.floor(Math.log10(magnitude)) : 0;
  const exponent = order <= -4 || order >= 5 ? Math.max(-323, order) : 0;
  const factor = 10 ** exponent;
  const scaled = (n: number) => (n - offset) / factor;
  let min = scaled(low), max = scaled(high);
  if (min === max) {
    const padding = Math.abs(min) * 0.1 || 1;
    min -= padding;
    max += padding;
  }
  const rawStep = (max - min) / intervals;
  const power = 10 ** Math.floor(Math.log10(rawStep));
  const multiple = [1, 2, 2.5, 4, 5, 10].find(n => n >= rawStep / power) ?? 10;
  const step = multiple * power;
  // Ignore round-off when an endpoint lies exactly on a decimal gridline.
  const snap = (n: number) => Math.abs(n - Math.round(n)) <= 8 * Number.EPSILON * Math.max(1, Math.abs(n)) ? Math.round(n) : n;
  const first = Math.floor(snap(min / step)), last = Math.ceil(snap(max / step));
  const count = last - first;
  if (!Number.isFinite(count) || count < 1 || count > 20) return null;
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + (multiple === 2.5 ? 1 : 0));
  const ticks = Array.from({length: count + 1}, (_, i) => ({
    position: i / count,
    label: ((first + i) * step).toFixed(decimals).replace(/^-/, "−"),
  }));
  const superscript = (n: number) => String(n).replace(/[-\d]/g, c => c === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]);
  const note = [
    exponent ? "×10" + superscript(exponent) : "",
    offset ? (offset < 0 ? "−" : "+") + String(Math.abs(offset)) : "",
  ].filter(Boolean).join(" ");
  return { ticks, note, position: (n: number) => (scaled(n) - first * step) / (count * step) };
}
