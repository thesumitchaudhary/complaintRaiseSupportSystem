export function HighlightedText({
  value,
  searchTerm,
  className = "bg-yellow-300 text-slate-950",
}) {
  const text = String(value || "-");
  const needle = String(searchTerm || "").trim();

  if (!needle) return text;

  const lowerText = text.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const parts = [];
  let cursor = 0;
  let matchIndex = lowerText.indexOf(lowerNeedle);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push(text.slice(cursor, matchIndex));
    }

    const matchEnd = matchIndex + needle.length;
    parts.push(
      <mark
        key={`${matchIndex}-${matchEnd}`}
        className={`rounded px-0.5 ${className}`}
      >
        {text.slice(matchIndex, matchEnd)}
      </mark>,
    );

    cursor = matchEnd;
    matchIndex = lowerText.indexOf(lowerNeedle, cursor);
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
}
