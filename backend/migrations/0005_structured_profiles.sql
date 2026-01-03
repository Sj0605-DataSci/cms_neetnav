-- Structured student profiles + document types catalog
-- Add structured fields to students_profiles
alter table students_profiles add column if not exists name text;
alter table students_profiles add column if not exists father_name text;
alter table students_profiles add column if not exists father_mobile text;
alter table students_profiles add column if not exists mother_name text;
alter table students_profiles add column if not exists mother_mobile text;
alter table students_profiles add column if not exists neet_roll_no text;
alter table students_profiles add column if not exists neet_rank integer;
alter table students_profiles add column if not exists neet_marks text;
alter table students_profiles add column if not exists application_no text;
alter table students_profiles add column if not exists dob date;
alter table students_profiles add column if not exists gender text check (gender in ('male','female','other'));
alter table students_profiles add column if not exists neet_mobile text;
alter table students_profiles add column if not exists whatsapp_no text;
alter table students_profiles add column if not exists email text;
alter table students_profiles add column if not exists permanent_address jsonb default '{}'::jsonb;
alter table students_profiles add column if not exists correspondence_address jsonb default '{}'::jsonb;
alter table students_profiles add column if not exists bms_counselling_opted boolean default false;
alter table students_profiles add column if not exists bhs_counselling_opted boolean default false;
alter table students_profiles add column if not exists max_budget text;
alter table students_profiles add column if not exists minority boolean default false;
alter table students_profiles add column if not exists minority_type text;
alter table students_profiles add column if not exists nri_quota boolean default false;
alter table students_profiles add column if not exists special_quotas text[];
alter table students_profiles add column if not exists domicile_state text;
alter table students_profiles add column if not exists single_child boolean default false;
alter table students_profiles add column if not exists stayed_in_state_since text;
alter table students_profiles add column if not exists tenth_school_details jsonb default '{}'::jsonb;
alter table students_profiles add column if not exists twelfth_school_details jsonb default '{}'::jsonb;
alter table students_profiles add column if not exists neet_category text;

-- Document types catalog
create table if not exists document_types (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    name text not null,
    category text not null default 'base',
    required_conditions jsonb default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Seed document types
insert into document_types (code, name, category, required_conditions) values
('TENTH_CERT', '10th Certificate', 'base', '{"mandatory": true}'),
('ELEVENTH_CERT', '11th Certificate', 'base', '{"mandatory": false}'),
('TWELFTH_CERT', '12th Certificate', 'base', '{"mandatory": true}'),
('CHARACTER_CERT', 'Character Certificate', 'base', '{"mandatory": true}'),
('MIGRATION_CERT', 'Migration Certificate', 'base', '{"mandatory": true}'),
('AADHAR', 'Aadhar Card', 'base', '{"mandatory": true}'),
('PHOTO', 'Photograph', 'base', '{"mandatory": true}'),
('SIGNATURE', 'Signature', 'base', '{"mandatory": true}'),
('NEET_ADMIT', 'NEET Admit Card', 'base', '{"mandatory": true}'),
('NEET_SCORECARD', 'NEET Score Card', 'base', '{"mandatory": true}'),
('CANCELLED_CHEQUE', 'Cancelled Cheque', 'base', '{"mandatory": true}'),
('OBC_STATE_CERT', 'OBC State Certificate', 'category', '{"mandatory": true, "category": "OBC"}'),
('OBC_CENTRAL_CERT', 'OBC Central Certificate', 'category', '{"mandatory": true, "category": "OBC"}'),
('SC_STATE_CERT', 'SC State Certificate', 'category', '{"mandatory": true, "category": ["SC","ST"]}'),
('SC_CENTRAL_CERT', 'SC Central Certificate', 'category', '{"mandatory": false, "category": ["SC","ST"]}'),
('ST_STATE_CERT', 'ST State Certificate', 'category', '{"mandatory": true, "category": "ST"}'),
('ST_CENTRAL_CERT', 'ST Central Certificate', 'category', '{"mandatory": false, "category": "ST"}'),
('INCOME_CERT', 'Income Certificate', 'category', '{"mandatory": true, "category": ["EWS","OBC"]}'),
('MINORITY_CERT', 'Minority Certificate', 'minority', '{"mandatory": true, "minority": true}'),
('EMBASSY_CERT', 'Embassy Certificate', 'nri', '{"mandatory": true, "nri_quota": true}'),
('RELATIONSHIP_AFFIDAVIT', 'Relationship Affidavit', 'nri', '{"mandatory": true, "nri_quota": true}'),
('SPONSORSHIP_AFFIDAVIT', 'Sponsorship Affidavit', 'nri', '{"mandatory": true, "nri_quota": true}'),
('SPONSOR_PASSPORT', 'Sponsor Passport', 'nri', '{"mandatory": true, "nri_quota": true}'),
('SPONSOR_VISA', 'Sponsor Visa', 'nri', '{"mandatory": true, "nri_quota": true}'),
('SPONSOR_OCI', 'Sponsor OCI Card', 'nri', '{"mandatory": false, "nri_quota": true}'),
('GAP_CERT', 'Gap Year Certificate', 'special', '{"mandatory": true, "gap_year": true}'),
('SINGLE_CHILD_CERT', 'Single Child Certificate', 'special', '{"mandatory": true, "single_child": true}'),
('PH_CERT', 'PH Certificate', 'quota', '{"mandatory": true, "special_quotas": ["PH"]}'),
('FF_CERT', 'Freedom Fighter Certificate', 'quota', '{"mandatory": true, "special_quotas": ["FF"]}'),
('DEFENCE_CERT', 'Defence Certificate', 'quota', '{"mandatory": true, "special_quotas": ["DEFENCE"]}'),
('DOMICILE_CERT', 'Domicile Certificate', 'base', '{"mandatory": false}')
on conflict (code) do nothing;

-- Update documents table to use document_type_id
alter table documents add column if not exists document_type_id uuid references document_types(id);
update documents set document_type_id = dt.id
from document_types dt
where documents.document_type = dt.code;

alter table documents drop column if exists document_type;
alter table documents alter column document_type_id set not null;

-- Add unique constraint for student + document_type
alter table documents add constraint documents_owner_document_type_key unique (owner_id, document_type_id);

-- Function to calculate required documents for a student
create or replace function get_required_documents_for_student(student_uuid uuid)
returns table (doc_id uuid, doc_code text, doc_name text, mandatory boolean, category text) as $$
begin
    return query
    with student_profile as (
        select * from students_profiles where user_id = student_uuid
    ),
    base_docs as (
        select id, code, name, category,
               (required_conditions->>'mandatory')::boolean as mandatory
        from document_types
        where category = 'base' or required_conditions->>'mandatory' = 'true'
    ),
    conditional_docs as (
        select id, code, name, category,
               (required_conditions->>'mandatory')::boolean as mandatory
        from document_types dt
        where (
            -- Category-based
            (required_conditions ? 'category' and
             required_conditions->>'category' = (select neet_category from student_profile)) or
            -- Minority
            (required_conditions ? 'minority' and
             (select minority from student_profile)) or
            -- NRI
            (required_conditions ? 'nri_quota' and
             (select nri_quota from student_profile)) or
            -- Gap year
            (required_conditions ? 'gap_year' and
             (select gap_year from student_profile)) or
            -- Single child
            (required_conditions ? 'single_child' and
             (select single_child from student_profile)) or
            -- Special quotas (array contains)
            (required_conditions ? 'special_quotas' and
             exists (select 1 from jsonb_array_elements_text(required_conditions->'special_quotas') as quota
                     where quota = any((select special_quotas from student_profile))))
        )
    )
    select distinct id, code, name, mandatory, category
    from (
        select * from base_docs
        union
        select * from conditional_docs
    ) as all_docs
    order by mandatory desc, name;
end;
$$ language plpgsql;
