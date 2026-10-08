import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Coins, 
  Video, 
  Check, 
  X, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react';

export default function IncomingRequestModal() {
  const { incomingRequest, acceptSessionRequest, declineSessionRequest } = useApp();

  if (!incomingRequest) return null;

  const { fromUser, topic } = incomingRequest;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '32px',
        background: 'rgba(15, 23, 42, 0.98)',
        border: '2px solid #8b5cf6',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.45)',
        textAlign: 'center'
      }}>
        
        {/* Pulsing Bell Icon */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '2px solid #a78bfa',
          boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)'
        }} className="pulse-glow">
          <Bell size={34} color="#c4b5fd" />
        </div>

        <span className="badge badge-teach" style={{ marginBottom: '10px' }}>
          <Sparkles size={13} /> Live Peer Session Request
        </span>

        <h3 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '8px' }}>
          {fromUser?.full_name} wants to learn from you!
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          {fromUser?.institution || 'University Student'} has requested a 1-on-1 peer teaching session.
        </p>

        {/* Lesson Details Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Topic:
            </span>
            <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.95rem' }}>
              {topic}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              You Will Earn:
            </span>
            <span style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem' }}>
              <Coins size={16} /> +1.0 Time-Credit Token
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={declineSessionRequest}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '12px', borderColor: 'rgba(239,68,68,0.4)', color: '#f87171' }}
          >
            <X size={16} /> Decline
          </button>

          <button
            onClick={acceptSessionRequest}
            className="btn btn-primary"
            style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.45)' }}
          >
            <Check size={16} /> Accept & Start Class
          </button>
        </div>

      </div>
    </div>
  );
}
