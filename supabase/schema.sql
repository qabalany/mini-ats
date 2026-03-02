-- db schema for mini-ats
-- copy and run in supabase sql editor

-- profile data tied to auth users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- job listings
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'internship')),
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- candidate applications
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  notes TEXT,
  stage TEXT DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected')),
  rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- audit log for tracking who did what
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- speed up queries
CREATE INDEX idx_jobs_owner ON public.jobs(owner_id);
CREATE INDEX idx_candidates_owner ON public.candidates(owner_id);
CREATE INDEX idx_candidates_job ON public.candidates(job_id);
CREATE INDEX idx_candidates_stage ON public.candidates(stage);
CREATE INDEX idx_activity_owner ON public.activity_log(owner_id);

-- turn on rls
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- simple util to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- security policies

-- profiles: everyone sees their own, admins see everything
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin() OR id = auth.uid());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- jobs: owners see their own, admins see all
CREATE POLICY "Users can view own jobs" ON public.jobs
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own jobs" ON public.jobs
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own jobs" ON public.jobs
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own jobs" ON public.jobs
  FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-- candidates: owners see their own, admins see all
CREATE POLICY "Users can view own candidates" ON public.candidates
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own candidates" ON public.candidates
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own candidates" ON public.candidates
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can delete own candidates" ON public.candidates
  FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-- activity log: owners see their own, admins see all
CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT WITH CHECK (owner_id = auth.uid() OR public.is_admin());

-- automatically setup profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- keep updated_at in sync
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- let admins fetch all users via edge function or admin panel
CREATE OR REPLACE FUNCTION public.admin_list_all_users()
RETURNS SETOF public.profiles AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.profiles ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- aggregate stats for the dashboard view
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_owner_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
  effective_owner UUID;
BEGIN
  -- Admins can query any owner or all
  IF public.is_admin() AND p_owner_id IS NOT NULL THEN
    effective_owner := p_owner_id;
  ELSE
    effective_owner := auth.uid();
  END IF;

  SELECT json_build_object(
    'total_jobs', (SELECT COUNT(*) FROM public.jobs WHERE owner_id = effective_owner),
    'open_jobs', (SELECT COUNT(*) FROM public.jobs WHERE owner_id = effective_owner AND status = 'open'),
    'total_candidates', (SELECT COUNT(*) FROM public.candidates WHERE owner_id = effective_owner),
    'by_stage', (
      SELECT json_object_agg(stage, cnt)
      FROM (
        SELECT stage, COUNT(*) as cnt
        FROM public.candidates
        WHERE owner_id = effective_owner
        GROUP BY stage
      ) s
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
