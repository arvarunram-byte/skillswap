import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
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
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null);
  
  // Persist activeSession in localStorage and sync with server
  const [activeSession, setActiveSessionState] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const setActiveSession = useCallback((sess) => {
    setActiveSessionState(sess);
    if (sess) {
      localStorage.setItem('skillswap_active_session', JSON.stringify(sess));
    } else {
      localStorage.removeItem('skillswap_active_session');
    }
  }, []);

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('matchmaker');
  const [notification, setNotification] = useState(null);

  // Load profiles from the server
  const refreshData = useCallback(async () => {
    const users = await api.getProfiles();
    setProfiles(users);
    const txs = await db.getTransactions();
    setTransactions(txs);
  }, []);

  // Sync active session from server on startup/login
  useEffect(() => {
    if (currentUser?.id) {
      api.getActiveSession(currentUser.id).then(sess => {
        if (sess) {
          setActiveSession(sess);
        }
      });
    }
  }, [currentUser?.id, setActiveSession]);

  // Socket and Presence lifecycle (with resilient reconnect support)
  useEffect(() => {
    refreshData();
    const socket = getSocket();

    const registerPresence = () => {
      if (currentUser) {
        socket.emit('register-presence', currentUser);
      }
    };

    registerPresence();
    socket.on('connect', registerPresence);

    // 1. Presence Updates
    socket.on('online-presence-update', ({ onlineUserIds }) => {
      setOnlineUserIds(onlineUserIds || []);
    });

    // 2. Incoming Session Request Notification
    socket.on('incoming-session-request', (reqData) => {
      console.log('🔔 Received incoming session request:', reqData);
      setIncomingRequest(reqData);
    });

    // 3. Request Status Listeners
    socket.on('session-request-sent', ({ topic }) => {
      showNotification(`🔔 Session request sent! Waiting for teacher to accept...`, 'info');
    });

    socket.on('session-request-error', ({ message }) => {
      showNotification(message, 'warning');
    });

    socket.on('session-declined', ({ byUserName, topic }) => {
      showNotification(`${byUserName} is currently unable to teach ${topic}.`, 'warning');
    });

    // 4. Session Start Broadcast (when teacher accepts or direct start)
    socket.on('session-accepted-and-start', (sessionData) => {
      console.log('🚀 Both users starting session:', sessionData);
      setIncomingRequest(null);
      setActiveSession(sessionData);
      setActiveTab('classroom');
      showNotification(`Session on ${sessionData.topic} started! Connecting WebRTC video...`, 'success');
    });

    // 5. Token Balance Broadcast
    socket.on('token-balance-updated', () => {
      refreshData();
    });

    return () => {
      socket.off('connect', registerPresence);
      socket.off('online-presence-update');
      socket.off('incoming-session-request');
      socket.off('session-request-sent');
      socket.off('session-request-error');
      socket.off('session-declined');
      socket.off('session-accepted-and-start');
      socket.off('token-balance-updated');
    };
  }, [currentUser, refreshData, setActiveSession]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Real User Registration
  const register = async (userData) => {
    const newProfile = await api.register(userData);
    setCurrentUser(newProfile);
    localStorage.setItem('skillswap_current_user', JSON.stringify(newProfile));
    
    // Register presence immediately on socket
    const socket = getSocket();
    socket.emit('register-presence', newProfile);

    await refreshData();
    showNotification(`🎉 Registration successful! 1 Free Welcome Token added!`, 'success');
    return newProfile;
  };

  // Real User Login
  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      setCurrentUser(res.profile);
      localStorage.setItem('skillswap_current_user', JSON.stringify(res.profile));

      const socket = getSocket();
      socket.emit('register-presence', res.profile);

      await refreshData();
      showNotification(`Welcome back, ${res.profile.full_name}!`, 'success');
      return true;
    } else {
      showNotification(res.message, 'danger');
      return false;
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    setActiveSession(null);
    setIncomingRequest(null);
    localStorage.removeItem('skillswap_current_user');
    showNotification('Logged out successfully.', 'info');
  };

  // Request a session with peer (triggers live notification on their screen!)
  const requestSession = (peer, topic, role = 'learner') => {
    if (!currentUser) {
      showNotification('Please register or log in first.', 'warning');
      return false;
    }

    if (currentUser.wallet_balance < 1 && role === 'learner') {
      showNotification(`Insufficient Time-Credits! You need 1 Time-Credit Token to learn. Teach a peer first!`, 'danger');
      return false;
    }

    const socket = getSocket();
    socket.emit('request-session', {
      fromUser: currentUser,
      toUserId: peer.id,
      topic: topic || peer.skills_teach[0],
      role
    });

    showNotification(`Sent 1-on-1 session request to ${peer.full_name}...`, 'info');
    return true;
  };

  // Direct start instant session
  const startDirectSession = (peer, topic) => {
    if (!currentUser) {
      showNotification('Please register or log in first.', 'warning');
      return false;
    }
    const socket = getSocket();
    socket.emit('start-direct-session', {
      fromUser: currentUser,
      toUser: peer,
      topic: topic || peer.skills_teach?.[0] || 'Peer Learning Session'
    });
    showNotification(`Connecting directly with ${peer.full_name}...`, 'info');
    return true;
  };

  const startSession = (partner, topic, role = 'learner') => {
    return requestSession(partner, topic, role);
  };

  // Teacher Accepts Request
  const acceptSessionRequest = () => {
    if (!incomingRequest || !currentUser) return;
    const socket = getSocket();
    socket.emit('respond-session-request', {
      requestId: incomingRequest.requestId,
      accepted: true,
      fromUser: incomingRequest.fromUser,
      toUser: currentUser,
      topic: incomingRequest.topic
    });
    setIncomingRequest(null);
  };

  // Teacher Declines Request
  const declineSessionRequest = () => {
    if (!incomingRequest || !currentUser) return;
    const socket = getSocket();
    socket.emit('respond-session-request', {
      requestId: incomingRequest.requestId,
      accepted: false,
      fromUser: incomingRequest.fromUser,
      toUser: currentUser,
      topic: incomingRequest.topic
    });
    setIncomingRequest(null);
    showNotification('Declined session request.', 'info');
  };

  const triggerEndSession = () => {
    if (!activeSession) return;
    setIsQuizOpen(true);
  };

  // Settle Tokens upon passing Quiz
  const completeQuizAndSettleTokens = async (scorePercent) => {
    if (!activeSession) return { success: false };

    const isPassed = scorePercent >= 60;

    if (isPassed) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      await api.transferToken(
        activeSession.learner.id,
        activeSession.teacher.id,
        activeSession.topic
      );

      await api.endSession(activeSession.roomId, activeSession.learner.id);
      await refreshData();

      showNotification(`🎉 Verification PASSED! 1 Time-Credit Token transferred from ${activeSession.learner.full_name} to ${activeSession.teacher.full_name}!`, 'success');

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

  // Update Skills
  const updateSkills = async (teachSkills, learnSkills) => {
    if (!currentUser) return;
    await api.updateSkills(currentUser.id, teachSkills, learnSkills);
    const updated = {
      ...currentUser,
      skills_teach: teachSkills,
      skills_learn: learnSkills
    };
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
        onlineUserIds,
        incomingRequest,
        acceptSessionRequest,
        declineSessionRequest,
        register,
        login,
        logout,
        activeSession,
        setActiveSession,
        startSession,
        startDirectSession,
        requestSession,
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
