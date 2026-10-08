// AI Proof-of-Learning Engine (Gemini API Integration)

// Pre-engineered topic question bank for instant zero-latency hackathon demos
const TOPIC_PRESETS = {
  'python': [
    {
      question: "In Python, which built-in data type is immutable?",
      options: ["List", "Dictionary", "Tuple", "Set"],
      answer: 2,
      explanation: "Tuples are immutable in Python; their elements cannot be changed after creation."
    },
    {
      question: "What is the time complexity of looking up a key in a Python dictionary on average?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      answer: 0,
      explanation: "Python dictionaries use hash tables, offering average O(1) constant time lookup."
    },
    {
      question: "Which keyword is used to create a generator function in Python?",
      options: ["return", "yield", "generate", "async"],
      answer: 1,
      explanation: "The 'yield' keyword turns a function into a generator producing values lazily."
    }
  ],
  'ui/ux': [
    {
      question: "What is the primary difference between UI and UX design?",
      options: [
        "UI is only colors; UX is only coding",
        "UI is the visual interface; UX is the overall user experience and journey",
        "There is no difference between them",
        "UX is done after the product is released"
      ],
      answer: 1,
      explanation: "UI (User Interface) focuses on visual aesthetics, while UX (User Experience) covers the entire user journey and usability."
    },
    {
      question: "What is a 'wireframe' in UI/UX design?",
      options: [
        "A finished 3D model of a product",
        "A low-fidelity structural blueprint of a webpage or screen",
        "A color palette generator",
        "The backend server architecture"
      ],
      answer: 1,
      explanation: "A wireframe is a simplified skeletal outline that maps out structure and flow."
    },
    {
      question: "Which UX principle states that the time required to rapidly move to a target area is a function of the ratio between the distance to the target and the width of the target?",
      options: ["Fitts's Law", "Hick's Law", "Miller's Law", "Jakob's Law"],
      answer: 0,
      explanation: "Fitts's Law states that larger, closer targets are easier and faster to click."
    }
  ],
  'react': [
    {
      question: "What is the purpose of the 'useEffect' Hook in React?",
      options: [
        "To manage component state",
        "To perform side effects like data fetching and subscriptions",
        "To create new DOM elements",
        "To speed up CSS animations"
      ],
      answer: 1,
      explanation: "useEffect lets you synchronize a component with an external system (side effects)."
    },
    {
      question: "Why must keys in React lists be unique among siblings?",
      options: [
        "To style elements with CSS",
        "To help React identify which items have changed, been added, or removed during reconciliation",
        "To count total items rendered",
        "Because JavaScript arrays require keys"
      ],
      answer: 1,
      explanation: "Keys give React a stable identity to optimize virtual DOM diffing."
    },
    {
      question: "Which of the following describes 'props' in React?",
      options: [
        "Internal mutable state of a component",
        "Read-only inputs passed from parent to child component",
        "Functions only used for routing",
        "A replacement for HTML tags"
      ],
      answer: 1,
      explanation: "Props are read-only arguments passed from parent components to child components."
    }
  ],
  'public speaking': [
    {
      question: "What is the recommended rule for eye contact during a presentation?",
      options: [
        "Look constantly at the slides to avoid nervousness",
        "Hold 3-5 seconds of direct eye contact with individuals across different sections of the room",
        "Stare strictly at the back wall above people's heads",
        "Close your eyes while delivering key points"
      ],
      answer: 1,
      explanation: "Engaging individual audience members for 3-5 seconds builds genuine connection."
    },
    {
      question: "What does the 'Rule of Three' in speechwriting emphasize?",
      options: [
        "Always give 3-hour speeches",
        "Ideas or concepts presented in groups of threes are inherently more memorable and satisfying",
        "Only 3 people should be in the audience",
        "Repeat the same sentence three times in a row"
      ],
      answer: 1,
      explanation: "The human brain naturally identifies patterns in triads (e.g., 'Life, liberty, and the pursuit of happiness')."
    },
    {
      question: "How can a speaker effectively reduce vocal fillers like 'um' and 'uh'?",
      options: [
        "Speak as fast as possible",
        "Embrace short intentional pauses in place of fillers",
        "Cough whenever feeling uncertain",
        "Drink ice water constantly"
      ],
      answer: 1,
      explanation: "Pausing gives the speaker time to think and gives the audience time to absorb information."
    }
  ]
};

export async function generateProofOfLearningQuiz(topic, apiKey = '') {
  const geminiKey = apiKey || localStorage.getItem('skillswap_gemini_api_key') || '';
  
  if (geminiKey) {
    try {
      const prompt = `You are the AI Proof-of-Learning Engine for SkillSwap. A peer student just taught another student a 45-minute lesson on the topic: "${topic}".
Generate exactly 3 multiple choice questions to verify the learner's basic understanding.
Return STRICT JSON ONLY in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Brief explanation why option 0 is correct"
  }
]
No markdown fences, no extra text, strictly valid JSON array of 3 questions.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
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
          return parsed.slice(0, 3);
        }
      }
    } catch (err) {
      console.warn("Gemini API call fell back to local curriculum engine:", err);
    }
  }

  // Smart local curriculum generator fallback
  const normalized = topic.toLowerCase();
  for (const [key, questions] of Object.entries(TOPIC_PRESETS)) {
    if (normalized.includes(key)) {
      return questions;
    }
  }

  // Dynamic contextual fallback if custom topic
  return [
    {
      question: `What is the core foundational principle when applying ${topic} in real-world projects?`,
      options: [
        `Understanding fundamental requirements and systematic application of ${topic}`,
        `Skipping planning and directly guessing the implementation`,
        `Relying solely on external automated tools without understanding basics`,
        `Ignoring best practices and industry standards`
      ],
      answer: 0,
      explanation: `Mastering fundamentals and structured thinking is the bedrock of ${topic}.`
    },
    {
      question: `During your peer session on ${topic}, what was the main problem-solving approach discussed?`,
      options: [
        `Trial and error with random parameters`,
        `Deconstructing complex problems into smaller, testable components`,
        `Memorizing syntax without conceptual clarity`,
        `Delegating all verification to third parties`
      ],
      answer: 1,
      explanation: `Modular decomposition is universally critical across technical and creative skills.`
    },
    {
      question: `How do you measure genuine proficiency and skill mastery in ${topic}?`,
      options: [
        `By the number of certificates printed`,
        `By successfully building practical projects and peer-explaining core concepts`,
        `By avoiding code or design reviews`,
        `By working in complete isolation`
      ],
      answer: 1,
      explanation: `Teaching others and delivering working output proves true comprehension.`
    }
  ];
}
