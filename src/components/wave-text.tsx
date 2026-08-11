// Splits by grapheme cluster (not raw code point) so Thai combining marks
// stay attached to their base consonant instead of animating separately.
function graphemes(text: string): { char: string; key: string }[] {
  const segments =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
          (s) => s.segment,
        )
      : Array.from(text);
  return segments.map((char, i) => ({ char, key: `${i}-${char}` }));
}

export function WaveText({ text, className }: Readonly<{ text: string; className?: string }>) {
  return (
    <span className={className}>
      {graphemes(text).map(({ char, key }, i) => (
        <span
          key={key}
          className="inline-block animate-[wave_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
