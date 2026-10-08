-- ====================================================================
-- SkillSwap Database Schema (Supabase PostgreSQL)
-- AI-Powered Peer-to-Peer Time-Credit Skill Exchange Network
-- Aligned with UN Sustainable Development Goal 4: Quality Education
-- Pure Production Schema (No Mock / No Dummy Seeds)
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
    institution TEXT DEFAULT 'University / College',
    wallet_balance NUMERIC DEFAULT 1.0 CHECK (wallet_balance >= 0), -- 1 Free Welcome Token upon registration
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
    room_id TEXT NOT NULL,
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

-- Real-time Policies for authenticated / demo app usage
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

-- Realtime publication for PostgreSQL
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
