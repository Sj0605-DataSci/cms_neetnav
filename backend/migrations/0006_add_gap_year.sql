-- Add gap_year field to students_profiles table
alter table students_profiles add column if not exists gap_year boolean default false;
