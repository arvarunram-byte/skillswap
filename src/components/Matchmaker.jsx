import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Sparkles, 
  Search, 
  Video, 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  Coins, 
  TrendingUp, 
  UserPlus,
  Copy,
  Bell,
  Wifi
} from 'lucide-react';

export default function Matchmaker() {
  const { profiles, currentUser, requestSession, startDirectSession, onlineUserIds, showNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  // Filter out self: only registered other students
  const peers = profiles.filter(p => p.id !== currentUser.id && p.email !== currentUser.email);

  // Calculate Match Compatibility & Match Type based on real skills
  const peerMatches = peers.map(peer => {
    const isOnline = onlineUserIds.includes(peer.id);

    const peerTeachesWhatIWant = (peer.skills_teach || []).filter(st => 
      (currentUser.skills_learn || []).some(sl => sl.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(sl.toLowerCase()))
    );

    const ITeachWhatPeerWants = (currentUser.skills_teach || []).filter(st => 
      (peer.skills_learn || []).some(sl => sl.toLowerCase().includes(st.toLowerCase()) || st.toLowerCase().includes(sl.toLowerCase()))
    );

    const isTwoWayCrossMatch = peerTeachesWhatIWant.length > 0 && ITeachWhatPeerWants.length > 0;
    const isOneWayTeachMatch = peerTeachesWhatIWant.length > 0;
    const isOneWayLearnMatch = ITeachWhatPeerWants.length > 0;

    let score = 70;
    let matchType = 'Community Peer';

    if (isTwoWayCrossMatch) {
      score = 98;
      matchType = '⚡ 2-Way Perfect Cross Match';
    } else if (isOneWayTeachMatch) {
      score = 88;
      matchType = 'Direct Mentor Match';
    } else if (isOneWayLearnMatch) {
      score = 82;
      matchType = 'Eager Learner Match';
    }

    return {
      peer,
      isOnline,
      score,
      matchType,
      isTwoWayCrossMatch,
      peerTeachesWhatIWant,
      ITeachWhatPeerWants,
      matchedTeach: peerTeachesWhatIWant[0] || peer.skills_teach?.[0] || 'Skill',
      matchedLearn: ITeachWhatPeerWants[0] || currentUser.skills_teach?.[0] || 'Skill'
    };
  });

  const filteredMatches = peerMatches.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.peer.full_name?.toLowerCase().includes(query) ||
      (item.peer.skills_teach || []).some(s => s.toLowerCase().includes(query)) ||
      (item.peer.skills_learn || []).some(s => s.toLowerCase().includes(query))
    );
  }).sort((a, b) => (b.isOnline ? 100 : 0) + b.score - ((a.isOnline ? 100 : 0) + a.score));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Hero & Intro Section */}
      <div className="glass-panel" style={{
        padding: '36px',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: 'var(--accent-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '750px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-teach" style={{ background: 'rgba(99,102,241,0.25)', color: '#c7d2fe' }}>
                <Sparkles size={13} /> Real-Time AI Skill Matching Engine
              </span>
              <span className="badge badge-token">
                <Coins size={13} /> Time-Bank Barter Model
              </span>
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                {onlineUserIds.length > 0 ? `${onlineUserIds.length} Active in Network` : '1 Active'}
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', lineHeight: '1.2', marginBottom: '12px', background: 'linear-gradient(135deg, #ffffff 40%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Learn with Time, Not Money.
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              Welcome, <strong style={{ color: '#fff' }}>{currentUser.full_name}</strong>! 
              Connect with fellow students through real-time cross-skill pairing. When you request a session, the teacher receives an instant real-time notification to accept!
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            textAlign: 'center',
            minWidth: '220px'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Available Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
              {currentUser.wallet_balance} Credits
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> 1 Credit = 1 Hour Lesson
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search peers by skill (Python, UI/UX, Figma, React, Public Speaking)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '44px' }}
          />
        </div>
      </div>

      {/* Real Peer Matches Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-primary)" />
            Available Peer Students ({filteredMatches.length})
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Live Presence & Skill Sync
          </span>
        </div>

        {/* Real Matches Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredMatches.map(({ peer, isOnline, score, matchType, isTwoWayCrossMatch, matchedTeach, matchedLearn }) => (
            <div 
              key={peer.id} 
              className="glass-panel" 
              style={{ 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: isTwoWayCrossMatch ? '1.5px solid rgba(168, 85, 247, 0.45)' : isOnline ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                background: isTwoWayCrossMatch ? 'linear-gradient(145deg, rgba(30, 27, 75, 0.4) 0%, rgba(17, 24, 39, 0.75) 100%)' : 'var(--bg-card)'
              }}
            >
              <div>
                {/* Header: Avatar, Name, Match Score & Online Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={peer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(peer.full_name)}`}
                        alt={peer.full_name}
                        style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                      />
                      {/* Live Online Dot */}
                      <span style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isOnline ? '#10b981' : '#6b7280',
                        border: '2px solid #0b0f19',
                        boxShadow: isOnline ? '0 0 8px #10b981' : 'none'
                      }} />
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{peer.full_name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: isOnline ? '#34d399' : 'var(--text-dim)', fontWeight: 600 }}>
                          {isOnline ? '🟢 Online Now' : '⚪ Offline'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{peer.institution || 'University'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: isTwoWayCrossMatch ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      border: `1px solid ${isTwoWayCrossMatch ? 'rgba(168, 85, 247, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
                      color: isTwoWayCrossMatch ? '#d8b4fe' : '#a5b4fc',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      <Sparkles size={12} /> {score}% Match
                    </div>
                  </div>
                </div>

                {/* Match Type Badge */}
                <div style={{ marginBottom: '16px' }}>
                  <span className={isTwoWayCrossMatch ? 'badge badge-token pulse-glow' : 'badge badge-teach'}>
                    {matchType}
                  </span>
                </div>

                {/* Skills Breakdown */}
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <GraduationCap size={13} color="#818cf8" />
                      They Teach:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(peer.skills_teach || []).map(sk => {
                        const isMatch = (currentUser.skills_learn || []).some(l => l.toLowerCase() === sk.toLowerCase());
                        return (
                          <span 
                            key={sk} 
                            className="badge badge-teach" 
                            style={{ 
                              background: isMatch ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)',
                              borderColor: isMatch ? 'var(--accent-primary)' : 'var(--border-subtle)',
                              fontWeight: isMatch ? 700 : 500
                            }}
                          >
                            {sk} {isMatch && '✨ Match'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <BookOpen size={13} color="#f472b6" />
                      They Want to Learn:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {(peer.skills_learn || []).map(sk => {
                        const isMatch = (currentUser.skills_teach || []).some(t => t.toLowerCase() === sk.toLowerCase());
                        return (
                          <span 
                            key={sk} 
                            className="badge badge-learn" 
                            style={{ 
                              background: isMatch ? 'rgba(236,72,153,0.35)' : 'rgba(255,255,255,0.05)',
                              borderColor: isMatch ? '#ec4899' : 'var(--border-subtle)',
                              fontWeight: isMatch ? 700 : 500
                            }}
                          >
                            {sk} {isMatch && '🤝 Match'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  "{peer.bio || 'Ready for peer skill exchange!'}"
                </p>
              </div>

              {/* Real Session Request Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => requestSession(peer, matchedTeach, 'learner')}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
                    title="Sends live notification to this student to start a 1-on-1 session"
                  >
                    <Bell size={16} />
                    Request to Learn {matchedTeach} (1 Credit)
                  </button>

                  <button
                    onClick={() => requestSession(peer, matchedLearn, 'teacher')}
                    className="btn btn-secondary"
                    style={{ padding: '10px' }}
                    title="Offer to teach this student"
                  >
                    <GraduationCap size={16} />
                    Teach
                  </button>
                </div>

                <button
                  onClick={() => startDirectSession(peer, matchedTeach)}
                  className="btn btn-sm"
                  style={{
                    background: isOnline ? 'rgba(16, 185, 129, 0.18)' : 'rgba(99, 102, 241, 0.15)',
                    border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.3)'}`,
                    color: isOnline ? '#34d399' : '#a5b4fc',
                    fontWeight: 700,
                    width: '100%',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  title="Directly launch 1-on-1 WebRTC Video Classroom with this peer"
                >
                  <Video size={14} />
                  ⚡ Instant Connect Live Classroom ({isOnline ? 'Peer Online' : 'Connect'})
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
