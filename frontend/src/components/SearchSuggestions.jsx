export function SearchSuggestions({
  items,
  getKey,
  getLabel,
  onSelect,
  className,
  itemClassName,
}) {
  if (items.length === 0) return null;

  return (
    <div
      className={`absolute left-0 top-full z-50 mt-1 w-full overflow-hidden border shadow-lg ${className}`}
    >
      {items.map((item, index) => {
        const label = getLabel(item);

        return (
          <button
            key={getKey(item, index)}
            type="button"
            className={`block w-full px-4 py-3 text-left text-sm transition-colors ${itemClassName}`}
            onClick={() => onSelect(item)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
