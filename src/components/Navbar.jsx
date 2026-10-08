import React from 'react';
import { useApp } from '../context/AppContext';
import { getSupabaseConfig } from '../lib/supabase';
import { 
  Sparkles, 
  Coins, 
  Users, 
  Video, 
  LayoutDashboard, 
  Database, 
  UserCheck,
  GraduationCap
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentUser, 
    profiles, 
    switchUser, 
    activeTab, 
    setActiveTab, 
    activeSession, 
    setIsSupabaseModalOpen 
  } = useApp();

  const supabaseConfig = getSupabaseConfig();

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('matchmaker')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)'
          }}>
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 30%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                SkillSwap
              </span>
              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600 }}>
                AI Time-Bank
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              UN SDG 4: Peer Skill Exchange Network
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('matchmaker')}
            className={`btn btn-sm ${activeTab === 'matchmaker' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <Users size={16} />
            Skill Matchmaker
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            <LayoutDashboard size={16} />
            My Dashboard
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`btn btn-sm ${activeTab === 'classroom' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', position: 'relative' }}
          >
            <Video size={16} />
            Peer Classroom
            {activeSession && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981'
              }} />
            )}
          </button>
        </nav>

        {/* Right Controls: User Switcher, Wallet Balance, Supabase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Quick Demo Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Demo Student:</span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchUser(e.target.value)}
              style={{
                background: 'rgba(31, 41, 55, 0.8)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '5px 8px',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.skills_teach[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Time-Credit Wallet Balance Widget */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            title="Time-Credit Token Wallet Balance. Teach 1 hour to earn 1 token!"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)'
            }}
          >
            <Coins size={16} color="#fbbf24" />
            <span style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.9rem' }}>
              {currentUser?.wallet_balance ?? 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: '500' }}>
              Credits
            </span>
          </div>

          {/* Supabase Config Pill */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            title="Configure Supabase Database Connection"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: supabaseConfig.isConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.06)',
              color: supabaseConfig.isConfigured ? '#34d399' : 'var(--text-muted)',
              border: `1px solid ${supabaseConfig.isConfigured ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
              cursor: 'pointer'
            }}
          >
            <Database size={13} color={supabaseConfig.isConfigured ? '#34d399' : '#9ca3af'} />
            {supabaseConfig.isConfigured ? 'Supabase Connected' : 'Supabase Setup'}
          </button>

          {/* User Avatar */}
          {currentUser && (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary)',
                boxShadow: '0 0 10px rgba(99,102,241,0.4)'
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}
