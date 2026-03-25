"use client";

import { useT } from "@/contexts/LanguageContext";

interface Props {
  onLogin: () => void;
  onClose: () => void;
}

export default function LoginModal({ onLogin, onClose }: Props) {
  const { t } = useT();

  return (
    <>
      <div className="fixed inset-0 z-[40] bg-black/70" onClick={onClose} />
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-xs bg-[#F4F4F0] border-3 border-black text-black p-8 flex flex-col gap-6"
          style={{ boxShadow: "6px 6px 0px #000000" }}
        >
          <div className="text-center">
            <p className="font-heading text-xs font-bold uppercase tracking-widest opacity-50 mb-2">
              {t.radarPet.loginModal.title}
            </p>
            <h2 className="font-heading text-2xl font-bold uppercase">
              {t.radarPet.loginModal.subtitle}
            </h2>
          </div>
          <button
            onClick={onLogin}
            className="font-body font-bold uppercase tracking-wide text-sm px-6 py-4 bg-[#F4F4F0] text-black border-3 border-black transition-transform active:scale-95"
            style={{ boxShadow: "4px 4px 0px #000000" }}
          >
            {t.radarPet.loginModal.btnGoogle}
          </button>
          <button
            onClick={onClose}
            className="font-body text-xs text-center opacity-50 uppercase tracking-wide"
          >
            {t.radarPet.loginModal.btnCancel}
          </button>
        </div>
      </div>
    </>
  );
}
