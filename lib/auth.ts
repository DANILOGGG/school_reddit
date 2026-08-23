// Supabase Auth вимагає email для реєстрації через пароль, але ми хочемо,
// щоб користувач бачив лише нік. Тому "під капотом" перетворюємо нік на
// технічний email — сам користувач його ніколи не бачить і не вводить.
export function nicknameToEmail(nickname: string): string {
  const normalized = nickname.trim().toLowerCase().replace(/\s+/g, "_");
  return `${normalized}@school-forum.local`;
}

export function validateNickname(nickname: string): string | null {
  const trimmed = nickname.trim();
  if (trimmed.length < 2) return "Нік має бути хоча б 2 символи.";
  if (trimmed.length > 24) return "Нік завдовгий (максимум 24 символи).";
  if (!/^[a-zA-Zа-яА-ЯіІїЇєЄ0-9_ ]+$/.test(trimmed)) {
    return "Нік може містити лише літери, цифри, пробіл і підкреслення.";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Пароль має бути хоча б 6 символів.";
  return null;
}
