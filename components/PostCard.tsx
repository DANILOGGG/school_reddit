import Link from "next/link";
import type { Post } from "@/lib/supabaseClient";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="block rounded-2xl border border-ink/10 bg-white p-4 transition hover:border-chalk/40 hover:shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-ink/60">
        {post.is_anonymous ? (
          <span className="rounded-full bg-chalkLight px-2 py-0.5 font-medium text-chalk">
            Анонімно
          </span>
        ) : (
          <span className="font-medium text-ink/80">{post.author_name}</span>
        )}
        <span>·</span>
        <span>{formatDate(post.created_at)}</span>
      </div>

      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt=""
          className="mb-3 max-h-80 w-full rounded-xl object-cover"
        />
      )}

      <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-ink">
        {post.body.length > 300 ? post.body.slice(0, 300) + "…" : post.body}
      </p>
    </Link>
  );
}
