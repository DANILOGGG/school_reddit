// !!! ВСТАВ СЮДИ ЛІНКУ НА СВІЙ TELEGRAM (канал/чат/профіль) !!!
const TELEGRAM_URL = 'https://t.me/your_channel_here';

// !!! ВСТАВ СЮДИ ЛІНКУ ДЛЯ ДОНАТУ (Monobank/PayPal/інше) !!!
const DONATE_URL = 'https://send.monobank.ua/your_jar_here';

// === Мова інтерфейсу (укр / рос / англ) ===
const LANGS = ['uk', 'ru', 'en'];
const LANG_CODE_LABELS = { uk: 'UA', ru: 'RU', en: 'EN' };

let currentLang = localStorage.getItem('lang');
if (!LANGS.includes(currentLang)) currentLang = 'uk';

// Словник усіх текстів інтерфейсу. Додаєш новий текст — додай ключ в усі 3 мови.
const I18N = {
  uk: {
    settings_title: 'Налаштування',
    profile_title: 'Мій профіль',
    stats_title: 'Статистика сайту',
    search_title: 'Пошук користувачів',
    donate_title: 'Підтримати проект',
    theme_title: 'Змінити тему',
    lang_title: 'Змінити мову',
    tg_title: 'Наш Telegram',
    inbox_title: 'Коментарі під моїми фото',

    search_heading: 'Пошук користувачів',
    search_placeholder: 'Введи нікнейм...',
    close_btn: 'Закрити',

    stats_tab_site: 'Статистика сайту',
    stats_tab_mine: 'Моя статистика',
    stats_photos: 'фото',
    stats_comments: 'коментарів',
    stats_likes: 'лайків',
    stats_users: 'користувачів',
    my_stats_photos: 'моїх фото',
    my_stats_comments: 'моїх коментарів',
    my_stats_likes: 'моїх лайків',

    donate_heading: 'Підтримка проекту',
    donate_action_btn: '💰 Донат',
    donate_qr_alt: 'QR код для донату',

    profile_heading_own: 'Мій профіль',
    profile_heading_other: 'Профіль: {nick}',
    avatar_edit_hint: 'Змінити',
    avatar_alt: 'Аватарка',

    inbox_heading: 'Коментарі під твоїми фото',

    tab_nick: 'Нікнейм',
    tab_about: 'Про сайт',
    current_nick_label: 'Твій поточний нік:',
    rename_placeholder: 'Новий нік',
    rename_btn: 'Змінити нік',
    rename_hint: 'Нік зміниться усюди: на твоїх фото, лайках і коментарях.',
    about_text: "Цей сайт видає тобі рандомні фотки. Ти можеш завантажити свою фотку, і вона з'явиться на сайті — її зможуть лайкати та писати під нею коментарі. На кнопку «Рандомна фото» тобі випаде фотка когось із користувачів сайту. Я учень Першого ліцею в Коломиї і хочу просунути цей сайт по школі — просто по приколу, бо мені вже трохи скучно на літніх канікулах. Буду вдячний, якщо поділишся сайтом! Ідеї для сайту пиши в Telegram: @a1_r1_i9_3h 🚀",

    nick_heading: 'Ласкаво просимо!',
    nick_sub: 'Введи свій нікнейм, щоб продовжити:',
    nick_placeholder: 'Твій нік',
    nick_save_btn: 'Зберегти',

    photo_placeholder: "Тут з'явиться фото 👇",
    comment_placeholder: 'Написати коментар...',
    upload_btn: '📤 Завантажити фото',
    random_btn: '🎲 Рандомна фото',

    categories_heading: '🗂️ Категорії фото',
    category_search_placeholder: 'Пошук категорії... (наприклад «гори», «шахи»)',
    category_search_placeholder_short: 'Пошук категорії...',

    category_pick_heading: 'Виберіть категорію фото',
    category_pick_cancel: 'Скасувати завантаження',

    edit_photo_heading: 'Редагувати фото',
    edit_caption_placeholder: "Опис фото (необов'язково)...",
    edit_category_label: 'Категорія:',
    edit_cancel_btn: 'Скасувати',
    edit_save_btn: 'Зберегти ✅',
    edit_saving: '⏳ Зберігаємо...',

    crop_heading: 'Обріж фото',
    crop_hint: 'Перетягни фото пальцем/мишкою, наближай повзунком',
    crop_caption_placeholder: "Додати опис (необов'язково)...",
    crop_cancel_btn: 'Скасувати',
    crop_confirm_btn: 'Готово ✅',
    crop_photo_alt: 'Фото для кадрування',

    default_nick: 'Анонім',
    enter_nick_first: 'Спочатку введи нікнейм 🙂',
    enter_nickname: 'Введи нікнейм 🙂',
    enter_new_nick: 'Введи новий нік 🙂',

    upload_success: 'Фото завантажено! ✅',
    error_prefix: 'Помилка: ',
    unknown_error: 'невідома',
    upload_fail: 'Не вдалося завантажити фото. Перевір, чи запущений сервер.',
    uploading_text: '⏳ Завантаження...',

    fetch_random_fail: 'Не вдалося отримати фото. Перевір, чи запущений сервер.',
    no_photos_at_all: 'Ще немає жодного фото. Завантаж перше! 📤',
    no_photos_in_category: 'Ще немає фото в категорії «{label}». Завантаж перше! 📤',

    photo_unavailable: 'Це фото більше не доступне.',
    open_photo_fail: 'Не вдалося відкрити фото.',

    fetch_comments_fail_console: 'Не вдалося отримати коментарі:',
    load_comments_fail: 'Не вдалося завантажити коментарі.',
    inbox_empty: 'Поки що ніхто не коментував твої фото 💬',

    load_profile_fail: 'Не вдалося завантажити профіль.',
    profile_grid_empty: 'Ще немає завантажених фото 📷',

    confirm_delete_photo: 'Видалити це фото? Цю дію не можна скасувати.',
    delete_photo_fail: 'Не вдалося видалити фото.',

    load_site_stats_fail: 'Не вдалося завантажити статистику сайту.',
    load_my_stats_fail: 'Не вдалося завантажити твою статистику.',
    stats_top_label: 'Найбільше лайків у',
    stats_no_likes_yet: 'Поки що немає лайків 🤷',

    search_list_fail: 'Не вдалося завантажити список 😕',
    search_nobody_found: 'Нікого не знайдено 🤷',
    photos_word: 'фото',

    avatar_change_fail: 'Не вдалося змінити аватарку.',

    rename_changing: '⏳ Змінюємо...',
    rename_success: 'Нік змінено! ✅',
    rename_fail: 'Не вдалося змінити нік. Перевір, чи запущений сервер.',
    get_likes_fail_console: 'Не вдалося отримати лайки:',
    register_user_fail_console: 'Не вдалося зареєструвати користувача:',

    welcome_text: 'Привіт, {nick}! 👋',
    total_likes_text: 'Твої лайки (сумарно): {total}',

    comments_none_yet: 'Ще немає коментарів. Будь першим! 💬',
    send_comment_fail_console: 'Не вдалося надіслати коментар:',
    like_fail_console: 'Не вдалося лайкнути:',

    already_liked_label: '💚 Вже лайкнуто',
    author_label: 'Автор:',

    edit_open_fail: 'Не вдалося відкрити редагування фото.',
    edit_save_fail: 'Не вдалося зберегти зміни.',
    edit_dots_title: 'Редагувати фото',

    category_not_found: 'Нічого не знайдено 🤷',

    photo_alt: 'Фото',
    photo_by_alt: 'Фото від {author}',

    create_group_btn: '👥 Створити групу',
    popular_groups_heading: '🔥 Популярні групи',
    groups_empty: 'Поки що немає груп. Створи першу! 👥',
    groups_load_fail: 'Не вдалося завантажити список груп.',
    group_subscribers_count: 'підписників: {count}',
    group_posts_count: 'постів: {count}',
    group_subscribed_badge: '✅ Ти підписаний',
    create_group_heading: 'Створити групу',
    create_group_avatar_hint: 'Натисни, щоб обрати аватарку',
    group_name_placeholder: 'Назва групи',
    group_desc_placeholder: "Опис групи (необов'язково)",
    create_group_submit: 'Створити',
    create_group_creating: '⏳ Створюємо...',
    create_group_fail: 'Не вдалося створити групу.',
    group_name_too_short: 'Введи назву групи (мінімум 2 символи) 🙂',
    group_subscribe_btn: '➕ Підписатися',
    group_unsubscribe_btn: '✖ Відписатися',
    group_admin_label: 'Адмін:',
    group_add_post_btn: '📤 Додати пост',
    group_delete_btn: '🗑 Видалити групу',
    group_delete_post_title: 'Видалити пост',
    group_confirm_delete: 'Видалити цю групу разом з усіма постами? Цю дію не можна скасувати.',
    group_confirm_delete_post: 'Видалити цей пост?',
    group_locked: '🔒 Підпишись на групу, щоб бачити пости, лайкати та коментувати.',
    group_no_posts: 'У цій групі ще немає постів.',
    group_load_fail: 'Не вдалося відкрити групу.',
    group_action_fail: 'Не вдалося виконати дію. Спробуй ще раз.',
    group_post_fail: 'Не вдалося опублікувати пост.'
  },

  ru: {
    settings_title: 'Настройки',
    profile_title: 'Мой профиль',
    stats_title: 'Статистика сайта',
    search_title: 'Поиск пользователей',
    donate_title: 'Поддержать проект',
    theme_title: 'Сменить тему',
    lang_title: 'Сменить язык',
    tg_title: 'Наш Telegram',
    inbox_title: 'Комментарии под моими фото',

    search_heading: 'Поиск пользователей',
    search_placeholder: 'Введи никнейм...',
    close_btn: 'Закрыть',

    stats_tab_site: 'Статистика сайта',
    stats_tab_mine: 'Моя статистика',
    stats_photos: 'фото',
    stats_comments: 'комментариев',
    stats_likes: 'лайков',
    stats_users: 'пользователей',
    my_stats_photos: 'моих фото',
    my_stats_comments: 'моих комментариев',
    my_stats_likes: 'моих лайков',

    donate_heading: 'Поддержка проекта',
    donate_action_btn: '💰 Донат',
    donate_qr_alt: 'QR код для доната',

    profile_heading_own: 'Мой профиль',
    profile_heading_other: 'Профиль: {nick}',
    avatar_edit_hint: 'Изменить',
    avatar_alt: 'Аватарка',

    inbox_heading: 'Комментарии под твоими фото',

    tab_nick: 'Никнейм',
    tab_about: 'О сайте',
    current_nick_label: 'Твой текущий ник:',
    rename_placeholder: 'Новый ник',
    rename_btn: 'Изменить ник',
    rename_hint: 'Ник изменится везде: на твоих фото, лайках и комментариях.',
    about_text: 'Этот сайт выдаёт тебе случайные фото. Ты можешь загрузить своё фото, и оно появится на сайте — его смогут лайкать и оставлять под ним комментарии. По кнопке «Случайное фото» тебе выпадет фото кого-то из пользователей сайта. Я ученик Первого лицея в Коломые и хочу продвинуть этот сайт по школе — просто ради интереса, потому что мне уже немного скучно на летних каникулах. Буду благодарен, если поделишься сайтом! Идеи для сайта пиши в Telegram: @a1_r1_i9_3h 🚀',

    nick_heading: 'Добро пожаловать!',
    nick_sub: 'Введи свой никнейм, чтобы продолжить:',
    nick_placeholder: 'Твой ник',
    nick_save_btn: 'Сохранить',

    photo_placeholder: 'Здесь появится фото 👇',
    comment_placeholder: 'Написать комментарий...',
    upload_btn: '📤 Загрузить фото',
    random_btn: '🎲 Случайное фото',

    categories_heading: '🗂️ Категории фото',
    category_search_placeholder: 'Поиск категории... (например «горы», «шахматы»)',
    category_search_placeholder_short: 'Поиск категории...',

    category_pick_heading: 'Выберите категорию фото',
    category_pick_cancel: 'Отменить загрузку',

    edit_photo_heading: 'Редактировать фото',
    edit_caption_placeholder: 'Описание фото (необязательно)...',
    edit_category_label: 'Категория:',
    edit_cancel_btn: 'Отменить',
    edit_save_btn: 'Сохранить ✅',
    edit_saving: '⏳ Сохраняем...',

    crop_heading: 'Обрежь фото',
    crop_hint: 'Перетащи фото пальцем/мышкой, приближай ползунком',
    crop_caption_placeholder: 'Добавить описание (необязательно)...',
    crop_cancel_btn: 'Отменить',
    crop_confirm_btn: 'Готово ✅',
    crop_photo_alt: 'Фото для обрезки',

    default_nick: 'Аноним',
    enter_nick_first: 'Сначала введи никнейм 🙂',
    enter_nickname: 'Введи никнейм 🙂',
    enter_new_nick: 'Введи новый ник 🙂',

    upload_success: 'Фото загружено! ✅',
    error_prefix: 'Ошибка: ',
    unknown_error: 'неизвестная',
    upload_fail: 'Не удалось загрузить фото. Проверь, запущен ли сервер.',
    uploading_text: '⏳ Загрузка...',

    fetch_random_fail: 'Не удалось получить фото. Проверь, запущен ли сервер.',
    no_photos_at_all: 'Пока нет ни одного фото. Загрузи первое! 📤',
    no_photos_in_category: 'Пока нет фото в категории «{label}». Загрузи первое! 📤',

    photo_unavailable: 'Это фото больше недоступно.',
    open_photo_fail: 'Не удалось открыть фото.',

    fetch_comments_fail_console: 'Не удалось получить комментарии:',
    load_comments_fail: 'Не удалось загрузить комментарии.',
    inbox_empty: 'Пока никто не комментировал твои фото 💬',

    load_profile_fail: 'Не удалось загрузить профиль.',
    profile_grid_empty: 'Пока нет загруженных фото 📷',

    confirm_delete_photo: 'Удалить это фото? Это действие нельзя отменить.',
    delete_photo_fail: 'Не удалось удалить фото.',

    load_site_stats_fail: 'Не удалось загрузить статистику сайта.',
    load_my_stats_fail: 'Не удалось загрузить твою статистику.',
    stats_top_label: 'Больше всего лайков у',
    stats_no_likes_yet: 'Пока нет лайков 🤷',

    search_list_fail: 'Не удалось загрузить список 😕',
    search_nobody_found: 'Никого не найдено 🤷',
    photos_word: 'фото',

    avatar_change_fail: 'Не удалось изменить аватарку.',

    rename_changing: '⏳ Меняем...',
    rename_success: 'Ник изменён! ✅',
    rename_fail: 'Не удалось изменить ник. Проверь, запущен ли сервер.',
    get_likes_fail_console: 'Не удалось получить лайки:',
    register_user_fail_console: 'Не удалось зарегистрировать пользователя:',

    welcome_text: 'Привет, {nick}! 👋',
    total_likes_text: 'Твои лайки (всего): {total}',

    comments_none_yet: 'Пока нет комментариев. Будь первым! 💬',
    send_comment_fail_console: 'Не удалось отправить комментарий:',
    like_fail_console: 'Не удалось поставить лайк:',

    already_liked_label: '💚 Уже лайкнуто',
    author_label: 'Автор:',

    edit_open_fail: 'Не удалось открыть редактирование фото.',
    edit_save_fail: 'Не удалось сохранить изменения.',
    edit_dots_title: 'Редактировать фото',

    category_not_found: 'Ничего не найдено 🤷',

    photo_alt: 'Фото',
    photo_by_alt: 'Фото от {author}',

    create_group_btn: '👥 Создать группу',
    popular_groups_heading: '🔥 Популярные группы',
    groups_empty: 'Пока нет групп. Создай первую! 👥',
    groups_load_fail: 'Не удалось загрузить список групп.',
    group_subscribers_count: 'подписчиков: {count}',
    group_posts_count: 'постов: {count}',
    group_subscribed_badge: '✅ Ты подписан',
    create_group_heading: 'Создать группу',
    create_group_avatar_hint: 'Нажми, чтобы выбрать аватарку',
    group_name_placeholder: 'Название группы',
    group_desc_placeholder: 'Описание группы (необязательно)',
    create_group_submit: 'Создать',
    create_group_creating: '⏳ Создаём...',
    create_group_fail: 'Не удалось создать группу.',
    group_name_too_short: 'Введи название группы (минимум 2 символа) 🙂',
    group_subscribe_btn: '➕ Подписаться',
    group_unsubscribe_btn: '✖ Отписаться',
    group_admin_label: 'Админ:',
    group_add_post_btn: '📤 Добавить пост',
    group_delete_btn: '🗑 Удалить группу',
    group_delete_post_title: 'Удалить пост',
    group_confirm_delete: 'Удалить эту группу вместе со всеми постами? Это действие нельзя отменить.',
    group_confirm_delete_post: 'Удалить этот пост?',
    group_locked: '🔒 Подпишись на группу, чтобы видеть посты, лайкать и комментировать.',
    group_no_posts: 'В этой группе пока нет постов.',
    group_load_fail: 'Не удалось открыть группу.',
    group_action_fail: 'Не удалось выполнить действие. Попробуй ещё раз.',
    group_post_fail: 'Не удалось опубликовать пост.'
  },

  en: {
    settings_title: 'Settings',
    profile_title: 'My profile',
    stats_title: 'Site stats',
    search_title: 'Search users',
    donate_title: 'Support the project',
    theme_title: 'Toggle theme',
    lang_title: 'Change language',
    tg_title: 'Our Telegram',
    inbox_title: 'Comments on my photos',

    search_heading: 'Search users',
    search_placeholder: 'Enter a nickname...',
    close_btn: 'Close',

    stats_tab_site: 'Site stats',
    stats_tab_mine: 'My stats',
    stats_photos: 'photos',
    stats_comments: 'comments',
    stats_likes: 'likes',
    stats_users: 'users',
    my_stats_photos: 'my photos',
    my_stats_comments: 'my comments',
    my_stats_likes: 'my likes',

    donate_heading: 'Support the project',
    donate_action_btn: '💰 Donate',
    donate_qr_alt: 'Donation QR code',

    profile_heading_own: 'My profile',
    profile_heading_other: 'Profile: {nick}',
    avatar_edit_hint: 'Change',
    avatar_alt: 'Avatar',

    inbox_heading: 'Comments on your photos',

    tab_nick: 'Nickname',
    tab_about: 'About',
    current_nick_label: 'Your current nickname:',
    rename_placeholder: 'New nickname',
    rename_btn: 'Change nickname',
    rename_hint: 'Your nickname will change everywhere: on your photos, likes and comments.',
    about_text: 'This site gives you random photos. You can upload your own photo, and it will appear on the site — others can like it and leave comments under it. Tap the "Random photo" button and you\'ll get a photo from one of the site\'s users. I\'m a student at Lyceum No. 1 in Kolomyia, and I want to spread this site around my school — just for fun, since I\'m already a bit bored on summer break. I\'d appreciate it if you shared the site! Got ideas for the site? Message me on Telegram: @a1_r1_i9_3h 🚀',

    nick_heading: 'Welcome!',
    nick_sub: 'Enter your nickname to continue:',
    nick_placeholder: 'Your nickname',
    nick_save_btn: 'Save',

    photo_placeholder: 'Your photo will appear here 👇',
    comment_placeholder: 'Write a comment...',
    upload_btn: '📤 Upload photo',
    random_btn: '🎲 Random photo',

    categories_heading: '🗂️ Photo categories',
    category_search_placeholder: 'Search category... (e.g. "mountains", "chess")',
    category_search_placeholder_short: 'Search category...',

    category_pick_heading: 'Choose a photo category',
    category_pick_cancel: 'Cancel upload',

    edit_photo_heading: 'Edit photo',
    edit_caption_placeholder: 'Photo caption (optional)...',
    edit_category_label: 'Category:',
    edit_cancel_btn: 'Cancel',
    edit_save_btn: 'Save ✅',
    edit_saving: '⏳ Saving...',

    crop_heading: 'Crop your photo',
    crop_hint: 'Drag the photo with your finger/mouse, zoom with the slider',
    crop_caption_placeholder: 'Add a caption (optional)...',
    crop_cancel_btn: 'Cancel',
    crop_confirm_btn: 'Done ✅',
    crop_photo_alt: 'Photo to crop',

    default_nick: 'Anonymous',
    enter_nick_first: 'Enter a nickname first 🙂',
    enter_nickname: 'Enter a nickname 🙂',
    enter_new_nick: 'Enter a new nickname 🙂',

    upload_success: 'Photo uploaded! ✅',
    error_prefix: 'Error: ',
    unknown_error: 'unknown',
    upload_fail: 'Could not upload the photo. Check that the server is running.',
    uploading_text: '⏳ Uploading...',

    fetch_random_fail: 'Could not load a photo. Check that the server is running.',
    no_photos_at_all: 'No photos yet. Upload the first one! 📤',
    no_photos_in_category: 'No photos in the "{label}" category yet. Upload the first one! 📤',

    photo_unavailable: 'This photo is no longer available.',
    open_photo_fail: 'Could not open the photo.',

    fetch_comments_fail_console: 'Could not fetch comments:',
    load_comments_fail: 'Could not load comments.',
    inbox_empty: 'No one has commented on your photos yet 💬',

    load_profile_fail: 'Could not load the profile.',
    profile_grid_empty: 'No photos uploaded yet 📷',

    confirm_delete_photo: 'Delete this photo? This action cannot be undone.',
    delete_photo_fail: 'Could not delete the photo.',

    load_site_stats_fail: 'Could not load site stats.',
    load_my_stats_fail: 'Could not load your stats.',
    stats_top_label: 'Most likes:',
    stats_no_likes_yet: 'No likes yet 🤷',

    search_list_fail: 'Could not load the list 😕',
    search_nobody_found: 'Nobody found 🤷',
    photos_word: 'photos',

    avatar_change_fail: 'Could not change the avatar.',

    rename_changing: '⏳ Changing...',
    rename_success: 'Nickname changed! ✅',
    rename_fail: 'Could not change the nickname. Check that the server is running.',
    get_likes_fail_console: 'Could not fetch likes:',
    register_user_fail_console: 'Could not register the user:',

    welcome_text: 'Hi, {nick}! 👋',
    total_likes_text: 'Your likes (total): {total}',

    comments_none_yet: 'No comments yet. Be the first! 💬',
    send_comment_fail_console: 'Could not send the comment:',
    like_fail_console: 'Could not like the photo:',

    already_liked_label: '💚 Already liked',
    author_label: 'Author:',

    edit_open_fail: 'Could not open the photo editor.',
    edit_save_fail: 'Could not save the changes.',
    edit_dots_title: 'Edit photo',

    category_not_found: 'Nothing found 🤷',

    photo_alt: 'Photo',
    photo_by_alt: 'Photo by {author}',

    create_group_btn: '👥 Create a group',
    popular_groups_heading: '🔥 Popular groups',
    groups_empty: 'No groups yet. Create the first one! 👥',
    groups_load_fail: 'Could not load the groups list.',
    group_subscribers_count: 'subscribers: {count}',
    group_posts_count: 'posts: {count}',
    group_subscribed_badge: '✅ Subscribed',
    create_group_heading: 'Create a group',
    create_group_avatar_hint: 'Tap to choose an avatar',
    group_name_placeholder: 'Group name',
    group_desc_placeholder: 'Group description (optional)',
    create_group_submit: 'Create',
    create_group_creating: '⏳ Creating...',
    create_group_fail: 'Could not create the group.',
    group_name_too_short: 'Enter a group name (at least 2 characters) 🙂',
    group_subscribe_btn: '➕ Subscribe',
    group_unsubscribe_btn: '✖ Unsubscribe',
    group_admin_label: 'Admin:',
    group_add_post_btn: '📤 Add a post',
    group_delete_btn: '🗑 Delete group',
    group_delete_post_title: 'Delete post',
    group_confirm_delete: 'Delete this group with all its posts? This action cannot be undone.',
    group_confirm_delete_post: 'Delete this post?',
    group_locked: '🔒 Subscribe to the group to see posts, like and comment.',
    group_no_posts: 'No posts in this group yet.',
    group_load_fail: 'Could not open the group.',
    group_action_fail: 'Could not complete the action. Try again.',
    group_post_fail: 'Could not publish the post.'
  }
};

function t(key, vars) {
  let str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.uk[key] || key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.split('{' + k + '}').join(vars[k]);
    });
  }
  return str;
}

// === Категорії фото ===
// ВАЖЛИВО: список ID категорій продубльований в server.js (для валідації).
// Тут — тільки структура (id + emoji), самі назви лежать в CATEGORY_I18N нижче.
const CATEGORY_STRUCTURE = [
  { id: 'none', emoji: '🚫', subcategories: ['none_general'] },
  {
    id: 'life_sport',
    emoji: '🏃',
    subcategories: [
      'sport_gym', 'sport_running', 'sport_yoga', 'sport_football', 'sport_basketball',
      'sport_cycling', 'sport_swimming', 'sport_martial_arts', 'life_friends', 'life_family',
      'life_everyday', 'life_food', 'life_party', 'life_travel'
    ]
  },
  {
    id: 'nature_vibe',
    emoji: '🌅',
    subcategories: [
      'nature_sunset', 'nature_mountains', 'nature_sea', 'nature_forest', 'nature_sky',
      'nature_flowers', 'nature_animals', 'nature_city_night', 'nature_architecture',
      'nature_winter', 'nature_autumn', 'nature_rain', 'nature_water'
    ]
  },
  {
    id: 'hobby',
    emoji: '🎨',
    subcategories: [
      'hobby_drawing', 'hobby_photography', 'hobby_music', 'hobby_guitar', 'hobby_singing',
      'hobby_dancing', 'hobby_reading', 'hobby_writing', 'hobby_cooking', 'hobby_baking',
      'hobby_knitting', 'hobby_sewing', 'hobby_gaming', 'hobby_boardgames', 'hobby_chess',
      'hobby_fishing', 'hobby_gardening', 'hobby_collecting', 'hobby_modeling', 'hobby_calligraphy',
      'hobby_robotics', 'hobby_programming', 'hobby_diy', 'hobby_woodworking', 'hobby_pottery',
      'hobby_origami', 'hobby_scrapbooking', 'hobby_cars', 'hobby_skating', 'hobby_surfing',
      'hobby_climbing', 'hobby_camping', 'hobby_astronomy', 'hobby_tattoo'
    ]
  }
];

const CATEGORY_I18N = {
  uk: {
    none: 'Без категорії', none_general: 'Просто фото без категорії',
    life_sport: 'Життя і спорт',
    sport_gym: 'Тренування / спортзал', sport_running: 'Біг', sport_yoga: 'Йога',
    sport_football: 'Футбол', sport_basketball: 'Баскетбол', sport_cycling: 'Велоспорт',
    sport_swimming: 'Плавання', sport_martial_arts: 'Єдиноборства', life_friends: 'Друзі',
    life_family: "Сім'я", life_everyday: 'Повсякденне життя', life_food: 'Їжа',
    life_party: 'Вечірки', life_travel: 'Подорожі',
    nature_vibe: 'Природа та вайб',
    nature_sunset: 'Заходи сонця', nature_mountains: 'Гори', nature_sea: 'Море',
    nature_forest: 'Ліс', nature_sky: 'Небо і хмари', nature_flowers: 'Квіти',
    nature_animals: 'Тварини', nature_city_night: 'Місто вночі', nature_architecture: 'Архітектура',
    nature_winter: 'Зима', nature_autumn: 'Осінь', nature_rain: 'Дощ і туман',
    nature_water: 'Водоспади і річки',
    hobby: 'Хобі',
    hobby_drawing: 'Малювання', hobby_photography: 'Фотографія', hobby_music: 'Музика',
    hobby_guitar: 'Гітара', hobby_singing: 'Спів', hobby_dancing: 'Танці',
    hobby_reading: 'Читання книг', hobby_writing: 'Письменництво', hobby_cooking: 'Кулінарія',
    hobby_baking: 'Випічка', hobby_knitting: "В'язання", hobby_sewing: 'Шиття',
    hobby_gaming: 'Відеоігри', hobby_boardgames: 'Настільні ігри', hobby_chess: 'Шахи',
    hobby_fishing: 'Риболовля', hobby_gardening: 'Садівництво', hobby_collecting: 'Колекціонування',
    hobby_modeling: 'Моделювання', hobby_calligraphy: 'Каліграфія', hobby_robotics: 'Робототехніка',
    hobby_programming: 'Програмування', hobby_diy: 'DIY і майстрування', hobby_woodworking: 'Робота з деревом',
    hobby_pottery: 'Кераміка', hobby_origami: 'Оригамі', hobby_scrapbooking: 'Скрапбукінг',
    hobby_cars: 'Автомобілі і тюнінг', hobby_skating: 'Скейтбординг', hobby_surfing: 'Серфінг',
    hobby_climbing: 'Скелелазіння', hobby_camping: 'Кемпінг', hobby_astronomy: 'Астрономія',
    hobby_tattoo: 'Тату-арт'
  },
  ru: {
    none: 'Без категории', none_general: 'Просто фото без категории',
    life_sport: 'Жизнь и спорт',
    sport_gym: 'Тренировки / спортзал', sport_running: 'Бег', sport_yoga: 'Йога',
    sport_football: 'Футбол', sport_basketball: 'Баскетбол', sport_cycling: 'Велоспорт',
    sport_swimming: 'Плавание', sport_martial_arts: 'Единоборства', life_friends: 'Друзья',
    life_family: 'Семья', life_everyday: 'Повседневная жизнь', life_food: 'Еда',
    life_party: 'Вечеринки', life_travel: 'Путешествия',
    nature_vibe: 'Природа и вайб',
    nature_sunset: 'Закаты', nature_mountains: 'Горы', nature_sea: 'Море',
    nature_forest: 'Лес', nature_sky: 'Небо и облака', nature_flowers: 'Цветы',
    nature_animals: 'Животные', nature_city_night: 'Город ночью', nature_architecture: 'Архитектура',
    nature_winter: 'Зима', nature_autumn: 'Осень', nature_rain: 'Дождь и туман',
    nature_water: 'Водопады и реки',
    hobby: 'Хобби',
    hobby_drawing: 'Рисование', hobby_photography: 'Фотография', hobby_music: 'Музыка',
    hobby_guitar: 'Гитара', hobby_singing: 'Пение', hobby_dancing: 'Танцы',
    hobby_reading: 'Чтение книг', hobby_writing: 'Писательство', hobby_cooking: 'Кулинария',
    hobby_baking: 'Выпечка', hobby_knitting: 'Вязание', hobby_sewing: 'Шитьё',
    hobby_gaming: 'Видеоигры', hobby_boardgames: 'Настольные игры', hobby_chess: 'Шахматы',
    hobby_fishing: 'Рыбалка', hobby_gardening: 'Садоводство', hobby_collecting: 'Коллекционирование',
    hobby_modeling: 'Моделирование', hobby_calligraphy: 'Каллиграфия', hobby_robotics: 'Робототехника',
    hobby_programming: 'Программирование', hobby_diy: 'DIY и мастерство', hobby_woodworking: 'Работа с деревом',
    hobby_pottery: 'Керамика', hobby_origami: 'Оригами', hobby_scrapbooking: 'Скрапбукинг',
    hobby_cars: 'Автомобили и тюнинг', hobby_skating: 'Скейтбординг', hobby_surfing: 'Сёрфинг',
    hobby_climbing: 'Скалолазание', hobby_camping: 'Кемпинг', hobby_astronomy: 'Астрономия',
    hobby_tattoo: 'Тату-арт'
  },
  en: {
    none: 'No category', none_general: 'Just a photo, no category',
    life_sport: 'Life & sport',
    sport_gym: 'Workout / gym', sport_running: 'Running', sport_yoga: 'Yoga',
    sport_football: 'Football', sport_basketball: 'Basketball', sport_cycling: 'Cycling',
    sport_swimming: 'Swimming', sport_martial_arts: 'Martial arts', life_friends: 'Friends',
    life_family: 'Family', life_everyday: 'Everyday life', life_food: 'Food',
    life_party: 'Parties', life_travel: 'Travel',
    nature_vibe: 'Nature & vibes',
    nature_sunset: 'Sunsets', nature_mountains: 'Mountains', nature_sea: 'Sea',
    nature_forest: 'Forest', nature_sky: 'Sky & clouds', nature_flowers: 'Flowers',
    nature_animals: 'Animals', nature_city_night: 'City at night', nature_architecture: 'Architecture',
    nature_winter: 'Winter', nature_autumn: 'Autumn', nature_rain: 'Rain & fog',
    nature_water: 'Waterfalls & rivers',
    hobby: 'Hobbies',
    hobby_drawing: 'Drawing', hobby_photography: 'Photography', hobby_music: 'Music',
    hobby_guitar: 'Guitar', hobby_singing: 'Singing', hobby_dancing: 'Dancing',
    hobby_reading: 'Reading books', hobby_writing: 'Writing', hobby_cooking: 'Cooking',
    hobby_baking: 'Baking', hobby_knitting: 'Knitting', hobby_sewing: 'Sewing',
    hobby_gaming: 'Video games', hobby_boardgames: 'Board games', hobby_chess: 'Chess',
    hobby_fishing: 'Fishing', hobby_gardening: 'Gardening', hobby_collecting: 'Collecting',
    hobby_modeling: 'Modeling', hobby_calligraphy: 'Calligraphy', hobby_robotics: 'Robotics',
    hobby_programming: 'Programming', hobby_diy: 'DIY & crafting', hobby_woodworking: 'Woodworking',
    hobby_pottery: 'Pottery', hobby_origami: 'Origami', hobby_scrapbooking: 'Scrapbooking',
    hobby_cars: 'Cars & tuning', hobby_skating: 'Skateboarding', hobby_surfing: 'Surfing',
    hobby_climbing: 'Climbing', hobby_camping: 'Camping', hobby_astronomy: 'Astronomy',
    hobby_tattoo: 'Tattoo art'
  }
};

function flattenCategories() {
  const labels = CATEGORY_I18N[currentLang] || CATEGORY_I18N.uk;
  return CATEGORY_STRUCTURE.flatMap(g =>
    g.subcategories.map(id => ({
      id,
      label: labels[id] || id,
      groupId: g.id,
      groupLabel: labels[g.id] || g.id,
      groupEmoji: g.emoji
    }))
  );
}

function categoryLabelById(id) {
  if (!id) return null;
  const labels = CATEGORY_I18N[currentLang] || CATEGORY_I18N.uk;
  return labels[id] || null;
}

// --- Малює список категорій (згруповано, або пласким списком, якщо є пошуковий запит) ---
function renderCategoryPanel(panelEl, { query = '', selectedId = null, onSelect }) {
  const labels = CATEGORY_I18N[currentLang] || CATEGORY_I18N.uk;
  const q = query.trim().toLowerCase();

  if (!q) {
    panelEl.innerHTML = CATEGORY_STRUCTURE.map(group => `
      <div class="category-group">
        <div class="category-group-title">${group.emoji} ${labels[group.id]}</div>
        <div class="category-chip-list">
          ${group.subcategories.map(id => `
            <button type="button" class="category-chip ${id === selectedId ? 'selected' : ''}" data-cat-id="${id}">${labels[id]}</button>
          `).join('')}
        </div>
      </div>
    `).join('');
  } else {
    const matches = flattenCategories().filter(s =>
      s.label.toLowerCase().includes(q) || s.groupLabel.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
      panelEl.innerHTML = `<p class="category-empty">${t('category_not_found')}</p>`;
    } else {
      panelEl.innerHTML = `
        <div class="category-group">
          <div class="category-chip-list">
            ${matches.map(s => `
              <button type="button" class="category-chip ${s.id === selectedId ? 'selected' : ''}" data-cat-id="${s.id}">${s.groupEmoji} ${s.label}</button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  panelEl.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.dataset.catId));
  });
}

const nickModal = document.getElementById('nickModal');
const nickInput = document.getElementById('nickInput');
const saveNickBtn = document.getElementById('saveNickBtn');
const welcomeText = document.getElementById('welcomeText');
const totalLikesText = document.getElementById('totalLikesText');

const uploadBtn = document.getElementById('uploadBtn');
const randomBtn = document.getElementById('randomBtn');
const fileInput = document.getElementById('fileInput');
const photoArea = document.getElementById('photoArea');
const photoInfo = document.getElementById('photoInfo');

const cropModal = document.getElementById('cropModal');
const cropViewport = document.getElementById('cropViewport');
const cropImage = document.getElementById('cropImage');
const cropZoom = document.getElementById('cropZoom');
const cropCancelBtn = document.getElementById('cropCancelBtn');
const cropConfirmBtn = document.getElementById('cropConfirmBtn');
const captionInput = document.getElementById('captionInput');
const photoCaption = document.getElementById('photoCaption');

const themeToggle = document.getElementById('themeToggle');
const langBtn = document.getElementById('langBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const tabNickBtn = document.getElementById('tabNickBtn');
const tabAboutBtn = document.getElementById('tabAboutBtn');
const tabNickPanel = document.getElementById('tabNickPanel');
const tabAboutPanel = document.getElementById('tabAboutPanel');
const currentNickDisplay = document.getElementById('currentNickDisplay');
const renameInput = document.getElementById('renameInput');
const saveRenameBtn = document.getElementById('saveRenameBtn');

const commentsSection = document.getElementById('commentsSection');
const commentsList = document.getElementById('commentsList');
const commentInput = document.getElementById('commentInput');
const sendCommentBtn = document.getElementById('sendCommentBtn');

const inboxBtn = document.getElementById('inboxBtn');
const inboxBadge = document.getElementById('inboxBadge');
const inboxModal = document.getElementById('inboxModal');
const inboxList = document.getElementById('inboxList');
const closeInboxBtn = document.getElementById('closeInboxBtn');

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const profileTitle = document.getElementById('profileTitle');
const profileAvatarImg = document.getElementById('profileAvatarImg');
const profileAvatarFallback = document.getElementById('profileAvatarFallback');
const avatarWrap = document.querySelector('.avatar-wrap');
const avatarEditHint = document.getElementById('avatarEditHint');
const avatarInput = document.getElementById('avatarInput');
const profileNickDisplay = document.getElementById('profileNickDisplay');
const profileGrid = document.getElementById('profileGrid');
const closeProfileBtn = document.getElementById('closeProfileBtn');

const statsBtn = document.getElementById('statsBtn');
const statsModal = document.getElementById('statsModal');
const statsPhotos = document.getElementById('statsPhotos');
const statsComments = document.getElementById('statsComments');
const statsLikes = document.getElementById('statsLikes');
const statsUsers = document.getElementById('statsUsers');
const statsTopUser = document.getElementById('statsTopUser');
const closeStatsBtn = document.getElementById('closeStatsBtn');

const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const closeSearchBtn = document.getElementById('closeSearchBtn');

const tgBtn = document.getElementById('tgBtn');

const donateBtn = document.getElementById('donateBtn');
const donateModal = document.getElementById('donateModal');
const donateActionBtn = document.getElementById('donateActionBtn');
const closeDonateBtn = document.getElementById('closeDonateBtn');

const categorySearchInput = document.getElementById('categorySearchInput');
const categoryPanel = document.getElementById('categoryPanel');

const categoryPickModal = document.getElementById('categoryPickModal');
const categoryPickSearchInput = document.getElementById('categoryPickSearchInput');
const categoryPickPanel = document.getElementById('categoryPickPanel');
const categoryPickCancelBtn = document.getElementById('categoryPickCancelBtn');

const editPhotoModal = document.getElementById('editPhotoModal');
const editCaptionInput = document.getElementById('editCaptionInput');
const editCategorySearchInput = document.getElementById('editCategorySearchInput');
const editCategoryPanel = document.getElementById('editCategoryPanel');
const editPhotoCancelBtn = document.getElementById('editPhotoCancelBtn');
const editPhotoSaveBtn = document.getElementById('editPhotoSaveBtn');

let profileIsOwn = false; // чи зараз відкритий профіль — це профіль поточного користувача

let unreadCount = 0;

let currentPhoto = null; // фото, яке зараз показане на екрані

let pendingUploadBlob = null; // обрізане фото, яке чекає на вибір категорії перед завантаженням
let pendingUploadCaption = '';

let editingPhotoId = null; // id фото, яке зараз редагується (три крапки в профілі)
let editingSelectedCategory = 'none_general';

// --- Нікнейм зберігаємо локально в цьому браузері, ---
// --- щоб сайт "пам'ятав" хто ти при наступному заході ---
function getNick() {
  return localStorage.getItem('nickname');
}

// --- Socket.IO: живі оновлення лайків без перезавантаження сторінки ---
const socket = io();

socket.on('likeUpdate', ({ id, likes }) => {
  // якщо хтось лайкнув те саме фото, яке зараз бачить цей користувач — оновлюємо на льоту
  if (currentPhoto && currentPhoto.id === id) {
    currentPhoto.likes = likes;
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn && !currentPhoto.likedByMe) {
      likeBtn.textContent = `❤️ ${likes}`;
    }
  }
});

socket.on('totalLikesUpdate', ({ total }) => {
  totalLikesText.textContent = t('total_likes_text', { total });
});

socket.on('commentUpdate', ({ photoId, comment }) => {
  if (currentPhoto && currentPhoto.id === photoId) {
    if (!currentPhoto.comments) currentPhoto.comments = [];
    // Захист від дублювання: якщо цей коментар вже доданий (наприклад, це наш власний,
    // який ми щойно додали одразу після відповіді сервера) — не додаємо вдруге
    const alreadyExists = currentPhoto.comments.some(c => c.id === comment.id);
    if (!alreadyExists) {
      currentPhoto.comments.push(comment);
      renderComments();
    }
  }
});

// --- Нотифікація: хтось прокоментував МОЄ фото ---
socket.on('newCommentOnMyPhoto', () => {
  unreadCount += 1;
  updateInboxBadge();
});

function updateInboxBadge() {
  if (unreadCount > 0) {
    inboxBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
    inboxBadge.classList.remove('hidden');
  } else {
    inboxBadge.classList.add('hidden');
  }
}

function getLastSeenKey() {
  const nick = getNick();
  return nick ? `commentsLastSeen:${nick}` : null;
}

async function refreshInboxBadge() {
  const nick = getNick();
  if (!nick) return;
  try {
    const res = await fetch(`/api/myComments/${encodeURIComponent(nick)}`);
    const data = await res.json();
    const lastSeenKey = getLastSeenKey();
    const lastSeen = lastSeenKey ? Number(localStorage.getItem(lastSeenKey) || 0) : 0;
    unreadCount = data.comments.filter(c => c.createdAt > lastSeen).length;
    updateInboxBadge();
  } catch (e) {
    console.error(t('fetch_comments_fail_console'), e);
  }
}

inboxBtn.addEventListener('click', async () => {
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }

  try {
    const res = await fetch(`/api/myComments/${encodeURIComponent(nick)}`);
    const data = await res.json();

    if (data.comments.length === 0) {
      inboxList.innerHTML = `<p class="inbox-empty">${t('inbox_empty')}</p>`;
    } else {
      inboxList.innerHTML = data.comments
        .map(
          (c, i) => `
            <div class="inbox-item">
              <img src="/uploads/${c.photoFilename}" alt="${t('photo_alt')}">
              <div class="inbox-text">
                <span class="inbox-author comment-author-link" data-idx="${i}">${c.commentAuthor}:</span> ${c.text}
              </div>
            </div>
          `
        )
        .join('');

      inboxList.querySelectorAll('.comment-author-link').forEach(el => {
        el.addEventListener('click', () => {
          const idx = Number(el.dataset.idx);
          openProfile(data.comments[idx].commentAuthor);
        });
      });
    }

    inboxModal.classList.remove('hidden');

    // Позначаємо все як прочитане
    unreadCount = 0;
    updateInboxBadge();
    const lastSeenKey = getLastSeenKey();
    if (lastSeenKey) localStorage.setItem(lastSeenKey, Date.now().toString());
  } catch (e) {
    alert(t('load_comments_fail'));
    console.error(e);
  }
});

closeInboxBtn.addEventListener('click', () => {
  inboxModal.classList.add('hidden');
});

// --- Профіль (свій і чужий) ---
function avatarHtmlFor(nickname, avatar, sizeClass, fallbackClass) {
  if (avatar) {
    return `<img class="${sizeClass}" src="/uploads/${avatar}" alt="${nickname}">`;
  }
  const letter = (nickname || '?').trim().charAt(0).toUpperCase() || '?';
  return `<div class="${fallbackClass}">${letter}</div>`;
}

async function openProfile(nickname) {
  if (!nickname) return;
  const myNick = getNick();
  profileIsOwn = nickname === myNick;

  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(nickname)}`);
    const data = await res.json();
    renderProfile(data);
    profileModal.classList.remove('hidden');
  } catch (e) {
    alert(t('load_profile_fail'));
    console.error(e);
  }
}

function renderProfile(data) {
  profileTitle.textContent = profileIsOwn ? t('profile_heading_own') : t('profile_heading_other', { nick: data.nickname });
  profileNickDisplay.textContent = data.nickname;

  if (data.avatar) {
    profileAvatarImg.src = `/uploads/${data.avatar}`;
    profileAvatarImg.classList.remove('hidden');
    profileAvatarFallback.classList.add('hidden');
  } else {
    profileAvatarImg.classList.add('hidden');
    profileAvatarFallback.textContent = (data.nickname || '?').trim().charAt(0).toUpperCase() || '?';
    profileAvatarFallback.classList.remove('hidden');
  }

  if (profileIsOwn) {
    avatarWrap.classList.add('editable');
    avatarEditHint.classList.remove('hidden');
  } else {
    avatarWrap.classList.remove('editable');
    avatarEditHint.classList.add('hidden');
  }

  if (!data.photos || data.photos.length === 0) {
    profileGrid.innerHTML = `<p class="profile-grid-empty">${t('profile_grid_empty')}</p>`;
  } else {
    profileGrid.innerHTML = data.photos
      .map(p => `
        <div class="profile-grid-item">
          <img src="/uploads/${p.filename}" alt="${t('photo_alt')}" class="profile-grid-photo" data-photo-id="${p.id}">
          <button type="button" class="profile-grid-dots ${profileIsOwn ? '' : 'hidden'}" data-photo-id="${p.id}" title="${t('edit_dots_title')}">⋮</button>
        </div>
      `)
      .join('');

    profileGrid.querySelectorAll('.profile-grid-dots').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditPhotoModal(btn.dataset.photoId);
      });
    });

    profileGrid.querySelectorAll('.profile-grid-photo').forEach(img => {
      let pressTimer = null;
      let longPressTriggered = false;

      img.addEventListener('pointerdown', () => {
        longPressTriggered = false;
        if (!profileIsOwn) return; // видаляти можна лише зі свого профілю
        pressTimer = setTimeout(() => {
          longPressTriggered = true;
          confirmDeletePhoto(img.dataset.photoId, img);
        }, 600);
      });

      const cancelPress = () => {
        if (pressTimer) clearTimeout(pressTimer);
      };
      img.addEventListener('pointerup', cancelPress);
      img.addEventListener('pointerleave', cancelPress);
      img.addEventListener('pointercancel', cancelPress);

      img.addEventListener('click', () => {
        if (longPressTriggered) return; // це було затискання, а не клік
        openPhotoById(img.dataset.photoId);
      });
    });
  }
}

async function confirmDeletePhoto(photoId, imgEl) {
  const nick = getNick();
  if (!nick) return;

  const ok = confirm(t('confirm_delete_photo'));
  if (!ok) return;

  try {
    const res = await fetch(`/api/photo/${encodeURIComponent(photoId)}?nickname=${encodeURIComponent(nick)}`, {
      method: 'DELETE'
    });
    const data = await res.json();

    if (data.success) {
      imgEl.remove();
      if (profileGrid.querySelectorAll('.profile-grid-photo').length === 0) {
        profileGrid.innerHTML = `<p class="profile-grid-empty">${t('profile_grid_empty')}</p>`;
      }
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('delete_photo_fail'));
    console.error(e);
  }
}

profileBtn.addEventListener('click', () => {
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }
  openProfile(nick);
});

closeProfileBtn.addEventListener('click', () => {
  profileModal.classList.add('hidden');
});

// --- Статистика сайту ---
const statsTabSiteBtn = document.getElementById('statsTabSiteBtn');
const statsTabMineBtn = document.getElementById('statsTabMineBtn');
const statsSitePanel = document.getElementById('statsSitePanel');
const statsMinePanel = document.getElementById('statsMinePanel');
const myStatsPhotos = document.getElementById('myStatsPhotos');
const myStatsComments = document.getElementById('myStatsComments');
const myStatsLikes = document.getElementById('myStatsLikes');

async function loadSiteStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    statsPhotos.textContent = data.totalPhotos;
    statsComments.textContent = data.totalComments;
    statsLikes.textContent = data.totalLikes;
    statsUsers.textContent = data.totalUsers;

    if (data.topUser) {
      const avatarHtml = avatarHtmlFor(data.topUser, data.topUserAvatar, 'mini-avatar', 'mini-avatar-fallback');
      statsTopUser.innerHTML = `
        ${avatarHtml}
        <span class="stats-top-label">${t('stats_top_label')}</span>
        <span class="stats-top-name" id="statsTopUserLink">${data.topUser}</span>
        <span class="stats-top-likes">❤️ ${data.topUserLikes}</span>
      `;
      document.getElementById('statsTopUserLink').addEventListener('click', () => {
        statsModal.classList.add('hidden');
        openProfile(data.topUser);
      });
    } else {
      statsTopUser.innerHTML = `<p class="stats-empty">${t('stats_no_likes_yet')}</p>`;
    }
  } catch (e) {
    alert(t('load_site_stats_fail'));
    console.error(e);
  }
}

async function loadMyStats() {
  const nick = getNick();
  if (!nick) {
    myStatsPhotos.textContent = '0';
    myStatsComments.textContent = '0';
    myStatsLikes.textContent = '0';
    return;
  }
  try {
    const res = await fetch(`/api/myStats/${encodeURIComponent(nick)}`);
    const data = await res.json();
    myStatsPhotos.textContent = data.totalPhotos;
    myStatsComments.textContent = data.totalComments;
    myStatsLikes.textContent = data.totalLikes;
  } catch (e) {
    alert(t('load_my_stats_fail'));
    console.error(e);
  }
}

function switchStatsTab(tab) {
  if (tab === 'site') {
    statsTabSiteBtn.classList.add('active');
    statsTabMineBtn.classList.remove('active');
    statsSitePanel.classList.remove('hidden');
    statsMinePanel.classList.add('hidden');
    loadSiteStats();
  } else {
    statsTabMineBtn.classList.add('active');
    statsTabSiteBtn.classList.remove('active');
    statsMinePanel.classList.remove('hidden');
    statsSitePanel.classList.add('hidden');
    loadMyStats();
  }
}

statsTabSiteBtn.addEventListener('click', () => switchStatsTab('site'));
statsTabMineBtn.addEventListener('click', () => switchStatsTab('mine'));

statsBtn.addEventListener('click', () => {
  switchStatsTab('site');
  statsModal.classList.remove('hidden');
});

closeStatsBtn.addEventListener('click', () => {
  statsModal.classList.add('hidden');
});

// --- Пошук користувачів ---
async function runUserSearch(query) {
  try {
    const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderSearchResults(data.users);
  } catch (e) {
    searchResults.innerHTML = `<p class="search-empty">${t('search_list_fail')}</p>`;
    console.error(e);
  }
}

function renderSearchResults(users) {
  if (!users || users.length === 0) {
    searchResults.innerHTML = `<p class="search-empty">${t('search_nobody_found')}</p>`;
    return;
  }

  searchResults.innerHTML = users
    .map((u, i) => {
      const avatarHtml = avatarHtmlFor(u.nickname, u.avatar, 'mini-avatar', 'mini-avatar-fallback');
      return `
        <div class="search-result-item" data-idx="${i}">
          ${avatarHtml}
          <span class="search-result-nick">${u.nickname}</span>
          <span class="search-result-count">${u.photosCount} ${t('photos_word')}</span>
        </div>
      `;
    })
    .join('');

  searchResults.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      searchModal.classList.add('hidden');
      openProfile(users[idx].nickname);
    });
  });
}

searchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchModal.classList.remove('hidden');
  runUserSearch(''); // порожній пошук = показати всіх користувачів
  searchInput.focus();
});

searchInput.addEventListener('input', () => {
  runUserSearch(searchInput.value.trim());
});

closeSearchBtn.addEventListener('click', () => {
  searchModal.classList.add('hidden');
});

// --- Кнопка Telegram ---
tgBtn.addEventListener('click', () => {
  window.open(TELEGRAM_URL, '_blank');
});

// --- Донат ---
donateBtn.addEventListener('click', () => {
  donateModal.classList.remove('hidden');
});

closeDonateBtn.addEventListener('click', () => {
  donateModal.classList.add('hidden');
});

donateActionBtn.addEventListener('click', () => {
  window.open(DONATE_URL, '_blank');
});

// --- Перегляд категорій (замість колишньої секції "Івенти") ---
function openCategoryBrowsePanel() {
  categoryPanel.classList.remove('hidden');
  renderCategoryPanel(categoryPanel, {
    query: categorySearchInput.value,
    onSelect: (categoryId) => {
      categoryPanel.classList.add('hidden');
      categorySearchInput.value = '';
      loadRandomPhoto(categoryId);
    }
  });
}

categorySearchInput.addEventListener('focus', openCategoryBrowsePanel);
categorySearchInput.addEventListener('click', openCategoryBrowsePanel);
categorySearchInput.addEventListener('input', openCategoryBrowsePanel);

document.addEventListener('click', (e) => {
  const section = document.querySelector('.categories-section');
  if (section && !section.contains(e.target)) {
    categoryPanel.classList.add('hidden');
  }
});

avatarWrap.addEventListener('click', () => {
  if (!profileIsOwn) return;
  avatarInput.click();
});

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;
  const nick = getNick();
  if (!nick) return;

  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('nickname', nick);

  try {
    const res = await fetch('/api/avatar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      profileAvatarImg.src = `/uploads/${data.avatar}?t=${Date.now()}`;
      profileAvatarImg.classList.remove('hidden');
      profileAvatarFallback.classList.add('hidden');
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('avatar_change_fail'));
    console.error(e);
  } finally {
    avatarInput.value = '';
  }
});

// Якщо хтось (включно з нами) змінив аватарку — оновлюємо її скрізь, де вона зараз показана
socket.on('avatarUpdate', ({ nickname, avatar }) => {
  if (currentPhoto && currentPhoto.author === nickname) {
    currentPhoto.authorAvatar = avatar;
    renderPhotoInfo();
  }
  if (currentPhoto && currentPhoto.comments) {
    let changed = false;
    currentPhoto.comments.forEach(c => {
      if (c.author === nickname) {
        c.authorAvatar = avatar;
        changed = true;
      }
    });
    if (changed) renderComments();
  }
});

// --- Тема (темна/світла) ---
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
  localStorage.setItem('theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  applyTheme(saved);
}

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light');
});

// --- Мова інтерфейсу ---
langBtn.addEventListener('click', () => {
  const idx = LANGS.indexOf(currentLang);
  currentLang = LANGS[(idx + 1) % LANGS.length];
  localStorage.setItem('lang', currentLang);
  applyStaticTranslations();
  refreshDynamicTexts();
});

function applyStaticTranslations() {
  document.documentElement.lang = currentLang;
  langBtn.textContent = LANG_CODE_LABELS[currentLang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.dataset.i18nTitle));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.setAttribute('alt', t(el.dataset.i18nAlt));
  });
}

// Оновлює тексти, які залежать від поточного стану (нік, відкрите фото тощо)
function refreshDynamicTexts() {
  const nick = getNick();
  if (nick) {
    welcomeText.textContent = t('welcome_text', { nick });
    currentNickDisplay.textContent = nick;
    refreshTotalLikes();
  }

  if (currentPhoto) {
    renderPhotoInfo();
    renderComments();
  }

  if (!categoryPanel.classList.contains('hidden')) {
    renderCategoryPanel(categoryPanel, {
      query: categorySearchInput.value,
      onSelect: (categoryId) => {
        categoryPanel.classList.add('hidden');
        categorySearchInput.value = '';
        loadRandomPhoto(categoryId);
      }
    });
  }

  if (!categoryPickModal.classList.contains('hidden')) {
    renderCategoryPanel(categoryPickPanel, {
      query: categoryPickSearchInput.value,
      onSelect: (categoryId) => {
        categoryPickModal.classList.add('hidden');
        uploadPhotoBlob(pendingUploadBlob, pendingUploadCaption, categoryId);
        pendingUploadBlob = null;
        pendingUploadCaption = '';
      }
    });
  }

  if (!editPhotoModal.classList.contains('hidden')) {
    renderEditCategoryPanel();
  }

  renderGroupsList();
  if (groupState && !groupModal.classList.contains('hidden')) {
    renderGroupView();
  }
}

// --- Налаштування (тема + вкладки нік/про сайт) ---
settingsBtn.addEventListener('click', () => {
  currentNickDisplay.textContent = getNick() || t('default_nick');
  renameInput.value = '';
  settingsModal.classList.remove('hidden');
});
closeSettingsBtn.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

function switchSettingsTab(tab) {
  if (tab === 'nick') {
    tabNickBtn.classList.add('active');
    tabAboutBtn.classList.remove('active');
    tabNickPanel.classList.remove('hidden');
    tabAboutPanel.classList.add('hidden');
  } else {
    tabAboutBtn.classList.add('active');
    tabNickBtn.classList.remove('active');
    tabAboutPanel.classList.remove('hidden');
    tabNickPanel.classList.add('hidden');
  }
}
tabNickBtn.addEventListener('click', () => switchSettingsTab('nick'));
tabAboutBtn.addEventListener('click', () => switchSettingsTab('about'));

// --- Зміна нікнейму (переноситься усюди: фото, лайки, коментарі) ---
saveRenameBtn.addEventListener('click', async () => {
  const oldNick = getNick();
  const newNick = renameInput.value.trim();

  if (!newNick) {
    alert(t('enter_new_nick'));
    return;
  }
  if (newNick === oldNick) {
    settingsModal.classList.add('hidden');
    return;
  }

  saveRenameBtn.disabled = true;
  saveRenameBtn.textContent = t('rename_changing');

  try {
    const res = await fetch('/api/renameUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldNickname: oldNick, newNickname: newNick })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('nickname', newNick);
      welcomeText.textContent = t('welcome_text', { nick: newNick });
      currentNickDisplay.textContent = newNick;
      socket.emit('register', newNick);
      refreshTotalLikes();
      loadGroups();
      alert(t('rename_success'));
      settingsModal.classList.add('hidden');
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('rename_fail'));
    console.error(e);
  } finally {
    saveRenameBtn.disabled = false;
    saveRenameBtn.textContent = t('rename_btn');
  }
});

async function refreshTotalLikes() {
  const nick = getNick();
  if (!nick) return;
  try {
    const res = await fetch(`/api/totalLikes/${encodeURIComponent(nick)}`);
    const data = await res.json();
    totalLikesText.textContent = t('total_likes_text', { total: data.total });
  } catch (e) {
    console.error(t('get_likes_fail_console'), e);
  }
}

function showNickModalIfNeeded() {
  const nick = getNick();
  if (!nick) {
    nickModal.classList.remove('hidden');
  } else {
    welcomeText.textContent = t('welcome_text', { nick });
    refreshTotalLikes();
    refreshInboxBadge();
    socket.emit('register', nick);
    registerUser(nick);
  }
}

async function registerUser(nickname) {
  try {
    await fetch('/api/registerUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname })
    });
  } catch (e) {
    console.error(t('register_user_fail_console'), e);
  }
}

saveNickBtn.addEventListener('click', () => {
  const value = nickInput.value.trim();
  if (!value) {
    alert(t('enter_nickname'));
    return;
  }
  localStorage.setItem('nickname', value);
  welcomeText.textContent = t('welcome_text', { nick: value });
  nickModal.classList.add('hidden');
  refreshTotalLikes();
  refreshInboxBadge();
  socket.emit('register', value);
  registerUser(value);
  loadGroups();
});

// --- Завантаження фото на сервер ---
uploadBtn.addEventListener('click', () => {
  groupUploadTargetId = null; // звичайне завантаження, не пост у групу
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  openCropModal(file);
});

// === Інструмент кадрування фото (як в Instagram) ===
const CROP_VIEWPORT_SIZE = 260; // має збігатись з .crop-viewport в CSS
const CROP_OUTPUT_SIZE = 800; // розмір готового квадратного фото в пікселях

let cropOriginalImage = null;
let cropObjectUrl = null;
let cropBaseScale = 1; // масштаб, при якому фото щільно покриває квадрат (zoom = 1)
let cropZoomValue = 1; // додатковий зум від повзунка (1.0 - 3.0)
let cropOffsetX = 0;
let cropOffsetY = 0;
let cropNaturalWidth = 0;
let cropNaturalHeight = 0;

function openCropModal(file) {
  cropObjectUrl = URL.createObjectURL(file);
  cropImage.src = cropObjectUrl;
  cropZoom.value = 100;
  cropZoomValue = 1;
  captionInput.value = '';

  cropImage.onload = () => {
    cropNaturalWidth = cropImage.naturalWidth;
    cropNaturalHeight = cropImage.naturalHeight;

    // Базовий масштаб — щоб коротша сторона фото точно покривала квадрат
    cropBaseScale = CROP_VIEWPORT_SIZE / Math.min(cropNaturalWidth, cropNaturalHeight);

    // Центруємо фото за замовчуванням
    const scaledW = cropNaturalWidth * cropBaseScale;
    const scaledH = cropNaturalHeight * cropBaseScale;
    cropOffsetX = (CROP_VIEWPORT_SIZE - scaledW) / 2;
    cropOffsetY = (CROP_VIEWPORT_SIZE - scaledH) / 2;

    updateCropTransform();
  };

  cropModal.classList.remove('hidden');
}

function updateCropTransform() {
  const scale = cropBaseScale * cropZoomValue;
  cropImage.style.width = `${cropNaturalWidth * scale}px`;
  cropImage.style.height = `${cropNaturalHeight * scale}px`;
  cropImage.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px)`;
  clampCropOffset();
}

function clampCropOffset() {
  const scale = cropBaseScale * cropZoomValue;
  const scaledW = cropNaturalWidth * scale;
  const scaledH = cropNaturalHeight * scale;

  // Не даємо фото "відклеїтись" від країв квадрата
  const minX = CROP_VIEWPORT_SIZE - scaledW;
  const minY = CROP_VIEWPORT_SIZE - scaledH;

  cropOffsetX = Math.min(0, Math.max(minX, cropOffsetX));
  cropOffsetY = Math.min(0, Math.max(minY, cropOffsetY));

  cropImage.style.transform = `translate(${cropOffsetX}px, ${cropOffsetY}px)`;
}

// --- Перетягування (мишкою і пальцем через Pointer Events) ---
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

cropViewport.addEventListener('pointerdown', (e) => {
  isDragging = true;
  cropViewport.classList.add('dragging');
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  dragOriginX = cropOffsetX;
  dragOriginY = cropOffsetY;
  cropViewport.setPointerCapture(e.pointerId);
});

cropViewport.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  cropOffsetX = dragOriginX + dx;
  cropOffsetY = dragOriginY + dy;
  clampCropOffset();
});

function stopDrag() {
  isDragging = false;
  cropViewport.classList.remove('dragging');
}
cropViewport.addEventListener('pointerup', stopDrag);
cropViewport.addEventListener('pointercancel', stopDrag);

// --- Зум повзунком ---
cropZoom.addEventListener('input', () => {
  cropZoomValue = cropZoom.value / 100;
  updateCropTransform();
});

// --- Скасувати кадрування ---
cropCancelBtn.addEventListener('click', () => {
  groupUploadTargetId = null;
  cropModal.classList.add('hidden');
  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl);
    cropObjectUrl = null;
  }
  fileInput.value = '';
});

// --- Підтвердити кадрування і завантажити ---
cropConfirmBtn.addEventListener('click', () => {
  const caption = captionInput.value.trim();
  const scale = cropBaseScale * cropZoomValue;

  // Переводимо видиму область квадрата в координати оригінального фото
  const sx = -cropOffsetX / scale;
  const sy = -cropOffsetY / scale;
  const sSize = CROP_VIEWPORT_SIZE / scale;

  const canvas = document.createElement('canvas');
  canvas.width = CROP_OUTPUT_SIZE;
  canvas.height = CROP_OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cropImage, sx, sy, sSize, sSize, 0, 0, CROP_OUTPUT_SIZE, CROP_OUTPUT_SIZE);

  canvas.toBlob(
    (blob) => {
      cropModal.classList.add('hidden');
      if (cropObjectUrl) {
        URL.revokeObjectURL(cropObjectUrl);
        cropObjectUrl = null;
      }
      captionInput.value = '';
      if (groupUploadTargetId) {
        uploadGroupPost(blob, caption); // фото для групи — без вибору категорії
      } else {
        openCategoryPickModal(blob, caption);
      }
    },
    'image/jpeg',
    0.9
  );
});

// --- Вибір категорії перед завантаженням фото ---
function openCategoryPickModal(blob, caption) {
  pendingUploadBlob = blob;
  pendingUploadCaption = caption;
  categoryPickSearchInput.value = '';
  renderCategoryPanel(categoryPickPanel, {
    onSelect: (categoryId) => {
      categoryPickModal.classList.add('hidden');
      uploadPhotoBlob(pendingUploadBlob, pendingUploadCaption, categoryId);
      pendingUploadBlob = null;
      pendingUploadCaption = '';
    }
  });
  categoryPickModal.classList.remove('hidden');
}

categoryPickSearchInput.addEventListener('input', () => {
  renderCategoryPanel(categoryPickPanel, {
    query: categoryPickSearchInput.value,
    onSelect: (categoryId) => {
      categoryPickModal.classList.add('hidden');
      uploadPhotoBlob(pendingUploadBlob, pendingUploadCaption, categoryId);
      pendingUploadBlob = null;
      pendingUploadCaption = '';
    }
  });
});

categoryPickCancelBtn.addEventListener('click', () => {
  categoryPickModal.classList.add('hidden');
  pendingUploadBlob = null;
  pendingUploadCaption = '';
  fileInput.value = '';
});

async function uploadPhotoBlob(blob, caption, category) {
  const formData = new FormData();
  formData.append('photo', blob, 'photo.jpg');
  formData.append('nickname', getNick() || t('default_nick'));
  formData.append('caption', caption || '');
  formData.append('category', category || 'none_general');

  uploadBtn.disabled = true;
  uploadBtn.textContent = t('uploading_text');

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert(t('upload_success'));
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('upload_fail'));
    console.error(e);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = t('upload_btn');
    fileInput.value = '';
  }
}

// --- Отримати рандомне фото з сервера (опційно — з конкретної категорії) ---
randomBtn.addEventListener('click', () => loadRandomPhoto());

async function loadRandomPhoto(categoryId) {
  try {
    const nick = getNick() || '';
    let url = `/api/random?nickname=${encodeURIComponent(nick)}`;
    if (categoryId) {
      url += `&category=${encodeURIComponent(categoryId)}`;
    }
    const res = await fetch(url);
    const data = await res.json();

    if (!data.photo) {
      const label = categoryId ? categoryLabelById(categoryId) : null;
      photoArea.innerHTML = label
        ? `<p class="placeholder">${t('no_photos_in_category', { label })}</p>`
        : `<p class="placeholder">${t('no_photos_at_all')}</p>`;
      photoInfo.innerHTML = '';
      photoCaption.classList.add('hidden');
      currentPhoto = null;
      return;
    }

    displayPhoto(data.photo);
  } catch (e) {
    alert(t('fetch_random_fail'));
    console.error(e);
  }
}

// --- Показати конкретне фото (з рандомної кнопки або з кліку в сітці профілю) ---
function displayPhoto(photo) {
  currentPhoto = photo;
  photoArea.innerHTML = `<img src="/uploads/${photo.filename}" alt="${t('photo_by_alt', { author: photo.author })}">`;

  renderPhotoInfo();

  commentsSection.classList.add('hidden');
  renderComments();

  photoArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function openPhotoById(photoId) {
  try {
    const nick = getNick() || '';
    const res = await fetch(`/api/photo/${encodeURIComponent(photoId)}?nickname=${encodeURIComponent(nick)}`);
    const data = await res.json();
    if (!data.photo) {
      alert(t('photo_unavailable'));
      return;
    }
    profileModal.classList.add('hidden');
    displayPhoto(data.photo);
  } catch (e) {
    alert(t('open_photo_fail'));
    console.error(e);
  }
}

function renderPhotoInfo() {
  if (!currentPhoto) return;
  const alreadyLiked = currentPhoto.likedByMe;
  const commentsCount = (currentPhoto.comments || []).length;
  const avatarHtml = avatarHtmlFor(currentPhoto.author, currentPhoto.authorAvatar, 'mini-avatar', 'mini-avatar-fallback');

  if (currentPhoto.caption) {
    photoCaption.textContent = currentPhoto.caption;
    photoCaption.classList.remove('hidden');
  } else {
    photoCaption.textContent = '';
    photoCaption.classList.add('hidden');
  }

  const categoryLabel = categoryLabelById(currentPhoto.category);

  photoInfo.innerHTML = `
    <p class="author author-with-avatar">
      ${avatarHtml}
      <span class="author-text">${t('author_label')} <span class="author-link" id="authorLink">${currentPhoto.author}</span></span>
    </p>
    ${categoryLabel && currentPhoto.category !== 'none_general' ? `<span class="photo-category-badge">🗂️ ${categoryLabel}</span>` : ''}
    <div class="action-row">
      <button id="likeBtn" class="btn-like" ${alreadyLiked ? 'disabled' : ''}>
        ${alreadyLiked ? t('already_liked_label') : '❤️'} ${currentPhoto.likes}
      </button>
      <button id="commentToggleBtn" class="btn-comment-toggle">💬 ${commentsCount}</button>
    </div>
  `;
  document.getElementById('likeBtn').addEventListener('click', likeCurrentPhoto);
  document.getElementById('commentToggleBtn').addEventListener('click', toggleComments);
  document.getElementById('authorLink').addEventListener('click', () => openProfile(currentPhoto.author));
}

// --- Коментарі ---
function toggleComments() {
  commentsSection.classList.toggle('hidden');
}

function renderComments() {
  if (!currentPhoto) return;
  const comments = currentPhoto.comments || [];

  const toggleBtn = document.getElementById('commentToggleBtn');
  if (toggleBtn) toggleBtn.textContent = `💬 ${comments.length}`;

  if (comments.length === 0) {
    commentsList.innerHTML = `<p class="comment-empty">${t('comments_none_yet')}</p>`;
    return;
  }

  commentsList.innerHTML = comments
    .map((c, i) => {
      const avatarHtml = avatarHtmlFor(c.author, c.authorAvatar, 'mini-avatar', 'mini-avatar-fallback');
      return `
        <div class="comment-item">
          <div class="author-with-avatar" style="justify-content: flex-start;">
            ${avatarHtml}
            <span class="comment-author comment-author-link" data-idx="${i}">${c.author}:</span>${c.text}
          </div>
        </div>
      `;
    })
    .join('');

  commentsList.querySelectorAll('.comment-author-link').forEach(el => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.idx);
      openProfile(comments[idx].author);
    });
  });

  commentsList.scrollTop = commentsList.scrollHeight;
}

sendCommentBtn.addEventListener('click', sendComment);
commentInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendComment();
});

async function sendComment() {
  if (!currentPhoto) return;
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }
  const text = commentInput.value.trim();
  if (!text) return;

  sendCommentBtn.disabled = true;

  try {
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentPhoto.id, nickname: nick, text })
    });
    const data = await res.json();

    if (data.success) {
      commentInput.value = '';
      if (!currentPhoto.comments) currentPhoto.comments = [];
      const alreadyExists = currentPhoto.comments.some(c => c.id === data.comment.id);
      if (!alreadyExists) {
        currentPhoto.comments.push(data.comment);
      }
      renderComments();
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    console.error(t('send_comment_fail_console'), e);
  } finally {
    sendCommentBtn.disabled = false;
  }
}

// --- Лайкнути поточне фото (один нік = один лайк на фото) ---
async function likeCurrentPhoto() {
  if (!currentPhoto) return;
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }

  const likeBtn = document.getElementById('likeBtn');
  likeBtn.disabled = true;

  try {
    const res = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentPhoto.id, nickname: nick })
    });
    const data = await res.json();

    if (res.status === 409) {
      // вже лайкав раніше
      likeBtn.textContent = `${t('already_liked_label')} ${data.likes}`;
      currentPhoto.likedByMe = true;
      return;
    }

    if (data.success) {
      likeBtn.textContent = `${t('already_liked_label')} ${data.likes}`;
      currentPhoto.likes = data.likes;
      currentPhoto.likedByMe = true;
    } else {
      likeBtn.disabled = false;
    }
  } catch (e) {
    console.error(t('like_fail_console'), e);
    likeBtn.disabled = false;
  }
}

// --- Редагування власного фото (опис + категорія) через "⋮" в профілі ---
async function openEditPhotoModal(photoId) {
  const nick = getNick();
  if (!nick) return;

  try {
    const res = await fetch(`/api/photo/${encodeURIComponent(photoId)}?nickname=${encodeURIComponent(nick)}`);
    const data = await res.json();
    if (!data.photo) {
      alert(t('photo_unavailable'));
      return;
    }

    editingPhotoId = photoId;
    editingSelectedCategory = data.photo.category || 'none_general';
    editCaptionInput.value = data.photo.caption || '';
    editCategorySearchInput.value = '';
    renderEditCategoryPanel();

    editPhotoModal.classList.remove('hidden');
  } catch (e) {
    alert(t('edit_open_fail'));
    console.error(e);
  }
}

function renderEditCategoryPanel() {
  renderCategoryPanel(editCategoryPanel, {
    query: editCategorySearchInput.value,
    selectedId: editingSelectedCategory,
    onSelect: (categoryId) => {
      editingSelectedCategory = categoryId;
      renderEditCategoryPanel();
    }
  });
}

editCategorySearchInput.addEventListener('input', renderEditCategoryPanel);

editPhotoCancelBtn.addEventListener('click', () => {
  editPhotoModal.classList.add('hidden');
  editingPhotoId = null;
});

editPhotoSaveBtn.addEventListener('click', async () => {
  const nick = getNick();
  if (!nick || !editingPhotoId) return;

  editPhotoSaveBtn.disabled = true;
  editPhotoSaveBtn.textContent = t('edit_saving');

  try {
    const res = await fetch(`/api/photo/${encodeURIComponent(editingPhotoId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: nick,
        caption: editCaptionInput.value.trim(),
        category: editingSelectedCategory
      })
    });
    const data = await res.json();

    if (data.success) {
      // Якщо це фото зараз відкрите на екрані — оновлюємо його на льоту
      if (currentPhoto && currentPhoto.id === editingPhotoId) {
        currentPhoto = data.photo;
        renderPhotoInfo();
      }
      editPhotoModal.classList.add('hidden');
      editingPhotoId = null;
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('edit_save_fail'));
    console.error(e);
  } finally {
    editPhotoSaveBtn.disabled = false;
    editPhotoSaveBtn.textContent = t('edit_save_btn');
  }
});

// ======================================================================
// === ГРУПИ ===
// ======================================================================
const createGroupBtn = document.getElementById('createGroupBtn');
const groupsList = document.getElementById('groupsList');

const createGroupModal = document.getElementById('createGroupModal');
const createGroupAvatarPicker = document.getElementById('createGroupAvatarPicker');
const createGroupAvatarInput = document.getElementById('createGroupAvatarInput');
const createGroupAvatarPreview = document.getElementById('createGroupAvatarPreview');
const createGroupAvatarPlaceholder = document.getElementById('createGroupAvatarPlaceholder');
const createGroupName = document.getElementById('createGroupName');
const createGroupDesc = document.getElementById('createGroupDesc');
const createGroupCancelBtn = document.getElementById('createGroupCancelBtn');
const createGroupSubmitBtn = document.getElementById('createGroupSubmitBtn');

const groupModal = document.getElementById('groupModal');
const groupContent = document.getElementById('groupContent');
const closeGroupBtn = document.getElementById('closeGroupBtn');

const LANG_LOCALES = { uk: 'uk-UA', ru: 'ru-RU', en: 'en-GB' };

let groupsCache = [];
let groupState = null; // { group, canView, posts } — група, яка зараз відкрита
let openCommentPosts = new Set(); // id постів, під якими розгорнуті коментарі
let groupUploadTargetId = null; // якщо не null — наступне вибране фото піде постом у цю групу
let createGroupAvatarBlob = null;
let createGroupPreviewUrl = null;

// Захист від HTML-коду в назвах, описах, коментарях (вставляємо через innerHTML)
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function groupAvatarHtml(group, imgClass, fallbackClass) {
  if (group.avatar) {
    return `<img class="${imgClass}" src="/uploads/${encodeURIComponent(group.avatar)}" alt="">`;
  }
  const letter = escapeHtml((group.name || '?').trim().charAt(0).toUpperCase() || '?');
  return `<div class="${fallbackClass}">${letter}</div>`;
}

// Стискаємо аватарку групи до квадрата, щоб великі фото з телефону не впирались у ліміт сервера
function squareResizeToBlob(file, size) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - side) / 2;
      const sy = (img.naturalHeight - side) / 2;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvas.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', 0.9);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image load failed'));
    };
    img.src = url;
  });
}

// --- Список популярних груп ---
async function loadGroups() {
  try {
    const res = await fetch(`/api/groups?nickname=${encodeURIComponent(getNick() || '')}`);
    const data = await res.json();
    groupsCache = data.groups || [];
    renderGroupsList();
  } catch (e) {
    groupsList.innerHTML = `<p class="groups-empty">${t('groups_load_fail')}</p>`;
    console.error(e);
  }
}

function renderGroupsList() {
  if (groupsCache.length === 0) {
    groupsList.innerHTML = `<p class="groups-empty">${t('groups_empty')}</p>`;
    return;
  }

  groupsList.innerHTML = groupsCache
    .map(g => `
      <button type="button" class="group-item" data-group-id="${escapeHtml(g.id)}">
        ${groupAvatarHtml(g, 'group-item-avatar', 'group-item-avatar group-avatar-fallback')}
        <span class="group-item-text">
          <span class="group-item-name">${escapeHtml(g.name)}</span>
          <span class="group-item-meta">${t('group_subscribers_count', { count: g.subscribersCount })}${g.isSubscribed ? ' · ' + t('group_subscribed_badge') : ''}</span>
        </span>
      </button>
    `)
    .join('');

  groupsList.querySelectorAll('.group-item').forEach(el => {
    el.addEventListener('click', () => openGroup(el.dataset.groupId));
  });
}

// --- Створення групи ---
createGroupBtn.addEventListener('click', () => {
  if (!getNick()) {
    alert(t('enter_nick_first'));
    return;
  }
  createGroupName.value = '';
  createGroupDesc.value = '';
  createGroupAvatarBlob = null;
  createGroupAvatarInput.value = '';
  if (createGroupPreviewUrl) {
    URL.revokeObjectURL(createGroupPreviewUrl);
    createGroupPreviewUrl = null;
  }
  createGroupAvatarPreview.classList.add('hidden');
  createGroupAvatarPlaceholder.classList.remove('hidden');
  createGroupModal.classList.remove('hidden');
});

createGroupAvatarPicker.addEventListener('click', () => createGroupAvatarInput.click());

createGroupAvatarInput.addEventListener('change', async () => {
  const file = createGroupAvatarInput.files[0];
  if (!file) return;
  try {
    createGroupAvatarBlob = await squareResizeToBlob(file, 400);
    if (createGroupPreviewUrl) URL.revokeObjectURL(createGroupPreviewUrl);
    createGroupPreviewUrl = URL.createObjectURL(createGroupAvatarBlob);
    createGroupAvatarPreview.src = createGroupPreviewUrl;
    createGroupAvatarPreview.classList.remove('hidden');
    createGroupAvatarPlaceholder.classList.add('hidden');
  } catch (e) {
    createGroupAvatarBlob = null;
    console.error(e);
  }
});

createGroupCancelBtn.addEventListener('click', () => {
  createGroupModal.classList.add('hidden');
});

createGroupSubmitBtn.addEventListener('click', async () => {
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }
  const name = createGroupName.value.trim();
  if (name.length < 2) {
    alert(t('group_name_too_short'));
    return;
  }

  const formData = new FormData();
  formData.append('nickname', nick);
  formData.append('name', name);
  formData.append('description', createGroupDesc.value.trim());
  if (createGroupAvatarBlob) formData.append('avatar', createGroupAvatarBlob, 'group.jpg');

  createGroupSubmitBtn.disabled = true;
  createGroupSubmitBtn.textContent = t('create_group_creating');

  try {
    const res = await fetch('/api/groups', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      createGroupModal.classList.add('hidden');
      await loadGroups();
      openGroup(data.group.id);
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    alert(t('create_group_fail'));
    console.error(e);
  } finally {
    createGroupSubmitBtn.disabled = false;
    createGroupSubmitBtn.textContent = t('create_group_submit');
  }
});

// --- Відкрити групу ---
async function fetchGroupState(groupId) {
  const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}?nickname=${encodeURIComponent(getNick() || '')}`);
  if (!res.ok) throw new Error('group not found');
  return res.json();
}

async function openGroup(groupId) {
  try {
    groupState = await fetchGroupState(groupId);
    openCommentPosts = new Set();
    renderGroupView();
    groupModal.classList.remove('hidden');
    groupModal.querySelector('.group-box').scrollTop = 0;
  } catch (e) {
    alert(t('group_load_fail'));
    console.error(e);
    loadGroups();
  }
}

async function refreshGroupView() {
  if (!groupState) return;
  try {
    groupState = await fetchGroupState(groupState.group.id);
    renderGroupView();
  } catch (e) {
    console.error(e);
  }
}

function renderGroupPostHtml(post, group, locale) {
  const id = escapeHtml(post.id);
  const date = new Date(post.createdAt).toLocaleString(locale, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
  const comments = post.comments || [];
  const commentsHtml = comments.length
    ? comments.map(c => `
        <div class="group-comment">
          <span class="group-comment-author" data-author="${escapeHtml(c.author)}">${escapeHtml(c.author)}:</span>${escapeHtml(c.text)}
        </div>`).join('')
    : `<p class="comment-empty">${t('comments_none_yet')}</p>`;

  return `
    <article class="group-post" data-post-id="${id}">
      <img class="group-post-img" src="/uploads/${encodeURIComponent(post.filename)}" alt="${t('photo_alt')}">
      ${post.caption ? `<p class="group-post-caption">${escapeHtml(post.caption)}</p>` : ''}
      <div class="group-post-meta">
        <span>${escapeHtml(date)}</span>
        ${group.isAdmin ? `<button type="button" class="group-post-delete" data-post-id="${id}" title="${t('group_delete_post_title')}">🗑</button>` : ''}
      </div>
      <div class="group-post-actions">
        <button type="button" class="group-like-btn" data-post-id="${id}" ${post.likedByMe ? 'disabled' : ''}>${post.likedByMe ? t('already_liked_label') : '❤️'} ${post.likes}</button>
        <button type="button" class="group-comment-toggle" data-post-id="${id}">💬 ${comments.length}</button>
      </div>
      <div class="group-comments ${openCommentPosts.has(post.id) ? '' : 'hidden'}">
        <div class="group-comments-list">${commentsHtml}</div>
        <div class="group-comment-form">
          <input type="text" maxlength="300" placeholder="${escapeHtml(t('comment_placeholder'))}" data-post-id="${id}">
          <button type="button" class="group-comment-send" data-post-id="${id}">➤</button>
        </div>
      </div>
    </article>`;
}

function renderGroupView() {
  if (!groupState) return;
  const { group, canView, posts } = groupState;
  const locale = LANG_LOCALES[currentLang] || 'uk-UA';
  const box = groupModal.querySelector('.group-box');
  const scrollTop = box.scrollTop;

  let actionsHtml;
  if (group.isAdmin) {
    actionsHtml = `
      <button type="button" class="group-action-btn group-action-primary" id="groupAddPostBtn">${t('group_add_post_btn')}</button>
      <button type="button" class="group-action-btn group-action-danger" id="groupDeleteBtn">${t('group_delete_btn')}</button>`;
  } else if (group.isSubscribed) {
    actionsHtml = `<button type="button" class="group-action-btn group-action-secondary" id="groupSubBtn" data-action="unsubscribe">${t('group_unsubscribe_btn')}</button>`;
  } else {
    actionsHtml = `<button type="button" class="group-action-btn group-action-primary" id="groupSubBtn" data-action="subscribe">${t('group_subscribe_btn')}</button>`;
  }

  let bodyHtml;
  if (!canView) {
    bodyHtml = `<p class="group-locked">${t('group_locked')}</p>`;
  } else if (posts.length === 0) {
    bodyHtml = `<p class="group-empty">${t('group_no_posts')}</p>`;
  } else {
    bodyHtml = posts.map(p => renderGroupPostHtml(p, group, locale)).join('');
  }

  groupContent.innerHTML = `
    <div class="group-header">
      ${groupAvatarHtml(group, 'group-header-avatar', 'group-header-avatar group-avatar-fallback')}
      <div class="group-header-text">
        <h2 class="group-title">${escapeHtml(group.name)}</h2>
        <p class="group-meta">${t('group_subscribers_count', { count: group.subscribersCount })} · ${t('group_posts_count', { count: group.postsCount })}</p>
        <p class="group-admin-line">${t('group_admin_label')} <span class="group-admin-link" data-author="${escapeHtml(group.admin)}">${escapeHtml(group.admin)}</span></p>
      </div>
    </div>
    ${group.description ? `<p class="group-description">${escapeHtml(group.description)}</p>` : ''}
    <div class="group-actions">${actionsHtml}</div>
    <div class="group-posts">${bodyHtml}</div>
  `;

  box.scrollTop = scrollTop;
}

closeGroupBtn.addEventListener('click', () => {
  groupModal.classList.add('hidden');
  groupState = null;
  groupUploadTargetId = null;
  loadGroups();
});

// --- Усі кліки всередині вікна групи (делегування, бо вміст перемальовується) ---
groupContent.addEventListener('click', async (e) => {
  if (!groupState) return;
  const group = groupState.group;
  const nick = getNick();

  const authorEl = e.target.closest('.group-admin-link, .group-comment-author');
  if (authorEl) {
    groupModal.classList.add('hidden');
    openProfile(authorEl.dataset.author);
    return;
  }

  const btn = e.target.closest('button');
  if (!btn) return;

  // Підписка / відписка
  if (btn.id === 'groupSubBtn') {
    if (!nick) { alert(t('enter_nick_first')); return; }
    btn.disabled = true;
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(group.id)}/${btn.dataset.action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nick })
      });
      const data = await res.json();
      if (!data.success) alert(t('error_prefix') + (data.error || t('unknown_error')));
      await refreshGroupView();
      loadGroups();
    } catch (err) {
      alert(t('group_action_fail'));
      console.error(err);
      btn.disabled = false;
    }
    return;
  }

  // Адмін: додати пост (далі вибір фото → кадрування → публікація)
  if (btn.id === 'groupAddPostBtn') {
    groupUploadTargetId = group.id;
    fileInput.click();
    return;
  }

  // Адмін: видалити групу
  if (btn.id === 'groupDeleteBtn') {
    if (!confirm(t('group_confirm_delete'))) return;
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(group.id)}?nickname=${encodeURIComponent(nick || '')}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        groupModal.classList.add('hidden');
        groupState = null;
        loadGroups();
      } else {
        alert(t('error_prefix') + (data.error || t('unknown_error')));
      }
    } catch (err) {
      alert(t('group_action_fail'));
      console.error(err);
    }
    return;
  }

  const postId = btn.dataset.postId;
  if (!postId) return;
  const post = groupState.posts.find(p => p.id === postId);
  if (!post) return;

  // Адмін: видалити пост
  if (btn.classList.contains('group-post-delete')) {
    if (!confirm(t('group_confirm_delete_post'))) return;
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(group.id)}/posts/${encodeURIComponent(postId)}?nickname=${encodeURIComponent(nick || '')}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await refreshGroupView();
        loadGroups();
      } else {
        alert(t('error_prefix') + (data.error || t('unknown_error')));
      }
    } catch (err) {
      alert(t('group_action_fail'));
      console.error(err);
    }
    return;
  }

  // Лайк
  if (btn.classList.contains('group-like-btn')) {
    if (!nick) { alert(t('enter_nick_first')); return; }
    btn.disabled = true;
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(group.id)}/posts/${encodeURIComponent(postId)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nick })
      });
      const data = await res.json();
      if (data.success || res.status === 409) {
        post.likes = data.likes;
        post.likedByMe = true;
        btn.textContent = `${t('already_liked_label')} ${post.likes}`;
      } else {
        alert(t('error_prefix') + (data.error || t('unknown_error')));
        btn.disabled = false;
      }
    } catch (err) {
      console.error(t('like_fail_console'), err);
      btn.disabled = false;
    }
    return;
  }

  // Показати / сховати коментарі
  if (btn.classList.contains('group-comment-toggle')) {
    const section = btn.closest('.group-post').querySelector('.group-comments');
    section.classList.toggle('hidden');
    if (section.classList.contains('hidden')) openCommentPosts.delete(postId);
    else openCommentPosts.add(postId);
    return;
  }

  // Надіслати коментар
  if (btn.classList.contains('group-comment-send')) {
    const input = btn.closest('.group-comment-form').querySelector('input');
    sendGroupComment(post, input);
  }
});

groupContent.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !groupState) return;
  const input = e.target.closest('.group-comment-form input');
  if (!input) return;
  const post = groupState.posts.find(p => p.id === input.dataset.postId);
  if (post) sendGroupComment(post, input);
});

async function sendGroupComment(post, inputEl) {
  const nick = getNick();
  if (!nick) {
    alert(t('enter_nick_first'));
    return;
  }
  const text = inputEl.value.trim();
  if (!text || !groupState) return;

  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupState.group.id)}/posts/${encodeURIComponent(post.id)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick, text })
    });
    const data = await res.json();
    if (data.success) {
      if (!post.comments) post.comments = [];
      post.comments.push(data.comment);
      openCommentPosts.add(post.id);
      renderGroupView();
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
    }
  } catch (e) {
    console.error(t('send_comment_fail_console'), e);
  }
}

// --- Публікація поста в групі (викликається після кадрування фото) ---
async function uploadGroupPost(blob, caption) {
  const groupId = groupUploadTargetId;
  groupUploadTargetId = null;
  const nick = getNick();
  if (!groupId || !nick) return;

  const formData = new FormData();
  formData.append('photo', blob, 'post.jpg');
  formData.append('nickname', nick);
  formData.append('caption', caption || '');

  const addBtn = document.getElementById('groupAddPostBtn');
  if (addBtn) {
    addBtn.disabled = true;
    addBtn.textContent = t('uploading_text');
  }

  try {
    const res = await fetch(`/api/groups/${encodeURIComponent(groupId)}/posts`, { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      await refreshGroupView();
      loadGroups();
    } else {
      alert(t('error_prefix') + (data.error || t('unknown_error')));
      renderGroupView();
    }
  } catch (e) {
    alert(t('group_post_fail'));
    console.error(e);
    renderGroupView();
  } finally {
    fileInput.value = '';
  }
}

// --- Ініціалізація ---
applyStaticTranslations();
initTheme();
showNickModalIfNeeded();
loadGroups();
