-- Training courses table
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  syllabus JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_hours INTEGER DEFAULT 1,
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Training progress table
CREATE TABLE public.training_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  current_module INTEGER DEFAULT 0,
  completed_modules INTEGER[] DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Hacker toolkits table
CREATE TABLE public.hacker_toolkits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  tutorial_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Practice exercises table
CREATE TABLE public.practice_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE SET NULL,
  toolkit_id UUID REFERENCES public.hacker_toolkits(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  exercise_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  solution JSONB,
  hints TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercise completions table
CREATE TABLE public.exercise_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.practice_exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER,
  attempts INTEGER DEFAULT 1,
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hacker_toolkits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_completions ENABLE ROW LEVEL SECURITY;

-- Training courses policies (public read)
CREATE POLICY "Anyone can view training courses" ON public.training_courses FOR SELECT USING (true);

-- Training progress policies
CREATE POLICY "Users can view own progress" ON public.training_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.training_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.training_progress FOR UPDATE USING (auth.uid() = user_id);

-- Hacker toolkits policies (public read)
CREATE POLICY "Anyone can view toolkits" ON public.hacker_toolkits FOR SELECT USING (true);

-- Practice exercises policies (public read)
CREATE POLICY "Anyone can view exercises" ON public.practice_exercises FOR SELECT USING (true);

-- Exercise completions policies
CREATE POLICY "Users can view own completions" ON public.exercise_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.exercise_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completions" ON public.exercise_completions FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON public.training_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON public.training_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default courses
INSERT INTO public.training_courses (title, description, category, difficulty, syllabus, estimated_hours) VALUES
('Hacking Basics 101', 'Introduction to ethical hacking fundamentals', 'fundamentals', 'beginner', '[{"title": "What is Ethical Hacking?", "content": "Understanding the mindset"}, {"title": "Legal Considerations", "content": "Know the law"}, {"title": "Setting Up Your Lab", "content": "Virtual environments"}]', 4),
('Penetration Testing Fundamentals', 'Learn the methodology of professional pen testing', 'pentesting', 'intermediate', '[{"title": "Reconnaissance", "content": "Information gathering"}, {"title": "Scanning", "content": "Network and vulnerability scanning"}, {"title": "Exploitation", "content": "Gaining access"}, {"title": "Reporting", "content": "Documentation"}]', 8),
('Web Application Security', 'Master OWASP Top 10 and web exploitation', 'web', 'intermediate', '[{"title": "OWASP Top 10", "content": "Common vulnerabilities"}, {"title": "SQL Injection", "content": "Database attacks"}, {"title": "XSS", "content": "Cross-site scripting"}, {"title": "CSRF", "content": "Request forgery"}]', 10),
('Network Security Essentials', 'Understanding network protocols and attacks', 'network', 'beginner', '[{"title": "TCP/IP Fundamentals", "content": "Protocol basics"}, {"title": "Network Scanning", "content": "Nmap and beyond"}, {"title": "MITM Attacks", "content": "Interception techniques"}]', 6);

-- Insert default toolkits
INSERT INTO public.hacker_toolkits (name, description, category, tools, tutorial_content) VALUES
('Reconnaissance Kit', 'Tools for information gathering', 'recon', '[{"name": "Nmap", "purpose": "Network scanning"}, {"name": "Shodan", "purpose": "IoT search"}, {"name": "theHarvester", "purpose": "Email harvesting"}]', 'Start with passive reconnaissance before active scanning...'),
('Web Exploitation Kit', 'Tools for web application testing', 'web', '[{"name": "Burp Suite", "purpose": "Web proxy"}, {"name": "SQLMap", "purpose": "SQL injection"}, {"name": "XSSer", "purpose": "XSS testing"}]', 'Always get authorization before testing web applications...'),
('Password Attack Kit', 'Tools for credential testing', 'passwords', '[{"name": "Hashcat", "purpose": "Hash cracking"}, {"name": "John the Ripper", "purpose": "Password cracking"}, {"name": "Hydra", "purpose": "Online brute force"}]', 'Understanding password security helps build better defenses...');