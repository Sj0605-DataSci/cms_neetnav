-- Enable UUID helper
create extension if not exists "pgcrypto";

-- Core auth + role table
create table if not exists users (
    id text primary key,
    email text unique not null,
    role text not null check (role in ('student','mentor','admin')),
    password_hash text not null,
    is_active boolean default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Student / mentor profiles
create table if not exists students_profiles (
    user_id text primary key references users(id) on delete cascade,
    personal_info jsonb default '{}'::jsonb,
    academic_info jsonb default '{}'::jsonb,
    mentor_id text references users(id),
    documents_verified boolean default false,
    verified_by text,
    updated_at timestamptz
);

create table if not exists mentors_profiles (
    user_id text primary key references users(id) on delete cascade,
    personal_info jsonb default '{}'::jsonb,
    academic_info jsonb default '{}'::jsonb,
    capacity integer default 0,
    assigned_students integer default 0,
    documents_verified boolean default false,
    verified_by text,
    updated_at timestamptz
);

create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    owner_id text references users(id) on delete cascade,
    owner_role text not null,
    document_type text not null,
    storage_path text not null,
    status text not null default 'submitted',
    verifier_id text references users(id),
    verified_at timestamptz,
    created_at timestamptz not null default now()
);

create table if not exists assignments (
    id uuid primary key default gen_random_uuid(),
    student_id text references users(id),
    mentor_id text references users(id),
    status text not null default 'pending',
    algorithm text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
