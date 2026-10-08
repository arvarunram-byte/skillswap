import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const PROFILES_FILE = path.join(__dirname, 'data', 'profiles.json');

app.use(cors());
app.use(express.json());

// Helper to read profiles from server disk
function readProfiles() {
  try {
    if (fs.existsSync(PROFILES_FILE)) {
      const data = fs.readFileSync(PROFILES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading profiles.json:', err);
  }
  return [];
}

// Helper to save profiles to server disk
function saveProfiles(profiles) {
  try {
    const dir = path.dirname(PROFILES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing profiles.json:', err);
  }
}

// --- REST API ENDPOINTS ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'SkillSwap: AI-Powered Peer-to-Peer Time-Credit Skill Exchange Network',
    realtime: 'Active (WebSockets + WebRTC + Live Presence + Notifications)',
    onlineUsersCount: onlineUsers.size,
    time: new Date().toISOString()
  });
});

// 2. Get all registered profiles (shared across all devices & browsers)
app.get('/api/profiles', (req, res) => {
  const profiles = readProfiles();
  res.json(profiles);
});

// 3. Real User Registration
app.post('/api/register', (req, res) => {
  const { fullName, email, password, institution, teachSkills, learnSkills } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const profiles = readProfiles();
  const existing = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A student is already registered with this email' });
  }

  const newProfile = {
    id: 'usr_' + Date.now(),
    email: email.trim().toLowerCase(),
    username: email.split('@')[0].toLowerCase(),
    full_name: fullName.trim(),
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}&backgroundColor=6366f1,8b5cf6,ec4899`,
    bio: `Student at ${institution || 'University'}. Passionate about peer learning!`,
    institution: institution?.trim() || 'University',
    wallet_balance: 1.0, // 1 Free Welcome Token upon registration
    skills_teach: teachSkills && teachSkills.length ? teachSkills : ['Python'],
    skills_learn: learnSkills && learnSkills.length ? learnSkills : ['Web Design'],
    rating: 5.0,
    sessions_completed: 0,
    password: password || '',
    created_at: new Date().toISOString()
  };

  profiles.unshift(newProfile);
  saveProfiles(profiles);

  res.json({ success: true, profile: newProfile });
});

// 4. Real User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const profiles = readProfiles();
  const found = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
  if (found) {
    if (password && found.password && found.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    return res.json({ success: true, profile: found });
  }
  return res.status(404).json({ error: 'No student found with this email. Please register.' });
});

// 5. Update Skills
app.post('/api/update-skills', (req, res) => {
  const { userId, skillsTeach, skillsLearn } = req.body;
  const profiles = readProfiles();
  const idx = profiles.findIndex(p => p.id === userId);
  if (idx >= 0) {
    profiles[idx].skills_teach = skillsTeach;
    profiles[idx].skills_learn = skillsLearn;
    saveProfiles(profiles);
    return res.json({ success: true, profile: profiles[idx] });
  }
  res.status(404).json({ error: 'User not found' });
});

// 6. Transfer Token upon AI verification
app.post('/api/transfer-token', (req, res) => {
  const { fromUserId, toUserId, topic } = req.body;
  const profiles = readProfiles();
  const learner = profiles.find(p => p.id === fromUserId);
  const teacher = profiles.find(p => p.id === toUserId);

  if (learner && learner.wallet_balance >= 1) {
    learner.wallet_balance = Number((learner.wallet_balance - 1).toFixed(2));
    learner.sessions_completed = (learner.sessions_completed || 0) + 1;
  }
  if (teacher) {
    teacher.wallet_balance = Number(((teacher.wallet_balance || 0) + 1).toFixed(2));
    teacher.sessions_completed = (teacher.sessions_completed || 0) + 1;
  }

  saveProfiles(profiles);

  if (fromUserId) activeSessions.delete(fromUserId);
  if (toUserId) activeSessions.delete(toUserId);

  // Broadcast token update to all connected sockets in real time
  io.emit('token-balance-updated', {
    fromUserId,
    toUserId,
    topic,
    amount: 1
  });

  res.json({ success: true, learner, teacher });
});

// 7. Get Active Session for User
app.get('/api/active-session/:userId', (req, res) => {
  const session = activeSessions.get(req.params.userId) || null;
  res.json({ session });
});

// 8. End Active Session
app.post('/api/end-session', (req, res) => {
  const { roomId, userId } = req.body;
  if (roomId) {
    const sess = roomSessions.get(roomId);
    if (sess) {
      if (sess.teacher?.id) activeSessions.delete(sess.teacher.id);
      if (sess.learner?.id) activeSessions.delete(sess.learner.id);
      roomSessions.delete(roomId);
    }
  } else if (userId) {
    const sess = activeSessions.get(userId);
    if (sess) {
      if (sess.teacher?.id) activeSessions.delete(sess.teacher.id);
      if (sess.learner?.id) activeSessions.delete(sess.learner.id);
      if (sess.roomId) roomSessions.delete(sess.roomId);
    }
  }
  res.json({ success: true });
});

// 9. Dynamic Gemini AI Quiz Generation
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, apiKey: clientApiKey } = req.body;
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the AI Proof-of-Learning Engine for SkillSwap. A peer student just taught another student a real-time lesson on: "${topic}".
Generate exactly 3 high-quality multiple choice questions to verify the learner's comprehension.
Return STRICT JSON ONLY without markdown fences, in this exact format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Why correct"
  }
]`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          return res.json({ success: true, isRealAI: true, questions: parsed.slice(0, 3) });
        }
      }
    } catch (err) {
      console.error('Gemini Live API error:', err);
    }
  }

  // Fallback intelligent questions for topic
  res.json({
    success: true,
    isRealAI: false,
    questions: [
      {
        question: `What is the core architectural principle taught in this session on ${topic}?`,
        options: [
          `Fundamental mastery of concepts and practical implementation in ${topic}`,
          `Memorizing answers without hands-on verification`,
          `Relying purely on third-party tools without understanding logic`,
          `Skipping debugging and edge-case testing`
        ],
        answer: 0,
        explanation: `Foundational mastery and systematic thinking are key to ${topic}.`
      },
      {
        question: `During the live peer session on ${topic}, how was the solution constructed?`,
        options: [
          `By guessing without a problem breakdown`,
          `By deconstructing the problem into modular, testable components`,
          `By copying untested snippets`,
          `By skipping all validation steps`
        ],
        answer: 1,
        explanation: `Modular decomposition is universally critical in peer problem-solving.`
      },
      {
        question: `In real-world applications of ${topic}, how do you ensure high reliability?`,
        options: [
          `Iterative testing, peer code reviews, and structured validation`,
          `Deploying without testing`,
          `Ignoring user inputs and security standards`,
          `Working in total isolation`
        ],
        answer: 0,
        explanation: `Continuous testing and structured validation guarantee high reliability.`
      }
    ]
  });
});

// ====================================================================
// REAL-TIME WEBRTC SIGNALING, PRESENCE, & LIVE NOTIFICATIONS
// ====================================================================

// Map: socketId -> user profile
const onlineUsers = new Map();
// Map: userId -> Set of socketIds (to support multiple tabs/devices per user)
const userSockets = new Map();
// Map: roomId -> Set of socketIds
const rooms = new Map();
// Map: userId -> activeSession object
const activeSessions = new Map();
// Map: roomId -> activeSession object
const roomSessions = new Map();
// Map: roomId -> { messages: [], code: '', notes: '' }
const roomData = new Map();

function getRoomData(roomId) {
  if (!roomData.has(roomId)) {
    roomData.set(roomId, {
      messages: [],
      code: '',
      notes: ''
    });
  }
  return roomData.get(roomId);
}

function broadcastOnlinePresence() {
  const onlineUserIds = Array.from(new Set(Array.from(onlineUsers.values()).map(u => u.id)));
  io.emit('online-presence-update', {
    onlineUserIds,
    count: onlineUserIds.length
  });
}

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // 1. User Online Presence Registration
  socket.on('register-presence', (user) => {
    if (!user || !user.id) return;
    onlineUsers.set(socket.id, user);

    if (!userSockets.has(user.id)) {
      userSockets.set(user.id, new Set());
    }
    userSockets.get(user.id).add(socket.id);

    console.log(`🟢 ${user.full_name} is now ONLINE (${onlineUsers.size} connections)`);
    broadcastOnlinePresence();
  });

  // 2. Real-Time Session Request & Notification ("oruthanaga teach pannura mari iruntha avangaluku notification poganum")
  socket.on('request-session', ({ fromUser, toUserId, topic, role }) => {
    console.log(`🔔 Session request: ${fromUser?.full_name} -> User ID ${toUserId} for ${topic}`);
    const targetSocketIds = userSockets.get(toUserId);

    const requestId = 'req_' + Date.now();
    const payload = {
      requestId,
      fromUser,
      toUserId,
      topic,
      role: role || 'learner',
      requestedAt: Date.now()
    };

    if (targetSocketIds && targetSocketIds.size > 0) {
      targetSocketIds.forEach(targetId => {
        io.to(targetId).emit('incoming-session-request', payload);
      });
      socket.emit('session-request-sent', { success: true, toUserId, topic });
    } else {
      // User is offline
      socket.emit('session-request-error', { 
        message: 'This student is currently offline. You can still schedule or leave a session request!' 
      });
    }
  });

  // 3. Teacher Accepts or Declines Session Request
  socket.on('respond-session-request', ({ requestId, accepted, fromUser, toUser, topic }) => {
    console.log(`Session response for ${requestId}: accepted=${accepted}`);
    
    // Create shared room ID for WebRTC deterministically
    const sortedIds = [fromUser.id, toUser.id].sort().join('_');
    const roomId = `room_${sortedIds}`;

    const callerSocketIds = userSockets.get(fromUser.id);
    const calleeSocketIds = userSockets.get(toUser.id);

    if (accepted) {
      const sessionData = {
        id: roomId,
        roomId,
        teacher: toUser, // The one who accepted to teach
        learner: fromUser,
        topic: topic || 'Peer Session',
        startedAt: Date.now()
      };

      activeSessions.set(fromUser.id, sessionData);
      activeSessions.set(toUser.id, sessionData);
      roomSessions.set(roomId, sessionData);

      // Notify caller that teacher accepted!
      if (callerSocketIds) {
        callerSocketIds.forEach(id => {
          io.to(id).emit('session-accepted-and-start', sessionData);
        });
      }

      // Notify callee (teacher)
      if (calleeSocketIds) {
        calleeSocketIds.forEach(id => {
          io.to(id).emit('session-accepted-and-start', sessionData);
        });
      }
    } else {
      // Declined
      if (callerSocketIds) {
        callerSocketIds.forEach(id => {
          io.to(id).emit('session-declined', {
            byUserName: toUser.full_name,
            topic
          });
        });
      }
    }
  });

  // 3b. Direct Session Launch (Instantly starts session without popup delay)
  socket.on('start-direct-session', ({ fromUser, toUser, topic }) => {
    console.log(`⚡ Direct session initiated: ${fromUser?.full_name} <-> ${toUser?.full_name}`);
    const sortedIds = [fromUser.id, toUser.id].sort().join('_');
    const roomId = `room_${sortedIds}`;

    const sessionData = {
      id: roomId,
      roomId,
      teacher: toUser,
      learner: fromUser,
      topic: topic || 'Peer Learning Exchange',
      startedAt: Date.now()
    };

    activeSessions.set(fromUser.id, sessionData);
    activeSessions.set(toUser.id, sessionData);
    roomSessions.set(roomId, sessionData);

    const callerSockets = userSockets.get(fromUser.id);
    const calleeSockets = userSockets.get(toUser.id);

    if (callerSockets) callerSockets.forEach(id => io.to(id).emit('session-accepted-and-start', sessionData));
    if (calleeSockets) calleeSockets.forEach(id => io.to(id).emit('session-accepted-and-start', sessionData));
  });

  // 4. In-App Classroom Video Room Join
  socket.on('join-room', ({ roomId, user }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userData = user;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    const roomSet = rooms.get(roomId);
    const otherSocketIds = Array.from(roomSet).filter(id => id !== socket.id);
    roomSet.add(socket.id);

    console.log(`👤 User ${user?.full_name || 'Student'} (${socket.id}) joined room: ${roomId}. Sockets in room: ${roomSet.size}`);

    // Provide persisted room history (messages, code, notes)
    const rd = getRoomData(roomId);
    socket.emit('room-history', rd);

    // If an existing peer is already in this room, trigger clean WebRTC negotiation
    if (otherSocketIds.length > 0) {
      const existingPeerSocketId = otherSocketIds[0];
      console.log(`🤝 Room pair established in ${roomId}: New Joiner (${socket.id}) will call Existing Peer (${existingPeerSocketId})`);

      // 1. Tell existing peer that another peer joined
      io.to(existingPeerSocketId).emit('peer-joined', {
        socketId: socket.id,
        user,
        isCaller: false
      });

      // 2. Tell new joiner to initiate WebRTC call (caller)
      socket.emit('ready-to-call', {
        targetSocketId: existingPeerSocketId,
        isCaller: true
      });
    }
  });

  // 5. WebRTC P2P Video Signaling (Offer, Answer, ICE Candidates)
  socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
    console.log(`📡 Relaying WebRTC Offer: ${socket.id} -> ${targetSocketId}`);
    io.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      offer
    });
  });

  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    console.log(`📡 Relaying WebRTC Answer: ${socket.id} -> ${targetSocketId}`);
    io.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });

  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  // 6. Live Synchronizers: Code, Notes, Chat
  socket.on('code-change', ({ roomId, code }) => {
    if (!roomId) return;
    const rd = getRoomData(roomId);
    rd.code = code;
    socket.to(roomId).emit('code-update', code);
  });

  socket.on('notes-change', ({ roomId, notes }) => {
    if (!roomId) return;
    const rd = getRoomData(roomId);
    rd.notes = notes;
    socket.to(roomId).emit('notes-update', notes);
  });

  socket.on('chat-message', ({ roomId, message }) => {
    if (!roomId || !message) return;
    console.log(`💬 Chat in ${roomId} [${message.sender}]: ${message.text}`);
    const rd = getRoomData(roomId);
    rd.messages.push(message);
    io.in(roomId).emit('chat-message', message);
  });

  // 7. Disconnect Handler
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user && user.id) {
      const sIds = userSockets.get(user.id);
      if (sIds) {
        sIds.delete(socket.id);
        if (sIds.size === 0) userSockets.delete(user.id);
      }
      onlineUsers.delete(socket.id);
      console.log(`⚪ User ${user.full_name} disconnected`);
      broadcastOnlinePresence();
    }

    if (socket.roomId && rooms.has(socket.roomId)) {
      rooms.get(socket.roomId).delete(socket.id);
      if (rooms.get(socket.roomId).size === 0) {
        rooms.delete(socket.roomId);
      } else {
        socket.to(socket.roomId).emit('user-left', { socketId: socket.id });
      }
    }
  });
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA client routing fallback (Express 5 compatible)
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('<h1>SkillSwap Real-Time Server Active</h1><p>Building client interface...</p>');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SkillSwap Fullstack Real-Time Server running on port ${PORT}`);
});
