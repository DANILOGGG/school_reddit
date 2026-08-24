import Link from "next/link";
import type { Post } from "@/lib/types";
import PostActions from "@/components/PostActions";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({
  post,
  liked,
  reposted,
}: {
  post: Post;
  liked: boolean;
  reposted: boolean;
}) {
  const likeCount = post.likes?.[0]?.count ?? 0;
  const repostCount = post.reposts?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 transition hover:border-chalk/60">
      <Link href={`/post/${post.id}`} className="block">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted">
          {post.is_anonymous ? (
            <span className="rounded-full bg-moss px-2 py-0.5 font-medium text-mint">
              Анонімно
            </span>
          ) : (
            <span
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-paper hover:underline"
            >
              {post.profiles?.nickname ? (
                <Link href={`/u/${post.profiles.nickname}`}>
                  {post.profiles.nickname}
                </Link>
              ) : (
                "Користувач"
              )}
            </span>
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

        <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-paper">
          {post.body.length > 300 ? post.body.slice(0, 300) + "…" : post.body}
        </p>
      </Link>

      <PostActions
        postId={post.id}
        likeCount={likeCount}
        repostCount={repostCount}
        commentCount={commentCount}
        liked={liked}
        reposted={reposted}
      />
    </div>
  );
}
