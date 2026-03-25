"use client";

import { useT } from "@/contexts/LanguageContext";

type FilterType = "all" | "lost" | "found";

interface Props {
  filter: FilterType;
  neighborhood: string;
  onFilterChange: (f: FilterType) => void;
  onNeighborhoodChange: (n: string) => void;
}

export default function FilterBar({ filter, neighborhood, onFilterChange, onNeighborhoodChange }: Props) {
  const { t } = useT();

  const options: { value: FilterType; label: string }[] = [
    { value: "all", label: t.radarPet.filterAll },
    { value: "lost", label: t.radarPet.filterLost },
    { value: "found", label: t.radarPet.filterFound },
  ];

  return (
    <div className="border-3 border-border brutal-shadow bg-background p-4 flex flex-wrap gap-4 items-center">
      <div className="flex border-3 border-border" style={{ boxShadow: "3px 3px 0 var(--border)" }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`font-body text-xs font-bold uppercase tracking-wide px-4 py-2 transition-all ${
              filter === opt.value
                ? "bg-foreground text-background"
                : "bg-background text-foreground hover:bg-muted/10"
            } ${opt.value !== "all" ? "border-l-3 border-border" : ""}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={neighborhood}
        onChange={(e) => onNeighborhoodChange(e.target.value)}
        placeholder={t.radarPet.filterByNeighborhood}
        className="border-3 border-border bg-background font-body text-xs px-3 py-2 w-48 focus:outline-none"
      />
    </div>
  );
}
