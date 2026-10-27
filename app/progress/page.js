'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SettingsBar from '@/components/SettingsBar';
import { getStoredQuizHistory, clearStoredQuizHistory } from '@/lib/storage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ProgressPage() {
  const [history, setHistory] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(getStoredQuizHistory());
    setMounted(true);
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your quiz progress and attempt history?')) {
      clearStoredQuizHistory();
      setHistory([]);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Date', 'Subject', 'Topic', 'Language', 'Score', 'Total', 'Percentage'];
    const rows = history.map((item) => [
      `"${new Date(item.date).toLocaleString().replace(/"/g, '""')}"`,
      `"${(item.subject || '').replace(/"/g, '""')}"`,
      `"${(item.topic || '').replace(/"/g, '""')}"`,
      `"${(item.language || '').replace(/"/g, '""')}"`,
      item.score,
      item.total,
      `${item.percentage}%`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vidya_mitra_progress_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Stat Cards
  const totalQuizzes = history.length;
  const totalQuestions = history.reduce((sum, h) => sum + (h.total || 0), 0);
  const totalCorrect = history.reduce((sum, h) => sum + (h.score || 0), 0);
  const averageScore = totalQuizzes > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Best Subject calculation
  const subjectScores = {};
  history.forEach((h) => {
    const sub = h.subject || 'Other';
    if (!subjectScores[sub]) {
      subjectScores[sub] = { score: 0, total: 0 };
    }
    subjectScores[sub].score += h.score || 0;
    subjectScores[sub].total += h.total || 0;
  });

  let bestSubject = 'N/A';
  let bestAvg = -1;
  Object.keys(subjectScores).forEach((sub) => {
    const avg = subjectScores[sub].score / subjectScores[sub].total;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestSubject = sub;
    }
  });

  // Data for Line Chart (chronological: oldest to newest)
  const chronologicalHistory = [...history].reverse();
  const lineChartLabels = chronologicalHistory.map((h, i) => {
    const d = new Date(h.date);
    return `${d.getMonth() + 1}/${d.getDate()} (#${i + 1})`;
  });

  const lineChartData = {
    labels: lineChartLabels.length > 0 ? lineChartLabels : ['No data'],
    datasets: [
      {
        label: 'Score %',
        data: chronologicalHistory.map((h) => h.percentage),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Data for Bar Chart (Subject Average)
  const barChartLabels = Object.keys(subjectScores);
  const barChartValues = barChartLabels.map((sub) => {
    const st = subjectScores[sub];
    return Math.round((st.score / st.total) * 100);
  });

  const barChartData = {
    labels: barChartLabels.length > 0 ? barChartLabels : ['No subjects yet'],
    datasets: [
      {
        label: 'Average Score %',
        data: barChartValues.length > 0 ? barChartValues : [0],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <SettingsBar />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Study Progress
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Track your quiz performance, subject mastery, and historical test attempts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              disabled={history.length === 0}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Quizzes
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {totalQuizzes}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Tests completed</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Score
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {averageScore}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across all attempts</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Best Subject
            </span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-violet-600 dark:text-violet-400 truncate">
              {bestSubject}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {bestAvg >= 0 ? `${Math.round(bestAvg * 100)}% avg score` : 'Take quiz to compute'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Questions Solved
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {totalCorrect} / {totalQuestions}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Correct answers</p>
          </div>
        </div>

        {/* Charts Section */}
        {history.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score % Over Time (Line Chart) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Score % Over Time
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Track how your performance is improving with each attempt
              </p>
              <div className="h-64 sm:h-72 w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>

            {/* Subject Breakdown (Bar Chart) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Average Score by Subject
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Identifies your strongest and weakest engineering modules
              </p>
              <div className="h-64 sm:h-72 w-full">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No Quiz Attempts Yet
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Complete your first 5 or 10-question quiz in DBMS, OS, or DSA to see charts, progress trends, and strengths.
            </p>
            <Link
              href="/quiz"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all inline-flex items-center gap-2"
            >
              <span>Take Your First Quiz</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        {/* History Table */}
        {history.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Attempt History Log ({history.length} records)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {history.map((item) => (
                    <tr key={item.id || item.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {item.subject}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate" title={item.topic}>
                        {item.topic}
                      </td>
                      <td className="py-3 px-4 uppercase text-xs font-mono">
                        {item.language}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {item.score} / {item.total}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.percentage >= 80
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : item.percentage >= 60
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {item.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
