import { useEffect, useState } from "react";

export function useDebouncedValue(
  value,
  { delay = 300, lowercase = false, trim = true } = {},
) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      let nextValue = typeof value === "string" ? value : String(value ?? "");

      if (trim) nextValue = nextValue.trim();
      if (lowercase) nextValue = nextValue.toLowerCase();

      setDebouncedValue(nextValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, lowercase, trim, value]);

  return debouncedValue;
}
