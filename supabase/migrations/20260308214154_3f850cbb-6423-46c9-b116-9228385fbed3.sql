
-- Create tables first
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  instructor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 6),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.classroom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, user_id)
);

CREATE TABLE public.classroom_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  due_date timestamp with time zone,
  UNIQUE(classroom_id, course_id)
);

-- Enable RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_assignments ENABLE ROW LEVEL SECURITY;

-- Trigger
CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_classroom_instructor(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms WHERE id = _classroom_id AND instructor_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_classroom_member(_classroom_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_members WHERE classroom_id = _classroom_id AND user_id = _user_id
  )
$$;

-- Classrooms policies
CREATE POLICY "Authenticated can select classrooms" ON public.classrooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors can insert own classrooms" ON public.classrooms FOR INSERT TO authenticated WITH CHECK (instructor_id = auth.uid());
CREATE POLICY "Instructors can update own classrooms" ON public.classrooms FOR UPDATE TO authenticated USING (instructor_id = auth.uid());
CREATE POLICY "Instructors can delete own classrooms" ON public.classrooms FOR DELETE TO authenticated USING (instructor_id = auth.uid());

-- Classroom members policies
CREATE POLICY "Members can view classroom members" ON public.classroom_members FOR SELECT TO authenticated
  USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_member(classroom_id, auth.uid()));
CREATE POLICY "Users can join classrooms" ON public.classroom_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Instructors can delete members" ON public.classroom_members FOR DELETE TO authenticated
  USING (public.is_classroom_instructor(classroom_id, auth.uid()));

-- Classroom assignments policies
CREATE POLICY "Members can view assignments" ON public.classroom_assignments FOR SELECT TO authenticated
  USING (public.is_classroom_instructor(classroom_id, auth.uid()) OR public.is_classroom_member(classroom_id, auth.uid()));
CREATE POLICY "Instructors can insert assignments" ON public.classroom_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_classroom_instructor(classroom_id, auth.uid()));
CREATE POLICY "Instructors can delete assignments" ON public.classroom_assignments FOR DELETE TO authenticated
  USING (public.is_classroom_instructor(classroom_id, auth.uid()));

-- Allow instructors to view training_progress of classroom members
CREATE POLICY "Instructors can view member progress" ON public.training_progress FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classroom_members cm
    JOIN public.classrooms c ON c.id = cm.classroom_id
    WHERE cm.user_id = training_progress.user_id AND c.instructor_id = auth.uid()
  ));

-- Allow instructors to view member profiles
CREATE POLICY "Instructors can view member profiles" ON public.profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.classroom_members cm
    JOIN public.classrooms c ON c.id = cm.classroom_id
    WHERE cm.user_id = profiles.id AND c.instructor_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_classroom_members_classroom ON public.classroom_members(classroom_id);
CREATE INDEX idx_classroom_members_user ON public.classroom_members(user_id);
CREATE INDEX idx_classroom_assignments_classroom ON public.classroom_assignments(classroom_id);
CREATE INDEX idx_classrooms_instructor ON public.classrooms(instructor_id);
CREATE INDEX idx_classrooms_invite_code ON public.classrooms(invite_code);
