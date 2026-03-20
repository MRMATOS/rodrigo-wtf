"use client";

type Shift     = "all" | "day" | "night";
type Intensity = "all" | "high" | "quiet";

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
  return (
    <div className="flex flex-col gap-1 w-28">
      <Chip active={shift === "all"}   onClick={() => onShiftChange("all")}>   🕐 Todos</Chip>
      <Chip active={shift === "day"}   onClick={() => onShiftChange("day")}>   ☀️ Dia</Chip>
      <Chip active={shift === "night"} onClick={() => onShiftChange("night")}> 🌙 Noite</Chip>
      <div className="h-px bg-black dark:bg-white my-0.5" />
      <Chip active={intensityFilter === "all"}   onClick={() => onIntensityChange("all")}>   Tudo</Chip>
      <Chip active={intensityFilter === "high"}  onClick={() => onIntensityChange("high")}>  🔴 Crítico</Chip>
      <Chip active={intensityFilter === "quiet"} onClick={() => onIntensityChange("quiet")}> 🟢 Sossego</Chip>
    </div>
  );
}
