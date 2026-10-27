'use client';

import React, { useState, useEffect, useRef } from 'react';
import SettingsBar from '@/components/SettingsBar';
import ChatBubble from '@/components/ChatBubble';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { useSettings } from '@/lib/settings-context';
import { getStoredChatHistory, saveStoredChatHistory, clearStoredChatHistory } from '@/lib/storage';

const QUICK_PROMPTS = {
  DBMS: [
    'Explain ACID properties with an ATM withdrawal example',
    'What is 3NF Normalization and why do we need it?',
    'Explain B-Tree Indexing in simple words',
    'Difference between Primary Key and Unique Key',
  ],
  'Operating Systems': [
    'Explain Deadlock and its 4 Coffman conditions',
    'Difference between Process and Thread',
    'How does Virtual Memory and Paging work?',
    'Explain Mutex vs Semaphore with real-life analogy',
  ],
  'Computer Networks': [
    'How does the TCP 3-Way Handshake work?',
    'Difference between OSI model and TCP/IP model',
    'Explain DNS resolution step-by-step',
    'Explain IPv4 vs IPv6 with simple examples',
  ],
  DSA: [
    'Explain Two-Pointer technique with an example',
    'Difference between Stack and Queue with real analogy',
    'How does Binary Search achieve O(log n) time?',
    'Explain Dynamic Programming vs Recursion',
  ],
  Python: [
    'What are Python Decorators with a simple example?',
    'Difference between List, Tuple, and Set',
    'Explain Python Generators and yield keyword',
    'What is the Global Interpreter Lock (GIL)?',
  ],
  'Web Development': [
    'How does Client-Side Rendering vs SSR work?',
    'What is CORS and how does browser handle it?',
    'Explain Event Loop in JavaScript with analogy',
    'REST API vs GraphQL key differences',
  ],
  Other: [
    'Explain Object-Oriented Programming (OOP) concepts',
    'What is Git Branching and Merge Conflicts?',
    'Explain Agile vs Waterfall model',
    'How does Public Key Cryptography work?',
  ],
};

export default function ChatPage() {
  const { settings, currentLangInfo } = useSettings();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = getStoredChatHistory();
    if (history && history.length > 0) {
      setMessages(history);
    } else {
      // Seed initial welcoming message
      const seedMessage = {
        id: 'welcome-1',
        isUser: false,
        text: `નમસ્તે! / नमस्ते! I am **Vidya Mitra**, your regional AI study companion for **${settings.subject}**.

Ask me any technical doubt, concept, or interview question in **${currentLangInfo.label}**, and I will explain it with simple words, real-life analogies, and exam takeaways!

You can also click on any suggestion below or use the microphone to ask your doubt.`,
        timestamp: new Date().toISOString(),
        subject: settings.subject,
      };
      setMessages([seedMessage]);
    }
  }, []);

  // Set up Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLangInfo.speechCode || 'en-IN';

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = (e) => {
          console.warn('[speech] Recognition error:', e.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [currentLangInfo]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLangInfo.speechCode || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('[speech] Start error:', err);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg = {
      id: 'msg-' + Date.now(),
      isUser: true,
      text: trimmed,
      timestamp: new Date().toISOString(),
      subject: settings.subject,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveStoredChatHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      // Send last 6 messages as context
      const contextMessages = newHistory.slice(-6).map((m) => ({
        role: m.isUser ? 'user' : 'assistant',
        text: m.text,
      }));

      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          messages: contextMessages,
          language: settings.language,
          subject: settings.subject,
          difficulty: settings.difficulty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate explanation.');
      }

      const botMsg = {
        id: 'msg-' + (Date.now() + 1),
        isUser: false,
        text: data.reply,
        timestamp: new Date().toISOString(),
        subject: settings.subject,
      };

      const finalHistory = [...newHistory, botMsg];
      setMessages(finalHistory);
      saveStoredChatHistory(finalHistory);
    } catch (err) {
      console.error('[ChatPage] Error:', err);
      setError(err.message || 'Something went wrong while connecting to Vidya Mitra.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      clearStoredChatHistory();
      setMessages([]);
    }
  };

  const handleSelectPrompt = (promptText) => {
    setInput(promptText);
  };

  const availablePrompts = QUICK_PROMPTS[settings.subject] || QUICK_PROMPTS.DBMS;

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-4rem)]">
      <SettingsBar />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      {/* Main Chat Container */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-4xl w-full mx-auto">
        {/* Top Header Actions */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Doubt Clearing Session ({settings.subject})
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              Explaining in {currentLangInfo.label}
            </span>
          </div>

          {messages.length > 1 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* Message Stream */}
        <div className="space-y-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} />
          ))}

          {loading && <Loader compact={false} />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick Prompts Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 flex-shrink-0 flex items-center gap-1">
              <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-.82-7.915A4.002 4.002 0 0116 8c0 1.258-.583 2.38-1.5 3.125V14z" />
              </svg>
              Quick Doubts:
            </span>
            {availablePrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrompt(prompt)}
                className="flex-shrink-0 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            {/* Mic Button for Web Speech API (hidden if unsupported) */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading}
                title={isListening ? 'Listening... click to stop' : 'Click to speak your doubt'}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-200 dark:ring-rose-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask any ${settings.subject} doubt (in ${currentLangInfo.label} or English)...`}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <span>Ask</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
