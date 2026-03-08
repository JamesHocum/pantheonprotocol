-- Enable realtime for classroom_members and training_progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_progress;

-- Allow instructors to view XP of their classroom members (for leaderboard)
CREATE POLICY "Instructors can view member xp"
ON public.user_xp
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classroom_members cm
    JOIN classrooms c ON c.id = cm.classroom_id
    WHERE cm.user_id = user_xp.user_id AND c.instructor_id = auth.uid()
  )
);

-- Allow classroom members to view each other's XP (for leaderboard)
CREATE POLICY "Classroom members can view peer xp"
ON public.user_xp
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classroom_members cm1
    JOIN classroom_members cm2 ON cm1.classroom_id = cm2.classroom_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = user_xp.user_id
  )
);

-- Allow classroom members to view each other's profiles (for leaderboard names)
CREATE POLICY "Classroom members can view peer profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM classroom_members cm1
    JOIN classroom_members cm2 ON cm1.classroom_id = cm2.classroom_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
  )
);