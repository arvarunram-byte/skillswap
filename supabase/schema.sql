-- ====================================================================
-- SkillSwap Database Schema (Supabase PostgreSQL)
-- AI-Powered Peer-to-Peer Time-Credit Skill Exchange Network
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    institution TEXT DEFAULT 'University College',
    wallet_balance NUMERIC DEFAULT 1.0 CHECK (wallet_balance >= 0), -- 1 Free Welcome Token
    skills_teach TEXT[] DEFAULT '{}',
    skills_learn TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 5.0,
    sessions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Peer Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'failed', 'on_hold')),
    quiz_passed BOOLEAN DEFAULT NULL,
    quiz_score NUMERIC DEFAULT NULL,
    tokens_transferred NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 4. Time-Credit Ledger / Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL DEFAULT 1.0,
    type TEXT NOT NULL CHECK (type IN ('WELCOME_BONUS', 'PEER_SESSION_TRANSFER', 'ESCROW_HOLD', 'REFUND')),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'ON_HOLD', 'FAILED')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Proof-of-Learning Quizzes Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    questions JSONB NOT NULL,
    learner_answers JSONB,
    score NUMERIC,
    is_passed BOOLEAN DEFAULT FALSE,
    verified_by_ai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo hackathon setup (can be tightened with auth.uid() later)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Sessions" ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Public Read Transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public Insert Transactions" ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public Insert Quizzes" ON public.quizzes FOR INSERT WITH CHECK (true);

-- 7. Seed Initial Demo Students for Peer Matching
INSERT INTO public.profiles (id, email, username, full_name, avatar_url, bio, institution, wallet_balance, skills_teach, skills_learn, rating)
VALUES 
(
    'a1111111-1111-1111-1111-111111111111',
    'alex@skillswap.edu',
    'alex_dev',
    'Alex Chen',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Computer Science sophomore. Love building algorithms and backend APIs.',
    'Stanford University',
    3.0,
    ARRAY['Python', 'Data Structures', 'Backend APIs'],
    ARRAY['UI/UX Design', 'Figma', 'Graphic Design'],
    4.9
),
(
    'b2222222-2222-2222-2222-222222222222',
    'priya@skillswap.edu',
    'priya_design',
    'Priya Sharma',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Design major passionate about human-centered wireframes and design systems.',
    'MIT Institute of Design',
    2.0,
    ARRAY['UI/UX Design', 'Figma', 'Graphic Design'],
    ARRAY['Python', 'Data Structures'],
    5.0
),
(
    'c3333333-3333-3333-3333-333333333333',
    'marcus@skillswap.edu',
    'marcus_v',
    'Marcus Vance',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Web developer specialized in React and modern CSS. Looking to master public speaking.',
    'UC Berkeley',
    1.0,
    ARRAY['React.js', 'Frontend Development', 'JavaScript'],
    ARRAY['Public Speaking', 'Presentation Skills'],
    4.8
),
(
    'd4444444-4444-4444-4444-444444444444',
    'ananya@skillswap.edu',
    'ananya_speak',
    'Ananya Iyer',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    'Debate club president & communications tutor. Want to learn machine learning basics.',
    'Oxford University',
    4.0,
    ARRAY['Public Speaking', 'Presentation Skills', 'English Fluency'],
    ARRAY['Machine Learning', 'Python'],
    4.95
)
ON CONFLICT (id) DO NOTHING;
