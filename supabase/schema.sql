-- ========================================================
-- ANJANI INFRA LUXURY HOME INTERIORS - SUPABASE SCHEMA
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BANNERS TABLE (Hero banners, promotional announcements)
create table if not exists public.banners (
    id text primary key default concat('banner-', gen_random_uuid()),
    title text not null,
    subtitle text,
    tag text,
    image_url text not null,
    link_url text default '/contact',
    start_date date,
    end_date date,
    is_active boolean default true,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROJECTS TABLE (Project portfolio, villa/apartment handovers)
create table if not exists public.projects (
    id text primary key default concat('proj-', gen_random_uuid()),
    title text not null,
    category text not null, -- 'Living Room', 'Modular Kitchen', 'Bedroom & Wardrobe', 'Dining & Pooja'
    location text not null, -- e.g. 'Jubilee Hills, Hyderabad'
    image_url text not null,
    budget text, -- e.g. '₹12 - ₹15 Lakhs'
    completion_days text default '40 Days',
    description text,
    is_featured boolean default false,
    display_order integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. OFFERS TABLE (Seasonal & factory-direct discounts)
create table if not exists public.offers (
    id text primary key default concat('offer-', gen_random_uuid()),
    title text not null,
    discount_pct integer not null default 30,
    code text,
    valid_until date,
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CONSULTATION_REQUESTS TABLE (Leads from ConsultationModal & Contact)
create table if not exists public.consultation_requests (
    id uuid primary key default gen_random_uuid(),
    full_name text not null,
    phone text not null,
    email text,
    property_type text, -- '2BHK', '3BHK', '4BHK', 'Villa', 'Commercial'
    property_location text,
    preferred_date date,
    preferred_time text,
    message text,
    status text default 'new', -- 'new', 'contacted', 'site_visit_scheduled', 'quote_shared', 'closed'
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. COST_ESTIMATES TABLE (From InteriorEstimateModal)
create table if not exists public.cost_estimates (
    id uuid primary key default gen_random_uuid(),
    floor_plan text not null, -- '1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa'
    carpet_area text,
    scope_of_work jsonb default '[]'::jsonb, -- ['Modular Kitchen', 'Wardrobes', 'False Ceiling', ...]
    package_type text default 'Signature Modern',
    customer_name text not null,
    customer_phone text not null,
    customer_email text,
    estimated_amount numeric(12, 2),
    status text default 'pending', -- 'pending', 'verified', 'consultant_assigned'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REFERRALS TABLE (From Platinum Membership Program)
create table if not exists public.referrals (
    id uuid primary key default gen_random_uuid(),
    referrer_name text not null,
    referrer_phone text not null,
    friend_name text not null,
    friend_phone text not null,
    property_location text,
    reward_status text default 'submitted', -- 'submitted', 'in_discussion', 'converted', 'reward_paid'
    reward_amount numeric(10, 2) default 25000.00,
    paid_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. MEDIA_LIBRARY TABLE (Metadata for images uploaded through Admin Panel)
create table if not exists public.media_library (
    id uuid primary key default gen_random_uuid(),
    filename text not null,
    file_url text not null,
    file_size bigint,
    mime_type text,
    storage_path text,
    uploaded_by text default 'admin',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Performance Indexes
create index if not exists idx_banners_active on public.banners(is_active, display_order);
create index if not exists idx_projects_category on public.projects(category, is_featured);
create index if not exists idx_offers_active on public.offers(is_active);
create index if not exists idx_consultations_status on public.consultation_requests(status, created_at desc);
create index if not exists idx_estimates_created on public.cost_estimates(created_at desc);
create index if not exists idx_referrals_phone on public.referrals(referrer_phone);

-- Enable Row Level Security (RLS)
alter table public.banners enable row level security;
alter table public.projects enable row level security;
alter table public.offers enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.cost_estimates enable row level security;
alter table public.referrals enable row level security;
alter table public.media_library enable row level security;

-- Public READ Policies (Safe to re-run with DROP POLICY IF EXISTS)
drop policy if exists "Allow public read active banners" on public.banners;
create policy "Allow public read active banners" on public.banners for select using (true);

drop policy if exists "Allow public read projects" on public.projects;
create policy "Allow public read projects" on public.projects for select using (true);

drop policy if exists "Allow public read active offers" on public.offers;
create policy "Allow public read active offers" on public.offers for select using (true);

drop policy if exists "Allow public read media library" on public.media_library;
create policy "Allow public read media library" on public.media_library for select using (true);

-- Public INSERT Policies for website visitor forms
drop policy if exists "Allow public insert consultations" on public.consultation_requests;
create policy "Allow public insert consultations" on public.consultation_requests for insert with check (true);

drop policy if exists "Allow public insert estimates" on public.cost_estimates;
create policy "Allow public insert estimates" on public.cost_estimates for insert with check (true);

drop policy if exists "Allow public insert referrals" on public.referrals;
create policy "Allow public insert referrals" on public.referrals for insert with check (true);

-- Seed initial records
insert into public.banners (id, title, subtitle, tag, image_url, link_url, start_date, end_date, is_active, display_order)
values 
  ('banner-1', 'Bespoke Luxury Home Interiors Across Hyderabad', 'Turnkey 40-Day Delivery • 10-Year Warranty • 100% Customized', 'FACTORY DIRECT', '/contemporary-interior-hyderabad.jpg', '/contact', '2026-01-01', '2026-12-31', true, 1),
  ('banner-2', 'Direct Factory Price Advantage — Save 30%', 'Crafted with precision German CNC Machinery in our 350,000 sq.ft facility', 'LIMITED PERIOD OFFER', '/customized-home-kitchen.jpg', '/design-and-build', '2026-01-01', '2026-12-31', true, 2),
  ('banner-3', 'Grand Showrooms in Banjara Hills, Gachibowli & Kokapet', 'Walk in to experience live modular kitchens, walk-in closets & smart storage', 'EXPERIENCE CENTRES', '/anjani-branch-showroom.jpg', '/contact', '2026-01-01', '2026-12-31', true, 3)
on conflict (id) do nothing;

-- 8. Blogs & Editorial Articles Table
create table if not exists public.blogs (
    id text primary key,
    slug text unique not null,
    title text not null,
    date text,
    formatted_date text,
    excerpt text,
    category text default 'Home Interiors',
    image_url text,
    read_time text default '5 min read',
    author_name text default 'Anjani Infra Editorial Team',
    author_role text default 'Principal Interior Architect',
    author_avatar text,
    intro_paragraphs jsonb default '[]'::jsonb,
    sections jsonb default '[]'::jsonb,
    conclusion text,
    featured boolean default false,
    is_published boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Indexes
create index if not exists idx_blogs_slug on public.blogs(slug);
create index if not exists idx_blogs_featured on public.blogs(featured, created_at desc);
create index if not exists idx_blogs_category on public.blogs(category);

-- Blog RLS Policies
alter table public.blogs enable row level security;

drop policy if exists "Allow public read blogs" on public.blogs;
create policy "Allow public read blogs" on public.blogs for select using (true);

drop policy if exists "Allow admin full access blogs" on public.blogs;
create policy "Allow admin full access blogs" on public.blogs for all using (true) with check (true);

-- 9. Customer Testimonials & Reviews Table (14,000+ Satisfied Customers)
create table if not exists public.testimonials (
    id text primary key,
    name text not null,
    location text default 'Hyderabad',
    text text not null,
    image_url text default '/testimonial-client-3.jpg',
    rating integer default 5,
    is_active boolean default true,
    display_order integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Testimonial Indexes
create index if not exists idx_testimonials_active on public.testimonials(is_active, display_order);

-- Testimonial RLS Policies
alter table public.testimonials enable row level security;

drop policy if exists "Allow public read testimonials" on public.testimonials;
create policy "Allow public read testimonials" on public.testimonials for select using (true);

drop policy if exists "Allow admin full access testimonials" on public.testimonials;
create policy "Allow admin full access testimonials" on public.testimonials for all using (true) with check (true);

-- 10. Homepage Video Showcase Table
create table if not exists public.video_showcase (
    id text primary key,
    title text not null,
    subtitle text,
    badge_text text default 'Plays Directly Here (No New Tabs)',
    video_type text default 'youtube',
    video_url text,
    embed_url text,
    direct_video_url text,
    poster_image text,
    is_active boolean default true,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.video_showcase enable row level security;

drop policy if exists "Allow public read video showcase" on public.video_showcase;
create policy "Allow public read video showcase" on public.video_showcase for select using (true);

drop policy if exists "Allow admin full access video showcase" on public.video_showcase;
create policy "Allow admin full access video showcase" on public.video_showcase for all using (true) with check (true);

-- ----------------------------------------------------
-- 8. ADMIN USERS TABLE (Optional for multi-admin accounts)
-- ----------------------------------------------------
create table if not exists public.admin_users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    password_hash text not null,
    full_name text default 'Administrator',
    role text default 'admin',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

drop policy if exists "Allow service role full access admin_users" on public.admin_users;
create policy "Allow service role full access admin_users" on public.admin_users for all using (true) with check (true);

-- Insert default admin user if not exists
insert into public.admin_users (email, password_hash, full_name, role, is_active)
values ('admin@anjaniinfra.com', 'admin@anjani2026', 'Super Administrator', 'super_admin', true)
on conflict (email) do nothing;

-- ----------------------------------------------------
-- 9. AUDIO TRACKS TABLE (Ambient music, audio reviews & voiceovers)
-- ----------------------------------------------------
create table if not exists public.audio_tracks (
    id text primary key default concat('audio-', gen_random_uuid()),
    title text not null,
    speaker_or_artist text default 'Anjani Infra',
    category text default 'background_music', -- 'background_music', 'client_voice_review', 'podcast', 'walkthrough_guide'
    audio_url text not null,
    duration_seconds integer default 0,
    file_format text default 'mp3', -- 'mp3', 'wav', 'aac', 'ogg'
    is_active boolean default true,
    display_order integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audio_tracks enable row level security;

drop policy if exists "Allow public read active audio tracks" on public.audio_tracks;
create policy "Allow public read active audio tracks" on public.audio_tracks for select using (true);

drop policy if exists "Allow admin full access audio tracks" on public.audio_tracks;
create policy "Allow admin full access audio tracks" on public.audio_tracks for all using (true) with check (true);

-- ----------------------------------------------------
-- 10. VIDEO LIBRARY TABLE (Multi-video collection, reels & tours)
-- ----------------------------------------------------
create table if not exists public.video_library (
    id text primary key default concat('vid-', gen_random_uuid()),
    title text not null,
    description text,
    category text default 'walkthrough', -- 'walkthrough', 'factory_tour', 'client_review', 'shorts_reel'
    video_type text default 'youtube', -- 'youtube', 'direct_mp4', 'vimeo'
    video_url text not null,
    embed_url text,
    direct_video_url text,
    thumbnail_url text,
    duration text,
    is_featured boolean default false,
    is_active boolean default true,
    display_order integer default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.video_library enable row level security;

drop policy if exists "Allow public read video library" on public.video_library;
create policy "Allow public read video library" on public.video_library for select using (true);

drop policy if exists "Allow admin full access video library" on public.video_library;
create policy "Allow admin full access video library" on public.video_library for all using (true) with check (true);

-- Initial seed for video library
insert into public.video_library (id, title, category, video_type, video_url, embed_url, thumbnail_url, is_featured, is_active, display_order)
values (
    'vid-hyderabad-villa',
    'Ultra Luxury Villa Tour in Hyderabad | Hallmark Floresta',
    'walkthrough',
    'youtube',
    'https://www.youtube.com/watch?v=EJJCbEKK5uw',
    'https://www.youtube-nocookie.com/embed/EJJCbEKK5uw?rel=0&modestbranding=1&playsinline=1',
    'https://nsmobuinpjloyiejtjth.supabase.co/storage/v1/object/public/anjani-media/projects/proj1.jpg',
    true,
    true,
    1
)
on conflict (id) do nothing;


