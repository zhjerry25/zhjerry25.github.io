import { useRef, useState } from "preact/hooks";
import type { JSX } from "preact";
import type { Lang } from "../../i18n/utils";
import { copy } from "./copy";
import { Figure, defaultStyles, downloadPng, type LineStyle } from "./Figure";
import { AdvancedSettings, defaultAppearance, type Preset, type LegendKey } from "./Legend";
import { rSquared, endpointSlopes, example, fit, parseCell, type Model, type Point } from "./graph";
import "./tool.css";

const columns = ["x", "y", "Δx", "Δy"];
const models: Model[] = ["linear", "quadratic", "exponential", "power", "logarithmic"];
const emptyRow = () => ["", "", "", ""];
type Field = "title" | "xName" | "yName" | "xUnit" | "yUnit";

export default function GraphTool({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [figureLang, setFigureLang] = useState<Lang>(lang);
  const f = copy[figureLang];
  const [isExample, setIsExample] = useState(true);
  const [rows, setRows] = useState(() => example.map(([x, y]) => [x, y, "", ""]));
  const [shared, setShared] = useState(["0.001", "0.05"]);
  const [custom, setCustom] = useState<Partial<Record<Field, string>>>({});
  const [model, setModel] = useState<Model | "none">("linear");
  const [bars, setBars] = useState(true);
  const [showUncertainties, setShowUncertainties] = useState(false);
  const [significantFigures, setSignificantFigures] = useState(3);
  const [zoom, setZoom] = useState(false);
  const [bounds, setBounds] = useState(true);
  const [appearance, setAppearance] = useState(defaultAppearance);
  const [grids, setGrids] = useState({ matplotlib: true, origin: false });
  const [showScore, setShowScore] = useState(true);
  const [customStyles, setCustomStyles] = useState<Partial<Record<keyof typeof defaultStyles, Partial<LineStyle>>>>({});
  const styles = { ...defaultStyles };
  const originColors = { best: "#222222", min: "#25579d", max: "#b63632" };
  for (const kind of ["best", "min", "max"] as const) {
    styles[kind] = { ...defaultStyles[kind], color: appearance.preset === "origin" ? originColors[kind] : defaultStyles[kind].color, ...customStyles[kind] };
  }
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const labels = {
    title: isExample ? f.sampleTitle : "",
    xName: isExample ? f.sampleX : "x", yName: isExample ? f.sampleY : "y",
    xUnit: isExample ? "m" : "", yUnit: isExample ? "N" : "", ...custom,
  };
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
  const result = model !== "none" && points.length ? fit(points, model) : undefined;
  const extremes = model === "linear" && bounds && result?.curve ? endpointSlopes(points) : {};
  const lines = [
    ...(result?.curve ? [{ kind: "best" as const, curve: result.curve }] : []),
    ...(extremes.min ? [{ kind: "min" as const, curve: extremes.min }] : []),
    ...(extremes.max ? [{ kind: "max" as const, curve: extremes.max }] : []),
  ];

  const score = showScore && result?.curve ? rSquared(points, result.curve) : undefined;
  const legendKeys: LegendKey[] = lines.map(line => line.kind);
  if (score !== undefined) legendKeys.push("rSquared");
  if (showUncertainties) legendKeys.push("uncertainty");

  function changeStyle(kind: keyof typeof defaultStyles, change: Partial<LineStyle>) {
    setCustomStyles(previous => ({ ...previous, [kind]: { ...previous[kind], ...change } }));
  }
  function updateCell(row: number, column: number, value: string) {
    setRows(previous => previous.map((cells, i) => i === row
      ? cells.map((cell, j) => j === column ? value : cell) : cells));
  }
  function paste(event: JSX.TargetedClipboardEvent<HTMLInputElement>, row: number, col: number) {
    const text = event.clipboardData?.getData("text/plain") ?? "";
    if (!/[\t\n\r]/.test(text)) return;
    event.preventDefault();
    const block = text.replace(/\r\n?/g, "\n").replace(/\n+$/, "").split("\n").map(line => line.split("\t"));
    setRows(previous => {
      const next = previous.map(cells => [...cells]);
      block.forEach((cells, i) => {
        const target = next[row + i] ?? (next[row + i] = emptyRow());
        cells.slice(0, 4 - col).forEach((value, j) => { target[col + j] = value.trim(); });
      });
      return next;
    });
  }
  function startBlank() {
    setIsExample(false);
    setRows([emptyRow()]);
    setShared(["", ""]);
    setCustom({});
    setCustomStyles({});
    setExportError(false);
  }
  async function save() {
    if (!svg.current) return;
    setExporting(true);
    setExportError(false);
    try { await downloadPng(svg.current, labels.title); }
    catch { setExportError(true); }
    finally { setExporting(false); }
  }
  function field(key: Field) {
    return <label class="ib-field">{t[key]}<input value={labels[key]}
      onInput={e => setCustom({ ...custom, [key]: e.currentTarget.value })} /></label>;
  }
  return <div class="ib-tool">
    <section class="ib-preview" aria-label={t.preview}>
      <div class="ib-toolbar">
        <h2>{t.preview}</h2>
        <button class="ib-zoom" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? t.fitWidth : t.zoom}</button>
        <label class="ib-language">{t.preset}
          <select aria-label={t.preset} value={appearance.preset} onChange={e => setAppearance({ ...appearance, preset: e.currentTarget.value as Preset })}>
            <option value="matplotlib">Matplotlib</option><option value="origin">Origin</option>
          </select>
        </label>
        <label class="ib-language">{t.lang}
          <select aria-label={t.lang} value={figureLang} onChange={e => setFigureLang(e.currentTarget.value as Lang)}>
            <option value="zh">中文</option><option value="en">English</option>
          </select>
        </label>
        <button class="ib-primary" onClick={save} disabled={!points.length || exporting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" /></svg>
          {exporting ? t.exporting : t.download}
        </button>
      </div>
      <div class={"ib-canvas" + (zoom ? " is-zoomed" : "")}>
      <Figure svgRef={svg} t={f} title={labels.title} xLabel={labels.xName} yLabel={labels.yName}
        ySymbol={isExample && custom.yName === undefined ? "F" : "y"} xUnit={labels.xUnit}
        yUnit={labels.yUnit} points={points} lines={lines} styles={styles} bars={bars}
        showUncertainties={showUncertainties} significantFigures={significantFigures} appearance={appearance} score={score} showGrid={grids[appearance.preset]} />
      </div>
      {(result?.error || extremes.error || exportError) && <p class="ib-notice" role="status">
        {result?.error && t[result.error]} {extremes.error && t[extremes.error]} {exportError && t.exportError}
      </p>}
      <div class="ib-legend-options">
        <label class="ib-check"><input type="checkbox" checked={grids[appearance.preset]}
          onChange={e => setGrids({ ...grids, [appearance.preset]: e.currentTarget.checked })} />{t.showGrid}</label>
        <label class="ib-check"><input type="checkbox" checked={showUncertainties}
          onChange={e => setShowUncertainties(e.currentTarget.checked)} />{t.showUncertainties}</label>
        {result?.curve && <label class="ib-check" title={t.scoreHint}><input type="checkbox" checked={showScore}
          onChange={e => setShowScore(e.currentTarget.checked)} />{t.showScore}</label>}
        {lines.length > 0 && <label class="ib-language">{t.significantFigures}
          <select aria-label={t.significantFigures} value={significantFigures}
            onChange={e => setSignificantFigures(Number(e.currentTarget.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>}
      </div>
      {lines.length > 0 && <details class="ib-line-styles">
        <summary>{t.lineStyles}</summary>
        <datalist id="ib-palette">
          {["#20649d", "#108477", "#bc551d", "#8545a3", "#b43d61", "#26343d"].map(color =>
            <option key={color} value={color} />)}
        </datalist>
        {lines.map(({ kind }) => <div class="ib-line-row" key={kind}>
          <span>{t[kind]}</span>
          <input type="color" list="ib-palette" value={styles[kind].color}
            aria-label={t[kind] + " · " + t.color} title={t.color}
            onInput={e => changeStyle(kind, { color: e.currentTarget.value })} />
          <select aria-label={t[kind] + " · " + t.pattern} value={styles[kind].pattern}
            onChange={e => changeStyle(kind, { pattern: e.currentTarget.value as LineStyle["pattern"] })}>
            {Object.entries(t.patterns).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select>
        </div>)}
      </details>}
      <AdvancedSettings t={t} value={appearance} onChange={setAppearance} keys={legendKeys} />
    </section>
    <div class="ib-editors">
      <section class="ib-panel">
        <h2>{t.data}</h2>
        <p class="ib-help">{t.hint}</p>
        <table class="ib-grid"><thead><tr><th scope="col">#</th>{columns.map(c => <th scope="col" key={c}>{c}</th>)}<th scope="col"><span class="sr-only">{t.remove}</span></th></tr></thead>
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
              setRows(rows.length === 1 ? [emptyRow()] : rows.filter((_, n) => n !== i))}>×</button></td>
          </tr>)}</tbody>
        </table>
        <div class="ib-actions">
          <button onClick={() => setRows([...rows, emptyRow()])}>＋ {t.add}</button>
          {isExample && <button class="ib-text-button" onClick={startBlank}>{t.blank}</button>}
        </div>
        <div class="ib-section">
          <h3>{t.defaults}</h3><p class="ib-help">{t.inherit}</p>
          <div class="ib-pair">{shared.map((value, i) => <label class="ib-field" key={i}>{columns[i+2]}
            <input value={value} placeholder="0" aria-invalid={!(Number.isFinite(sharedValues[i]) && sharedValues[i] >= 0)}
              onInput={e => setShared(shared.map((old, j) => i === j ? e.currentTarget.value : old))} />
            {(!Number.isFinite(sharedValues[i]) || sharedValues[i] < 0) && <small>{t.unsigned}</small>}
          </label>)}</div>
        </div>
      </section>
      <section class="ib-panel">
        <h2>{t.labels}</h2>
        <div class="ib-fields">{field("title")}
          <div class="ib-axis">{field("xName")}{field("xUnit")}</div>
          <div class="ib-axis">{field("yName")}{field("yUnit")}</div>
        </div>
        <div class="ib-section"><h3>{t.options}</h3>
          <label class="ib-field">{t.model}<select aria-label={t.model} value={model} onChange={e => setModel(e.currentTarget.value as typeof model)}>
            <option value="none">{t.none}</option>
            {models.map(key => <option value={key} key={key}>{t[key]}</option>)}
          </select></label>
          {(model === "exponential" || model === "power") && <p class="ib-help">{t.logFit}</p>}
          <label class="ib-check"><input type="checkbox" checked={bars} onChange={e => setBars(e.currentTarget.checked)} />{t.bars}</label>
          {model === "linear" && <label class="ib-check"><input type="checkbox" checked={bounds} onChange={e => setBounds(e.currentTarget.checked)} />{t.bounds}</label>}
        </div>
      </section>
    </div>
  </div>;
}
