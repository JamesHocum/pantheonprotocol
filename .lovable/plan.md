

## Team/Classroom Mode + Background Update

### Part 1: Replace App Background Image

Copy the uploaded image to `src/assets/` and update `src/index.css` to reference it instead of `cyber-cafe-bg.jpg`.

**Files:**
- Copy `user-uploads://ChatGPT_Image_Jan_13_2026_04_28_04_AM.png` to `src/assets/cyberpunk-cafe-bg.png`
- Update `src/index.css` line 91: change `background-image` URL

---

### Part 2: Database Schema for Classroom Mode

Create migration with these tables:

**`classrooms`** - Groups created by instructors
- `id` uuid PK
- `name` text
- `description` text
- `instructor_id` uuid (references profiles)
- `invite_code` text unique (6-char alphanumeric for easy sharing)
- `created_at`, `updated_at` timestamps

**`classroom_members`** - Students enrolled in classrooms
- `id` uuid PK
- `classroom_id` uuid FK -> classrooms
- `user_id` uuid
- `role` text default 'student' (student | assistant_instructor)
- `joined_at` timestamp

**`classroom_assignments`** - Courses assigned to a classroom
- `id` uuid PK
- `classroom_id` uuid FK -> classrooms
- `course_id` uuid FK -> training_courses
- `assigned_at` timestamp
- `due_date` timestamp nullable

RLS policies:
- Instructors can CRUD their own classrooms
- Members can SELECT classrooms they belong to
- Instructors can view all member progress in their classrooms
- Students can join via invite code (insert into classroom_members)

---

### Part 3: Classroom UI Components

**Create `src/hooks/useClassrooms.ts`**
- `fetchMyClassrooms()` - classrooms where user is instructor
- `fetchEnrolledClassrooms()` - classrooms where user is student
- `createClassroom(name, description)` - generates invite code
- `joinClassroom(inviteCode)` - adds user as student member
- `assignCourse(classroomId, courseId, dueDate?)` - instructor assigns course
- `getClassroomProgress(classroomId)` - fetches all member progress for assigned courses

**Create `src/components/classroom/ClassroomDashboard.tsx`**
Main component that renders either the instructor or student view based on whether the user owns any classrooms.

**Create `src/components/classroom/InstructorView.tsx`**
- List of classrooms the user instructs
- "Create Classroom" button with name/description form
- Each classroom card shows: member count, assigned courses, invite code (copyable)
- Click a classroom to see member progress grid

**Create `src/components/classroom/StudentView.tsx`**
- "Join Classroom" input field for invite code
- List of enrolled classrooms with assigned courses and due dates
- Progress indicators per assigned course

**Create `src/components/classroom/ClassroomDetail.tsx`**
- Instructor sees: member list with per-student progress bars, assign course dropdown, manage members
- Student sees: assigned courses with their own progress, due dates

**Create `src/components/classroom/ProgressGrid.tsx`**
- Table/grid showing students as rows, assigned courses as columns
- Cells show completion percentage with color coding (red < 25%, yellow < 75%, green >= 75%)

---

### Part 4: Wire into Main App

**Update `src/pages/Index.tsx`**
- Add a 7th tab "Classroom" with `Users` icon between Academy and AI Studio
- Tab renders `<ClassroomDashboard />`
- Only visible when user is logged in

---

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useClassrooms.ts` | Classroom CRUD and progress queries |
| `src/components/classroom/ClassroomDashboard.tsx` | Main classroom tab container |
| `src/components/classroom/InstructorView.tsx` | Instructor classroom management |
| `src/components/classroom/StudentView.tsx` | Student enrollment and course view |
| `src/components/classroom/ClassroomDetail.tsx` | Single classroom detail view |
| `src/components/classroom/ProgressGrid.tsx` | Student progress table for instructors |

### Files to Update
| File | Changes |
|------|---------|
| `src/index.css` | New background image reference |
| `src/pages/Index.tsx` | Add Classroom tab |

### Database Migration
- Create `classrooms`, `classroom_members`, `classroom_assignments` tables with RLS

