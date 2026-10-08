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
  ExternalLink
} from 'lucide-react';

export default function Matchmaker() {
  const { profiles, currentUser, startSession, showNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  // Filter out self: only REAL registered other students
  const peers = profiles.filter(p => p.id !== currentUser.id && p.email !== currentUser.email);

  // Calculate Match Compatibility & Match Type based on real skills
  const peerMatches = peers.map(peer => {
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
  }).sort((a, b) => b.score - a.score);

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
            </div>

            <h1 style={{ fontSize: '2.2rem', lineHeight: '1.2', marginBottom: '12px', background: 'linear-gradient(135deg, #ffffff 40%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Learn with Time, Not Money.
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
              Welcome, <strong style={{ color: '#fff' }}>{currentUser.full_name}</strong>! 
              Connect with fellow students through real-time cross-skill pairing. When you teach 1 hour, you earn <strong>1 Time-Credit</strong>. Spend that credit to learn high-demand skills from certified peers!
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
      {peers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search registered peers by skill or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '44px' }}
            />
          </div>
        </div>
      )}

      {/* Real Peer Matches Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--accent-primary)" />
            Real Registered Students ({peers.length})
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Live Database Sync
          </span>
        </div>

        {/* Empty State: If no other real students registered yet */}
        {peers.length === 0 ? (
          <div className="glass-panel" style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={32} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
              You are the first student registered in this database!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 24px', lineHeight: '1.6' }}>
              Since all simulations have been removed, only real accounts appear here. To test real-time matching and the live WebRTC classroom:
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              maxWidth: '560px',
              margin: '0 auto 24px',
              textAlign: 'left',
              fontSize: '0.88rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ color: '#e2e8f0', marginBottom: '8px' }}>
                👉 <strong>Step 1:</strong> Open an <strong>Incognito Window</strong> or another browser (Edge/Chrome).
              </p>
              <p style={{ color: '#e2e8f0', marginBottom: '8px' }}>
                👉 <strong>Step 2:</strong> Go to <code style={{ color: '#38bdf8' }}>http://localhost:3000</code> and register a 2nd student account.
              </p>
              <p style={{ color: '#e2e8f0' }}>
                👉 <strong>Step 3:</strong> That account will immediately appear here in <strong>real time</strong> without even refreshing the page!
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin);
                showNotification('Platform URL copied to clipboard! Open in new tab or incognito to register 2nd student.', 'info');
              }}
              className="btn btn-primary"
            >
              <Copy size={16} /> Copy URL to Test in Incognito Tab
            </button>
          </div>
        ) : (
          /* Real Matches Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {filteredMatches.map(({ peer, score, matchType, isTwoWayCrossMatch, matchedTeach, matchedLearn }) => (
              <div 
                key={peer.id} 
                className="glass-panel" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: isTwoWayCrossMatch ? '1.5px solid rgba(168, 85, 247, 0.45)' : '1px solid var(--border-subtle)',
                  background: isTwoWayCrossMatch ? 'linear-gradient(145deg, rgba(30, 27, 75, 0.4) 0%, rgba(17, 24, 39, 0.75) 100%)' : 'var(--bg-card)'
                }}
              >
                <div>
                  {/* Header: Avatar, Name, Match Score */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={peer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(peer.full_name)}`}
                        alt={peer.full_name}
                        style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>{peer.full_name}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {peer.institution || 'University'}
                        </p>
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

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => startSession(peer, matchedTeach, 'learner')}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    <Video size={16} />
                    Learn {matchedTeach} (1 Credit)
                  </button>

                  <button
                    onClick={() => startSession(peer, matchedLearn, 'teacher')}
                    className="btn btn-secondary"
                    style={{ padding: '10px' }}
                  >
                    <GraduationCap size={16} />
                    Teach
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
