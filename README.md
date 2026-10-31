# Vidya Mitra (વિદ્યા મિત્ર • विद्या मित्र) 🎓

A complete, production-ready regional-language AI study assistant for Indian IT and Engineering students. Explains complex computer science topics (DBMS, Operating Systems, Computer Networks, DSA, Python, Web Development) in **Gujarati**, **Hindi**, or **English** using intuitive real-life analogies (cricket, train reservation, tea stalls, post offices) while preserving standard technical terms in English for exam and interview success.

---

## 🚀 Key Features

1. **Ask a Doubt (AI Chat)**:
   - Explanations tailored to Gujarati, Hindi, or English.
   - Real-life Indian analogies + short code snippets.
   - Text-to-speech audio reader (`speechSynthesis` with `gu-IN`, `hi-IN`, `en-IN` accents).
   - Voice speech-to-text input using the Web Speech API.
   - Context-aware doubt clearing (preserves last 6 messages).

2. **Notes & PDF Summarizer**:
   - Zero-server PDF parsing: reads lecture slides directly in browser using `pdf.js` via cdnjs.
   - Generates 5-7 key bullets, high-yield IT definitions, and a 1-paragraph summary.
   - One-click copy and `.txt` file download.

3. **Interactive MCQ Quizzes**:
   - 5 or 10 question adaptive quizzes with difficulty levels (Beginner, Intermediate, Advanced).
   - Instant scoring with color-coded review and detailed explanations.
   - Saves attempts to browser `localStorage`.

4. **3D Revision Flashcards**:
   - 8 high-yield cards per topic for vivas and midterms.
   - Smooth 3D CSS card flipping animation.
   - Keyboard navigation (`Space` to flip, `ArrowLeft` / `ArrowRight` to navigate).

5. **My Progress Analytics**:
   - Powered by Chart.js & `react-chartjs-2`.
   - Line chart showing score trajectory over time.
   - Bar chart breaking down average performance per subject.
   - Stat cards and historical table with CSV export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, JavaScript only, React 18)
- **Styling**: Tailwind CSS (with Dark / Light theme toggle)
- **AI Backend**: Google Gemini API via official `@google/genai` package
- **Charts**: `chart.js` + `react-chartjs-2`
- **PDF Extraction**: Browser-side `pdf.js` from cdnjs (no server file storage)
- **Persistence**: Safe `localStorage` wrapper (SSR-guarded, zero server state)
- **Deployment**: Vercel Serverless Functions (zero extra configuration)

---

## 💻 Local Run Steps (Windows)

1. Open PowerShell or Command Prompt in the project folder:
   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env.local`:
   ```powershell
   copy .env.example .env.local
   ```

3. Open `.env.local` and paste your Google Gemini API key and Supabase credentials:
   ```env
   GEMINI_API_KEY=AIzaSy...your_actual_key_here
   MODEL_NAME=gemini-2.5-flash

   # Supabase Multi-User Authentication & Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   *(Get your free Gemini key from [Google AI Studio](https://aistudio.google.com/) and Supabase project from [Supabase](https://supabase.com))*.

   *Database Setup*: Open the Supabase SQL Editor and execute the script in `supabase/schema.sql` to initialize user profiles, chat history, quiz history, and Row-Level Security (RLS).

4. Start the local development server:
   ```powershell
   npm run dev
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## ☁️ Vercel Deployment Steps

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Vidya Mitra"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vidya-mitra.git
   git push -u origin main
   ```

2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `vidya-mitra` GitHub repository.
4. Framework Preset will be automatically detected as **Next.js**. Root Directory stays `./`.
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `MODEL_NAME`: `gemini-2.5-flash` *(Optional, defaults to gemini-2.5-flash)*
6. Click **Deploy**. Vercel will build and deploy the app in under 60 seconds!
7. *Note*: If you ever update or change your environment variables in Vercel settings, trigger a **Redeploy** for the new values to take effect in serverless functions.

---

## ⚠️ Common Errors & Fixes

1. **`Server is missing GEMINI_API_KEY`**:
   - *Cause*: The `GEMINI_API_KEY` environment variable is not defined in `.env.local` (locally) or in Vercel Project Settings (production).
   - *Fix*: Add `GEMINI_API_KEY=your_key` to `.env.local` and restart `npm run dev`, or add it under Vercel Settings > Environment Variables and redeploy.

2. **`Rate limit reached, please wait a minute and try again` (HTTP 429)**:
   - *Cause*: Exceeded free-tier quota on Google AI Studio.
   - *Fix*: Wait 60 seconds and retry, or use a paid tier Gemini project key.

3. **`npm : File ... npm.ps1 cannot be loaded because running scripts is disabled`**:
   - *Cause*: Windows PowerShell default execution policy blocks `.ps1` wrapper scripts.
   - *Fix*: Use `npm.cmd install` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell.

4. **Microphone button does not appear**:
   - *Cause*: Web Speech API is not supported in non-Chromium browsers or requires an HTTPS/localhost origin.
   - *Fix*: Use Google Chrome, Microsoft Edge, or Brave on `localhost:3000` or on your HTTPS Vercel URL.

5. **PDF text extraction produces empty text**:
   - *Cause*: The uploaded PDF consists of scanned raster images or photocopied pages rather than searchable text layers.
   - *Fix*: Upload digital lecture slides or directly copy-paste the lecture notes into the text box.
