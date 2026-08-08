'use client';

export function FilterBar({
  query,
  onQueryChange,
  placeholder = 'Filter…',
  chips,
  activeChip,
  onChipChange,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  placeholder?: string;
  chips?: { id: string; label: string }[];
  activeChip?: string;
  onChipChange?: (id: string) => void;
}) {
  return (
    <div className="filter-bar">
      <input
        type="search"
        className="input"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={placeholder}
      />
      {chips?.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className={`chip${activeChip === chip.id ? ' active' : ''}`}
          onClick={() => onChipChange?.(chip.id)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
