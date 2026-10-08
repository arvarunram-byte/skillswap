import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Coins, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Clock, 
  Plus, 
  X, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, updateSkills, transactions } = useApp();

  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');

  if (!currentUser) return null;

  const handleAddTeach = (e) => {
    e.preventDefault();
    if (!newTeachSkill.trim()) return;
    if (currentUser.skills_teach.includes(newTeachSkill.trim())) return;
    const updated = [...currentUser.skills_teach, newTeachSkill.trim()];
    updateSkills(updated, currentUser.skills_learn);
    setNewTeachSkill('');
  };

  const handleRemoveTeach = (skill) => {
    const updated = currentUser.skills_teach.filter(s => s !== skill);
    updateSkills(updated, currentUser.skills_learn);
  };

  const handleAddLearn = (e) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) return;
    if (currentUser.skills_learn.includes(newLearnSkill.trim())) return;
    const updated = [...currentUser.skills_learn, newLearnSkill.trim()];
    updateSkills(currentUser.skills_teach, updated);
    setNewLearnSkill('');
  };

  const handleRemoveLearn = (skill) => {
    const updated = currentUser.skills_learn.filter(s => s !== skill);
    updateSkills(currentUser.skills_teach, updated);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Banner / Student Profile Header */}
      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <img
            src={currentUser.avatar_url}
            alt={currentUser.full_name}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '24px',
              objectFit: 'cover',
              border: '3px solid var(--accent-primary)',
              boxShadow: 'var(--accent-glow)'
            }}
          />

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>{currentUser.full_name}</h2>
              <span className="badge badge-success">
                <CheckCircle size={12} /> Verified Student Peer
              </span>
              <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}>
                ★ {currentUser.rating} / 5.0
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              {currentUser.institution} • @{currentUser.username}
            </p>
            <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '8px', maxWidth: '750px' }}>
              "{currentUser.bio}"
            </p>
          </div>

          {/* Time-Credit Wallet Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            minWidth: '240px',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                Time-Bank Wallet
              </span>
              <Coins size={20} color="#fbbf24" />
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fef08a' }}>
                {currentUser.wallet_balance}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 600 }}>
                Credits
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              1 Credit = 1 Hour of 1-on-1 Peer Learning
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', padding: '12px', borderRadius: '12px' }}>
            <GraduationCap size={24} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentUser.skills_teach.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skills I Teach</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(236,72,153,0.15)', padding: '12px', borderRadius: '12px' }}>
            <BookOpen size={24} color="#f472b6" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentUser.skills_learn.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Skills I Want to Learn</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', padding: '12px', borderRadius: '12px' }}>
            <Award size={24} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentUser.sessions_completed || 0}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sessions Completed</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(6,182,212,0.15)', padding: '12px', borderRadius: '12px' }}>
            <ShieldCheck size={24} color="#22d3ee" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AI Verification Rate</div>
          </div>
        </div>
      </div>

      {/* Skill Matrix Section (PDF Step 1: User Profile & Skill Matrix) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        
        {/* Skills I Can Teach */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(99,102,241,0.2)', padding: '8px', borderRadius: '8px' }}>
                <GraduationCap size={18} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Skills I Can Teach</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Earn +1 Credit / Hour
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Add skills you are confident explaining to fellow students. Once matched, you will earn credits.
          </p>

          {/* Skill Tag Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {currentUser.skills_teach.map(skill => (
              <span key={skill} className="badge badge-teach" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                {skill}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer', marginLeft: '4px' }} 
                  onClick={() => handleRemoveTeach(skill)}
                />
              </span>
            ))}
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddTeach} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. Python, SQL, Video Editing..."
              value={newTeachSkill}
              onChange={(e) => setNewTeachSkill(e.target.value)}
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Add Skill
            </button>
          </form>
        </div>

        {/* Skills I Want to Learn */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(236,72,153,0.2)', padding: '8px', borderRadius: '8px' }}>
                <BookOpen size={18} color="#f472b6" />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Skills I Want to Learn</h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Costs 1 Credit / Hour
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Our AI Matchmaker will connect you with peers who teach these skills without money!
          </p>

          {/* Skill Tag Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {currentUser.skills_learn.map(skill => (
              <span key={skill} className="badge badge-learn" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                {skill}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer', marginLeft: '4px' }} 
                  onClick={() => handleRemoveLearn(skill)}
                />
              </span>
            ))}
          </div>

          {/* Add Skill Form */}
          <form onSubmit={handleAddLearn} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="e.g. UI/UX Design, Public Speaking..."
              value={newLearnSkill}
              onChange={(e) => setNewLearnSkill(e.target.value)}
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '0.88rem' }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap', background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' }}>
              <Plus size={16} /> Add Skill
            </button>
          </form>
        </div>

      </div>

      {/* Transaction Ledger / Time-Bank Audit History */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Time-Credit Transaction Ledger</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Every token transfer is strictly verified by AI Proof-of-Learning quiz scores (≥60%)
            </p>
          </div>
          <span className="badge badge-token">
            <Coins size={14} /> Peer Barter Ledger
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px 12px' }}>Type</th>
                <th style={{ padding: '10px 12px' }}>Topic / Description</th>
                <th style={{ padding: '10px 12px' }}>Peer Involved</th>
                <th style={{ padding: '10px 12px' }}>Credits</th>
                <th style={{ padding: '10px 12px' }}>AI Verification</th>
                <th style={{ padding: '10px 12px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {/* Default Welcome Bonus Entry */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px' }}>
                  <span className="badge badge-success">
                    <Sparkles size={12} /> Welcome Bonus
                  </span>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-main)' }}>Platform Sign-up Reward (Free Starter Token)</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>SkillSwap Network</td>
                <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>+1.0</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <ShieldCheck size={14} /> System Verified
                  </span>
                </td>
                <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>Onboarding</td>
              </tr>

              {/* Dynamic transactions */}
              {transactions.map(tx => {
                const isRecipient = tx.to_user_id === currentUser.id;
                return (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${isRecipient ? 'badge-success' : 'badge-teach'}`}>
                        {isRecipient ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {isRecipient ? 'Earned Teaching' : 'Spent Learning'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 500 }}>
                      {tx.topic}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                      {isRecipient ? tx.from_user_name : tx.to_user_name}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: isRecipient ? '#10b981' : '#f43f5e' }}>
                      {isRecipient ? `+${tx.amount}.0` : `-${tx.amount}.0`}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <ShieldCheck size={14} /> AI Pass (≥60%)
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
