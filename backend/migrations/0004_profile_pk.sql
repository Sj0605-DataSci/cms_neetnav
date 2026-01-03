-- Normalize students_profiles
alter table if exists students_profiles drop constraint if exists students_profiles_pkey;
alter table if exists students_profiles drop constraint if exists students_profiles_user_id_fkey;
alter table if exists students_profiles drop constraint if exists students_profiles_user_id_key;

alter table students_profiles add column if not exists id uuid;
update students_profiles set id = gen_random_uuid() where id is null;
alter table students_profiles alter column id set default gen_random_uuid();
alter table students_profiles alter column id set not null;
alter table students_profiles add constraint students_profiles_pkey primary key (id);

alter table students_profiles alter column user_id set not null;
alter table students_profiles add constraint students_profiles_user_id_key unique (user_id);
alter table students_profiles add constraint students_profiles_user_id_fkey foreign key (user_id) references users (id) on delete cascade;

alter table if exists students_profiles drop constraint if exists students_profiles_mentor_id_fkey;
alter table students_profiles add constraint students_profiles_mentor_id_fkey foreign key (mentor_id) references users (id);

-- Normalize mentors_profiles
alter table if exists mentors_profiles drop constraint if exists mentors_profiles_pkey;
alter table if exists mentors_profiles drop constraint if exists mentors_profiles_user_id_fkey;
alter table if exists mentors_profiles drop constraint if exists mentors_profiles_user_id_key;

alter table mentors_profiles add column if not exists id uuid;
update mentors_profiles set id = gen_random_uuid() where id is null;
alter table mentors_profiles alter column id set default gen_random_uuid();
alter table mentors_profiles alter column id set not null;
alter table mentors_profiles add constraint mentors_profiles_pkey primary key (id);

alter table mentors_profiles alter column user_id set not null;
alter table mentors_profiles add constraint mentors_profiles_user_id_key unique (user_id);
alter table mentors_profiles add constraint mentors_profiles_user_id_fkey foreign key (user_id) references users (id) on delete cascade;
