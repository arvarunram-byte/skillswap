import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Mail, 
  Lock, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Coins, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Video,
  Clock
} from 'lucide-react';

export default function AuthScreen() {
  const { register, login } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('');
  const [teachSkillsInput, setTeachSkillsInput] = useState('');
  const [learnSkillsInput, setLearnSkillsInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isRegisterMode) {
      const teachSkills = teachSkillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const learnSkills = learnSkillsInput.split(',').map(s => s.trim()).filter(Boolean);

      await register({
        fullName,
        email,
        password,
        institution,
        teachSkills: teachSkills.length ? teachSkills : ['Python Basics'],
        learnSkills: learnSkills.length ? learnSkills : ['Web Design']
      });
    } else {
      await login(email, password);
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '40px auto',
      padding: '0 24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
      gap: '40px',
      alignItems: 'center'
    }}>
      
      {/* Left Column: Platform Value Proposition (UN SDG 4) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-success">
            <ShieldCheck size={14} /> UN SDG 4: Quality Education
          </span>
          <span className="badge badge-token">
            <Coins size={14} /> 1 Free Starter Token
          </span>
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          lineHeight: '1.15',
          background: 'linear-gradient(135deg, #ffffff 40%, #c4b5fd 80%, #f472b6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          Learn with Time, <br />Not with Money.
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          SkillSwap is a pure real-time peer-to-peer barter platform for university students. 
          When you teach a peer for 1 hour, you earn <strong>1 Time-Credit Token</strong>. 
          Use that token to learn advanced skills from certified peers — 100% free of tuition costs.
        </p>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(99,102,241,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Coins size={20} color="#fbbf24" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Instant Welcome Gift</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Register your student profile today and instantly receive 1 Free Time-Credit.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16,185,129,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Video size={20} color="#34d399" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Real-Time WebRTC P2P Classroom</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live video calls, screen sharing, and synchronized live code editor.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(236,72,153,0.2)', padding: '10px', borderRadius: '12px' }}>
              <Sparkles size={20} color="#f472b6" />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>AI Proof-of-Learning Engine (USP)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tokens transfer only after the learner scores ≥60% on Gemini AI comprehension quizzes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Real Registration / Sign-In Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        border: '1.5px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), var(--accent-glow)'
      }}>
        
        {/* Toggle Mode */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setIsRegisterMode(true)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isRegisterMode ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Create Real Account
          </button>

          <button
            type="button"
            onClick={() => setIsRegisterMode(false)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: !isRegisterMode ? 'var(--accent-primary)' : 'transparent',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {isRegisterMode && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  College / University
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Harvard, IIT Madras, Anna University"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  Skills You Can Teach (Comma-separated) *
                </label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python, Machine Learning, UI/UX"
                    value={teachSkillsInput}
                    onChange={(e) => setTeachSkillsInput(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                  Skills You Want to Learn (Comma-separated) *
                </label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. React.js, Public Speaking, Graphic Design"
                    value={learnSkillsInput}
                    onChange={(e) => setLearnSkillsInput(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '10px', padding: '14px', fontSize: '1rem' }}
          >
            {loading ? 'Processing...' : isRegisterMode ? 'Register & Claim 1 Welcome Token' : 'Sign In to SkillSwap'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '16px' }}>
          ✓ 100% Real-Time Database • Verified by Gemini AI Proof-of-Learning
        </p>

      </div>

    </div>
  );
}
