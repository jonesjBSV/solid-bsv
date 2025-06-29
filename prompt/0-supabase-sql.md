-- NextAuth.js schema setup for Supabase
-- Tables created in public schema for Supabase adapter compatibility

-- Note: Using Supabase's built-in auth.uid() function
-- No need to create custom function as Supabase provides this

-- NextAuth.js required tables for Supabase adapter
-- Create users table first (no dependencies)
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text unique,
  "emailVerified" timestamptz,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create verification_tokens table (no dependencies)
create table if not exists public.verification_tokens (
  identifier text,
  token text not null,
  expires timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (identifier, token)
);

-- Create accounts table (references users)
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  "userId" uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create sessions table (references users)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  expires timestamptz not null,
  "sessionToken" text not null unique,
  "userId" uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indices for performance
create index if not exists accounts_provider_provider_account_id_idx on public.accounts (provider, "providerAccountId");
create index if not exists accounts_user_id_idx on public.accounts ("userId");
create index if not exists sessions_user_id_idx on public.sessions ("userId");
create index if not exists sessions_session_token_idx on public.sessions ("sessionToken");

-- Enable RLS on NextAuth tables
alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.users enable row level security;
alter table public.verification_tokens enable row level security;

-- Helper function to safely create policies
create or replace function create_policy_if_not_exists(
  policy_name text,
  table_name text,
  policy_definition text
) returns void as $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = split_part(table_name, '.', 1) 
    and tablename = split_part(table_name, '.', 2) 
    and policyname = policy_name
  ) then
    execute format('create policy %I on %s %s', policy_name, table_name, policy_definition);
  end if;
end;
$$ language plpgsql;

-- Disable RLS for NextAuth tables - service role will access directly
alter table public.accounts disable row level security;
alter table public.sessions disable row level security;
alter table public.users disable row level security;
alter table public.verification_tokens disable row level security;

-- SOLID Pod + BSV Overlay Application Tables

create table if not exists public.pod_resource (
  id integer generated always as identity primary key,
  resource_path text not null,       -- Path/name of resource in user's SOLID pod
  resource_type text not null,       -- e.g. 'note', 'document', 'context', 'file'
  status text not null,              -- e.g. 'private', 'shared', 'notarized', 'public'
  bsv_tx_hash text,                  -- BSV transaction hash if notarized
  overlay_topic text,                -- Overlay topic for discovery (if shared)
  pod_url text not null,             -- Full URL to the resource in user's pod
  content_hash text,                 -- Hash of content for integrity verification
  description text,                  -- Description of the resource
  mime_type text,                    -- MIME type of the resource
  resource_size integer,             -- Size of the resource in bytes
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.pod_resource is 'Tracks resources in user SOLID pods with BSV attestation metadata.';

alter table public.pod_resource enable row level security;

select create_policy_if_not_exists(
  'Select own pod_resource',
  'public.pod_resource',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Insert own pod_resource', 
  'public.pod_resource',
  'for insert with check (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Update own pod_resource',
  'public.pod_resource', 
  'for update using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Delete own pod_resource',
  'public.pod_resource',
  'for delete using (auth.uid() = user_id)'
);

create table if not exists public.identity (
  id integer generated always as identity primary key,
  solid_pod_url text not null,
  did text not null,
  did_document jsonb,                -- The uploaded DID document
  did_bsv_hash text,                 -- BSV transaction hash for DID timestamping
  did_overlay_topic text default 'tm_did', -- Overlay topic for DID discovery
  vc jsonb,                          -- Verifiable credential data
  vc_bsv_hash text,                  -- BSV transaction hash for VC timestamping
  vc_overlay_topic text default 'tm_vc', -- Overlay topic for VC discovery
  connection_status text default 'disconnected', -- 'connected', 'disconnected', 'pending'
  access_token text,                 -- SOLID pod access token (encrypted)
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.identity is 'Stores SOLID pod details, DIDs, VCs with BSV overlay integration.';

alter table public.identity enable row level security;

select create_policy_if_not_exists(
  'Select own identity',
  'public.identity',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Insert own identity',
  'public.identity', 
  'for insert with check (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Update own identity',
  'public.identity',
  'for update using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Delete own identity',
  'public.identity',
  'for delete using (auth.uid() = user_id)'
);

create table if not exists public.bsv_attestation (
  id integer generated always as identity primary key,
  resource_id integer references public.pod_resource(id) on delete cascade,
  identity_id integer references public.identity(id) on delete cascade,
  attestation_type text not null,    -- 'resource', 'did', 'vc'
  tx_hash text not null,             -- BSV transaction hash
  overlay_topic text,                -- Overlay topic used
  content_hash text not null,        -- Hash of attested content
  timestamp_proof jsonb,             -- Full timestamp proof data
  wallet_address text,               -- Application wallet address used
  created_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.bsv_attestation is 'BSV blockchain attestations for pod resources and identity documents.';

alter table public.bsv_attestation enable row level security;

select create_policy_if_not_exists(
  'Select own bsv_attestation',
  'public.bsv_attestation',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Insert own bsv_attestation',
  'public.bsv_attestation',
  'for insert with check (auth.uid() = user_id)'
);

create table if not exists public.context_entry (
  id integer generated always as identity primary key,
  title text not null,               -- Title of the context entry
  content text not null,             -- The text snippet, note or context entry
  content_type text not null default 'text', -- 'text', 'markdown', 'link', 'snippet'
  tags text[] default '{}',          -- Array of tags for categorization
  metadata jsonb,                    -- Additional metadata, privacy flags, etc.
  pod_resource_id integer references public.pod_resource(id) on delete set null,
  bsv_tx_hash text,                  -- BSV transaction hash if notarized
  overlay_topic text,                -- Overlay topic if shared
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.context_entry is 'Second brain context entries, optionally linked to pod resources.';

alter table public.context_entry enable row level security;

select create_policy_if_not_exists(
  'Select own context_entry',
  'public.context_entry',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Insert own context_entry',
  'public.context_entry',
  'for insert with check (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Update own context_entry', 
  'public.context_entry',
  'for update using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Delete own context_entry',
  'public.context_entry',
  'for delete using (auth.uid() = user_id)'
);

create table if not exists public.shared_resource (
  id integer generated always as identity primary key,
  resource_type text not null,       -- 'pod_resource' or 'context_entry'
  resource_id integer not null,      -- ID from pod_resource or context_entry
  
  -- General sharing fields
  shared_with_user_id text,          -- Direct user sharing (user ID)
  shared_with_public boolean default false, -- Public sharing flag
  requires_payment boolean default false,   -- Whether payment is required
  description text,                  -- Description of the shared resource
  access_limit integer,              -- Maximum number of accesses
  expiry_date timestamp with time zone,     -- When sharing expires
  
  -- Payment fields
  price_per_access decimal(10,2),    -- Generic price per access
  price_currency text default 'USD', -- Currency (USD, BSV, SAT)
  price_satoshis integer,            -- Micropayment price in satoshis (for BSV)
  
  -- BSV/Overlay specific fields
  overlay_topic text,                -- Overlay topic for discovery
  access_policy jsonb,               -- SOLID access control policies
  payment_address text,              -- BSV address for payments
  
  -- Stats
  total_access_count integer default 0,
  total_earnings_satoshis integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.shared_resource is 'Shared pod resources and context entries with micropayment pricing.';

alter table public.shared_resource enable row level security;

select create_policy_if_not_exists(
  'Select own shared_resource',
  'public.shared_resource',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Select public shared_resource',
  'public.shared_resource',
  'for select using (is_active = true)'
);

select create_policy_if_not_exists(
  'Insert own shared_resource',
  'public.shared_resource',
  'for insert with check (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Update own shared_resource',
  'public.shared_resource',
  'for update using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Delete own shared_resource',
  'public.shared_resource',
  'for delete using (auth.uid() = user_id)'
);

create table if not exists public.micropayment (
  id integer generated always as identity primary key,
  shared_resource_id integer not null references public.shared_resource(id),
  buyer_user_id uuid not null,
  seller_user_id uuid not null,
  amount_satoshis integer not null,
  tx_hash text not null,             -- BSV transaction hash
  payment_status text not null,      -- 'pending', 'confirmed', 'failed'
  access_granted boolean default false,
  access_expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  confirmed_at timestamp with time zone
);
comment on table public.micropayment is 'BSV micropayments for accessing shared resources.';

alter table public.micropayment enable row level security;

select create_policy_if_not_exists(
  'Select own micropayment',
  'public.micropayment',
  'for select using (auth.uid() = buyer_user_id or auth.uid() = seller_user_id)'
);

select create_policy_if_not_exists(
  'Insert micropayment',
  'public.micropayment',
  'for insert with check (auth.uid() = buyer_user_id)'
);

select create_policy_if_not_exists(
  'Update micropayment',
  'public.micropayment',
  'for update using (auth.uid() = buyer_user_id or auth.uid() = seller_user_id)'
);

create table if not exists public.overlay_sync (
  id integer generated always as identity primary key,
  sync_type text not null,           -- 'did', 'vc', 'resource', 'payment'
  reference_id integer not null,     -- ID from related table
  overlay_topic text not null,
  tx_hash text,                      -- BSV transaction hash
  sync_status text not null,         -- 'pending', 'synced', 'failed'
  sync_data jsonb,                   -- Overlay-specific data
  last_sync_at timestamp with time zone,
  retry_count integer default 0,
  created_at timestamp with time zone default now(),
  user_id uuid not null default auth.uid()
);
comment on table public.overlay_sync is 'Tracks synchronization status with BSV overlay services.';

alter table public.overlay_sync enable row level security;

select create_policy_if_not_exists(
  'Select own overlay_sync',
  'public.overlay_sync',
  'for select using (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Insert own overlay_sync',
  'public.overlay_sync',
  'for insert with check (auth.uid() = user_id)'
);

select create_policy_if_not_exists(
  'Update own overlay_sync',
  'public.overlay_sync',
  'for update using (auth.uid() = user_id)'
);

-- Indexes for performance
create index if not exists idx_pod_resource_user_id on public.pod_resource(user_id);
create index if not exists idx_pod_resource_status on public.pod_resource(status);
create index if not exists idx_pod_resource_overlay_topic on public.pod_resource(overlay_topic);
create index if not exists idx_bsv_attestation_tx_hash on public.bsv_attestation(tx_hash);
create index if not exists idx_shared_resource_overlay_topic on public.shared_resource(overlay_topic);
create index if not exists idx_micropayment_tx_hash on public.micropayment(tx_hash);
create index if not exists idx_overlay_sync_topic on public.overlay_sync(overlay_topic);

-- Clean up helper function
drop function if exists create_policy_if_not_exists(text, text, text);