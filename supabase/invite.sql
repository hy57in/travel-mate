-- Invite tokens for trip sharing
-- Run this in Supabase SQL Editor after schema.sql

create table if not exists trip_invites (
  id text primary key default gen_random_uuid()::text,
  trip_id text references trips(id) on delete cascade not null,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table trip_invites enable row level security;

-- Anyone with the invite link can read it
create policy "Anyone can read invites"
  on trip_invites for select
  using (true);

-- Only trip owner can create invites
create policy "Owner can create invites"
  on trip_invites for insert
  with check (created_by = auth.uid());

-- Allow authenticated users to insert themselves as trip members via invite
create policy "Users can join via invite"
  on trip_members for insert
  with check (
    user_id = auth.uid()
    and trip_id in (select trip_id from trip_invites where id = trip_id or expires_at > now())
  );
