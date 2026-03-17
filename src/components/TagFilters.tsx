"use client";

import { useState } from "react";
import Link from "next/link";

interface TagFiltersProps {
  tags: string[];
  activeTag?: string;
  basePath: string;
}

export default function TagFilters({ tags, activeTag, basePath }: TagFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="col-span-4 border-3 border-border brutal-shadow bg-background px-4 md:px-8 py-4">
      {/* Desktop: all tags visible */}
      <div className="hidden md:flex flex-wrap gap-2">
        <TagList tags={tags} activeTag={activeTag} basePath={basePath} />
      </div>

      {/* Mobile: first row + toggle button on the right */}
      <div className="md:hidden flex items-start gap-2">
        <div
          className="flex-1 flex flex-wrap gap-2 overflow-hidden"
          style={{ maxHeight: expanded ? "none" : "36px" }}
        >
          <TagList tags={tags} activeTag={activeTag} basePath={basePath} />
        </div>
        <button
          onClick={() => setExpanded((p) => !p)}
          className="shrink-0 min-w-[36px] min-h-[36px] font-body text-sm font-bold border-3 border-border px-2 py-1 bg-blue text-white dark:bg-acid dark:text-[#000000]"
          aria-label={expanded ? "Esconder filtros" : "Ver todos os filtros"}
          style={{
            transitionTimingFunction: "steps(1)",
            transitionDuration: "0s",
            transitionProperty: "background-color, color",
          }}
        >
          {expanded ? "−" : "+"}
        </button>
      </div>
    </div>
  );
}

function TagList({
  tags,
  activeTag,
  basePath,
}: {
  tags: string[];
  activeTag?: string;
  basePath: string;
}) {
  return (
    <>
      <Link
        href={basePath}
        className={`font-body text-xs font-bold uppercase tracking-wide px-3 py-1.5 border-3 border-border shrink-0 ${
          !activeTag
            ? "bg-foreground text-background"
            : "hover:bg-acid hover:text-[#000000]"
        }`}
        style={{
          transitionTimingFunction: "steps(1)",
          transitionDuration: "0s",
          transitionProperty: "background-color, color",
        }}
      >
        Todos
      </Link>
      {tags.map((t) => (
        <Link
          key={t}
          href={`${basePath}?tag=${t}`}
          className={`font-body text-xs font-bold uppercase tracking-wide px-3 py-1.5 border-3 border-border shrink-0 ${
            activeTag === t
              ? "bg-foreground text-background"
              : "hover:bg-acid hover:text-[#000000]"
          }`}
          style={{
            transitionTimingFunction: "steps(1)",
            transitionDuration: "0s",
            transitionProperty: "background-color, color",
          }}
        >
          #{t}
        </Link>
      ))}
    </>
  );
}
