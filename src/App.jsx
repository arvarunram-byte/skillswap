import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Matchmaker from './components/Matchmaker';
import Classroom from './components/Classroom';
import QuizModal from './components/QuizModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import AuthModal from './components/AuthModal';
import { GraduationCap, Database } from 'lucide-react';

function MainContent() {
  const { activeTab, notification, setIsAuthModalOpen, setIsSupabaseModalOpen } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 9999,
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' 
            : notification.type === 'danger'
            ? 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          fontSize: '0.92rem',
          fontWeight: 600,
          maxWidth: '420px',
          animation: 'fadeIn 0.25s ease'
        }}>
          {notification.message}
        </div>
      )}

      {/* Navigation */}
      <Navbar />

      {/* Main Tab Area */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'matchmaker' && <Matchmaker />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'classroom' && <Classroom />}
      </main>

      {/* Modals */}
      <QuizModal />
      <SupabaseConfigModal />
      <AuthModal />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(8, 12, 20, 0.95)',
        padding: '36px 24px',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>SkillSwap</span>
              <span className="badge badge-success">UN SDG 4 Aligned</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '520px' }}>
              Democratizing education through peer time-banking. Students exchange skills for free: 1 hour taught = 1 Time-Credit earned. Verified by Gemini AI Proof-of-Learning quizzes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <GraduationCap size={15} /> Join as Student
            </button>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Database size={15} /> Supabase Settings
            </button>
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '20px auto 0',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: 'var(--text-dim)'
        }}>
          <span>© 2026 SkillSwap Network. Built for Students Worldwide.</span>
          <span>Zero Tuition Fees • 100% Peer-to-Peer</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
