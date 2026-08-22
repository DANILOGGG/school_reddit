"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { assertPostLength, containsBlockedWord } from "@/lib/moderation";

export default function PostForm() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [file, setFile] = useState<File | null>(null);
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
    if (!isAnonymous && authorName.trim().length === 0) {
      setError("Вкажи ім'я або постав позначку «Анонімно».");
      return;
    }

    setSubmitting(true);
    try {
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
        author_name: isAnonymous ? null : authorName.trim(),
        image_url: imageUrl,
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Що хочеш розповісти?"
        rows={6}
        className="w-full rounded-xl border border-ink/15 bg-white p-3 text-[15px] leading-relaxed outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsAnonymous(true)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            isAnonymous
              ? "bg-chalk text-paper"
              : "bg-white text-ink/70 border border-ink/15"
          }`}
        >
          Анонімно
        </button>
        <button
          type="button"
          onClick={() => setIsAnonymous(false)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            !isAnonymous
              ? "bg-chalk text-paper"
              : "bg-white text-ink/70 border border-ink/15"
          }`}
        >
          Під іменем
        </button>
      </div>

      {!isAnonymous && (
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Твоє ім'я або нік"
          className="w-full rounded-xl border border-ink/15 bg-white p-3 text-[15px] outline-none focus:border-chalk focus:ring-2 focus:ring-chalk/20"
        />
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/70">
        <span className="rounded-full border border-ink/15 bg-white px-3 py-1.5">
          {file ? file.name : "Додати фото (необов'язково)"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {error && (
        <p className="rounded-lg bg-flag/10 p-2 text-sm text-flag">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-chalk px-5 py-2.5 font-medium text-paper transition hover:bg-chalk/90 disabled:opacity-50"
      >
        {submitting ? "Публікуємо…" : "Опублікувати"}
      </button>
    </form>
  );
}
