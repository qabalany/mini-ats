-- ==========================================
-- MINI-ATS: Mock Data Generator (Customer Company 2)
-- Run this in your Supabase SQL Editor
-- WARNING: This script depends on an existing auth.user
-- ==========================================

-- 1. Use the ID of an existing user as the owner for these records.
-- Replace the UUID below with your actual user ID from the auth.users table.
DO $$
DECLARE
  v_owner_id UUID := '00000000-0000-0000-0000-000000000000'; ----------> ⚠️ REPLACE THIS WITH THE NEW CUSTOMER USER ID ⚠️
  v_job_sales UUID := gen_random_uuid();
  v_job_support UUID := gen_random_uuid();
  v_job_pm UUID := gen_random_uuid();
BEGIN

  -- Verify user exists in profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_owner_id) THEN
    RAISE NOTICE 'Please replace the v_owner_id placeholder with your actual auth.uid()';
    RETURN;
  END IF;

  -- ==========================================
  -- INSERT JOBS (Different from first set)
  -- ==========================================
  
  INSERT INTO public.jobs (id, owner_id, title, department, location, employment_type, description, status)
  VALUES 
    (v_job_sales, v_owner_id, 'Account Executive (Enterprise)', 'Sales', 'Remote (EMEA)', 'full-time', 'Seeking a seasoned AE to close enterprise deals in the European market.', 'open'),
    (v_job_support, v_owner_id, 'Customer Success Specialist', 'Support', 'Austin, TX', 'full-time', 'Looking for an empathetic problem solver to help our users succeed.', 'open'),
    (v_job_pm, v_owner_id, 'Product Manager', 'Product', 'Remote (US)', 'full-time', 'We need an experienced PM to lead our mobile app roadmap.', 'closed');

  RAISE NOTICE 'Inserted 3 jobs for Company 2 (including one closed job)';

  -- ==========================================
  -- INSERT CANDIDATES
  -- ==========================================
  
  -- Sales Roles
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_sales, 'Oliver Bennett', 'oliver.b.sales@example.uk', '+44-7700-900111', 'https://linkedin.com/in/oliverb', 'offer', 5, 'Exceptional closing rate. Hit quota 4 years in a row at previous SaaS co.'),
    (v_owner_id, v_job_sales, 'Sophie Laurent', 'sophie.laurent@example.fr', '+33-6-1234-5678', 'https://linkedin.com/in/slaurent', 'interview', 4, 'Great energy, speaks 3 languages. Moving to panel interview stage.'),
    (v_owner_id, v_job_sales, 'Lars Jensen', 'lars.j@example.dk', '+45-20-123456', NULL, 'screening', 0, 'Solid background, need to schedule a call to discuss compensation expectations.'),
    (v_owner_id, v_job_sales, 'Maria Garcia', 'maria.g.sales@example.es', '+34-600-123456', 'https://linkedin.com/in/mariag', 'applied', 0, 'New inbound applicant from LinkedIn.');

  -- Support Roles
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_support, 'Kevin Matthews', 'kev.matthews@example.com', '+1-555-8888', 'https://linkedin.com/in/kevmatthews', 'hired', 4, 'Vast experience with Zendesk and Intercom. Starts next Monday.'),
    (v_owner_id, v_job_support, 'Rachel Chu', 'rachel.chu@example.com', '+1-555-9999', 'https://linkedin.com/in/rchu', 'interview', 3, 'Good technical knowledge, but communication was slightly nervous during the mock call.'),
    (v_owner_id, v_job_support, 'Hassan Ali', 'hassan.ali@example.com', '+1-555-1111', NULL, 'applied', 0, 'Waiting on resume review from the hiring manager.');

  -- PM Roles (Closed Job)
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_pm, 'Emily Chen', 'emily.c.pm@example.com', '+1-555-3333', 'https://linkedin.com/in/emilycpm', 'rejected', 4, 'Very strong candidate, but we ultimately went with an internal promotion for this role. Keeping in touch for future openings.'),
    (v_owner_id, v_job_pm, 'Daniel Wright', 'dwright.product@example.com', '+1-555-4444', 'https://linkedin.com/in/dwright', 'rejected', 2, 'Lacked the specific mobile app launch experience we required.');

  RAISE NOTICE 'Inserted 9 candidates for Company 2';

END $$;
