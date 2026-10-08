import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig, saveSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { 
  Database, 
  Key, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Cpu, 
  AlertCircle 
} from 'lucide-react';

export default function SupabaseConfigModal() {
  const { isSupabaseModalOpen, setIsSupabaseModalOpen, showNotification } = useApp();

  const config = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(config.url || '');
  const [supabaseKey, setSupabaseKey] = useState(config.key || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('skillswap_gemini_api_key') || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isSupabaseModalOpen) return null;

  const handleSave = async () => {
    saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
    if (geminiKey.trim()) {
      localStorage.setItem('skillswap_gemini_api_key', geminiKey.trim());
    } else {
      localStorage.removeItem('skillswap_gemini_api_key');
    }
    showNotification('Database and AI API keys saved successfully!', 'success');
    setIsSupabaseModalOpen(false);
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setConnectionStatus({ success: false, message: 'Please enter both Supabase URL and Anon Key' });
      return;
    }
    setTestingConnection(true);
    setConnectionStatus(null);
    try {
      saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      const client = getSupabaseClient();
      const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      setConnectionStatus({ success: true, message: '✓ Successfully connected to Supabase PostgreSQL database!' });
      showNotification('Supabase connection verified!', 'success');
    } catch (err) {
      setConnectionStatus({ success: false, message: `Connection error: ${err.message || 'Make sure schema.sql has been run in Supabase'}` });
    } finally {
      setTestingConnection(false);
    }
  };

  const copySqlToClipboard = () => {
    const sqlScript = `-- Run this in your Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    institution TEXT DEFAULT 'University College',
    wallet_balance NUMERIC DEFAULT 1.0 CHECK (wallet_balance >= 0),
    skills_teach TEXT[] DEFAULT '{}',
    skills_learn TEXT[] DEFAULT '{}',
    rating NUMERIC DEFAULT 5.0,
    sessions_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    status TEXT DEFAULT 'scheduled',
    tokens_transferred NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES public.profiles(id),
    to_user_id UUID REFERENCES public.profiles(id),
    amount NUMERIC DEFAULT 1.0,
    type TEXT,
    status TEXT DEFAULT 'COMPLETED',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Public Read Sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Public Insert Transactions" ON public.transactions FOR INSERT WITH CHECK (true);`;

    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showNotification('SQL Schema copied to clipboard!', 'info');
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '640px',
        width: '100%',
        padding: '32px',
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <Database size={24} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Supabase Database & AI Settings</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Cloud PostgreSQL database connection for live deployment
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Instructions */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, color: '#34d399' }}>Step 1: Setup Supabase Database</span>
            <button
              onClick={copySqlToClipboard}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
            >
              {copiedSql ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              {copiedSql ? 'Copied!' : 'Copy SQL Schema'}
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            1. Open <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>supabase.com/dashboard</a> and create a free project.<br />
            2. Go to <strong>SQL Editor</strong>, paste the copied SQL schema, and click <strong>Run</strong>.<br />
            3. Go to <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>Anon Public Key</strong> and paste below:
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '6px' }}>
              Google Gemini API Key (Optional for live dynamic quizzes)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="input-field"
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Free key from Google AI Studio. If left empty, SkillSwap's built-in intelligent curriculum engine is used.
            </p>
          </div>
        </div>

        {/* Status Message */}
        {connectionStatus && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            background: connectionStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${connectionStatus.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            color: connectionStatus.success ? '#34d399' : '#f87171'
          }}>
            {connectionStatus.message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="btn btn-secondary"
          >
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </button>

          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save & Connect
          </button>
        </div>

      </div>
    </div>
  );
}
