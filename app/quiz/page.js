'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SettingsBar from '@/components/SettingsBar';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { useSettings } from '@/lib/settings-context';
import { saveStoredQuizAttempt } from '@/lib/storage';

export default function QuizPage() {
  const { settings, currentLangInfo } = useSettings();
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);

  const sampleTopics = {
    DBMS: ['ACID Properties', 'Normalization (1NF to BCNF)', 'Indexing & B-Trees', 'SQL Joins & Subqueries'],
    'Operating Systems': ['CPU Scheduling Algorithms', 'Deadlock & Banker Algorithm', 'Virtual Memory & Paging', 'Semaphores & Mutex'],
    'Computer Networks': ['OSI 7 Layers', 'TCP 3-Way Handshake', 'Subnetting & IP Addressing', 'Routing Protocols (RIP, OSPF)'],
    DSA: ['Binary Search Trees', 'Graph BFS & DFS', 'Sorting Algorithms', 'Dynamic Programming Basics'],
    Python: ['List Comprehension & Lambdas', 'Decorators & Generators', 'OOP in Python', 'Exception Handling'],
    'Web Development': ['DOM & Event Bubbling', 'REST APIs & HTTP Methods', 'Async/Await & Promises', 'CSS Flexbox & Grid'],
    Other: ['Git & Version Control', 'Software Engineering Lifecycles', 'Object Oriented Principles', 'Cloud Computing Basics'],
  };

  const handleStartQuiz = async (e) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (!trimmed) {
      setError('Please enter a topic for the quiz.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: trimmed,
          count: questionCount,
          language: settings.language,
          subject: settings.subject,
          difficulty: settings.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('AI returned an empty quiz. Please try again.');
      }

      setQuestions(data.questions);
    } catch (err) {
      console.error('[QuizPage] Error:', err);
      setError(err.message || 'Something went wrong while generating the quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionIndex, optionIndex) => {
    if (submitted) return; // Prevent change after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!questions) return;

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        calculatedScore += 1;
      }
    });

    const total = questions.length;
    const percentage = Math.round((calculatedScore / total) * 100);

    setScore(calculatedScore);
    setSubmitted(true);

    // Save attempt to localStorage
    saveStoredQuizAttempt({
      id: 'quiz-' + Date.now(),
      date: new Date().toISOString(),
      subject: settings.subject,
      topic: topic.trim(),
      language: settings.language,
      score: calculatedScore,
      total,
      percentage,
    });
  };

  const handleResetQuiz = () => {
    setQuestions(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentTopics = sampleTopics[settings.subject] || sampleTopics.DBMS;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <SettingsBar />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Setup Screen if no active quiz */}
        {!questions && !loading && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Interactive MCQ Quiz</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wider">
                  {currentLangInfo.label}
                </span>
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Self-evaluate your {settings.subject} preparation with 5 or 10 questions. Questions and explanations in {currentLangInfo.label} with standard IT terms in English.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Topic Input */}
              <div>
                <label htmlFor="quiz-topic" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Enter Subject Topic
                </label>
                <input
                  id="quiz-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={`e.g. Normalization, B-Trees, TCP Handshake, Paging...`}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Sample Topic Chips */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                  Quick Topics for {settings.subject}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentTopics.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        questionCount === count
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{count} Questions</span>
                      <span className="text-xs font-normal text-slate-400">({count === 5 ? '~5 mins' : '~10 mins'})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={!topic.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Start {questionCount}-Question Quiz in {currentLangInfo.label}
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12">
            <Loader message={`ક્વિઝના પ્રશ્નો તૈયાર થઈ રહ્યા છે (${topic})...`} />
          </div>
        )}

        {/* Active Quiz View */}
        {questions && !loading && (
          <div className="space-y-6">
            {/* Quiz Header Banner */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {settings.subject} • {settings.difficulty}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Topic: {topic}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Answered: {answeredCount} / {questions.length}
                </span>

                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="text-xs text-slate-400 hover:text-rose-500 font-medium"
                >
                  Exit Quiz
                </button>
              </div>
            </div>

            {/* Score Banner when Submitted */}
            {submitted && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-200">
                    Quiz Results
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">
                    Your Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </h3>
                  <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                    {score / questions.length >= 0.8
                      ? '🎉 શાનદાર! ઉત્કૃષ્ટ તૈયારી! (Outstanding preparation!)'
                      : score / questions.length >= 0.6
                      ? '👍 ઘણું સારું પરિણામ! (Good job, keep polishing!)'
                      : '📚 થોડો વધુ અભ્યાસ જરૂરી છે. રિવિઝન કરો! (Review the explanations below!)'}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    Take Another Quiz
                  </button>
                  <Link
                    href="/progress"
                    className="px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900/90 text-white font-semibold text-xs sm:text-sm transition-colors border border-indigo-400/30"
                  >
                    View in Progress
                  </Link>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => {
                const userSelected = selectedAnswers[qIdx];
                const isCorrect = userSelected === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm ${
                      submitted
                        ? isCorrect
                          ? 'border-emerald-500/80 bg-emerald-50/10 dark:bg-emerald-950/10'
                          : 'border-rose-500/80 bg-rose-50/10 dark:bg-rose-950/10'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Question Title */}
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center">
                        Q{qIdx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {q.question}
                      </h3>
                    </div>

                    {/* Options (Radio Buttons) */}
                    <div className="space-y-2.5 pl-0 sm:pl-10">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = userSelected === optIdx;
                        const isRightAnswer = optIdx === q.correctIndex;

                        let optionClasses =
                          'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

                        if (!submitted && isChosen) {
                          optionClasses =
                            'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-semibold ring-2 ring-indigo-500/20';
                        }

                        if (submitted) {
                          if (isRightAnswer) {
                            optionClasses =
                              'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 font-semibold';
                          } else if (isChosen && !isRightAnswer) {
                            optionClasses =
                              'bg-rose-50 dark:bg-rose-950/60 border-rose-600 text-rose-900 dark:text-rose-200 font-semibold line-through';
                          } else {
                            optionClasses =
                              'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600';
                          }
                        }

                        return (
                          <label
                            key={optIdx}
                            onClick={() => handleOptionSelect(qIdx, optIdx)}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${optionClasses} ${
                              submitted ? 'cursor-default' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={isChosen}
                              onChange={() => handleOptionSelect(qIdx, optIdx)}
                              disabled={submitted}
                              className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="flex-1 text-sm">{opt}</span>

                            {submitted && isRightAnswer && (
                              <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {submitted && isChosen && !isRightAnswer && (
                              <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Explanation Box when Submitted */}
                    {submitted && (
                      <div className="mt-4 sm:ml-10 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Explanation (સમજૂતી):</span>
                        </div>
                        <p className="leading-relaxed pl-5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Submit Action */}
            {!submitted && (
              <div className="sticky bottom-4 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  {answeredCount === questions.length ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ All questions answered! Ready to submit.
                    </span>
                  ) : (
                    <span>Answer all questions to submit ({answeredCount}/{questions.length} answered)</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={answeredCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
