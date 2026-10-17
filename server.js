const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Якщо в Railway підключено Volume (постійний диск) — використовуємо його,
// щоб фото та data.json НЕ зникали при кожному новому деплої.
// Локально (на твоєму комп'ютері) цієї змінної немає, тож просто працює як і раніше.
const STORAGE_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;

const DATA_FILE = path.join(STORAGE_DIR, 'data.json');
const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- Ініціалізація сховища ---
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ photos: [], users: {} }, null, 2));
}

function readData() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  if (!data.users) data.users = {}; // для сумісності зі старими data.json
  if (!data.groups) data.groups = []; // групи (канали)
  return data;
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAvatar(data, nickname) {
  return (data.users[nickname] && data.users[nickname].avatar) || null;
}

// === Категорії фото ===
// ВАЖЛИВО: цей самий список продубльований в script.js (CATEGORY_GROUPS).
// Якщо змінюєш категорії тут — онови і там, щоб фронтенд і бекенд збігались.
const CATEGORY_GROUPS = [
  {
    id: 'none',
    label: 'Без категорії',
    emoji: '🚫',
    subcategories: [
      { id: 'none_general', label: 'Просто фото без категорії' }
    ]
  },
  {
    id: 'life_sport',
    label: 'Життя і спорт',
    emoji: '🏃',
    subcategories: [
      { id: 'sport_gym', label: 'Тренування / спортзал' },
      { id: 'sport_running', label: 'Біг' },
      { id: 'sport_yoga', label: 'Йога' },
      { id: 'sport_football', label: 'Футбол' },
      { id: 'sport_basketball', label: 'Баскетбол' },
      { id: 'sport_cycling', label: 'Велоспорт' },
      { id: 'sport_swimming', label: 'Плавання' },
      { id: 'sport_martial_arts', label: 'Єдиноборства' },
      { id: 'life_friends', label: 'Друзі' },
      { id: 'life_family', label: "Сім'я" },
      { id: 'life_everyday', label: 'Повсякденне життя' },
      { id: 'life_food', label: 'Їжа' },
      { id: 'life_party', label: 'Вечірки' },
      { id: 'life_travel', label: 'Подорожі' }
    ]
  },
  {
    id: 'nature_vibe',
    label: 'Природа та вайб',
    emoji: '🌅',
    subcategories: [
      { id: 'nature_sunset', label: 'Заходи сонця' },
      { id: 'nature_mountains', label: 'Гори' },
      { id: 'nature_sea', label: 'Море' },
      { id: 'nature_forest', label: 'Ліс' },
      { id: 'nature_sky', label: 'Небо і хмари' },
      { id: 'nature_flowers', label: 'Квіти' },
      { id: 'nature_animals', label: 'Тварини' },
      { id: 'nature_city_night', label: 'Місто вночі' },
      { id: 'nature_architecture', label: 'Архітектура' },
      { id: 'nature_winter', label: 'Зима' },
      { id: 'nature_autumn', label: 'Осінь' },
      { id: 'nature_rain', label: 'Дощ і туман' },
      { id: 'nature_water', label: 'Водоспади і річки' }
    ]
  },
  {
    id: 'hobby',
    label: 'Хобі',
    emoji: '🎨',
    subcategories: [
      { id: 'hobby_drawing', label: 'Малювання' },
      { id: 'hobby_photography', label: 'Фотографія' },
      { id: 'hobby_music', label: 'Музика' },
      { id: 'hobby_guitar', label: 'Гітара' },
      { id: 'hobby_singing', label: 'Спів' },
      { id: 'hobby_dancing', label: 'Танці' },
      { id: 'hobby_reading', label: 'Читання книг' },
      { id: 'hobby_writing', label: 'Письменництво' },
      { id: 'hobby_cooking', label: 'Кулінарія' },
      { id: 'hobby_baking', label: 'Випічка' },
      { id: 'hobby_knitting', label: "В'язання" },
      { id: 'hobby_sewing', label: 'Шиття' },
      { id: 'hobby_gaming', label: 'Відеоігри' },
      { id: 'hobby_boardgames', label: 'Настільні ігри' },
      { id: 'hobby_chess', label: 'Шахи' },
      { id: 'hobby_fishing', label: 'Риболовля' },
      { id: 'hobby_gardening', label: 'Садівництво' },
      { id: 'hobby_collecting', label: 'Колекціонування' },
      { id: 'hobby_modeling', label: 'Моделювання' },
      { id: 'hobby_calligraphy', label: 'Каліграфія' },
      { id: 'hobby_robotics', label: 'Робототехніка' },
      { id: 'hobby_programming', label: 'Програмування' },
      { id: 'hobby_diy', label: 'DIY і майстрування' },
      { id: 'hobby_woodworking', label: 'Робота з деревом' },
      { id: 'hobby_pottery', label: 'Кераміка' },
      { id: 'hobby_origami', label: 'Оригамі' },
      { id: 'hobby_scrapbooking', label: 'Скрапбукінг' },
      { id: 'hobby_cars', label: 'Автомобілі і тюнінг' },
      { id: 'hobby_skating', label: 'Скейтбординг' },
      { id: 'hobby_surfing', label: 'Серфінг' },
      { id: 'hobby_climbing', label: 'Скелелазіння' },
      { id: 'hobby_camping', label: 'Кемпінг' },
      { id: 'hobby_astronomy', label: 'Астрономія' },
      { id: 'hobby_tattoo', label: 'Тату-арт' }
    ]
  }
];

const VALID_CATEGORY_IDS = new Set(
  CATEGORY_GROUPS.flatMap(g => g.subcategories.map(s => s.id))
);

function normalizeCategory(category) {
  return VALID_CATEGORY_IDS.has(category) ? category : 'none_general';
}

// === Піксель Арт: спільне полотно 1000x1000 ===
const PIXEL_GRID_SIZE = 1000;
const PIXEL_FILE = path.join(STORAGE_DIR, 'pixelart.bin');

// Кожен байт = індекс кольору з палітри (0 = білий/фон)
let pixelGrid;
if (fs.existsSync(PIXEL_FILE)) {
  pixelGrid = fs.readFileSync(PIXEL_FILE);
  if (pixelGrid.length !== PIXEL_GRID_SIZE * PIXEL_GRID_SIZE) {
    // Файл пошкоджений або старого розміру — створюємо новий чистий
    pixelGrid = Buffer.alloc(PIXEL_GRID_SIZE * PIXEL_GRID_SIZE, 0);
    fs.writeFileSync(PIXEL_FILE, pixelGrid);
  }
} else {
  pixelGrid = Buffer.alloc(PIXEL_GRID_SIZE * PIXEL_GRID_SIZE, 0);
  fs.writeFileSync(PIXEL_FILE, pixelGrid);
}

let pixelGridDirty = false;
// Зберігаємо на диск не після кожного пікселя (це було б занадто повільно
// при активному малюванні), а раз в кілька секунд, якщо щось змінилось
setInterval(() => {
  if (pixelGridDirty) {
    pixelGridDirty = false;
    fs.writeFile(PIXEL_FILE, pixelGrid, (err) => {
      if (err) console.error('Не вдалося зберегти піксель-арт:', err);
    });
  }
}, 3000);

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

// --- Налаштування завантаження файлів ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // максимум 10 МБ на фото
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Можна завантажувати тільки зображення'));
    }
    cb(null, true);
  }
});

// Окреме сховище для аватарок (той самий диск, інший префікс назви файлу)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + unique + ext);
  }
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // максимум 5 МБ на аватарку
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Можна завантажувати тільки зображення'));
    }
    cb(null, true);
  }
});

// --- Socket.IO: кожен клієнт при вході "реєструється" під своїм ніком, ---
// --- щоб ми могли надіслати саме йому оновлення його total likes ---
const PIXELART_ROOM = 'pixelart';

function broadcastPixelArtOnlineCount() {
  const room = io.sockets.adapter.rooms.get(PIXELART_ROOM);
  const count = room ? room.size : 0;
  io.to(PIXELART_ROOM).emit('pixelArtOnlineCount', { count });
}

io.on('connection', (socket) => {
  socket.on('register', (nickname) => {
    if (nickname) {
      socket.join(nickname);
    }
  });

  socket.on('joinPixelArt', () => {
    socket.join(PIXELART_ROOM);
    broadcastPixelArtOnlineCount();
  });

  socket.on('leavePixelArt', () => {
    socket.leave(PIXELART_ROOM);
    broadcastPixelArtOnlineCount();
  });

  socket.on('disconnect', () => {
    broadcastPixelArtOnlineCount();
  });
});

app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// --- API: отримати всю сітку піксель-арту (бінарно, максимально швидко) ---
app.get('/api/pixelart/grid', (req, res) => {
  res.set('Content-Type', 'application/octet-stream');
  res.send(pixelGrid);
});

// --- API: поставити один піксель ---
app.post('/api/pixelart/pixel', (req, res) => {
  const { x, y, colorIndex } = req.body;

  if (
    !Number.isInteger(x) || !Number.isInteger(y) ||
    x < 0 || x >= PIXEL_GRID_SIZE || y < 0 || y >= PIXEL_GRID_SIZE
  ) {
    return res.status(400).json({ error: 'Координати поза межами полотна' });
  }
  if (!Number.isInteger(colorIndex) || colorIndex < 0 || colorIndex > 63) {
    return res.status(400).json({ error: 'Невірний колір' });
  }

  const index = y * PIXEL_GRID_SIZE + x;
  pixelGrid[index] = colorIndex;
  pixelGridDirty = true;

  io.to(PIXELART_ROOM).emit('pixelUpdate', { x, y, colorIndex });

  res.json({ success: true });
});

// --- API: список усіх категорій ---
app.get('/api/categories', (req, res) => {
  res.json({ categories: CATEGORY_GROUPS });
});

// --- API: завантажити фото ---
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    const nickname = (req.body.nickname || 'Анонім').trim().slice(0, 20) || 'Анонім';
    const caption = (req.body.caption || '').trim().slice(0, 200);
    const category = normalizeCategory(req.body.category);
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не отримано' });
    }

    const data = readData();
    const photo = {
      id: Date.now().toString(),
      author: nickname,
      filename: req.file.filename,
      caption,
      category,
      likes: 0,
      likedBy: [], // ніки тих, хто вже лайкнув це фото
      comments: [] // коментарі під фото
    };
    data.photos.push(photo);

    // Реєструємо автора як користувача сайту (для статистики), якщо ще не існує
    if (!data.users[nickname]) data.users[nickname] = { avatar: null, joinedAt: Date.now() };

    writeData(data);

    res.json({ success: true, photo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// --- Формує повний об'єкт фото для відповіді (з аватарками, likedByMe тощо) ---
function buildPhotoResponse(photo, data, nickname) {
  const likedBy = photo.likedBy || [];
  const likedByMe = nickname ? likedBy.includes(nickname) : false;

  return {
    id: photo.id,
    author: photo.author,
    authorAvatar: getAvatar(data, photo.author),
    filename: photo.filename,
    caption: photo.caption || '',
    category: photo.category || 'none_general',
    likes: photo.likes,
    likedByMe,
    comments: (photo.comments || []).map(c => ({
      ...c,
      authorAvatar: getAvatar(data, c.author)
    }))
  };
}

// --- Вибирає випадкове фото зі списку з урахуванням уподобань користувача. ---
// --- Фото з категорій, які нік частіше лайкав, мають більший шанс випасти, ---
// --- але це не жорсткий фільтр — інші категорії теж можуть трапитись. ---
function pickWeightedRandomPhoto(photos, categoryLikes) {
  if (!categoryLikes || Object.keys(categoryLikes).length === 0) {
    return photos[Math.floor(Math.random() * photos.length)];
  }

  const weights = photos.map(p => 1 + (categoryLikes[p.category] || 0) * 3);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (let i = 0; i < photos.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return photos[i];
  }
  return photos[photos.length - 1];
}

// --- API: отримати випадкове фото (опційно відфільтроване за категорією) ---
app.get('/api/random', (req, res) => {
  const data = readData();
  const nickname = req.query.nickname || null;
  const category = req.query.category || null;

  let pool = data.photos;
  if (category) {
    pool = pool.filter(p => p.category === category);
  }

  if (pool.length === 0) {
    return res.json({ photo: null });
  }

  const categoryLikes = nickname && data.users[nickname] ? data.users[nickname].categoryLikes : null;
  const random = pickWeightedRandomPhoto(pool, categoryLikes);

  res.json({ photo: buildPhotoResponse(random, data, nickname) });
});

// --- API: отримати конкретне фото за id (наприклад, клік по фото в профілі) ---
app.get('/api/photo/:id', (req, res) => {
  const data = readData();
  const photo = data.photos.find(p => p.id === req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Фото не знайдено' });
  }
  const nickname = req.query.nickname || null;

  res.json({ photo: buildPhotoResponse(photo, data, nickname) });
});

// --- API: лайкнути фото (одна людина = один лайк на фото) ---
app.post('/api/like', (req, res) => {
  const { id, nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: 'Потрібен нікнейм, щоб лайкнути' });
  }

  const data = readData();
  const photo = data.photos.find(p => p.id === id);
  if (!photo) {
    return res.status(404).json({ error: 'Фото не знайдено' });
  }

  if (!photo.likedBy) photo.likedBy = [];

  if (photo.likedBy.includes(nickname)) {
    return res.status(409).json({ error: 'Ти вже лайкнув це фото', likes: photo.likes });
  }

  photo.likedBy.push(nickname);
  photo.likes += 1;

  // Запам'ятовуємо, яку категорію нік щойно лайкнув — це трохи піднімає
  // шанс частіше побачити фото з цієї категорії в /api/random надалі
  if (!data.users[nickname]) data.users[nickname] = { avatar: null, joinedAt: Date.now() };
  if (!data.users[nickname].categoryLikes) data.users[nickname].categoryLikes = {};
  const likedCategory = photo.category || 'none_general';
  data.users[nickname].categoryLikes[likedCategory] =
    (data.users[nickname].categoryLikes[likedCategory] || 0) + 1;

  writeData(data);

  // Розсилаємо всім, хто зараз дивиться це фото, що лічильник змінився
  io.emit('likeUpdate', { id: photo.id, likes: photo.likes });

  // Розсилаємо автору фото оновлену суму його лайків (в реальному часі)
  const authorTotal = data.photos
    .filter(p => p.author === photo.author)
    .reduce((sum, p) => sum + p.likes, 0);
  io.to(photo.author).emit('totalLikesUpdate', { total: authorTotal });

  res.json({ success: true, likes: photo.likes });
});

// --- API: додати коментар до фото ---
app.post('/api/comment', (req, res) => {
  const { id, nickname, text } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: 'Потрібен нікнейм, щоб коментувати' });
  }
  const trimmedText = (text || '').trim();
  if (!trimmedText) {
    return res.status(400).json({ error: 'Коментар не може бути порожнім' });
  }
  if (trimmedText.length > 300) {
    return res.status(400).json({ error: 'Коментар занадто довгий (максимум 300 символів)' });
  }

  const data = readData();
  const photo = data.photos.find(p => p.id === id);
  if (!photo) {
    return res.status(404).json({ error: 'Фото не знайдено' });
  }

  if (!photo.comments) photo.comments = [];

  const comment = {
    id: Date.now().toString() + '-' + Math.round(Math.random() * 1e6),
    author: nickname.trim().slice(0, 20),
    text: trimmedText,
    createdAt: Date.now()
  };
  photo.comments.push(comment);
  writeData(data);

  const commentWithAvatar = { ...comment, authorAvatar: getAvatar(data, comment.author) };

  // Розсилаємо всім, хто зараз дивиться це фото, новий коментар в реальному часі
  io.emit('commentUpdate', { photoId: photo.id, comment: commentWithAvatar });

  // Сповіщаємо автора фото, що під його фото залишили коментар (для нотифікацій)
  if (photo.author !== nickname) {
    io.to(photo.author).emit('newCommentOnMyPhoto', {
      photoId: photo.id,
      photoFilename: photo.filename,
      commentAuthor: comment.author,
      text: comment.text,
      createdAt: comment.createdAt
    });
  }

  res.json({ success: true, comment: commentWithAvatar });
});

// --- API: перейменувати нікнейм і перенести всі його фото/лайки/коментарі на новий нік ---
app.post('/api/renameUser', (req, res) => {
  const { oldNickname, newNickname } = req.body;

  const oldNick = (oldNickname || '').trim();
  const newNick = (newNickname || '').trim().slice(0, 20);

  if (!oldNick || !newNick) {
    return res.status(400).json({ error: 'Потрібні і старий, і новий нікнейм' });
  }
  if (oldNick === newNick) {
    return res.json({ success: true, total: null });
  }

  const data = readData();

  data.photos.forEach(photo => {
    // Автор фото
    if (photo.author === oldNick) {
      photo.author = newNick;
    }
    // Лайки
    if (photo.likedBy && photo.likedBy.includes(oldNick)) {
      photo.likedBy = photo.likedBy.map(n => (n === oldNick ? newNick : n));
    }
    // Коментарі
    if (photo.comments) {
      photo.comments.forEach(c => {
        if (c.author === oldNick) c.author = newNick;
      });
    }
  });

  // Групи: адмін, підписники, лайки й коментарі під постами
  data.groups.forEach(group => {
    if (group.admin === oldNick) group.admin = newNick;
    group.subscribers = (group.subscribers || []).map(n => (n === oldNick ? newNick : n));
    (group.posts || []).forEach(post => {
      post.likedBy = (post.likedBy || []).map(n => (n === oldNick ? newNick : n));
      (post.comments || []).forEach(c => {
        if (c.author === oldNick) c.author = newNick;
      });
    });
  });

  // Переносимо аватарку на новий нік
  if (data.users[oldNick]) {
    data.users[newNick] = data.users[oldNick];
    delete data.users[oldNick];
  }

  writeData(data);

  const total = data.photos
    .filter(p => p.author === newNick)
    .reduce((sum, p) => sum + p.likes, 0);

  res.json({ success: true, total });
});

// --- API: коментарі, залишені під фото конкретного користувача (нотифікації) ---
app.get('/api/myComments/:nickname', (req, res) => {
  const data = readData();
  const nickname = req.params.nickname;

  const myComments = [];
  data.photos
    .filter(p => p.author === nickname)
    .forEach(photo => {
      (photo.comments || []).forEach(c => {
        myComments.push({
          photoId: photo.id,
          photoFilename: photo.filename,
          commentAuthor: c.author,
          text: c.text,
          createdAt: c.createdAt
        });
      });
    });

  myComments.sort((a, b) => b.createdAt - a.createdAt);

  res.json({ comments: myComments });
});

// --- API: завантажити/змінити аватарку ---
app.post('/api/avatar', uploadAvatar.single('avatar'), (req, res) => {
  try {
    const nickname = (req.body.nickname || '').trim();
    if (!nickname) {
      return res.status(400).json({ error: 'Потрібен нікнейм' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не отримано' });
    }

    const data = readData();
    if (!data.users[nickname]) data.users[nickname] = {};
    data.users[nickname].avatar = req.file.filename;
    writeData(data);

    // Сповіщаємо всіх, хто зараз дивиться коментарі/фото цього ніка, що аватарка змінилась
    io.emit('avatarUpdate', { nickname, avatar: req.file.filename });

    res.json({ success: true, avatar: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// --- API: профіль користувача (аватарка + сітка його фото) ---
app.get('/api/profile/:nickname', (req, res) => {
  const data = readData();
  const nickname = req.params.nickname;

  const myPhotos = data.photos
    .filter(p => p.author === nickname)
    .map(p => ({ id: p.id, filename: p.filename, likes: p.likes }))
    .reverse(); // найновіші спочатку

  res.json({
    nickname,
    avatar: getAvatar(data, nickname),
    photos: myPhotos
  });
});

// --- API: видалити своє фото ---
app.delete('/api/photo/:id', (req, res) => {
  const nickname = (req.query.nickname || req.body.nickname || '').trim();
  if (!nickname) {
    return res.status(400).json({ error: 'Потрібен нікнейм' });
  }

  const data = readData();
  const index = data.photos.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Фото не знайдено' });
  }

  const photo = data.photos[index];
  if (photo.author !== nickname) {
    return res.status(403).json({ error: 'Можна видаляти лише свої фото' });
  }

  // Видаляємо файл з диску
  const filePath = path.join(UPLOADS_DIR, photo.filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Не вдалося видалити файл:', e);
    }
  }

  data.photos.splice(index, 1);
  writeData(data);

  res.json({ success: true });
});

// --- API: редагувати своє фото (опис і/або категорія) ---
app.put('/api/photo/:id', (req, res) => {
  const { nickname, caption, category } = req.body;
  const nick = (nickname || '').trim();
  if (!nick) {
    return res.status(400).json({ error: 'Потрібен нікнейм' });
  }

  const data = readData();
  const photo = data.photos.find(p => p.id === req.params.id);
  if (!photo) {
    return res.status(404).json({ error: 'Фото не знайдено' });
  }
  if (photo.author !== nick) {
    return res.status(403).json({ error: 'Можна редагувати лише свої фото' });
  }

  if (typeof caption === 'string') {
    photo.caption = caption.trim().slice(0, 200);
  }
  if (typeof category === 'string') {
    photo.category = normalizeCategory(category);
  }

  writeData(data);

  res.json({ success: true, photo: buildPhotoResponse(photo, data, nick) });
});

// --- API: зареєструвати нікнейм (щоб рахувався в статистиці, навіть якщо ще нічого не завантажив) ---
app.post('/api/registerUser', (req, res) => {
  const nickname = (req.body.nickname || '').trim().slice(0, 20);
  if (!nickname) {
    return res.status(400).json({ error: 'Потрібен нікнейм' });
  }

  const data = readData();
  if (!data.users[nickname]) {
    data.users[nickname] = { avatar: null, joinedAt: Date.now() };
    writeData(data);
  }

  res.json({ success: true });
});

// --- API: пошук користувачів за ніком (або всі, якщо пошук порожній) ---
app.get('/api/users', (req, res) => {
  const data = readData();
  const search = (req.query.search || '').trim().toLowerCase();

  let nicknames = Object.keys(data.users);
  if (search) {
    nicknames = nicknames.filter(n => n.toLowerCase().includes(search));
  }

  const results = nicknames
    .map(n => ({
      nickname: n,
      avatar: getAvatar(data, n),
      photosCount: data.photos.filter(p => p.author === n).length
    }))
    .sort((a, b) => a.nickname.localeCompare(b.nickname));

  res.json({ users: results });
});

// --- API: особиста статистика конкретного користувача ---
app.get('/api/myStats/:nickname', (req, res) => {
  const data = readData();
  const nickname = req.params.nickname;

  const myPhotos = data.photos.filter(p => p.author === nickname);
  const totalPhotos = myPhotos.length;
  const totalLikes = myPhotos.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = myPhotos.reduce((sum, p) => sum + (p.comments || []).length, 0);

  res.json({ totalPhotos, totalLikes, totalComments });
});

// --- API: загальна статистика сайту ---
app.get('/api/stats', (req, res) => {
  const data = readData();

  const totalPhotos = data.photos.length;
  let totalComments = 0;
  let totalLikes = 0;
  const likesByAuthor = {};

  data.photos.forEach(photo => {
    totalComments += (photo.comments || []).length;
    totalLikes += photo.likes;
    likesByAuthor[photo.author] = (likesByAuthor[photo.author] || 0) + photo.likes;
  });

  let topUser = null;
  let topUserLikes = 0;
  Object.entries(likesByAuthor).forEach(([author, likes]) => {
    if (likes > topUserLikes) {
      topUserLikes = likes;
      topUser = author;
    }
  });

  res.json({
    totalPhotos,
    totalComments,
    totalLikes,
    totalUsers: Object.keys(data.users).length,
    topUser,
    topUserLikes,
    topUserAvatar: topUser ? getAvatar(data, topUser) : null
  });
});

// --- API: загальна кількість лайків для конкретного ніка ---
app.get('/api/totalLikes/:nickname', (req, res) => {
  const data = readData();
  const total = data.photos
    .filter(p => p.author === req.params.nickname)
    .reduce((sum, p) => sum + p.likes, 0);
  res.json({ total });
});

// ======================================================================
// === ГРУПИ (канали): адмін постить, підписники бачать, лайкають, коментують ===
// ======================================================================

function canAccessGroup(group, nickname) {
  return !!nickname && (group.admin === nickname || (group.subscribers || []).includes(nickname));
}

function buildGroupSummary(group, data, nickname) {
  return {
    id: group.id,
    name: group.name,
    description: group.description || '',
    avatar: group.avatar || null,
    admin: group.admin,
    adminAvatar: getAvatar(data, group.admin),
    subscribersCount: (group.subscribers || []).length,
    postsCount: (group.posts || []).length,
    isAdmin: !!nickname && group.admin === nickname,
    isSubscribed: canAccessGroup(group, nickname)
  };
}

function buildGroupPost(post, data, nickname) {
  const likedBy = post.likedBy || [];
  return {
    id: post.id,
    filename: post.filename,
    caption: post.caption || '',
    createdAt: post.createdAt,
    likes: post.likes || 0,
    likedByMe: nickname ? likedBy.includes(nickname) : false,
    comments: (post.comments || []).map(c => ({
      ...c,
      authorAvatar: getAvatar(data, c.author)
    }))
  };
}

function removeUploadedFile(filename) {
  if (!filename) return;
  const filePath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (e) { console.error('Не вдалося видалити файл:', e); }
  }
}

// --- API: список груп (найпопулярніші — за кількістю підписників — першими) ---
app.get('/api/groups', (req, res) => {
  const data = readData();
  const nickname = (req.query.nickname || '').trim() || null;

  const groups = data.groups
    .map(g => buildGroupSummary(g, data, nickname))
    .sort((a, b) => b.subscribersCount - a.subscribersCount || b.postsCount - a.postsCount);

  res.json({ groups });
});

// --- API: створити групу (назва, опис, аватарка) ---
app.post('/api/groups', uploadAvatar.single('avatar'), (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  const name = (req.body.name || '').trim().slice(0, 40);
  const description = (req.body.description || '').trim().slice(0, 300);

  if (!nickname) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(400).json({ error: 'Потрібен нікнейм' });
  }
  if (name.length < 2) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(400).json({ error: 'Назва групи занадто коротка (мінімум 2 символи)' });
  }

  const data = readData();
  if (!data.users[nickname]) data.users[nickname] = { avatar: null, joinedAt: Date.now() };

  const group = {
    id: Date.now().toString() + '-' + Math.round(Math.random() * 1e6),
    name,
    description,
    avatar: req.file ? req.file.filename : null,
    admin: nickname,
    createdAt: Date.now(),
    subscribers: [nickname], // адмін автоматично підписаний на свою групу
    posts: []
  };
  data.groups.push(group);
  writeData(data);

  res.json({ success: true, group: buildGroupSummary(group, data, nickname) });
});

// --- API: відкрити групу. Пости бачать лише підписники та адмін ---
app.get('/api/groups/:id', (req, res) => {
  const data = readData();
  const nickname = (req.query.nickname || '').trim() || null;
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Групу не знайдено' });
  }

  const canView = canAccessGroup(group, nickname);
  const posts = canView
    ? (group.posts || []).map(p => buildGroupPost(p, data, nickname)).reverse() // найновіші спочатку
    : [];

  res.json({ group: buildGroupSummary(group, data, nickname), canView, posts });
});

// --- API: підписатися на групу ---
app.post('/api/groups/:id/subscribe', (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  if (!nickname) return res.status(400).json({ error: 'Потрібен нікнейм, щоб підписатися' });

  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Групу не знайдено' });

  if (!group.subscribers.includes(nickname)) {
    group.subscribers.push(nickname);
    if (!data.users[nickname]) data.users[nickname] = { avatar: null, joinedAt: Date.now() };
    writeData(data);
  }
  res.json({ success: true, group: buildGroupSummary(group, data, nickname) });
});

// --- API: відписатися від групи (адмін не може відписатись від своєї групи) ---
app.post('/api/groups/:id/unsubscribe', (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  if (!nickname) return res.status(400).json({ error: 'Потрібен нікнейм' });

  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Групу не знайдено' });
  if (group.admin === nickname) {
    return res.status(400).json({ error: 'Адмін не може відписатись від своєї групи' });
  }

  group.subscribers = group.subscribers.filter(n => n !== nickname);
  writeData(data);
  res.json({ success: true, group: buildGroupSummary(group, data, nickname) });
});

// --- API: видалити групу (тільки адмін) разом з усіма постами ---
app.delete('/api/groups/:id', (req, res) => {
  const nickname = (req.query.nickname || '').trim();
  const data = readData();
  const index = data.groups.findIndex(g => g.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Групу не знайдено' });

  const group = data.groups[index];
  if (!nickname || group.admin !== nickname) {
    return res.status(403).json({ error: 'Видалити групу може лише адмін' });
  }

  removeUploadedFile(group.avatar);
  (group.posts || []).forEach(p => removeUploadedFile(p.filename));
  data.groups.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

// --- API: новий пост у групі (тільки адмін) ---
app.post('/api/groups/:id/posts', upload.single('photo'), (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  const caption = (req.body.caption || '').trim().slice(0, 500);

  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(404).json({ error: 'Групу не знайдено' });
  }
  if (!nickname || group.admin !== nickname) {
    if (req.file) removeUploadedFile(req.file.filename);
    return res.status(403).json({ error: 'Постити в групі може лише адмін' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Файл не отримано' });
  }

  const post = {
    id: Date.now().toString() + '-' + Math.round(Math.random() * 1e6),
    filename: req.file.filename,
    caption,
    createdAt: Date.now(),
    likes: 0,
    likedBy: [],
    comments: []
  };
  group.posts.push(post);
  writeData(data);

  res.json({ success: true, post: buildGroupPost(post, data, nickname) });
});

// --- API: видалити пост (тільки адмін групи) ---
app.delete('/api/groups/:id/posts/:postId', (req, res) => {
  const nickname = (req.query.nickname || '').trim();
  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Групу не знайдено' });
  if (!nickname || group.admin !== nickname) {
    return res.status(403).json({ error: 'Видаляти пости може лише адмін' });
  }

  const index = group.posts.findIndex(p => p.id === req.params.postId);
  if (index === -1) return res.status(404).json({ error: 'Пост не знайдено' });

  removeUploadedFile(group.posts[index].filename);
  group.posts.splice(index, 1);
  writeData(data);
  res.json({ success: true });
});

// --- API: лайкнути пост (тільки підписники й адмін) ---
app.post('/api/groups/:id/posts/:postId/like', (req, res) => {
  const nickname = (req.body.nickname || '').trim();
  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Групу не знайдено' });
  if (!canAccessGroup(group, nickname)) {
    return res.status(403).json({ error: 'Підпишись на групу, щоб лайкати пости' });
  }

  const post = group.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Пост не знайдено' });

  if (!post.likedBy) post.likedBy = [];
  if (post.likedBy.includes(nickname)) {
    return res.status(409).json({ error: 'Ти вже лайкнув цей пост', likes: post.likes });
  }
  post.likedBy.push(nickname);
  post.likes = (post.likes || 0) + 1;
  writeData(data);

  res.json({ success: true, likes: post.likes });
});

// --- API: коментар під постом (тільки підписники й адмін) ---
app.post('/api/groups/:id/posts/:postId/comments', (req, res) => {
  const nickname = (req.body.nickname || '').trim().slice(0, 20);
  const text = (req.body.text || '').trim();

  if (!text) return res.status(400).json({ error: 'Коментар не може бути порожнім' });
  if (text.length > 300) {
    return res.status(400).json({ error: 'Коментар занадто довгий (максимум 300 символів)' });
  }

  const data = readData();
  const group = data.groups.find(g => g.id === req.params.id);
  if (!group) return res.status(404).json({ error: 'Групу не знайдено' });
  if (!canAccessGroup(group, nickname)) {
    return res.status(403).json({ error: 'Підпишись на групу, щоб коментувати' });
  }

  const post = group.posts.find(p => p.id === req.params.postId);
  if (!post) return res.status(404).json({ error: 'Пост не знайдено' });

  if (!post.comments) post.comments = [];
  const comment = {
    id: Date.now().toString() + '-' + Math.round(Math.random() * 1e6),
    author: nickname,
    text,
    createdAt: Date.now()
  };
  post.comments.push(comment);
  writeData(data);

  res.json({ success: true, comment: { ...comment, authorAvatar: getAvatar(data, nickname) } });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`✅ Сервер запущено: http://localhost:${PORT}`);
  if (localIp) {
    console.log(`📱 Для телефону в тій самій Wi-Fi мережі: http://${localIp}:${PORT}`);
  }
});
