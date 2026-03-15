-- Travel Mate DB Schema
-- Run this in Supabase SQL Editor

-- Trips table: each row is a full trip with JSON data
create table if not exists trips (
  id text primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null default '',
  emoji text not null default '✈️',
  data jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shared access: who can view/edit a trip
create table if not exists trip_members (
  trip_id text references trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'editor', -- 'owner' | 'editor' | 'viewer'
  created_at timestamptz default now(),
  primary key (trip_id, user_id)
);

-- Row Level Security
alter table trips enable row level security;
alter table trip_members enable row level security;

-- Trips: owner or member can read
create policy "Users can view own trips"
  on trips for select
  using (
    owner_id = auth.uid()
    or id in (select trip_id from trip_members where user_id = auth.uid())
  );

-- Trips: owner or editor can update
create policy "Users can update own trips"
  on trips for update
  using (
    owner_id = auth.uid()
    or id in (select trip_id from trip_members where user_id = auth.uid() and role in ('owner', 'editor'))
  );

-- Trips: authenticated users can insert
create policy "Users can create trips"
  on trips for insert
  with check (owner_id = auth.uid());

-- Trips: only owner can delete
create policy "Only owner can delete trips"
  on trips for delete
  using (owner_id = auth.uid());

-- Trip members: trip owner or member can read
create policy "Members can view trip members"
  on trip_members for select
  using (
    user_id = auth.uid()
    or trip_id in (select id from trips where owner_id = auth.uid())
  );

-- Trip members: only trip owner can manage
create policy "Owner can manage members"
  on trip_members for all
  using (trip_id in (select id from trips where owner_id = auth.uid()));

-- Enable realtime
alter publication supabase_realtime add table trips;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trips_updated_at
  before update on trips
  for each row execute function update_updated_at();
