-- Create image_generations table for persisting AI-generated images
CREATE TABLE public.image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_generations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own images" ON public.image_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON public.image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON public.image_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Storage policies
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own images storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own images storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view generated images" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images');

-- Seed practice exercises with beginner CTF-style challenges
INSERT INTO public.practice_exercises (title, description, difficulty, exercise_type, content, solution, hints) VALUES
(
  'Base64 Decode',
  'Decode this Base64 encoded string to reveal the hidden message.',
  'beginner',
  'decode',
  '{"encoded": "U2F5IG15IG5hbWU=", "instructions": "Use atob() or a Base64 decoder to reveal the secret message."}',
  '{"expected_output": "Say my name", "explanation": "Base64 is a common encoding scheme used to represent binary data in ASCII format."}',
  ARRAY['Base64 uses A-Z, a-z, 0-9, +, and /', 'In JavaScript, use atob() to decode', 'The = signs are padding']
),
(
  'Find the Flag',
  'A flag is hidden somewhere in this HTML. Can you find it?',
  'beginner',
  'forensics',
  '{"html": "<html><head><title>Nothing here</title></head><body><p>Just a normal page</p><!-- FLAG{h1dd3n_1n_c0mm3nt} --></body></html>", "instructions": "Examine the HTML source carefully. Flags are often hidden in unexpected places."}',
  '{"expected_output": "FLAG{h1dd3n_1n_c0mm3nt}", "explanation": "HTML comments are a common place to hide information. Always view page source!"}',
  ARRAY['Check the HTML comments', 'Comments start with <!-- and end with -->', 'The flag format is FLAG{...}']
),
(
  'Caesar Cipher',
  'Decrypt this Caesar cipher message. The shift is 3.',
  'beginner',
  'crypto',
  '{"encrypted": "khoor zruog", "shift": 3, "instructions": "Each letter has been shifted forward by 3 positions in the alphabet."}',
  '{"expected_output": "hello world", "explanation": "Caesar cipher shifts each letter by a fixed number. To decrypt, shift backwards."}',
  ARRAY['A becomes D, B becomes E, etc.', 'To decrypt, shift backwards by 3', 'k shifted back 3 is h']
),
(
  'Hex to ASCII',
  'Convert this hexadecimal string to readable ASCII text.',
  'beginner',
  'decode',
  '{"hex": "48 61 63 6b 65 72", "instructions": "Each pair of hex digits represents one ASCII character."}',
  '{"expected_output": "Hacker", "explanation": "Hexadecimal is base-16 and commonly used to represent binary data."}',
  ARRAY['48 in hex = 72 in decimal = H in ASCII', 'Use String.fromCharCode() with parseInt(hex, 16)', 'Split by spaces and convert each pair']
),
(
  'Binary Message',
  'Decode this binary message to reveal the secret word.',
  'intermediate',
  'decode',
  '{"binary": "01000011 01001111 01000100 01000101", "instructions": "Each 8-bit group represents one ASCII character."}',
  '{"expected_output": "CODE", "explanation": "Binary is the fundamental language of computers. Each byte (8 bits) can represent a character."}',
  ARRAY['01000011 in binary = 67 in decimal', '67 in ASCII = C', 'Convert each byte separately']
);