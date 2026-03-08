-- Allow students to leave classrooms (delete their own membership)
CREATE POLICY "Students can leave classrooms"
ON public.classroom_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());