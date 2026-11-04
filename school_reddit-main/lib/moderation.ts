// A minimal starting point for content moderation.
// Replace or extend this list with words relevant to your school/language.
// This is NOT a full solution — pair it with the report button and the
// admin panel described in the README.
const BLOCKED_WORDS: string[] = [
  // add lowercase words/phrases here, e.g. "приклад"
];

export function containsBlockedWord(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => word.length > 0 && lower.includes(word));
}

export function assertPostLength(text: string, max = 2000): string | null {
  if (text.trim().length === 0) return "Текст не може бути порожнім.";
  if (text.length > max) return `Занадто довгий текст (максимум ${max} символів).`;
  return null;
}
