"use client";

import { useT } from "@/contexts/LanguageContext";
import type { ResolvedVia } from "../_lib/supabase-pets";

interface Props {
  onConfirm: (via: ResolvedVia) => void;
  onClose: () => void;
}

export default function ResolveModal({ onConfirm, onClose }: Props) {
  const { t } = useT();
  const m = t.radarPet.resolveModal;

  const options: { via: ResolvedVia; label: string }[] = [
    { via: "platform", label: m.optionPlatform },
    { via: "other", label: m.optionOther },
    { via: "no", label: m.optionNo },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[40] bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm bg-[#F4F4F0] border-3 border-black text-black p-8 flex flex-col gap-4"
          style={{ boxShadow: "6px 6px 0px #000000" }}
        >
          <h2 className="font-heading text-xl font-bold uppercase text-center">{m.title}</h2>
          {options.map((opt) => (
            <button
              key={opt.via}
              onClick={() => onConfirm(opt.via)}
              className="font-body text-sm font-bold uppercase tracking-wide px-6 py-3 border-3 border-black bg-white transition-transform active:scale-95 text-left"
              style={{ boxShadow: "3px 3px 0 #000" }}
            >
              {opt.label}
            </button>
          ))}
          <button onClick={onClose} className="font-body text-xs text-center opacity-50 uppercase tracking-wide mt-2">
            {m.btnCancel}
          </button>
        </div>
      </div>
    </>
  );
}
