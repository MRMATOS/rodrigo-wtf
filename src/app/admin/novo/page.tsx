import PostEditor from "../_components/PostEditor";

export const metadata = { title: "Novo post — Admin" };

export default function NovoPost() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase">
        Novo post
      </h1>
      <PostEditor />
    </div>
  );
}
