import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS for WebRTC signaling and real-time collaboration
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'SkillSwap: AI-Powered Peer-to-Peer Time-Credit Skill Exchange Network',
    realtime: 'Active (WebSockets + WebRTC Signaling Enabled)',
    time: new Date().toISOString()
  });
});

// Real-time AI Proof-of-Learning Quiz Generation API (Google Gemini 1.5 Flash)
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, apiKey: clientApiKey } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the AI Proof-of-Learning Engine for SkillSwap. A peer student just taught another student a real-time lesson on: "${topic}".
Generate exactly 3 high-quality multiple choice questions to verify the learner's comprehension.
Return STRICT JSON ONLY without markdown fences, in this exact format:
[
  {
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Why Option A is correct"
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
      console.error('Gemini Live API Error:', err.message);
    }
  }

  // Fallback dynamic questions if API key not present
  return res.json({
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
// REAL-TIME WEBRTC SIGNALING & COLLABORATION (Socket.io)
// ====================================================================
const rooms = new Map(); // roomId -> Set of socketIds

io.on('connection', (socket) => {
  console.log(`🔌 New client connected in real-time: ${socket.id}`);

  // 1. Join Classroom Session Room
  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userData = user;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);

    console.log(`👤 User ${user?.full_name || socket.id} joined room ${roomId}`);

    // Notify other peers in this room that a new user joined (triggers WebRTC offer)
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      user
    });

    // Send list of existing users to the newly joined peer
    const existingUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id);
    socket.emit('existing-users', existingUsers);
  });

  // 2. WebRTC P2P Video Signaling: Offer
  socket.on('webrtc-offer', ({ targetSocketId, offer }) => {
    socket.to(targetSocketId).emit('webrtc-offer', {
      senderSocketId: socket.id,
      offer
    });
  });

  // 3. WebRTC P2P Video Signaling: Answer
  socket.on('webrtc-answer', ({ targetSocketId, answer }) => {
    socket.to(targetSocketId).emit('webrtc-answer', {
      senderSocketId: socket.id,
      answer
    });
  });

  // 4. WebRTC P2P Video Signaling: ICE Candidate
  socket.on('webrtc-ice-candidate', ({ targetSocketId, candidate }) => {
    socket.to(targetSocketId).emit('webrtc-ice-candidate', {
      senderSocketId: socket.id,
      candidate
    });
  });

  // 5. Real-Time Shared Code Editor Synchronizer
  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code);
  });

  // 6. Real-Time Shared Notes Synchronizer
  socket.on('notes-change', ({ roomId, notes }) => {
    socket.to(roomId).emit('notes-update', notes);
  });

  // 7. Real-Time In-Session Chat
  socket.on('chat-message', ({ roomId, message }) => {
    io.in(roomId).emit('chat-message', message);
  });

  // 8. Real-Time Session Status (End session, start quiz)
  socket.on('session-event', ({ roomId, event, payload }) => {
    io.in(roomId).emit('session-event', { event, payload });
  });

  // 9. Real-Time Global Token Settlement Notification
  socket.on('token-transfer-broadcast', (data) => {
    io.emit('token-balance-updated', data);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
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
