import type { ReactNode } from "react";

const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/";

// ---------- маленькі будівельні блоки сторінки ----------

function Section({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-2xl border border-border bg-surface p-5"
    >
      <h2 className="mb-3 flex items-center gap-3 font-display text-xl text-paper">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss font-body text-sm font-semibold text-mint">
          {num}
        </span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-paper">
        {children}
      </div>
    </section>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </h3>
  );
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-chalk text-xs font-semibold text-mint">
            {i + 1}
          </span>
          <span className="pt-px">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Callout({
  tone = "tip",
  title,
  children,
}: {
  tone?: "tip" | "warn";
  title: string;
  children: ReactNode;
}) {
  const styles =
    tone === "warn"
      ? "border-gold bg-gold/10"
      : "border-chalk bg-moss/40";
  const titleColor = tone === "warn" ? "text-gold" : "text-mint";
  return (
    <div className={`rounded-xl border-l-4 px-4 py-3 text-sm ${styles}`}>
      <p className={`mb-0.5 font-semibold ${titleColor}`}>{title}</p>
      <div className="text-paper">{children}</div>
    </div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-surfaceRaised px-1.5 py-0.5 text-[13px] font-medium text-mint">
      {children}
    </span>
  );
}

// ---------- дані ----------

const TOC = [
  ["start", "Вхід і реєстрація"],
  ["menu", "Верхнє меню"],
  ["feed", "Стрічка"],
  ["new-post", "Як створити пост"],
  ["post-actions", "Дії з постом"],
  ["comments", "Коментарі"],
  ["groups", "Групи"],
  ["profile", "Твій профіль"],
  ["my-stats", "Моя статистика"],
  ["friends", "Друзі та чати"],
  ["activity", "Активність"],
  ["site-stats", "Статистика сайту"],
  ["install", "Встановити як застосунок"],
  ["rules", "Правила та безпека"],
] as const;

const MENU: [string, string, string][] = [
  ["➕", "Новий пост", "Створити публікацію"],
  ["▦", "Категорії", "Вибрати категорію стрічки"],
  ["ⓘ", "Про сайт", "Ця сторінка"],
  ["💳", "Донат", "Підтримати автора"],
  ["✈️", "Telegram", "Канал сайту"],
  ["📊", "Статистика", "Скільки людей на сайті"],
  ["🔔", "Активність", "Червона крапка — є щось нове"],
  ["👥", "Друзі", "Друзі та особисті чати"],
  ["🙂", "Профіль", "Кружечок з твоїм фото"],
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Вступ від автора (текст автора збережено без змін) */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-mint">
          Шкільна дошка
        </p>
        <h1 className="mb-4 font-display text-3xl text-paper">Про сайт</h1>
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-paper">
          {`Привіт, це мій сайт, на нього ти можеш загружати фотки, анонімні історії і просто ділитися думками. Я учень Коломийського ліцею №1, і надіюсь, що сайт стане популярним по школі. Я написав його, бо давно хотів мати сайт, де буде багато учнів в одному місці, і ще мені вже просто стало нудно на літніх канікулах.\n\nЯкщо є якісь класні ідеї для сайту — пишіть сюди в тг ${TELEGRAM_URL}, дуже хочу, щоб люди казали, що додати і т.д., це цікаво.\n\nА ще переходьте в мій тгк — на сайті є кнопка, яка перекидає вас в мій тгк.\n\nДякую, що користуєтесь сайтом :)`}
        </p>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-chalk px-5 py-2 text-sm font-medium text-base transition hover:bg-mint"
        >
          ✈️ Перейти в Telegram
        </a>
      </div>

      {/* Зміст */}
      <nav
        aria-label="Зміст"
        className="rounded-2xl border border-border bg-surface p-5"
      >
        <h2 className="mb-1 font-display text-xl text-paper">
          Як користуватись сайтом
        </h2>
        <p className="mb-4 text-sm text-muted">
          Короткий путівник для тих, хто ще не розібрався. Натисни на розділ,
          щоб перейти до нього.
        </p>
        <ol className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
          {TOC.map(([id, label], i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-paper transition hover:bg-surfaceRaised hover:text-mint"
              >
                <span className="w-5 text-right text-xs font-semibold text-muted">
                  {i + 1}
                </span>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Section id="start" num={1} title="Вхід і реєстрація">
        <Bullets
          items={[
            <>Пошта не потрібна: потрібні лише <b>нік</b> і <b>пароль</b>.</>,
            "Нік: від 2 до 24 символів — літери (українські чи англійські), цифри, пробіл і підкреслення.",
            "Пароль: мінімум 6 символів.",
            <>
              Новому користувачу відкривається вікно <b>«Реєстрація»</b>. Якщо
              акаунт уже є, натисни <Key>Увійти</Key> під формою або вгорі.
            </>,
            "Якщо пише, що нік зайнятий, придумай інший.",
          ]}
        />
        <Callout tone="warn" title="Запиши свій пароль">
          Кнопки «Забув пароль» на сайті немає, тому збережи його десь у надійному
          місці.
        </Callout>
      </Section>

      <Section id="menu" num={2} title="Верхнє меню">
        <p className="text-muted">Іконки справа вгорі:</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MENU.map(([icon, name, desc]) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded-xl border border-border bg-surfaceRaised px-3 py-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-base">
                {icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-paper">{name}</span>
                <span className="block text-xs text-muted">{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="feed" num={3} title="Стрічка">
        <Bullets
          items={[
            "На головній видно останні пости: автор, дата, фото й початок тексту. Натисни на пост, щоб відкрити його повністю.",
            <>
              <b>Категорії</b> (іконка ▦): анонімні пости, цікаві новини,
              спонтанні думки або «без категорії», тобто всі пости.
            </>,
            "Пости, якими часто діляться (3 і більше репостів), піднімаються вгору стрічки.",
            <>
              Коли з'явилися нові пости, а ти прокрутив вниз, зверху зʼявиться
              кнопка <Key>↑ Є нові пости</Key>.
            </>,
            <>
              Внизу стрічки є кнопка <Key>Старіші пости →</Key>.
            </>,
          ]}
        />
      </Section>

      <Section id="new-post" num={4} title="Як створити пост">
        <Steps
          items={[
            <>Натисни <Key>➕</Key> у верхньому меню.</>,
            "Напиши текст (до 2000 символів).",
            <>
              За бажанням постав галочку <b>«Анонімно»</b>: тоді інші
              користувачі не побачать твого ніка.
            </>,
            "Вибери категорію: без категорії, новини або думки.",
            "За бажанням додай фото. Воно стискається автоматично, тож великі фото з телефона зменшувати не треба.",
            <>Натисни <Key>Опублікувати</Key>.</>,
          ]}
        />
        <p className="text-sm text-muted">
          Деякі слова заборонені. Якщо пост не публікується, перечитай текст.
        </p>
      </Section>

      <Section id="post-actions" num={5} title="Що можна робити з постом">
        <Bullets
          items={[
            <>❤️ <b>Лайк</b> ставиться один раз, зняти його не можна.</>,
            <>💬 <b>Коментарі</b> відкривають сторінку поста.</>,
            <>🔁 <b>Репост</b> підтримує пост і піднімає його в стрічці.</>,
            <>
              ⬆️ <b>Поділитись</b>: можна скопіювати посилання або надіслати
              пост другові в чат.
            </>,
            <>
              👁 <b>Перегляди</b> показані в правому нижньому куті поста. Пост
              вважається переглянутим, коли ти його побачив у стрічці. Одна
              людина рахується один раз, тож оновлення сторінки число не
              збільшує.
            </>,
            <>
              🚩 <b>Поскаржитись</b>: кнопка на сторінці поста. Якщо пост
              порушує правила, натисни її, і скаргу побачать адміни.
            </>,
          ]}
        />
      </Section>

      <Section id="comments" num={6} title="Коментарі">
        <p>
          Внизу сторінки поста є поле <b>«Додати коментар…»</b>. До коментаря
          можна додати <b>гіфку</b>. Коментарі підписані твоїм ніком, анонімних
          коментарів немає. Коментарі теж можна лайкати.
        </p>
      </Section>

      <Section id="groups" num={7} title="Групи">
        <p className="text-muted">
          Блок «Групи» стоїть над стрічкою. Це окремі «клуби за інтересами».
        </p>
        <Bullets
          items={[
            <>
              <b>Створити групу</b>: кнопка «+ Створити групу». Потрібна назва
              (2–40 символів), можна додати опис (до 300 символів) і фото групи.
              Одна людина може створити <b>не більше 3 груп</b>.
            </>,
            <>
              <b>Підписатися / Відписатися</b>: кнопка на сторінці групи.
            </>,
            "Пости групи бачать лише підписники.",
            "Писати пости в групі може тільки її власник. Підписники читають, лайкають і коментують.",
            "Пости з груп не можна репостити і пересилати в чат.",
            "Власник групи може її редагувати, видаляти пости й коментарі в ній або видалити групу разом з усіма постами.",
            "Усі групи можна переглянути за посиланням «Усі групи».",
          ]}
        />
      </Section>

      <Section id="profile" num={8} title="Твій профіль">
        <Bullets
          items={[
            <>
              <b>Аватарка</b>: натисни на фото, вибери зображення й обріж його.
            </>,
            <>
              <b>Меню профілю</b> (три крапки): «Змінити нікнейм», «Вийти з
              акаунту» і «Видалити акаунт». Видалення назавжди, тож будь
              обережним.
            </>,
            "Усі твої пости видно в профілі, їх можна редагувати або видаляти.",
            "Твої анонімні пости в профілі бачиш тільки ти.",
          ]}
        />
      </Section>

      <Section id="my-stats" num={9} title="Моя статистика">
        <p>
          У профілі є картка <Key>📊 Моя статистика</Key>. Там видно, як
          сприймають твої публікації.
        </p>
        <Bullets
          items={[
            <>
              <b>Загальні цифри</b> по всіх твоїх постах: 👁 перегляди, ❤️
              лайки, 💬 коментарі, 🔁 репости.
            </>,
            "Графік нових переглядів за останні 14 днів.",
            <>
              <b>Кожен пост окремо</b>: натисни на пост у списку й побачиш його
              показники, залученість і графік переглядів саме цього поста.
            </>,
            "Пости можна сортувати: нові, за переглядами, лайками, коментарями чи репостами.",
            "Цифри оновлюються самі кожні 15 секунд, перезавантажувати сторінку не треба.",
          ]}
        />
        <Callout title="Як рахуються перегляди">
          Твої власні перегляди не враховуються, а одна людина рахується один раз
          на пост. Тож цифра показує, скільки різних людей побачили пост.
        </Callout>
      </Section>

      <Section id="friends" num={10} title="Друзі та чати">
        <Steps
          items={[
            "Натисни на нік людини під постом, щоб відкрити її профіль.",
            <>
              Натисни <Key>Додати в друзі</Key>. Кнопка зміниться на «Заявку
              надіслано».
            </>,
            <>
              Людині прийде сповіщення у 🔔. Вона натискає <Key>Прийняти</Key>.
            </>,
            <>
              Тепер вона у твоєму списку 👥 «Друзі». Натисни на неї, щоб
              відкрити <b>особистий чат</b>.
            </>,
          ]}
        />
        <Bullets
          items={[
            "Писати в чат можна лише друзям. Повідомлення приходять одразу, без перезавантаження.",
            "Дружбу можна розірвати: натисни кнопку друга в його профілі й підтверди.",
          ]}
        />
      </Section>

      <Section id="activity" num={11} title="Активність">
        <p>Дзвіночок 🔔 збирає все нове:</p>
        <Bullets
          items={[
            "заявки в друзі;",
            "коментарі до твоїх постів;",
            "непрочитані повідомлення.",
          ]}
        />
        <p className="text-sm text-muted">
          Червона крапка на дзвіночку означає, що тут є що подивитись.
        </p>
      </Section>

      <Section id="site-stats" num={12} title="Статистика сайту">
        <p>
          Іконка 📊 у меню відкриває загальну статистику: скільки на сайті
          користувачів, постів, груп і відвідувачів, плюс графіки за день,
          тиждень, місяць і рік.
        </p>
      </Section>

      <Section id="install" num={13} title="Встановити як застосунок">
        <p>
          Сайт можна додати на головний екран телефона, і він відкриватиметься
          як звичайний застосунок.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surfaceRaised p-3 text-sm">
            <p className="mb-1 font-medium text-paper">Android (Chrome)</p>
            <p className="text-muted">
              Меню ⋮ → «Встановити застосунок» або «Додати на головний екран».
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surfaceRaised p-3 text-sm">
            <p className="mb-1 font-medium text-paper">iPhone (Safari)</p>
            <p className="text-muted">
              Кнопка «Поділитися» → «На екран “Додому”».
            </p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Якщо зник інтернет, замість білого екрана побачиш сторінку «Немає
          з'єднання».
        </p>
      </Section>

      <Section id="rules" num={14} title="Правила та безпека">
        <Bullets
          items={[
            "Будь ввічливим: цькування, образи й обман тут не потрібні.",
            "Не пиши в постах і коментарях свої паролі, адресу та номер телефона.",
          ]}
        />

        <Sub>Модерація</Sub>
        <p>
          Адміни можуть видаляти пости й коментарі та <b>блокувати акаунти</b>{" "}
          (на годину, день, тиждень, місяць або назавжди). Заблокований
          користувач при вході бачить окремий екран «Тебе забанено» з терміном
          блокування та причиною. Користуватись сайтом, поки бан діє, не можна:
          він зникає сам, коли мине термін. Або можна видалити акаунт і
          створити новий.
        </p>

        <Callout tone="warn" title="Про анонімність">
          Інші користувачі не бачать, хто автор анонімного поста, але{" "}
          <b>адміністратор його бачить</b>. Це потрібно, щоб можна було зупинити
          цькування. Не публікуй анонімно те, за що не готовий відповідати перед
          адміністрацією.
        </Callout>
      </Section>
    </div>
  );
}
