import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import PostActions from "@/components/PostActions";
import AdminDeleteButton from "@/components/AdminDeleteButton";

// Серверний компонент: не вантажить жодного JS для самої картки.
// Інтерактивні лише кнопки лайків/репостів (PostActions) і кнопка адміна.
export default function PostCard({
  post,
  liked,
  reposted,
  isAdmin = false,
}: {
  post: Post;
  liked: boolean;
  reposted: boolean;
  isAdmin?: boolean;
}) {
  const likeCount = post.likes?.[0]?.count ?? 0;
  const repostCount = post.reposts?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;

  return (
    <div
      data-view-post={post.id}
      className="rounded-2xl border border-border bg-surface p-4 transition hover:border-chalk/60"
    >
      <div className="mb-2 flex items-center gap-2 text-xs text-muted">
        {post.is_anonymous ? (
          <span className="rounded-full bg-moss px-2 py-0.5 font-medium text-mint">
            Анонімно
          </span>
        ) : post.profiles?.nickname ? (
          <Link
            href={`/u/${post.profiles.nickname}`}
            className="font-medium text-paper hover:underline"
          >
            {post.profiles.nickname}
          </Link>
        ) : (
          <span className="font-medium text-paper">Користувач</span>
        )}
        <span>·</span>
        <span>{formatDateTime(post.created_at)}</span>

        {isAdmin && (
          <div className="ml-auto flex items-center gap-3">
            {post.report_count > 0 && (
              <span className="text-gold">⚠ скарг: {post.report_count}</span>
            )}
            <AdminDeleteButton postId={post.id} />
          </div>
        )}
      </div>

      {isAdmin && post.is_anonymous && post.profiles?.nickname && (
        <p className="-mt-1 mb-2 text-xs text-gold">
          Автор анонімного поста:{" "}
          <Link href={`/u/${post.profiles.nickname}`} className="underline">
            {post.profiles.nickname}
          </Link>
        </p>
      )}

      <Link href={`/post/${post.id}`} className="block">
        {post.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            decoding="async"
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
        inGroup={!!post.group_id}
        viewCount={post.view_count ?? 0}
      />
    </div>
  );
}
