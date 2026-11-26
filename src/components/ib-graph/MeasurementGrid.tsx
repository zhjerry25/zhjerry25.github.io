import { memo } from "preact/compat";
import type { JSX } from "preact";
import type { Labels } from "./copy";
import { parseCell, type Point } from "./graph";

export const columns = ["x", "y", "Δx", "Δy"];
export const emptyRow = () => ["", "", "", ""];

export function readMeasurements(rows: string[][], shared: string[], t: Labels) {
  const sharedValues = shared.map(v => v.trim() ? parseCell(v) : 0);
  const points: Point[] = [];
  const errors = rows.map(row => {
    if (row.every(cell => !cell.trim())) return [];
    const values = row.map((cell, i) => i >= 2 && !cell.trim() ? sharedValues[i-2] : parseCell(cell));
    const messages = values.map((value, i) => {
      if (i < 2 && !row[i].trim()) return t.required;
      if (i >= 2 && !row[i].trim() && (!Number.isFinite(value) || value < 0)) return t.inheritedError;
      if (!Number.isFinite(value)) return t.numeric;
      if (i >= 2 && value < 0) return t.unsigned;
      if (i >= 2 && Number.isFinite(values[i-2]) &&
          (!Number.isFinite(values[i-2] + value) || !Number.isFinite(values[i-2] - value))) return t.range;
      return "";
    });
    if (!messages.some(Boolean)) points.push({ x: values[0], y: values[1], dx: values[2], dy: values[3] });
    return messages;
  });
  return { points, errors, sharedValues };
}

export const MeasurementGrid = memo(function MeasurementGrid({ rows, shared, t, errors, onRows }: {
  rows: string[][]; shared: string[]; t: Labels; errors: string[][]; onRows: (rows: string[][]) => void;
}) {
  function updateCell(row: number, column: number, value: string) {
    onRows(rows.map((cells, i) => i === row
      ? cells.map((cell, j) => j === column ? value : cell) : cells));
  }
  function paste(event: JSX.TargetedClipboardEvent<HTMLInputElement>, row: number, col: number) {
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!/[\t\n\r]/.test(text)) return;
    event.preventDefault();
    const block = text.replace(/\r\n?/g, "\n").replace(/\n+$/, "").split("\n").map(line => line.split("\t"));
    const next = rows.map(cells => [...cells]);
    block.forEach((cells, i) => {
      const target = next[row + i] ?? (next[row + i] = emptyRow());
      cells.slice(0, 4 - col).forEach((value, j) => { target[col + j] = value.trim(); });
    });
    onRows(next);
  }
  return <table class="ib-grid"><thead><tr><th scope="col">#</th>{columns.map(c => <th scope="col" key={c}>{c}</th>)}<th scope="col"><span class="sr-only">{t.remove}</span></th></tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}>
            <th scope="row">{i + 1}</th>
            {row.map((cell, j) => <td key={j}>
              <input aria-label={columns[j] + " · " + (i+1)} value={cell} inputMode="text" autoComplete="off"
                placeholder={j >= 2 ? (shared[j-2] || "0") : "—"} aria-invalid={!!errors[i][j]}
                aria-describedby={errors[i][j] ? `ib-error-${i}-${j}` : undefined}
                onInput={e => updateCell(i, j, e.currentTarget.value)} onPaste={e => paste(e, i, j)} />
              {errors[i][j] && <small id={`ib-error-${i}-${j}`}>{errors[i][j]}</small>}
            </td>)}
            <td><button class="ib-delete" aria-label={t.remove + " " + (i+1)} onClick={() =>
              onRows(rows.length === 1 ? [emptyRow()] : rows.filter((_, n) => n !== i))}>×</button></td>
          </tr>)}</tbody>
        </table>;
});
