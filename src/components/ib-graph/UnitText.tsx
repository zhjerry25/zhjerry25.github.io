// A small LaTeX-style subset for units. Keep ordinary and unfinished input as text.
export function UnitText({ value }: { value: string }) {
  const parts = [];
  const script = /([\^_])(?:\{([^{}]+)\}|([+−-]?\d+|[\p{L}]))/gu;
  let end = 0;
  for (const match of value.matchAll(script)) {
    parts.push(value.slice(end, match.index));
    parts.push(<tspan key={match.index} baseline-shift={match[1] === "^" ? "super" : "sub"}
      font-size="72%">{match[2] ?? match[3]}</tspan>);
    end = match.index + match[0].length;
  }
  parts.push(value.slice(end));
  return <>{parts}</>;
}
