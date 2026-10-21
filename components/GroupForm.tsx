"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { containsBlockedWord } from "@/lib/moderation";
import { GroupAvatar } from "@/components/GroupCard";
import type { Group } from "@/lib/types";

// Форма створення групи. Якщо передати group — працює як редагування.
export default function GroupForm({ group }: { group?: Group }) {
  const router = useRouter();
  const [name, setName] = useState(group?.name ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    group?.avatar_url ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPickFile(f: File | null) {
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (trimmedName.length < 2 || trimmedName.length > 40) {
      setError("Назва має бути від 2 до 40 символів.");
      return;
    }
    if (trimmedDesc.length > 300) {
      setError("Опис занадто довгий (максимум 300 символів).");
      return;
    }
    if (containsBlockedWord(trimmedName + " " + trimmedDesc)) {
      setError("Текст містить слова, які не можна публікувати.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("not authenticated");

      let avatarUrl = group?.avatar_url ?? null;
      if (file) {
        const prepared = await compressImage(file, 256, 0.85);
        const ext = prepared.name.split(".").pop();
        const path = `${user.id}/group-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, prepared, { cacheControl: "31536000" });
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data
          .publicUrl;
      }

      if (group) {
        const { error: updateError } = await supabase
          .from("groups")
          .update({
            name: trimmedName,
            description: trimmedDesc || null,
            avatar_url: avatarUrl,
          })
          .eq("id", group.id);
        if (updateError) throw updateError;
        router.push(`/g/${group.id}`);
      } else {
        const { data, error: insertError } = await supabase
          .from("groups")
          .insert({
            owner_id: user.id,
            name: trimmedName,
            description: trimmedDesc || null,
            avatar_url: avatarUrl,
          })
          .select("id")
          .single();
        if (insertError) throw insertError;
        router.push(`/g/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string }).code;
      if (code === "23505") {
        setError("Група з такою назвою вже існує.");
      } else if (code === "42501") {
        setError(
          "Не вдалося створити групу. Можна мати не більше 3 груп, а забанені користувачі не можуть створювати групи."
        );
      } else {
        setError("Щось пішло не так. Спробуй ще раз.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-surface p-3 text-[15px] text-paper placeholder:text-muted outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <GroupAvatar
          group={{ name: name || "?", avatar_url: previewUrl }}
          size={72}
        />
        <label className="cursor-pointer">
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-paper hover:border-chalk">
            {previewUrl ? "Змінити аватарку" : "Додати аватарку"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div>
        <p className="mb-1 text-xs text-muted">Назва групи</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Наприклад: Книголюби"
          className={inputCls}
        />
      </div>

      <div>
        <p className="mb-1 text-xs text-muted">Опис (необов&apos;язково)</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={4}
          placeholder="Про що ця група?"
          className={inputCls}
        />
        <p className="mt-1 text-right text-xs text-muted">
          {description.length}/300
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-flag/10 p-2 text-sm text-flag">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-chalk px-5 py-2.5 font-medium text-base transition hover:bg-mint disabled:opacity-50"
      >
        {submitting
          ? "Зберігаємо…"
          : group
          ? "Зберегти зміни"
          : "Створити групу"}
      </button>
    </form>
  );
}
