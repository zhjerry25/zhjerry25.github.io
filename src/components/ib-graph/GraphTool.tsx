import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { MeasurementGrid, readMeasurements, columns, emptyRow } from "./MeasurementGrid";
import type { Lang } from "../../i18n/utils";
import { copy } from "./copy";
import { Figure, downloadPng } from "./Figure";
import { AdvancedSettings } from "./Legend";
import { draftKey, newProject, readProject, models, type Project, type Field, type LegendKey } from "./project";
import { rSquared, endpointSlopes, fit } from "./graph";
import { VisualSettings } from "./VisualSettings";
import { matchingPreset, presetVisual, type LineStyle, type Preset, type Visual } from "./visual";
import "./tool.css";

export default function GraphTool({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [project, setProject] = useState(() => newProject(lang));
  const { figureLang, isExample, rows, shared, custom, symbols, model, bars, showUncertainties, significantFigures,
    bounds, appearance, visual, showScore } = project;
  const f = copy[figureLang];
  const [resetCount, setResetCount] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<"draftHint" | "draftPending" | "draftSaved" | "draftRestored" | "cacheError" | "badDraft">("draftHint");
  const [fileStatus, setFileStatus] = useState<"fileOpened" | "invalidFile" | "saveFailed" | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const openRequest = useRef(0);
  const initialized = useRef(false);
  const restored = useRef<Project | null>(null);
  useLayoutEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      try {
        const text = localStorage.getItem(draftKey);
        if (text !== null) {
          try {
            restored.current = readProject(text);
            setProject(restored.current);
            setCacheStatus("draftRestored");
          } catch { setCacheStatus("badDraft"); }
        }
      } catch { setCacheStatus("cacheError"); }
      return;
    }
    if (project === restored.current) return;
    restored.current = null;
    let pending = true;
    const flush = () => {
      if (!pending) return;
      pending = false;
      try {
        localStorage.setItem(draftKey, JSON.stringify(project));
        setCacheStatus("draftSaved");
      } catch { setCacheStatus("cacheError"); }
    };
    const onVisibility = () => { if (document.hidden) flush(); };
    setCacheStatus("draftPending");
    const timer = window.setTimeout(flush, 250);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [project]);

  function edit(changes: Partial<Project>) {
    setProject(previous => ({ ...previous, ...changes }));
  }
  function saveProject() {
    setFileStatus(null);
    try {
      const file = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = (labels.title.replace(/[\\/:*?"<>|]/g, "-").trim().slice(0, 100) || "ib-graph") + ".ibgraph.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    } catch { setFileStatus("saveFailed"); }
  }
  async function openProject(file?: File) {
    if (!file) return;
    const request = ++openRequest.current;
    try {
      const next = readProject(await file.text());
      if (request !== openRequest.current) return;
      setProject(next);
      setExportError(false);
      setFileStatus("fileOpened");
    } catch { if (request === openRequest.current) setFileStatus("invalidFile"); }
  }
  const styles = visual.lines;
  const activePreset = useMemo(() => matchingPreset(visual), [visual]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const labels = {
    title: isExample ? f.sampleTitle : "",
    xName: isExample ? f.sampleX : "x", yName: isExample ? f.sampleY : "y",
    xUnit: isExample ? "m" : "", yUnit: isExample ? "N" : "", ...custom,
  };
  const { sharedValues, points, errors } = useMemo(() => readMeasurements(rows, shared, t), [rows, shared, t]);
  const { result, extremes, lines } = useMemo(() => {
    const result = model !== "none" && points.length ? fit(points, model) : undefined;
    const extremes = model === "linear" && bounds && result?.curve ? endpointSlopes(points) : {};
    const lines = [
      ...(result?.curve ? [{ kind: "best" as const, curve: result.curve }] : []),
      ...(extremes.min ? [{ kind: "min" as const, curve: extremes.min }] : []),
      ...(extremes.max ? [{ kind: "max" as const, curve: extremes.max }] : []),
    ];
    return { result, extremes, lines };
  }, [model, points, bounds]);
  const score = useMemo(() => showScore && result?.curve ? rSquared(points, result.curve) : undefined, [result, points, showScore]);
  const legendKeys: LegendKey[] = lines.map(line => line.kind);
  if (score !== undefined) legendKeys.push("rSquared");
  if (showUncertainties) legendKeys.push("uncertainty");

  function changeStyle(kind: keyof Visual["lines"], change: Partial<LineStyle>) {
    edit({ visual: { ...visual, lines: { ...styles, [kind]: { ...styles[kind], ...change } } } });
  }
  const changeRows = useCallback((rows: string[][]) => setProject(previous => ({ ...previous, rows })), []);
  function resetAll() {
    if (!window.confirm(t.confirmReset)) return;
    ++openRequest.current;
    const initial = newProject(lang);
    restored.current = initial;
    setProject(initial);
    setZoom(false);
    setFileStatus(null);
    setExportError(false);
    setResetCount(n => n + 1);
    try {
      localStorage.removeItem(draftKey);
      setCacheStatus("draftHint");
    } catch { setCacheStatus("cacheError"); }
  }
  function startBlank() {
    edit({ isExample: false, rows: [emptyRow()], shared: ["", ""], custom: {}, symbols: { x: "x", y: "y" } });
    setFileStatus(null);
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
    return <div class="ib-field">
      <label for={"ib-" + key}>{t[key]}</label>
      <input id={"ib-" + key} value={labels[key]} onInput={e => edit({ custom: { ...custom, [key]: e.currentTarget.value } })} />
    </div>;
  }
  function symbolField(axis: "x" | "y") {
    return <label class="ib-field">{axis === "x" ? t.xSymbol : t.ySymbol}
      <input value={symbols[axis]} placeholder={axis}
        onInput={e => edit({ symbols: { ...symbols, [axis]: e.currentTarget.value } })} />
    </label>;
  }
  return <div class="ib-tool" key={resetCount}>
    <section class="ib-preview" aria-label={t.preview}>
      <div class="ib-toolbar">
        <h2>{t.preview}</h2>
        <button class="ib-zoom" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? t.fitWidth : t.zoom}</button>
        <label class="ib-language">{t.preset}
          <select aria-label={t.preset} value={activePreset} onChange={e => {
            const preset = e.currentTarget.value as Preset;
            edit({ basePreset: preset, visual: presetVisual(preset) });
          }}>
            {activePreset === "custom" && <option value="custom" disabled>{t.customStyle}</option>}
            <option value="matplotlib">Matplotlib</option><option value="origin">Origin</option>
          </select>
        </label>
        <label class="ib-language">{t.lang}
          <select aria-label={t.lang} value={figureLang} onChange={e => edit({ figureLang: e.currentTarget.value as Lang })}>
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
        xSymbol={symbols.x.trim() || "x"} ySymbol={symbols.y.trim() || "y"} xUnit={labels.xUnit}
        yUnit={labels.yUnit} points={points} lines={lines} visual={visual} bars={bars}
        showUncertainties={showUncertainties} significantFigures={significantFigures} appearance={appearance} score={score} />
      </div>
      {(result?.error || extremes.error || exportError) && <p class="ib-notice" role="status">
        {result?.error && t[result.error]} {extremes.error && t[extremes.error]} {exportError && t.exportError}
      </p>}
      <div class="ib-legend-options">
        <label class="ib-check"><input type="checkbox" checked={visual.grid}
          onChange={e => edit({ visual: { ...visual, grid: e.currentTarget.checked } })} />{t.showGrid}</label>
        <label class="ib-check"><input type="checkbox" checked={showUncertainties}
          onChange={e => edit({ showUncertainties: e.currentTarget.checked })} />{t.showUncertainties}</label>
        {result?.curve && <label class="ib-check" title={t.scoreHint}><input type="checkbox" checked={showScore}
          onChange={e => edit({ showScore: e.currentTarget.checked })} />{t.showScore}</label>}
        {lines.length > 0 && <label class="ib-language">{t.significantFigures}
          <select aria-label={t.significantFigures} value={significantFigures}
            onChange={e => edit({ significantFigures: Number(e.currentTarget.value) })}>
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
      <AdvancedSettings t={t} value={appearance} onChange={appearance => edit({ appearance })} keys={legendKeys} />
      <VisualSettings t={t} value={visual} onChange={visual => edit({ visual })} />
    </section>
    <div class="ib-project-files">
      <button type="button" onClick={saveProject}>{t.saveProject}</button>
      <button type="button" onClick={() => fileInput.current?.click()}>{t.openProject}</button>
      <button type="button" onClick={resetAll}>{t.resetAll}</button>
      <input hidden type="file" ref={fileInput} accept=".json,application/json" onChange={e => {
        const file = e.currentTarget.files?.[0];
        e.currentTarget.value = "";
        void openProject(file);
      }} />
      <span role="status">{fileStatus && t[fileStatus] + " "}{t[cacheStatus]}</span>
    </div>
    <div class="ib-editors">
      <section class="ib-panel">
        <h2>{t.data}</h2>
        <p class="ib-help">{t.hint}</p>
        <MeasurementGrid rows={rows} shared={shared} errors={errors} t={t} onRows={changeRows} />
        <div class="ib-actions">
          <button onClick={() => edit({ rows: [...rows, emptyRow()] })}>＋ {t.add}</button>
          <button class="ib-text-button" onClick={startBlank}>{t.blank}</button>
        </div>
        <div class="ib-section">
          <h3>{t.defaults}</h3><p class="ib-help">{t.inherit}</p>
          <div class="ib-pair">{shared.map((value, i) => <label class="ib-field" key={i}>{columns[i+2]}
            <input value={value} placeholder="0" aria-invalid={!(Number.isFinite(sharedValues[i]) && sharedValues[i] >= 0)}
              onInput={e => edit({ shared: shared.map((old, j) => i === j ? e.currentTarget.value : old) })} />
            {(!Number.isFinite(sharedValues[i]) || sharedValues[i] < 0) && <small>{t.unsigned}</small>}
          </label>)}</div>
        </div>
      </section>
      <section class="ib-panel">
        <h2>{t.labels}</h2>
        <div class="ib-fields">{field("title")}
          <div class="ib-axis">{field("xName")}{field("xUnit")}</div>
          <div class="ib-axis">{field("yName")}{field("yUnit")}</div>
          <div class="ib-pair">{symbolField("x")}{symbolField("y")}</div>
          <p class="ib-symbol-hint">{t.symbolHint}</p>
          <details class="ib-unit-help"><summary>{t.unitHelp}</summary>
            <p>{t.unitSyntax}</p>
            <p><code>m^2</code> → m² · <code>{"m s^{-2}"}</code> → m s⁻² · <code>H_2O</code> → H₂O</p>
          </details>
        </div>
        <div class="ib-section"><h3>{t.options}</h3>
          <label class="ib-field">{t.model}<select aria-label={t.model} value={model} onChange={e => edit({ model: e.currentTarget.value as typeof model })}>
            <option value="none">{t.none}</option>
            {models.map(key => <option value={key} key={key}>{t[key]}</option>)}
          </select></label>
          {(model === "exponential" || model === "power") && <p class="ib-help">{t.logFit}</p>}
          <label class="ib-check"><input type="checkbox" checked={bars} onChange={e => edit({ bars: e.currentTarget.checked })} />{t.bars}</label>
          {model === "linear" && <label class="ib-check"><input type="checkbox" checked={bounds} onChange={e => edit({ bounds: e.currentTarget.checked })} />{t.bounds}</label>}
        </div>
      </section>
    </div>
  </div>;
}
