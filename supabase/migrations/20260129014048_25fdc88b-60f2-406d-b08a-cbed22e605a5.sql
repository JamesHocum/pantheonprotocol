-- Create user_xp table for gamification
CREATE TABLE public.user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_xp
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_xp
CREATE POLICY "Users can view own XP" ON public.user_xp FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own XP" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own XP" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_xp_updated_at BEFORE UPDATE ON public.user_xp
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add theme_era and preferred_model to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_era TEXT DEFAULT '2020s';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_model TEXT DEFAULT 'google/gemini-2.5-flash';

-- Seed 15 advanced CTF exercises
INSERT INTO public.practice_exercises (title, description, difficulty, exercise_type, content, solution, hints) VALUES
-- Crypto exercises
('ROT13 Decoder', 'Decode a message encrypted with ROT13 cipher. A classic substitution cipher that shifts letters by 13 positions.', 'intermediate', 'crypto', 
 '{"challenge": "Decode this message: Gur cnffjbeq vf: plorefrphevgl", "expectedAnswer": "The password is: cybersecurity"}'::jsonb,
 '{"explanation": "ROT13 shifts each letter 13 positions in the alphabet. A becomes N, B becomes O, etc."}'::jsonb,
 ARRAY['ROT13 is its own inverse - encoding and decoding use the same operation', 'Try shifting each letter 13 positions forward or backward']),

('Vigenere Cipher Challenge', 'Break a Vigenere cipher using frequency analysis and known plaintext attack techniques.', 'advanced', 'crypto',
 '{"challenge": "Decrypt: LXFOPVEFRNHR with key: LEMON", "expectedAnswer": "ATTACKATDAWN"}'::jsonb,
 '{"explanation": "Vigenere uses a repeating key to shift each letter by different amounts based on the key letter position."}'::jsonb,
 ARRAY['Each letter in the key represents a shift amount (A=0, B=1, etc.)', 'The key repeats across the plaintext']),

('RSA Key Analysis', 'Analyze RSA parameters to understand the relationship between p, q, n, e, and d. Calculate the private exponent.', 'advanced', 'crypto',
 '{"challenge": "Given p=11, q=13, e=7, calculate n, φ(n), and d", "expectedN": 143, "expectedPhi": 120, "expectedD": 103}'::jsonb,
 '{"explanation": "n = p*q, φ(n) = (p-1)(q-1), d is the modular multiplicative inverse of e mod φ(n)"}'::jsonb,
 ARRAY['n is simply p multiplied by q', 'φ(n) = (p-1) × (q-1)', 'd × e ≡ 1 (mod φ(n))']),

('XOR Key Recovery', 'Recover the XOR encryption key from ciphertext when you know part of the plaintext.', 'intermediate', 'crypto',
 '{"challenge": "Ciphertext (hex): 1b37373331363f78151b7f2b783431333d, Known plaintext starts with: Cooking", "expectedKey": "X"}'::jsonb,
 '{"explanation": "XOR has the property that A ⊕ B = C means A ⊕ C = B, so we can recover the key from known plaintext."}'::jsonb,
 ARRAY['XOR the first bytes of ciphertext with the first bytes of known plaintext', 'The result gives you the key']),

('Hash Collision Detection', 'Identify potential hash collisions and understand why certain hashing algorithms are vulnerable.', 'advanced', 'crypto',
 '{"challenge": "Two different files have the same MD5 hash: d41d8cd98f00b204e9800998ecf8427e. What type of file would produce this?", "expectedAnswer": "empty"}'::jsonb,
 '{"explanation": "This is the MD5 hash of an empty string/file. Collisions occur when different inputs produce the same hash."}'::jsonb,
 ARRAY['This particular hash is well-known in security circles', 'What file has zero bytes?']),

-- Forensics exercises
('EXIF Data Extraction', 'Extract hidden metadata from an image file to find geolocation and camera information.', 'intermediate', 'forensics',
 '{"challenge": "An image has EXIF data showing GPS coordinates 37.7749° N, 122.4194° W. What city was this photo taken in?", "expectedAnswer": "San Francisco"}'::jsonb,
 '{"explanation": "EXIF (Exchangeable Image File Format) stores metadata like camera settings, timestamps, and GPS coordinates."}'::jsonb,
 ARRAY['Look up the GPS coordinates on a map', 'These are famous coordinates for a major US west coast city']),

('Steganography Detection', 'Detect and extract hidden messages embedded within image files using LSB steganography.', 'advanced', 'forensics',
 '{"challenge": "A PNG image has data hidden in the least significant bits. The binary extracted is: 01001000 01001001. What does it spell?", "expectedAnswer": "HI"}'::jsonb,
 '{"explanation": "LSB steganography hides data in the least significant bits of pixel values, making changes imperceptible to human eyes."}'::jsonb,
 ARRAY['Convert each 8-bit binary group to ASCII', '01001000 = 72 in decimal = H in ASCII']),

('Memory Dump Analysis', 'Analyze a memory dump to find running processes, network connections, and potential malware indicators.', 'advanced', 'forensics',
 '{"challenge": "A memory dump shows process cmd.exe spawned by powershell.exe with network connection to 192.168.1.100:4444. What type of attack does this indicate?", "expectedAnswer": "reverse shell"}'::jsonb,
 '{"explanation": "Command shells with outbound connections to unusual ports often indicate reverse shell backdoors."}'::jsonb,
 ARRAY['Port 4444 is commonly associated with Metasploit', 'A reverse shell connects FROM victim TO attacker']),

('Log File Investigation', 'Parse web server logs to identify suspicious activity patterns and potential intrusion attempts.', 'intermediate', 'forensics',
 '{"challenge": "Log shows: GET /admin/..%2f..%2f..%2fetc/passwd HTTP/1.1. What type of attack is this?", "expectedAnswer": "directory traversal"}'::jsonb,
 '{"explanation": "%2f is URL-encoded forward slash. Attackers use this to escape the web root and access system files."}'::jsonb,
 ARRAY['Decode %2f - what character is it?', 'The pattern ../../../ is used to navigate up directories']),

('Deleted File Recovery', 'Understand file system forensics and how deleted files can be recovered from unallocated space.', 'intermediate', 'forensics',
 '{"challenge": "A FAT32 file system marks deleted files by replacing the first character of filename with 0xE5. What command would find deleted JPGs?", "expectedAnswer": "grep or strings"}'::jsonb,
 '{"explanation": "Deleted files often remain on disk until overwritten. File carving tools scan for file signatures in raw disk data."}'::jsonb,
 ARRAY['File headers remain intact after deletion', 'JPEG files start with bytes FF D8 FF']),

-- Web exploitation exercises
('SQL Injection Detection', 'Identify SQL injection vulnerabilities and craft payloads to bypass authentication.', 'intermediate', 'web',
 '{"challenge": "A login form is vulnerable to SQLi. Craft a username that would bypass authentication: SELECT * FROM users WHERE username=''[INPUT]'' AND password=''pass''", "expectedAnswer": "'' OR ''1''=''1"}'::jsonb,
 '{"explanation": "SQL injection allows attackers to modify queries by inserting SQL code through user inputs."}'::jsonb,
 ARRAY['Close the existing quote and add a condition that is always true', 'Use OR to add an alternative condition']),

('XSS Payload Identification', 'Identify and categorize different types of Cross-Site Scripting attack payloads.', 'intermediate', 'web',
 '{"challenge": "Classify this payload: <img src=x onerror=alert(1)>. Is it Reflected, Stored, or DOM-based XSS?", "expectedAnswer": "Reflected"}'::jsonb,
 '{"explanation": "This payload uses an image tag with an error handler - when src=x fails, onerror executes JavaScript."}'::jsonb,
 ARRAY['The payload type depends on how it is delivered, not the payload itself', 'Without context of storage, assume immediate execution']),

('JWT Token Analysis', 'Decode and analyze JWT tokens to identify security misconfigurations and potential vulnerabilities.', 'advanced', 'web',
 '{"challenge": "A JWT has alg:none in its header. Why is this dangerous?", "expectedAnswer": "signature bypass"}'::jsonb,
 '{"explanation": "The ''none'' algorithm tells the server to not verify the signature, allowing attackers to forge tokens."}'::jsonb,
 ARRAY['JWT has three parts: header, payload, signature', 'If no algorithm is used, what happens to signature verification?']),

('HTTP Header Injection', 'Exploit HTTP header injection to perform cache poisoning or response splitting attacks.', 'advanced', 'web',
 '{"challenge": "User input in a redirect header: Location: /page?lang=[INPUT]. What payload would inject a new header?", "expectedAnswer": "%0d%0aSet-Cookie:admin=true"}'::jsonb,
 '{"explanation": "CRLF injection (%0d%0a) allows inserting new HTTP headers by injecting line breaks."}'::jsonb,
 ARRAY['%0d%0a represents carriage return and line feed', 'HTTP headers are separated by newlines']),

('Command Injection', 'Identify command injection vulnerabilities and understand how to exploit shell metacharacters.', 'advanced', 'web',
 '{"challenge": "A ping utility runs: ping -c 1 [USER_INPUT]. What input would also run ''id''?", "expectedAnswer": "; id"}'::jsonb,
 '{"explanation": "Shell metacharacters like ; | && allow chaining multiple commands. Unsanitized input leads to command injection."}'::jsonb,
 ARRAY['Semicolon separates commands in most shells', 'The shell will execute both ping and your injected command']);