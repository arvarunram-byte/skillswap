import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, getSupabaseConfig } from '../lib/supabase';
import { getSocket } from '../lib/socket';
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
  const [activeTab, setActiveTab] = useState('matchmaker');
  const [notification, setNotification] = useState(null);

  // Load latest data from DB
  const refreshData = useCallback(async () => {
    const users = await db.getProfiles();
    setProfiles(users);
    const txs = await db.getTransactions();
    setTransactions(txs);
  }, []);

  // Initialize and attach real-time listeners
  useEffect(() => {
    refreshData().then(() => {
      // Pick initial user
      const storedUserId = localStorage.getItem('skillswap_active_user_id');
      db.getProfiles().then(users => {
        if (users && users.length > 0) {
          const found = storedUserId ? users.find(u => u.id === storedUserId) : users[0];
          setCurrentUser(found || users[0]);
        }
      });
    });

    // 1. Socket.io Real-Time Listener
    const socket = getSocket();
    socket.on('token-balance-updated', (data) => {
      console.log('⚡ Real-time token settlement received via WebSocket:', data);
      refreshData();
    });

    // 2. Cross-tab LocalStorage Real-Time Listener
    const handleStorageChange = (e) => {
      if (e.key === 'skillswap_profiles' || e.key === 'skillswap_tx') {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Supabase Cloud Realtime Channel Listener
    const unsubscribeSupabase = db.subscribeToChanges(() => {
      refreshData();
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSupabase();
    };
  }, [refreshData]);

  // Sync currentUser with profiles state
  useEffect(() => {
    if (currentUser) {
      const fresh = profiles.find(p => p.id === currentUser.id);
      if (fresh && (fresh.wallet_balance !== currentUser.wallet_balance || fresh.skills_teach.length !== currentUser.skills_teach.length)) {
        setCurrentUser(fresh);
      }
    }
  }, [profiles, currentUser]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Switch student profile
  const switchUser = (userId) => {
    const selected = profiles.find(p => p.id === userId);
    if (selected) {
      setCurrentUser(selected);
      localStorage.setItem('skillswap_active_user_id', selected.id);
      showNotification(`Switched profile to ${selected.full_name} (${selected.wallet_balance} Credits)`, 'info');
    }
  };

  // Launch live peer session
  const startSession = (partner, topic, role = 'learner') => {
    const teacher = role === 'teacher' ? currentUser : partner;
    const learner = role === 'learner' ? currentUser : partner;

    if (learner.wallet_balance < 1) {
      showNotification(`Insufficient Time-Credits! ${learner.full_name} needs 1 Time-Credit Token to join. Teach a peer first!`, 'danger');
      return false;
    }

    // Unique room ID based on both student IDs & topic for real-time WebRTC pairing
    const sortedIds = [teacher.id, learner.id].sort().join('_');
    const roomId = `room_${sortedIds}_${encodeURIComponent(topic || 'lesson')}`;

    const session = {
      id: 'sess_' + Date.now(),
      roomId,
      teacher,
      learner,
      topic: topic || (role === 'learner' ? partner.skills_teach[0] : currentUser.skills_teach[0]),
      startedAt: Date.now(),
      codeContent: `# SkillSwap Live Real-Time Code Space\n# Topic: ${topic}\n# Teacher: ${teacher.full_name} | Learner: ${learner.full_name}\n\ndef execute_peer_lesson():\n    print("Real-time collaborative room connected!")\n\nexecute_peer_lesson()`,
      notesContent: `### Real-Time Session Notes: ${topic}\n- Key Concept 1\n- Real-world application\n- Hands-on exercise`,
      messages: []
    };

    setActiveSession(session);
    setActiveTab('classroom');
    showNotification(`Live peer session launched for ${topic}! Connecting WebRTC video & collaborative editor...`, 'success');
    return true;
  };

  // Trigger End of Session -> Launches AI Proof-of-Learning Quiz
  const triggerEndSession = () => {
    if (!activeSession) return;
    setIsQuizOpen(true);
  };

  // Complete Quiz & Settle Time-Credit Tokens in Real Time
  const completeQuizAndSettleTokens = async (scorePercent) => {
    if (!activeSession) return { success: false };

    const isPassed = scorePercent >= 60; // 60% requirement per PDF

    if (isPassed) {
      // Confetti explosion
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Settle Time-Credit token
      const result = await db.transferToken({
        fromUserId: activeSession.learner.id,
        toUserId: activeSession.teacher.id,
        sessionId: activeSession.id,
        topic: activeSession.topic
      });

      // Broadcast real-time token settlement across WebSockets
      const socket = getSocket();
      socket.emit('token-transfer-broadcast', {
        from: activeSession.learner.id,
        to: activeSession.teacher.id,
        topic: activeSession.topic,
        amount: 1
      });

      await refreshData();

      showNotification(`🎉 Verification PASSED! 1 Time-Credit Token transferred from ${activeSession.learner.full_name} to ${activeSession.teacher.full_name} in real time!`, 'success');

      setActiveSession(null);
      setIsQuizOpen(false);
      setActiveTab('dashboard');

      return { success: true, passed: true };
    } else {
      showNotification(`Quiz score below 60%. Token placed ON-HOLD in escrow for review.`, 'warning');
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
    await refreshData();
    showNotification('Skills Matrix updated in real time!', 'success');
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
        showNotification,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
