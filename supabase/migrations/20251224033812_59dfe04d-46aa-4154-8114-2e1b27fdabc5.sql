-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create user agent settings table (custom instructions, avatar, tor toggle per agent per user)
CREATE TABLE public.user_agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assistant_key TEXT NOT NULL,
  custom_instructions TEXT,
  custom_avatar_url TEXT,
  tor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, assistant_key)
);

-- Enable RLS on user_agent_settings
ALTER TABLE public.user_agent_settings ENABLE ROW LEVEL SECURITY;

-- Agent settings policies
CREATE POLICY "Users can view own agent settings" ON public.user_agent_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own agent settings" ON public.user_agent_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own agent settings" ON public.user_agent_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own agent settings" ON public.user_agent_settings FOR DELETE USING (auth.uid() = user_id);

-- Create canvas data table (code editor content per agent per user)
CREATE TABLE public.canvas_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assistant_key TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'javascript',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, assistant_key)
);

-- Enable RLS on canvas_data
ALTER TABLE public.canvas_data ENABLE ROW LEVEL SECURITY;

-- Canvas data policies
CREATE POLICY "Users can view own canvas" ON public.canvas_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own canvas" ON public.canvas_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own canvas" ON public.canvas_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own canvas" ON public.canvas_data FOR DELETE USING (auth.uid() = user_id);

-- Add user_id to conversations table for user-specific chat history
ALTER TABLE public.conversations ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Update conversations RLS policies
DROP POLICY IF EXISTS "Allow all access to conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Update chat_messages RLS policies
DROP POLICY IF EXISTS "Allow all access to chat_messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_agent_settings_user ON public.user_agent_settings(user_id);
CREATE INDEX idx_canvas_data_user ON public.canvas_data(user_id);
CREATE INDEX idx_conversations_user ON public.conversations(user_id);

-- Trigger for profile timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for agent settings timestamps
CREATE TRIGGER update_user_agent_settings_updated_at
  BEFORE UPDATE ON public.user_agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for canvas data timestamps
CREATE TRIGGER update_canvas_data_updated_at
  BEFORE UPDATE ON public.canvas_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);