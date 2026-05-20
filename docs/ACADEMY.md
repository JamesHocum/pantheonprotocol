# Hacker Academy

LadyVioletGPT runs a structured curriculum for ethical hacking. Everything is defensive, lab-based, or capture-the-flag style — never live targets.

## Curriculum shape

- **Courses** → ordered **Lessons** → embedded **Exercises** (CTF-style).
- Progress is tracked per user in `user_progress`; XP awards fire on lesson completion and exercise solve.
- `src/components/training/` holds `CourseLibrary`, `CourseViewer`, `ExerciseRunner`, `ProgressTracker`, and the `ToolkitBrowser` (curated tools per topic).

## XP, levels, badges

- Levels 1–50, with milestone unlocks at 5/10/20/30/50.
- `useXP()` exposes `xp`, `level`, `nextLevelAt`, and `award(amount, reason)`.
- Unlockable avatars (`UnlockableAvatars.tsx`) and badges (`LevelBadges.tsx`) gate by level.
- XP sources: lesson complete, exercise solve, CTF flag, mini-game high score, daily streak.

## Classroom mode

For instructors running cohorts (`src/components/classroom/`):

- **InstructorView** — roster, assignments, real-time progress grid, achievements feed.
- **Leaderboard** — XP ranking scoped to a classroom.
- **Analytics** — completion rates, stuck-points, time-on-task.
- **StudentView** — assigned courses + classroom-scoped leaderboard.

Realtime updates use `useClassroomRealtime()` (Supabase Realtime on the `enrollments` and `user_progress` tables).

## Arcade

Mini-games that double as learning reinforcement:

- **CIPHER_BREAK** — classical cipher cryptanalysis with hints.
- **HACK THE PLANET** — terminal-style port scan / password crack / loot simulator across `Hackers`-themed targets. Score scales with attempts; hints cost points.

Both award XP and feed the leaderboard.
