"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { assertPostLength, containsBlockedWord } from "@/lib/moderation";
import ImageCropper from "@/components/ImageCropper";

type Category = "none" | "news" | "thoughts";

export default function PostForm() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<Category>("none");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const lengthError = assertPostLength(body);
    if (lengthError) {
      setError(lengthError);
      return;
    }
    if (containsBlockedWord(body)) {
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

      let imageUrl: string | null = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("posts").insert({
        body,
        is_anonymous: isAnonymous,
        image_url: imageUrl,
        user_id: user.id,
        category: category === "none" ? null : category,
      });

      if (insertError) throw insertError;

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Щось пішло не так. Спробуй ще раз.");
    } finally {
      setSubmitting(false);
    }
  }

  const catBtn = (value: Category, label: string) => (
    <button
      type="button"
      onClick={() => setCategory(value)}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
        category === value
          ? "bg-chalk text-base"
          : "border border-border bg-surface text-muted"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Що хочеш розповісти?"
        rows={6}
        className="w-full rounded-xl border border-border bg-surface p-3 text-[15px] leading-relaxed text-paper placeholder:text-muted outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsAnonymous(true)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            isAnonymous
              ? "bg-chalk text-base"
              : "border border-border bg-surface text-muted"
          }`}
        >
          Анонімно
        </button>
        <button
          type="button"
          onClick={() => setIsAnonymous(false)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            !isAnonymous
              ? "bg-chalk text-base"
              : "border border-border bg-surface text-muted"
          }`}
        >
          Під своїм ніком
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs text-muted">Категорія</p>
        <div className="flex flex-wrap gap-2">
          {catBtn("none", "Без категорії")}
          {catBtn("news", "Цікаві новини")}
          {catBtn("thoughts", "Спонтанні думки")}
        </div>
      </div>

      {!file && (
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted">
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-paper">
            Додати фото (необов&apos;язково)
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {file && (
        <div className="flex items-center gap-3">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surfaceRaised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previewUrl && (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCropperOpen(true)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-paper hover:border-chalk"
            >
              Обрізати
            </button>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-flag hover:border-flag"
            >
              Прибрати фото
            </button>
          </div>
        </div>
      )}

      {cropperOpen && file && (
        <ImageCropper
          file={file}
          onCancel={() => setCropperOpen(false)}
          onCropped={(cropped) => {
            setFile(cropped);
            setCropperOpen(false);
          }}
        />
      )}

      {error && (
        <p className="rounded-lg bg-flag/10 p-2 text-sm text-flag">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-chalk px-5 py-2.5 font-medium text-base transition hover:bg-mint disabled:opacity-50"
      >
        {submitting ? "Публікуємо…" : "Опублікувати"}
      </button>
    </form>
  );
}
