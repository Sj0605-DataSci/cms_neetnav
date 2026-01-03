-- UUID migration for users + profile references
create extension if not exists "pgcrypto";

-- add uuid column to users
alter table users add column if not exists new_id uuid;
update users set new_id = gen_random_uuid() where new_id is null;

-- students profiles
alter table students_profiles add column if not exists new_user_id uuid;
update students_profiles sp
set new_user_id = u.new_id
from users u
where sp.user_id = u.id;

alter table students_profiles add column if not exists new_mentor_id uuid;
update students_profiles sp
set new_mentor_id = u.new_id
from users u
where sp.mentor_id = u.id;

alter table students_profiles add column if not exists new_verified_by uuid;
update students_profiles sp
set new_verified_by = u.new_id
from users u
where sp.verified_by = u.id;

-- mentors profiles
alter table mentors_profiles add column if not exists new_user_id uuid;
update mentors_profiles mp
set new_user_id = u.new_id
from users u
where mp.user_id = u.id;

alter table mentors_profiles add column if not exists new_verified_by uuid;
update mentors_profiles mp
set new_verified_by = u.new_id
from users u
where mp.verified_by = u.id;

-- documents
alter table documents add column if not exists new_owner_id uuid;
update documents d
set new_owner_id = u.new_id
from users u
where d.owner_id = u.id;

alter table documents add column if not exists new_verifier_id uuid;
update documents d
set new_verifier_id = u.new_id
from users u
where d.verifier_id = u.id;

-- assignments
alter table assignments add column if not exists new_student_id uuid;
update assignments a
set new_student_id = u.new_id
from users u
where a.student_id = u.id;

alter table assignments add column if not exists new_mentor_id uuid;
update assignments a
set new_mentor_id = u.new_id
from users u
where a.mentor_id = u.id;

-- drop old constraints before replacing columns
alter table students_profiles drop constraint if exists students_profiles_user_id_fkey;
alter table students_profiles drop constraint if exists students_profiles_mentor_id_fkey;

alter table mentors_profiles drop constraint if exists mentors_profiles_user_id_fkey;

alter table documents drop constraint if exists documents_owner_id_fkey;
alter table documents drop constraint if exists documents_verifier_id_fkey;

alter table assignments drop constraint if exists assignments_student_id_fkey;
alter table assignments drop constraint if exists assignments_mentor_id_fkey;

-- replace columns with uuid versions
alter table students_profiles drop column if exists user_id;
alter table students_profiles rename column new_user_id to user_id;
alter table students_profiles alter column user_id set not null;

alter table students_profiles drop column if exists mentor_id;
alter table students_profiles rename column new_mentor_id to mentor_id;

alter table students_profiles drop column if exists verified_by;
alter table students_profiles rename column new_verified_by to verified_by;

alter table mentors_profiles drop column if exists user_id;
alter table mentors_profiles rename column new_user_id to user_id;
alter table mentors_profiles alter column user_id set not null;

alter table mentors_profiles drop column if exists verified_by;
alter table mentors_profiles rename column new_verified_by to verified_by;

alter table documents drop column if exists owner_id;
alter table documents rename column new_owner_id to owner_id;

alter table documents drop column if exists verifier_id;
alter table documents rename column new_verifier_id to verifier_id;

alter table assignments drop column if exists student_id;
alter table assignments rename column new_student_id to student_id;

alter table assignments drop column if exists mentor_id;
alter table assignments rename column new_mentor_id to mentor_id;

-- swap users column
alter table users drop constraint users_pkey;
alter table users drop column if exists id;
alter table users rename column new_id to id;
alter table users alter column id set default gen_random_uuid();
alter table users alter column id set not null;
alter table users add constraint users_pkey primary key (id);

-- re-create foreign keys with uuid types
alter table students_profiles
    add constraint students_profiles_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

alter table students_profiles
    add constraint students_profiles_mentor_id_fkey foreign key (mentor_id) references users (id);

alter table mentors_profiles
    add constraint mentors_profiles_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

alter table documents
    add constraint documents_owner_id_fkey foreign key (owner_id) references users (id) on delete cascade;

alter table documents
    add constraint documents_verifier_id_fkey foreign key (verifier_id) references users (id);

alter table assignments
    add constraint assignments_student_id_fkey foreign key (student_id) references users (id);

alter table assignments
    add constraint assignments_mentor_id_fkey foreign key (mentor_id) references users (id);

-- backfill profiles for existing users based on role
insert into students_profiles (user_id, updated_at)
select id, now()
from users
where role = 'student'
on conflict (user_id) do nothing;

insert into mentors_profiles (user_id, updated_at)
select id, now()
from users
where role = 'mentor'
on conflict (user_id) do nothing;

-- trigger to auto-create profile rows
create or replace function public.create_profile_for_user()
returns trigger as $$
begin
  if NEW.role = 'student' then
    insert into students_profiles (user_id, updated_at)
    values (NEW.id, now())
    on conflict (user_id) do nothing;
  elsif NEW.role = 'mentor' then
    insert into mentors_profiles (user_id, updated_at)
    values (NEW.id, now())
    on conflict (user_id) do nothing;
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_create_profile on users;
create trigger trg_create_profile
after insert on users
for each row execute function public.create_profile_for_user();
