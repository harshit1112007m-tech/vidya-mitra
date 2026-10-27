import { Inter, Noto_Sans_Gujarati, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { SettingsProvider } from '@/lib/settings-context';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoGujarati = Noto_Sans_Gujarati({
  weight: ['400', '500', '600', '700'],
  subsets: ['gujarati'],
  variable: '--font-noto-gujarati',
  display: 'swap',
});

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

export const metadata = {
  title: 'Vidya Mitra (વિદ્યા મિત્ર) - Regional AI Study Assistant for IT & Engineering',
  description:
    'Empowering IT and Engineering students to master complex technical concepts in Gujarati, Hindi, and English with real-life analogies, exam summaries, quizzes, and flashcards.',
  keywords: [
    'Vidya Mitra',
    'Gujarati AI',
    'Hindi AI',
    'Engineering Study Assistant',
    'DBMS in Gujarati',
    'DSA in Hindi',
    'GTU Study Helper',
    'Regional Education AI',
  ],
  authors: [{ name: 'Vidya Mitra Team' }],
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎓</text></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${notoGujarati.variable} ${notoDevanagari.variable}`}>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors selection:bg-indigo-500 selection:text-white">
        <SettingsProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 transition-colors">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-bold text-base bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Vidya Mitra
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-gujarati">
                    • વિદ્યા મિત્ર • विद्या मित्र
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dedicated to engineering & IT students across Gujarat and India. Learn in your mother tongue.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Powered by Google Gemini 2.5</span>
                <span>•</span>
                <span>Zero Server Storage</span>
                <span>•</span>
                <span>Vercel Ready</span>
              </div>
            </div>
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
