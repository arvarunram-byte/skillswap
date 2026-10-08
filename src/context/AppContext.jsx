import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, getSupabaseConfig } from '../lib/supabase';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('matchmaker'); // 'dashboard', 'matchmaker', 'classroom'
  const [notification, setNotification] = useState(null);

  // Load profiles on startup
  useEffect(() => {
    async function loadData() {
      const users = await db.getProfiles();
      setProfiles(users);
      if (users.length > 0 && !currentUser) {
        // Default to first user (Alex Chen)
        setCurrentUser(users[0]);
      }
      const txs = await db.getTransactions();
      setTransactions(txs);
    }
    loadData();
  }, []);

  // Update current user when profiles change
  useEffect(() => {
    if (currentUser) {
      const fresh = profiles.find(p => p.id === currentUser.id);
      if (fresh) {
        setCurrentUser(fresh);
      }
    }
  }, [profiles]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Switch between demo student accounts for live hackathon demonstration
  const switchUser = (userId) => {
    const selected = profiles.find(p => p.id === userId);
    if (selected) {
      setCurrentUser(selected);
      showNotification(`Switched active profile to ${selected.full_name} (${selected.wallet_balance} Time-Credits)`, 'info');
    }
  };

  // Launch live peer session
  const startSession = (partner, topic, role = 'learner') => {
    const teacher = role === 'teacher' ? currentUser : partner;
    const learner = role === 'learner' ? currentUser : partner;

    if (learner.wallet_balance < 1) {
      showNotification(`Insufficient Time-Credits! ${learner.full_name} needs at least 1 Time-Credit Token to join a session. Teach a peer first to earn credits!`, 'danger');
      return false;
    }

    const session = {
      id: 'sess_' + Date.now(),
      teacher,
      learner,
      topic: topic || (role === 'learner' ? partner.skills_teach[0] : currentUser.skills_teach[0]),
      startedAt: Date.now(),
      elapsedSeconds: 0,
      codeContent: `# Peer Collaboration Room - ${topic}\n# Topic: ${topic}\n\ndef solution():\n    print("Welcome to SkillSwap Live Peer Session!")\n\nsolution()`,
      notesContent: `### Lesson Outline for ${topic}\n- Key Concept 1\n- Real-world application\n- Hands-on exercise`,
      messages: [
        {
          id: 'm1',
          sender: teacher.full_name,
          text: `Hi ${learner.full_name}! Excited for our 1-on-1 session on ${topic}. Let's dive in!`,
          time: 'Just now'
        }
      ]
    };

    setActiveSession(session);
    setActiveTab('classroom');
    showNotification(`Peer session started for ${topic}! Video & collaborative editor initialized.`, 'success');
    return true;
  };

  // Trigger End of Session -> Launches AI Proof-of-Learning Quiz
  const triggerEndSession = () => {
    if (!activeSession) return;
    setIsQuizOpen(true);
  };

  // Complete Quiz & Settle Time-Credit Tokens
  const completeQuizAndSettleTokens = async (scorePercent) => {
    if (!activeSession) return { success: false };

    const isPassed = scorePercent >= 60; // 60% requirement per PDF

    if (isPassed) {
      // Confetti explosion
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Settle Time-Credit token
      const result = await db.transferToken({
        fromUserId: activeSession.learner.id,
        toUserId: activeSession.teacher.id,
        sessionId: activeSession.id,
        topic: activeSession.topic
      });

      // Refresh profiles & transactions
      const updatedProfiles = await db.getProfiles();
      setProfiles(updatedProfiles);
      const updatedTxs = await db.getTransactions();
      setTransactions(updatedTxs);

      showNotification(`🎉 Verification PASSED! 1 Time-Credit Token transferred from ${activeSession.learner.full_name} to ${activeSession.teacher.full_name}!`, 'success');

      // Close session
      setActiveSession(null);
      setIsQuizOpen(false);
      setActiveTab('dashboard');

      return { success: true, passed: true };
    } else {
      // Fail condition per PDF
      showNotification(`Quiz score below 60%. Token placed ON-HOLD in escrow for revision.`, 'warning');
      setIsQuizOpen(false);
      return { success: true, passed: false };
    }
  };

  // Update profile skills
  const updateSkills = async (teachSkills, learnSkills) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      skills_teach: teachSkills,
      skills_learn: learnSkills
    };
    await db.updateProfile(updated);
    const refreshed = await db.getProfiles();
    setProfiles(refreshed);
    showNotification('Skills Matrix successfully updated!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        currentUser,
        setCurrentUser,
        switchUser,
        activeSession,
        setActiveSession,
        startSession,
        triggerEndSession,
        isQuizOpen,
        setIsQuizOpen,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        transactions,
        activeTab,
        setActiveTab,
        completeQuizAndSettleTokens,
        updateSkills,
        notification,
        showNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
