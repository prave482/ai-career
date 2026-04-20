'use client';

import { useEffect, useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import { ArrowUpRight, LoaderCircle, Mic } from 'lucide-react';
import ProfileEmptyState from '@/components/ProfileEmptyState';
import { evaluateInterviewAnswer, refreshInterviewQuestions } from '@/lib/api';
import { useCareerProfile } from '@/hooks/useCareerProfile';

export default function InterviewPage() {
  const { profile, meta, persistProfile, isBootstrapping } = useCareerProfile();
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
    sampleAnswer: string;
    aiProvider: string;
  } | null>(null);
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isEvaluating, startEvaluateTransition] = useTransition();

  useEffect(() => {
    setAnswer('');
    setFeedback(null);
  }, [selectedQuestion, profile?.id]);

  const handleRefresh = () => {
    if (!profile) return;
    startRefreshTransition(async () => {
      try {
        const result = await refreshInterviewQuestions(profile.id);
        persistProfile(result.profile, result.meta);
        setSelectedQuestion(0);
        toast.success('Interview questions refreshed.');
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to refresh questions.');
      }
    });
  };

  const handleEvaluate = () => {
    if (!profile || !profile.interviewQuestions[selectedQuestion] || !answer.trim()) {
      toast.error('Choose a question and write your answer first.');
      return;
    }

    startEvaluateTransition(async () => {
      try {
        const result = await evaluateInterviewAnswer(
          profile.id,
          profile.interviewQuestions[selectedQuestion].question,
          answer
        );
        setFeedback(result.feedback);
        toast.success('Answer evaluated.');
      } catch (error: any) {
        toast.error(error?.response?.data?.error || 'Failed to evaluate answer.');
      }
    });
  };

  if (isBootstrapping) {
    return <div className="page-shell"><div className="surface"><p>Loading interview workspace...</p></div></div>;
  }

  if (!profile) {
    return (
      <div className="page-shell">
        <ProfileEmptyState
          title="No interview workspace yet"
          copy="Analyze your resume first so the app can generate role-based interview questions for you."
        />
      </div>
    );
  }

  const currentQuestion = profile.interviewQuestions[selectedQuestion];

  return (
    <div className="page-shell panel-stack">
      <section className="surface">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Mock Interview</p>
            <h1>{profile.targetRole} practice session</h1>
          </div>
          <div className="header-actions">
            <span className="tag">AI: {meta?.aiProvider ?? 'saved'}</span>
            <button className="secondary-button" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <LoaderCircle className="spin" size={16} /> : <ArrowUpRight size={16} />}
              <span>Refresh Questions</span>
            </button>
          </div>
        </div>
      </section>

      <div className="interview-grid">
        <section className="surface question-list">
          {profile.interviewQuestions.map((item, index) => (
            <button
              key={item.question}
              type="button"
              className={`question-item ${selectedQuestion === index ? 'is-active' : ''}`}
              onClick={() => setSelectedQuestion(index)}
            >
              <strong>{item.focusArea}</strong>
              <span>{item.question}</span>
            </button>
          ))}
        </section>

        <section className="surface panel-stack">
          <div className="question-card">
            <h2>{currentQuestion?.question}</h2>
            <p>{currentQuestion?.idealAnswerHint}</p>
          </div>

          <textarea
            className="textarea"
            rows={10}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write your answer here..."
          />

          <button className="primary-button" type="button" onClick={handleEvaluate} disabled={isEvaluating}>
            {isEvaluating ? <LoaderCircle className="spin" size={16} /> : <Mic size={16} />}
            <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Answer'}</span>
          </button>

          {feedback ? (
            <div className="feedback-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Feedback</p>
                  <h2>{feedback.score}/100</h2>
                </div>
                <span className="tag">{feedback.verdict}</span>
              </div>
              <div className="two-column">
                <div>
                  <h3>Strengths</h3>
                  <ul className="list">
                    {feedback.strengths.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Improvements</h3>
                  <ul className="list">
                    {feedback.improvements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="sample-answer">
                <h3>Sample answer direction</h3>
                <p>{feedback.sampleAnswer}</p>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
