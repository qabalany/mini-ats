-- ==========================================
-- MINI-ATS: Mock Data Generator
-- Run this in your Supabase SQL Editor
-- WARNING: This script depends on an existing auth.user
-- ==========================================

-- 1. Use the ID of an existing user as the owner for these records.
-- Replace the UUID below with your actual user ID from the auth.users table.
-- You can find it in the Supabase Dashboard under Authentication -> Users.
DO $$
DECLARE
  v_owner_id UUID := '00000000-0000-0000-0000-000000000000'; ----------> ⚠️ REPLACE THIS WITH YOUR USER ID ⚠️
  v_job_dev UUID := gen_random_uuid();
  v_job_design UUID := gen_random_uuid();
  v_job_marketing UUID := gen_random_uuid();
BEGIN

  -- Verify user exists in profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_owner_id) THEN
    RAISE NOTICE 'Please replace the v_owner_id placeholder with your actual auth.uid()';
    RETURN;
  END IF;

  -- ==========================================
  -- INSERT JOBS
  -- ==========================================
  
  INSERT INTO public.jobs (id, owner_id, title, department, location, employment_type, description, status)
  VALUES 
    (v_job_dev, v_owner_id, 'Senior Full Stack Engineer', 'Engineering', 'Remote (US)', 'full-time', 'Looking for an experienced engineer proficient in React and Node.js to lead our core product team.', 'open'),
    (v_job_design, v_owner_id, 'Product Designer', 'Design', 'New York, NY', 'full-time', 'Seeking a talented product designer with a strong portfolio showcasing user-centric web and mobile apps.', 'open'),
    (v_job_marketing, v_owner_id, 'Growth Marketing Manager', 'Marketing', 'San Francisco, CA', 'full-time', 'We need a data-driven marketer to scale our paid acquisition channels and optimize conversion rates.', 'open');

  RAISE NOTICE 'Inserted 3 jobs';

  -- ==========================================
  -- INSERT CANDIDATES
  -- ==========================================
  
  -- Engineering Roles
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_dev, 'Sarah Jenkins', 'sarah.j@example.com', '+1-555-0192', 'https://linkedin.com/in/sarahjenkins', 'hired', 5, 'Exceptional technical skills. Nailed the system design interview. Team loved her.'),
    (v_owner_id, v_job_dev, 'Michael Chen', 'mchen22@example.com', '+1-555-8832', 'https://linkedin.com/in/mchen', 'offer', 4, 'Very strong on the frontend side. Slight hesitation on database scaling, but great cultural fit.'),
    (v_owner_id, v_job_dev, 'David Rodriguez', 'davidr.dev@example.com', '+1-555-7711', 'https://linkedin.com/in/drodriguez', 'interview', 4, 'Solid technical screening. Moving to the final technical loop next Tuesday.'),
    (v_owner_id, v_job_dev, 'Elena Rostova', 'elena.rostova@example.com', '+1-555-9012', 'https://linkedin.com/in/erostova', 'interview', 3, 'Good communication but struggled slightly with the specialized architecture question.'),
    (v_owner_id, v_job_dev, 'James Wilson', 'jwilson.codes@example.com', '+1-555-2244', 'https://linkedin.com/in/jamesw', 'screening', 0, 'Reviewing take-home assignment this weekend.'),
    (v_owner_id, v_job_dev, 'Anita Patel', 'anita.p.tech@example.com', '+1-555-6678', NULL, 'applied', 0, 'Strong resume, need to schedule initial screening call.'),
    (v_owner_id, v_job_dev, 'Marcus Johnson', 'marcus.j.dev@example.com', NULL, 'https://linkedin.com/in/mjtech', 'applied', 0, 'Referred by internal employee (Sarah). Notes look promising.');

  -- Design Roles
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_design, 'Chloe O''Connor', 'chloe.design@example.com', '+1-555-1122', 'https://linkedin.com/in/chloeo', 'interview', 5, 'Incredible portfolio. Her work on the fintech app is exactly what we need. Highly recommend.'),
    (v_owner_id, v_job_design, 'Liam Smith', 'liam.s.creative@example.com', '+1-555-3344', 'https://linkedin.com/in/liamsmith', 'screening', 3, 'Good visual design skills, but need to dig deeper into his UX research methodology.'),
    (v_owner_id, v_job_design, 'Zoe Andersson', 'zoe.a.design@example.com', '+1-555-5566', 'https://linkedin.com/in/zoea', 'applied', 0, 'Just applied. Portfolio link included in application.'),
    (v_owner_id, v_job_design, 'Robert Davis', 'rdavis.uiux@example.com', '+1-555-7788', NULL, 'rejected', 2, 'Portfolio was a bit too corporate/dated for our current brand direction. Sent standard rejection.');

  -- Marketing Roles
  INSERT INTO public.candidates (owner_id, job_id, full_name, email, phone, linkedin_url, stage, rating, notes) VALUES
    (v_owner_id, v_job_marketing, 'Sophia Lee', 'sophia.l.marketing@example.com', '+1-555-9900', 'https://linkedin.com/in/sophialee', 'offer', 5, 'Exactly what we are looking for. Deep experience with our target channels and impressive ROI metrics on past campaigns.'),
    (v_owner_id, v_job_marketing, 'Jackson Taylor', 'jtaylor.growth@example.com', '+1-555-1234', 'https://linkedin.com/in/jacksont', 'interview', 4, 'Very charismatic. Knows the tools well. Concerned about budget management experience at our scale.'),
    (v_owner_id, v_job_marketing, 'Isabella Martinez', 'isabella.m.growth@example.com', '+1-555-5678', 'https://linkedin.com/in/imartinez', 'screening', 0, 'Initial call scheduled for Thursday at 2 PM.'),
    (v_owner_id, v_job_marketing, 'William Brown', 'william.b.ads@example.com', '+1-555-9012', NULL, 'applied', 0, 'Strong background in B2B SaaS marketing. Looks like a solid fit on paper.');

  RAISE NOTICE 'Inserted 15 candidates';

END $$;
