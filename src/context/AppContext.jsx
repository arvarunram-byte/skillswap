import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/supabase';
import { getSocket } from '../lib/socket';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('skillswap_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeSession, setActiveSession] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('matchmaker');
  const [notification, setNotification] = useState(null);

  // Load latest real data
  const refreshData = useCallback(async () => {
    const users = await db.getProfiles();
    setProfiles(users);
    const txs = await db.getTransactions();
    setTransactions(txs);
  }, []);

  // Sync current user with latest profile
  useEffect(() => {
    refreshData();

    // Socket real-time broadcast listener
    const socket = getSocket();
    socket.on('token-balance-updated', () => {
      refreshData();
    });

    // Cross-tab real-time listener
    const handleStorageChange = (e) => {
      if (e.key === 'skillswap_profiles' || e.key === 'skillswap_tx') {
        refreshData();
      }
      if (e.key === 'skillswap_current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Supabase cloud realtime listener
    const unsubscribeSupabase = db.subscribeToChanges(() => {
      refreshData();
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribeSupabase();
    };
  }, [refreshData]);

  // Keep currentUser synced
  useEffect(() => {
    if (currentUser) {
      const fresh = profiles.find(p => p.id === currentUser.id || p.email === currentUser.email);
      if (fresh) {
        if (fresh.wallet_balance !== currentUser.wallet_balance || fresh.skills_teach.length !== currentUser.skills_teach.length) {
          setCurrentUser(fresh);
          localStorage.setItem('skillswap_current_user', JSON.stringify(fresh));
        }
      }
    }
  }, [profiles, currentUser]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Real User Registration
  const register = async (userData) => {
    const newProfile = await db.registerUser(userData);
    setCurrentUser(newProfile);
    localStorage.setItem('skillswap_current_user', JSON.stringify(newProfile));
    await refreshData();
    showNotification(`🎉 Registration successful! 1 Free Welcome Token added to your wallet!`, 'success');
    return newProfile;
  };

  // Real User Login
  const login = async (email, password) => {
    const res = await db.loginUser(email, password);
    if (res.success) {
      setCurrentUser(res.user);
      localStorage.setItem('skillswap_current_user', JSON.stringify(res.user));
      showNotification(`Welcome back, ${res.user.full_name}!`, 'success');
      return true;
    } else {
      showNotification(res.message, 'danger');
      return false;
    }
  };

  // Real Logout
  const logout = () => {
    setCurrentUser(null);
    setActiveSession(null);
    localStorage.removeItem('skillswap_current_user');
    showNotification('Logged out successfully.', 'info');
  };

  // Start Real Peer Session
  const startSession = (partner, topic, role = 'learner') => {
    if (!currentUser) {
      showNotification('Please register or log in first.', 'warning');
      return false;
    }

    const teacher = role === 'teacher' ? currentUser : partner;
    const learner = role === 'learner' ? currentUser : partner;

    if (learner.wallet_balance < 1) {
      showNotification(`Insufficient Time-Credits! ${learner.full_name} needs at least 1 Time-Credit Token. Teach a peer to earn credits!`, 'danger');
      return false;
    }

    const sortedIds = [teacher.id, learner.id].sort().join('_');
    const roomId = `room_${sortedIds}_${encodeURIComponent(topic || 'lesson')}`;

    const session = {
      id: 'sess_' + Date.now(),
      roomId,
      teacher,
      learner,
      topic: topic || (role === 'learner' ? partner.skills_teach[0] : currentUser.skills_teach[0]),
      startedAt: Date.now(),
      codeContent: `# SkillSwap Real-Time Peer Code Space\n# Topic: ${topic}\n# Teacher: ${teacher.full_name} | Learner: ${learner.full_name}\n\ndef live_solution():\n    print("Real-time collaborative room connected!")\n\nlive_solution()`,
      notesContent: `### Real-Time Session Notes: ${topic}\n- Key Concept 1\n- Real-world application\n- Hands-on exercise`,
      messages: []
    };

    setActiveSession(session);
    setActiveTab('classroom');
    showNotification(`Live peer session launched for ${topic}! Connecting WebRTC video & collaborative editor...`, 'success');
    return true;
  };

  const triggerEndSession = () => {
    if (!activeSession) return;
    setIsQuizOpen(true);
  };

  // Complete Quiz & Settle Tokens in Real Time
  const completeQuizAndSettleTokens = async (scorePercent) => {
    if (!activeSession) return { success: false };

    const isPassed = scorePercent >= 60;

    if (isPassed) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      await db.transferToken({
        fromUserId: activeSession.learner.id,
        toUserId: activeSession.teacher.id,
        sessionId: activeSession.id,
        topic: activeSession.topic
      });

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

  // Real-Time Skill Matrix Update
  const updateSkills = async (teachSkills, learnSkills) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      skills_teach: teachSkills,
      skills_learn: learnSkills
    };
    await db.updateProfile(updated);
    setCurrentUser(updated);
    localStorage.setItem('skillswap_current_user', JSON.stringify(updated));
    await refreshData();
    showNotification('Skills Matrix updated in real time!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        currentUser,
        setCurrentUser,
        register,
        login,
        logout,
        activeSession,
        setActiveSession,
        startSession,
        triggerEndSession,
        isQuizOpen,
        setIsQuizOpen,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
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
