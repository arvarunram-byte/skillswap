import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../lib/supabase';
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  Coins, 
  CheckCircle2, 
  Building 
} from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, setCurrentUser, showNotification } = useApp();

  const [isSignUp, setIsSignUp] = useState(true);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState('IIT Madras');
  const [teachSkill, setTeachSkill] = useState('');
  const [learnSkill, setLearnSkill] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      if (!fullName || !email || !teachSkill || !learnSkill) {
        showNotification('Please fill in all required fields to register', 'danger');
        return;
      }

      const newStudent = {
        id: 'usr_' + Date.now(),
        email: email.trim(),
        username: username.trim() || email.split('@')[0],
        full_name: fullName.trim(),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        bio: `Eager student at ${institution}. Teaching ${teachSkill} and learning ${learnSkill}.`,
        institution: institution.trim(),
        wallet_balance: 1.0, // 1 Free Welcome Token per PDF requirement!
        skills_teach: teachSkill.split(',').map(s => s.trim()).filter(Boolean),
        skills_learn: learnSkill.split(',').map(s => s.trim()).filter(Boolean),
        rating: 5.0,
        sessions_completed: 0,
        created_at: new Date().toISOString()
      };

      await db.updateProfile(newStudent);
      setCurrentUser(newStudent);
      showNotification(`🎉 Welcome ${fullName}! You've received 1 Free Welcome Token in your Time-Bank wallet!`, 'success');
      setIsAuthModalOpen(false);
    } else {
      // Sign in simulation
      const users = await db.getProfiles();
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        showNotification(`Welcome back, ${matched.full_name}!`, 'success');
        setIsAuthModalOpen(false);
      } else {
        showNotification('No account found with this email. Please check or sign up.', 'warning');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '32px',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1.5px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <span className="badge badge-token" style={{ marginBottom: '6px' }}>
              <Coins size={13} /> 1 Free Welcome Token upon Signup
            </span>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
              {isSignUp ? 'Create Student Account' : 'Sign In to SkillSwap'}
            </h3>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>College / University</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Anna University, IIT, NIT..."
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Skills I Can Teach (Comma-separated) *</label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Python, SQL, Video Editing"
                    value={teachSkill}
                    onChange={(e) => setTeachSkill(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '5px' }}>Skills I Want to Learn (Comma-separated) *</label>
                <div style={{ position: 'relative' }}>
                  <BookOpen size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. UI/UX Design, Public Speaking, Flutter"
                    value={learnSkill}
                    onChange={(e) => setLearnSkill(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '40px' }}
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
            {isSignUp ? 'Create Account & Claim Welcome Token' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

      </div>
    </div>
  );
}
