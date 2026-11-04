// Формати дат. Часовий пояс вказуємо явно (Київ): раніше сервер (Vercel, UTC)
// і телефон показували різний час, і React видавав помилки гідратації.
// Intl.DateTimeFormat створюємо один раз — це швидше, ніж toLocaleString на кожен пост.
const TZ = "Europe/Kyiv";

const dateTime = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const timeOnly = new Intl.DateTimeFormat("uk-UA", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

const dateTimeLong = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatTime = (iso: string) => timeOnly.format(new Date(iso));
export const formatDateTimeLong = (iso: string) => dateTimeLong.format(new Date(iso));

const dateShort = new Intl.DateTimeFormat("uk-UA", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

// «15.11.2026»
export const formatDateShort = (iso: string) => dateShort.format(new Date(iso));

// Компактні числа для лічильників: 950 → «950», 1250 → «1,3K», 12000 → «12K»
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10)
      .toString()
      .replace(".", ",") + "K";
  }
  return (Math.round(n / 100_000) / 10).toString().replace(".", ",") + "M";
}
