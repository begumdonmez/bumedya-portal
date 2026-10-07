-- Galeri video alanı: kamera arkası, çekimler vb.
-- Adminlerin eklediği videolar doğrudan 'approved'; üyelerin önerdikleri 'pending' başlar.
-- Tüm okuma/yazma sunucu tarafında service role ile yapılır (API rotaları + galeri sayfası),
-- bu yüzden RLS açık ve hiçbir politika yok: tarayıcıdan anon/authenticated erişim kapalı.

create table if not exists public.gallery_videos (
    id           uuid primary key default gen_random_uuid(),
    youtube_id   text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
    title        text not null check (char_length(title) between 1 and 120),
    description  text check (char_length(description) <= 500),
    submitted_by uuid not null references auth.users (id) on delete cascade,
    username     text not null,
    status       text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewed_by  uuid references auth.users (id) on delete set null,
    reviewed_at  timestamptz,
    created_at   timestamptz not null default now()
);

create index if not exists gallery_videos_status_created_idx
    on public.gallery_videos (status, created_at desc);

alter table public.gallery_videos enable row level security;
