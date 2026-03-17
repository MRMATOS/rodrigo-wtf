"use client";

import { deletePost } from "../actions";

export default function DeleteButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form action={deletePost}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="brutal-btn bg-background px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide hover:bg-red-500 hover:text-white"
        style={{
          transitionTimingFunction: "steps(1)",
          transitionDuration: "0s",
          transitionProperty: "background-color, color",
        }}
        onClick={(e) => {
          if (!confirm(`Apagar "${title}"?`)) e.preventDefault();
        }}
      >
        Apagar
      </button>
    </form>
  );
}
