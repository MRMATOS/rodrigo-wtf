"use client";

import { useT } from "@/contexts/LanguageContext";

export type Shift     = "all" | "day" | "night";
export type Intensity = "all" | "high" | "quiet";

interface Props {
  shift:            Shift;
  intensityFilter:  Intensity;
  onShiftChange:    (v: Shift)     => void;
  onIntensityChange:(v: Intensity) => void;
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full font-body text-xs uppercase tracking-wide px-3 py-2 transition-all active:scale-95 text-right ${
        active ? "map-chip-active" : "map-chip"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({ shift, intensityFilter, onShiftChange, onIntensityChange }: Props) {
  const { t } = useT();
  return (
    <div className="flex flex-col w-full">
      <Chip active={shift === "day"}   onClick={() => onShiftChange(shift === "day"   ? "all" : "day")}>   {t.map.filter.day}</Chip>
      <Chip active={shift === "night"} onClick={() => onShiftChange(shift === "night" ? "all" : "night")}> {t.map.filter.night}</Chip>
      <div className="h-px bg-black dark:bg-white" />
      <Chip active={intensityFilter === "high"}  onClick={() => onIntensityChange(intensityFilter === "high"  ? "all" : "high")}>  🔴 {t.map.filter.critical}</Chip>
      <Chip active={intensityFilter === "quiet"} onClick={() => onIntensityChange(intensityFilter === "quiet" ? "all" : "quiet")}> 🟢 {t.map.filter.quietFilter}</Chip>
    </div>
  );
}
