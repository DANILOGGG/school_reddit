"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Кнопка «Видалити (адмін)». Винесена з PostCard окремо, щоб клієнтський код
// (і гідратація) був лише в адміна, а не у кожної з 20–50 карток для всіх.
export default function AdminDeleteButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleAdminDelete() {
    if (!confirm("Видалити цей пост назавжди (як адмін)?")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      setDeleting(false);
      alert("Не вдалося видалити пост: " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <button
      onClick={handleAdminDelete}
      disabled={deleting}
      className="text-flag hover:underline disabled:opacity-50"
    >
      {deleting ? "Видаляємо…" : "Видалити (адмін)"}
    </button>
  );
}
