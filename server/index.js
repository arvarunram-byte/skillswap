import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'SkillSwap: AI-Powered Peer-to-Peer Time-Credit Skill Exchange Network',
    un_sdg: 'Goal 4: Quality Education',
    time: new Date().toISOString()
  });
});

// AI Proof-of-Learning Quiz Generation API
app.post('/api/generate-quiz', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are the AI Proof-of-Learning Engine for SkillSwap. A peer student just taught another student a 45-minute lesson on: "${topic}".
Generate exactly 3 multiple choice questions to verify the learner's understanding.
Return STRICT JSON ONLY in this format:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "Why correct"
  }
]
No markdown fences, valid JSON only.`;

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
        return res.json({ success: true, questions: parsed.slice(0, 3) });
      }
    } catch (err) {
      console.error('Gemini Backend Call Error:', err);
    }
  }

  // Fallback intelligent questions for common topics
  return res.json({
    success: true,
    fallback: true,
    questions: [
      {
        question: `What is the core foundational principle when implementing ${topic}?`,
        options: [
          `Understanding fundamentals and structural best practices for ${topic}`,
          `Guessing implementations without architectural planning`,
          `Skipping testing and error handling entirely`,
          `Relying on deprecated techniques`
        ],
        answer: 0,
        explanation: `Systematic problem decomposition is fundamental to ${topic}.`
      },
      {
        question: `How does peer-to-peer explanation reinforce retention in ${topic}?`,
        options: [
          `It decreases understanding through discussion`,
          `Teaching requires synthesizing concepts into clear mental models (Protégé effect)`,
          `It only helps the teacher, never the learner`,
          `It replaces hands-on practice entirely`
        ],
        answer: 1,
        explanation: `Teaching a peer is scientifically proven to cement long-term conceptual retention.`
      },
      {
        question: `In a production workflow for ${topic}, what ensures high quality deliverables?`,
        options: [
          `Continuous testing, peer feedback, and iterative refinement`,
          `Shipping without reviewing code or design`,
          `Ignoring edge cases and accessibility`,
          `Using random configurations`
        ],
        answer: 0,
        explanation: `Iterative review and feedback loops guarantee robust quality.`
      }
    ]
  });
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// For SPA client routing fallback (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SkillSwap Fullstack Server running on http://localhost:${PORT}`);
});
