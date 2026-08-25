-- ЕТАП 3-5: друзі, активність, особисті чати.
-- Запусти в Supabase: SQL Editor -> New query -> встав -> Run.

-- 1. Дружба: одна заявка = один рядок. requester_id надіслав запит
-- addressee_id. status: 'pending' поки не прийнято, 'accepted' — друзі.
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

alter table friendships enable row level security;

drop policy if exists "Учасники бачать свою дружбу" on friendships;
create policy "Учасники бачать свою дружбу" on friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "Надіслати заявку в друзі" on friendships;
create policy "Надіслати заявку в друзі" on friendships
  for insert with check (auth.uid() = requester_id);

drop policy if exists "Прийняти заявку в друзі" on friendships;
create policy "Прийняти заявку в друзі" on friendships
  for update using (auth.uid() = addressee_id and status = 'pending')
  with check (status = 'accepted');

drop policy if exists "Скасувати або розірвати дружбу" on friendships;
create policy "Скасувати або розірвати дружбу" on friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 2. Особисті повідомлення — лише між друзями (перевіряється в політиці).
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references profiles(id) on delete cascade,
  receiver_id uuid not null references profiles(id) on delete cascade,
  body text,
  shared_post_id uuid references posts(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table messages enable row level security;

drop policy if exists "Учасники бачать свої повідомлення" on messages;
create policy "Учасники бачать свої повідомлення" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Надсилати повідомлення лише другу" on messages;
create policy "Надсилати повідомлення лише другу" on messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = sender_id and f.addressee_id = receiver_id)
          or (f.requester_id = receiver_id and f.addressee_id = sender_id)
        )
    )
  );

drop policy if exists "Отримувач позначає прочитаним" on messages;
create policy "Отримувач позначає прочитаним" on messages
  for update using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id);

-- 3. Коментарі більше не анонімні — тепер видно, хто саме коментує
-- (потрібно для вкладки "Активність": "хто тобі написав комент").
-- Стовпець user_id вже є з етапу 1, просто прибираємо застарілий
-- author_name/is_anonymous прапорець зі значення "завжди анонімно" в коді.

-- 4. Живі оновлення чату (щоб повідомлення з'являлись без перезавантаження)
alter publication supabase_realtime add table messages;
