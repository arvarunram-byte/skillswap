import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateProofOfLearningQuiz } from '../lib/aiService';
import { 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Coins, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  HelpCircle,
  Award
} from 'lucide-react';

export default function QuizModal() {
  const { isQuizOpen, setIsQuizOpen, activeSession, completeQuizAndSettleTokens } = useApp();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (isQuizOpen && activeSession) {
      setLoading(true);
      setIsSubmitted(false);
      setSelectedAnswers({});
      setCurrentIndex(0);
      setScoreResult(null);

      // Generate 3 questions dynamically via Gemini API or topic engine
      generateProofOfLearningQuiz(activeSession.topic)
        .then(qList => {
          setQuestions(qList);
          setLoading(false);
        })
        .catch(err => {
          console.error('Quiz generation error:', err);
          setLoading(false);
        });
    }
  }, [isQuizOpen, activeSession]);

  if (!isQuizOpen || !activeSession) return null;

  const handleSelectOption = (optIndex) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentIndex]: optIndex
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Grade questions
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = percent >= 60;

    setScoreResult({
      correctCount,
      total: questions.length,
      percent,
      passed
    });
    setIsSubmitted(true);

    if (passed) {
      setIsTransferring(true);
      setTimeout(async () => {
        await completeQuizAndSettleTokens(percent);
        setIsTransferring(false);
      }, 1800);
    } else {
      await completeQuizAndSettleTokens(percent);
    }
  };

  const currentQ = questions[currentIndex];
  const allAnswered = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1.5px solid rgba(99, 102, 241, 0.4)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.3)'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge badge-teach">
                <Sparkles size={13} /> AI Proof-of-Learning Engine (USP)
              </span>
              <span className="badge badge-token">
                Pass Mark: ≥60%
              </span>
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>
              Skill Verification: {activeSession.topic}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Learner: <strong>{activeSession.learner.full_name}</strong> • Teacher: <strong>{activeSession.teacher.full_name}</strong>
            </p>
          </div>

          <button
            onClick={() => setIsQuizOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 20px',
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Generating Dynamic Verification Questions...</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Gemini AI is analyzing the session topic <strong>"{activeSession.topic}"</strong> to craft 3 comprehension MCQs.
            </p>
          </div>
        )}

        {/* Active Quiz Questions View */}
        {!loading && !isSubmitted && currentQ && (
          <div>
            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {questions.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: '28px',
                      height: '6px',
                      borderRadius: '3px',
                      background: i === currentIndex ? 'var(--accent-primary)' : selectedAnswers[i] !== undefined ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid var(--border-subtle)'
            }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f3f4f6', lineHeight: '1.5' }}>
                {currentQ.question}
              </p>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'var(--text-dim)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isSelected ? 'var(--accent-primary)' : 'transparent',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span style={{ fontSize: '0.92rem', color: isSelected ? '#fff' : '#d1d5db', flex: 1 }}>
                      {option}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn btn-secondary btn-sm"
                style={{ opacity: currentIndex === 0 ? 0.4 : 1 }}
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="btn btn-secondary btn-sm"
                  disabled={selectedAnswers[currentIndex] === undefined}
                  style={{ opacity: selectedAnswers[currentIndex] === undefined ? 0.5 : 1 }}
                >
                  Next Question →
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="btn btn-success"
                  style={{ opacity: !allAnswered ? 0.5 : 1 }}
                >
                  <Sparkles size={16} /> Submit & Settle Token
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results View */}
        {isSubmitted && scoreResult && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            {scoreResult.passed ? (
              <div className="animate-fade-in">
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '2px solid #10b981',
                  boxShadow: 'var(--success-glow)'
                }}>
                  <ShieldCheck size={40} color="#10b981" />
                </div>

                <h3 style={{ fontSize: '1.6rem', color: '#10b981', marginBottom: '6px' }}>
                  AI Verification PASSED!
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
                  Score: <strong>{scoreResult.percent}%</strong> ({scoreResult.correctCount} / {scoreResult.total} Correct) • Threshold: ≥60%
                </p>

                {/* Instant Token Settlement Animation Box (PDF Step 5) */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1.5px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  marginBottom: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* Learner */}
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={activeSession.learner.avatar_url}
                        alt="Learner"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #ec4899', margin: '0 auto 6px' }}
                      />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeSession.learner.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 700 }}>-1 Time-Credit</div>
                    </div>

                    {/* Animated Arrow / Token */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div className="pulse-glow" style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}>
                        <Coins size={18} /> 1.0 TOKEN TRANSFER
                      </div>
                      <ArrowRight size={22} color="#fbbf24" />
                    </div>

                    {/* Teacher */}
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={activeSession.teacher.avatar_url}
                        alt="Teacher"
                        style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #818cf8', margin: '0 auto 6px' }}
                      />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeSession.teacher.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>+1 Time-Credit</div>
                    </div>

                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#fbbf24', marginTop: '16px' }}>
                    ✓ Automated Proof-of-Learning Smart Contract executed. Token deposited into teacher's wallet!
                  </p>
                </div>

                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="btn btn-primary"
                  style={{ minWidth: '180px' }}
                >
                  Done & View Updated Wallet
                </button>
              </div>
            ) : (
              /* Fail State (PDF Step 6B) */
              <div className="animate-fade-in">
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  border: '2px solid #ef4444'
                }}>
                  <AlertTriangle size={36} color="#ef4444" />
                </div>

                <h3 style={{ fontSize: '1.5rem', color: '#ef4444', marginBottom: '6px' }}>
                  Score &lt; 60% — Token Placed On-Hold
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Score: <strong>{scoreResult.percent}%</strong> ({scoreResult.correctCount} / {scoreResult.total} Correct). Per UN SDG 4 quality standards, tokens are only released upon verified comprehension.
                </p>

                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', textAlign: 'left', fontSize: '0.85rem', color: '#fca5a5' }}>
                  <strong>Escrow Status:</strong> The 1 Time-Credit token remains safely held in escrow. The learner may review lesson notes with the teacher and retry the verification quiz.
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedAnswers({});
                      setCurrentIndex(0);
                    }}
                    className="btn btn-secondary"
                  >
                    <RotateCcw size={16} /> Retry Verification Quiz
                  </button>
                  <button
                    onClick={() => setIsQuizOpen(false)}
                    className="btn btn-primary"
                  >
                    Close Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
