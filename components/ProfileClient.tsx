"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, Profile } from "@/lib/types";
import { validateNickname } from "@/lib/auth";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProfileClient({
  profile,
  initialPosts,
}: {
  profile: Profile;
  initialPosts: Post[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [nickname, setNickname] = useState(profile.nickname);
  const [posts, setPosts] = useState(initialPosts);
  const [menuOpen, setMenuOpen] = useState(false);
  const [nicknameModalOpen, setNicknameModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState(profile.nickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      setBusy(false);
      alert("Не вдалося завантажити аватарку.");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await supabase
      .from("profiles")
      .update({ avatar_url: data.publicUrl })
      .eq("id", profile.id);

    setAvatarUrl(data.publicUrl);
    setBusy(false);
  }

  async function handleNicknameSave() {
    setNicknameError(null);
    const err = validateNickname(newNickname);
    if (err) return setNicknameError(err);

    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ nickname: newNickname.trim() })
      .eq("id", profile.id);
    setBusy(false);

    if (error) {
      if (error.message.includes("duplicate")) {
        setNicknameError("Цей нік вже зайнятий.");
      } else {
        setNicknameError("Не вдалося змінити нік.");
      }
      return;
    }

    setNickname(newNickname.trim());
    setNicknameModalOpen(false);
    setMenuOpen(false);
  }

  async function handleDeleteAccount() {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setBusy(false);
      alert("Не вдалося видалити акаунт.");
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleDeletePost(postId: string) {
    if (!confirm("Видалити цей пост назавжди?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      alert("Не вдалося видалити пост.");
      return;
    }
    setPosts(posts.filter((p) => p.id !== postId));
  }

  function startEdit(post: Post) {
    setEditingPostId(post.id);
    setEditingBody(post.body);
  }

  async function saveEdit(postId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ body: editingBody })
      .eq("id", postId);
    if (error) {
      alert("Не вдалося зберегти зміни.");
      return;
    }
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, body: editingBody } : p))
    );
    setEditingPostId(null);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-chalk bg-surfaceRaised"
          title="Змінити аватарку"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-mint">
              {nickname[0]?.toUpperCase()}
            </span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="flex-1">
          <h1 className="font-display text-xl text-paper">{nickname}</h1>
          <p className="text-sm text-muted">{posts.length} постів</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-paper hover:border-chalk"
            aria-label="Меню"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-10 w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
              <button
                onClick={() => {
                  setNicknameModalOpen(true);
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-3 text-left text-sm text-paper hover:bg-surfaceRaised"
              >
                Змінити нікнейм
              </button>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-3 text-left text-sm text-paper hover:bg-surfaceRaised"
              >
                Вийти з акаунту
              </button>
              <button
                onClick={() => {
                  setDeleteConfirmOpen(true);
                  setMenuOpen(false);
                }}
                className="block w-full px-4 py-3 text-left text-sm text-flag hover:bg-surfaceRaised"
              >
                Видалити акаунт
              </button>
            </div>
          )}
        </div>
      </div>

      {nicknameModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-lg text-paper">
              Новий нікнейм
            </h2>
            <input
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="mb-2 w-full rounded-xl border border-border bg-surfaceRaised p-3 text-paper outline-none focus:border-chalk"
            />
            {nicknameError && (
              <p className="mb-2 text-sm text-flag">{nicknameError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setNicknameModalOpen(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm text-paper"
              >
                Скасувати
              </button>
              <button
                onClick={handleNicknameSave}
                disabled={busy}
                className="flex-1 rounded-full bg-chalk py-2 text-sm font-medium text-base disabled:opacity-50"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-flag/40 bg-surface p-5">
            <h2 className="mb-2 font-display text-lg text-flag">
              Видалити акаунт назавжди?
            </h2>
            <p className="mb-4 text-sm text-muted">
              Всі твої пости й коментарі теж будуть видалені. Це не можна
              скасувати.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 rounded-full border border-border py-2 text-sm text-paper"
              >
                Скасувати
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={busy}
                className="flex-1 rounded-full bg-flag py-2 text-sm font-medium text-paper disabled:opacity-50"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-3 font-display text-lg text-paper">Мої пости</h2>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <div className="flex items-center gap-2">
                {post.is_anonymous && (
                  <span className="rounded-full bg-moss px-2 py-0.5 font-medium text-mint">
                    Анонімно
                  </span>
                )}
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEdit(post)}
                  className="text-mint hover:underline"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-flag hover:underline"
                >
                  Видалити
                </button>
              </div>
            </div>

            {post.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.image_url}
                alt=""
                className="mb-2 max-h-64 w-full rounded-xl object-cover"
              />
            )}

            {editingPostId === post.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editingBody}
                  onChange={(e) => setEditingBody(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surfaceRaised p-2 text-sm text-paper outline-none focus:border-chalk"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPostId(null)}
                    className="rounded-full border border-border px-3 py-1 text-xs text-paper"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={() => saveEdit(post.id)}
                    className="rounded-full bg-chalk px-3 py-1 text-xs font-medium text-base"
                  >
                    Зберегти
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-paper">
                {post.body}
              </p>
            )}
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-sm text-muted">Ти ще нічого не публікував(-ла).</p>
        )}
      </div>
    </div>
  );
}
