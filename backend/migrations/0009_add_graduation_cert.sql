-- Add graduation certificate document type for mentors
insert into document_types (code, name, category, required_conditions) values
('GRAD_CERT', 'Graduation Certificate', 'base', '{"mandatory": true}')
on conflict (code) do nothing;
