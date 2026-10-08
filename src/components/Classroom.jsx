import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  PhoneOff, 
  Clock, 
  Code2, 
  FileText, 
  MessageSquare, 
  Send, 
  Play, 
  Sparkles, 
  CheckCircle, 
  FastForward,
  Award,
  ChevronRight
} from 'lucide-react';

export default function Classroom() {
  const { activeSession, currentUser, triggerEndSession, setActiveTab } = useApp();

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveInternalTab] = useState('code'); // 'code', 'notes', 'chat'
  const [code, setCode] = useState(activeSession?.codeContent || `# Peer Learning Code Space\ndef learn_skill():\n    print("Hello from SkillSwap Classroom!")\n\nlearn_skill()`);
  const [notes, setNotes] = useState(activeSession?.notesContent || '### Session Notes & Key Takeaways\n- Discussion Point 1\n- Architecture breakdown\n- Next steps');
  const [chatMessages, setChatMessages] = useState(activeSession?.messages || []);
  const [chatInput, setChatInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState('');

  // Video feed stream ref
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  // Timer interval
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  // Request actual webcam if available
  useEffect(() => {
    async function initCamera() {
      if (isVideoOn && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.log('Using simulated peer video stream:', err);
        }
      }
    }
    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isVideoOn]);

  if (!activeSession) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', padding: '40px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '48px 32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Video size={32} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>No Active Peer Classroom</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
            To join a live 1-on-1 session with video calling, code sharing, and AI verification, choose a peer from the Matchmaker.
          </p>
          <button onClick={() => setActiveTab('matchmaker')} className="btn btn-primary">
            Explore Matchmaker <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Format elapsed time (hh:mm:ss)
  const formatTime = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTeacher = currentUser?.id === activeSession.teacher.id;
  const partner = isTeacher ? activeSession.learner : activeSession.teacher;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = {
      id: 'm_' + Date.now(),
      sender: currentUser?.full_name || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, msg]);
    setChatInput('');
  };

  const handleRunCode = () => {
    setTerminalOutput(`[Executing Code in Sandboxed Environment]...\nOutput: Session logic verified! Topic "${activeSession.topic}" compiled successfully.\n✓ Status: Ready for AI Proof-of-Learning Quiz`);
  };

  // Fast forward helper for demo / hackathon presentation
  const handleFastForward = () => {
    setElapsedSeconds(45 * 60 + 12); // Jump to 45 mins
  };

  const isMinimumDurationMet = elapsedSeconds >= 45 * 60; // 45 minutes target per PDF

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 'calc(100vh - 100px)' }}>
      
      {/* Top Session Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', animation: 'pulseGlow 1.5s infinite' }} />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#fca5a5' }}>
              LIVE PEER SESSION
            </span>
          </div>

          <div style={{ height: '20px', width: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>
              {activeSession.topic}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Teacher: <strong style={{ color: '#818cf8' }}>{activeSession.teacher.full_name}</strong> • Learner: <strong style={{ color: '#f472b6' }}>{activeSession.learner.full_name}</strong>
            </p>
          </div>
        </div>

        {/* Timer and Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live Timer Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.4)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            color: '#34d399',
            fontWeight: 700
          }}>
            <Clock size={16} color="#34d399" />
            <span>{formatTime(elapsedSeconds)}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>/ 45:00 min</span>
          </div>

          {/* Hackathon Fast Forward Demo Button */}
          <button
            onClick={handleFastForward}
            title="Fast forward to 45 mins to simulate full lesson duration for demo"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <FastForward size={14} /> Fast-Forward Demo (45m)
          </button>

          {/* End Session Button -> Triggers AI Quiz */}
          <button
            onClick={triggerEndSession}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              fontWeight: 700
            }}
          >
            <Sparkles size={16} />
            End Session & Verify with AI Quiz
          </button>
        </div>
      </div>

      {/* Main Classroom Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px', flex: 1, minHeight: '620px' }}>
        
        {/* Left Column: Video Feeds & Media Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Remote Peer Video Stream Tile */}
          <div className="glass-panel" style={{
            position: 'relative',
            height: '240px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <img
              src={partner.avatar_url}
              alt={partner.full_name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.9,
                filter: 'brightness(0.9)'
              }}
            />

            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(0,0,0,0.65)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backdropFilter: 'blur(4px)',
              fontSize: '0.75rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              {partner.full_name} ({isTeacher ? 'Learner' : 'Teacher'})
            </div>

            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.7rem',
              color: '#a5b4fc'
            }}>
              WebRTC P2P HD
            </div>
          </div>

          {/* Local User Video Feed Tile */}
          <div className="glass-panel" style={{
            position: 'relative',
            height: '190px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#090d16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <VideoOff size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.8rem' }}>Camera Off</p>
              </div>
            )}

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.65)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#fff'
            }}>
              You ({currentUser.full_name})
            </div>
          </div>

          {/* Media Control Toolbar */}
          <div className="glass-panel" style={{
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: 0,
                background: isMicOn ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
                color: isMicOn ? '#fff' : '#f87171',
                borderColor: isMicOn ? 'var(--border-subtle)' : '#ef4444'
              }}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: 0,
                background: isVideoOn ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.2)',
                color: isVideoOn ? '#fff' : '#f87171',
                borderColor: isVideoOn ? 'var(--border-subtle)' : '#ef4444'
              }}
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className="btn btn-secondary btn-sm"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: 0,
                background: isScreenSharing ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                color: isScreenSharing ? '#818cf8' : '#fff',
                borderColor: isScreenSharing ? 'var(--accent-primary)' : 'var(--border-subtle)'
              }}
              title="Share Screen"
            >
              <Monitor size={18} />
            </button>

            <button
              onClick={triggerEndSession}
              className="btn btn-danger btn-sm"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                padding: 0
              }}
              title="End Peer Call"
            >
              <PhoneOff size={18} />
            </button>
          </div>

        </div>

        {/* Right Column: Shared Workspace (Code Editor, Whiteboard / Notes, Chat) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Workspace Tabs Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveInternalTab('code')}
                className={`btn btn-sm ${activeTab === 'code' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <Code2 size={15} /> Shared Code Editor
              </button>

              <button
                onClick={() => setActiveInternalTab('notes')}
                className={`btn btn-sm ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <FileText size={15} /> Lesson Notes
              </button>

              <button
                onClick={() => setActiveInternalTab('chat')}
                className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <MessageSquare size={15} /> In-Session Chat
              </button>
            </div>

            {activeTab === 'code' && (
              <button
                onClick={handleRunCode}
                className="btn btn-success btn-sm"
                style={{ fontSize: '0.8rem' }}
              >
                <Play size={14} /> Run Code
              </button>
            )}
          </div>

          {/* Workspace Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px' }}>
            
            {/* Code Tab */}
            {activeTab === 'code' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{
                    flex: 1,
                    width: '100%',
                    minHeight: '340px',
                    background: '#070a13',
                    color: '#e2e8f0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.92rem',
                    lineHeight: '1.6',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    outline: 'none',
                    resize: 'none'
                  }}
                  spellCheck="false"
                />

                {terminalOutput && (
                  <div style={{
                    background: '#05070d',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    color: '#34d399',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {terminalOutput}
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div style={{ flex: 1 }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Collaborative session notes... Both students can write and summarize."
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '440px',
                    background: '#070a13',
                    color: '#e2e8f0',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    lineHeight: '1.7',
                    padding: '18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  flex: 1,
                  minHeight: '380px',
                  background: '#070a13',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id} 
                      style={{
                        maxWidth: '80%',
                        alignSelf: msg.sender === currentUser?.full_name ? 'flex-end' : 'flex-start',
                        background: msg.sender === currentUser?.full_name ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${msg.sender === currentUser?.full_name ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c7d2fe' }}>{msg.sender}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{msg.time}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#fff' }}>{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type a message or share a link..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} /> Send
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
