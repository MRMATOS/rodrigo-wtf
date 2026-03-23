"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";
import ShareButton from "./ShareButton";

interface Props {
  shareTitle?: string;
  shareUrl?: string;
}

export default function BackButton({ shareTitle, shareUrl }: Props) {
  const router = useRouter();
  const { t } = useT();
  return (
    <div className="col-span-4 flex justify-center items-center gap-4">
      <button
        onClick={() => router.back()}
        className="brutal-btn brutal-btn-adaptive px-8 py-4 font-body text-sm font-bold uppercase tracking-wide"
      >
        {t.content.backBtn}
      </button>
      {shareTitle && shareUrl && (
        <ShareButton title={shareTitle} url={shareUrl} className="px-8 py-4 text-sm" />
      )}
    </div>
  );
}
