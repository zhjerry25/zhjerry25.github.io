import type { Labels } from "./copy";
import { legendSizes, markerSizes, titleSizes, weights, widths, type Visual } from "./visual";

function Choice<T extends string | number>({ label, value, options, names, onChange }: {
  label: string; value: T; options: readonly T[]; names?: readonly string[]; onChange: (v: T) => void;
}) {
  return <label class="ib-field">{label}<select value={value}
    onChange={e => onChange(options[e.currentTarget.selectedIndex])}>
    {options.map((option, i) => <option key={option} value={option}>{names?.[i] ?? option}</option>)}
  </select></label>;
}

export function VisualSettings({ t, value, onChange }: { t: Labels; value: Visual; onChange: (v: Visual) => void }) {
  const set = (patch: Partial<Visual>) => onChange({ ...value, ...patch });
  const families = ["sans","serif"] as const;
  const familyNames = [t.sans,t.serif], weightNames = [t.regular,t.semibold,t.bold];
  function color(key: "ink" | "tickColor" | "markerColor" | "errorColor" | "gridColor" | "frameColor" | "legendBorder") {
    return <label class="ib-field">{t[key]}<input type="color" value={value[key]}
      onInput={e => set({ [key]: e.currentTarget.value })} /></label>;
  }
  function width(key: "frameWidth" | "lineWidth" | "errorWidth" | "gridWidth") {
    return <Choice label={t[key]} value={value[key]} options={widths} onChange={v => set({ [key]: v })} />;
  }
  return <details class="ib-line-styles">
    <summary>{t.visualOptions}</summary>
    <fieldset class="ib-advanced"><legend>{t.plotAxes}</legend>
      <Choice label={t.frame} value={value.frame} options={["axes","box"] as const} names={[t.leftBottom,t.fullBox]} onChange={frame => set({ frame })} />
      {width("frameWidth")}{color("frameColor")}
      <Choice label={t.tickFont} value={value.tickFont} options={families} names={familyNames} onChange={tickFont => set({ tickFont })} />
      {color("ink")}{color("tickColor")}
      {(["majorTicks","minorTicks"] as const).map(key => <label key={key} class="ib-check"><input type="checkbox" checked={value[key]}
        onChange={e => set({ [key]: e.currentTarget.checked })} />{t[key]}</label>)}
    </fieldset>
    <fieldset class="ib-advanced"><legend>{t.gridStyle}</legend>
      {width("gridWidth")}{color("gridColor")}
    </fieldset>
    <fieldset class="ib-advanced"><legend>{t.marks}</legend>
      <Choice label={t.marker} value={value.marker} options={["circle","square"] as const} names={[t.circle,t.square]} onChange={marker => set({ marker })} />
      <Choice label={t.markerSize} value={value.markerSize} options={markerSizes} onChange={markerSize => set({ markerSize })} />
      {color("markerColor")}{width("lineWidth")}{width("errorWidth")}{color("errorColor")}
    </fieldset>
    {(["title","axes","legend"] as const).map(key => {
      const type = value[key];
      return <fieldset key={key} class="ib-advanced"><legend>{key === "legend" ? t.legendType : t.typeLabels[key]}</legend>
        <Choice label={t.fontSize} value={type.size} options={key === "legend" ? legendSizes : titleSizes}
          onChange={size => set({ [key]: { ...type, size } })} />
        <Choice label={t.fontFamily} value={type.font} options={families} names={familyNames}
          onChange={font => set({ [key]: { ...type, font } })} />
        <Choice label={key === "legend" ? t.legendLabelWeight : t.fontWeight} value={type.weight} options={weights} names={weightNames}
          onChange={weight => set({ [key]: { ...type, weight } })} />
        {key === "legend" && <>
          <Choice label={t.legendDetailWeight} value={value.legend.detailWeight} options={weights} names={weightNames}
            onChange={detailWeight => set({ legend: { ...value.legend, detailWeight } })} />
          {color("legendBorder")}
        </>}
      </fieldset>;
    })}
  </details>;
}
