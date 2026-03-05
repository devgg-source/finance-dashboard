# Xpensio — AI-Powered Personal Finance Tracker with Recurring Transaction Detection

I built Xpensio because every free finance app I tried had the same problem: they tracked what I'd already spent, but never warned me about what was coming. Subscriptions I forgot about, bills due tomorrow, rent I hadn't budgeted for — the important stuff always slipped through.

So I built a tool that actually solves this. Xpensio scans your transaction history, detects recurring patterns (subscriptions, EMIs, rent, salary), and tells you what's due, what's overdue, and how much your recurring commitments actually cost per month/year. Now with an AI assistant powered by CopilotKit (AG-UI) that lets you manage finances through natural conversation. No more surprise charges.

![Xpensio](https://img.shields.io/badge/version-3.1-blue.svg)

## The Problem

Most personal finance tools are glorified spreadsheets. You enter transactions, see pie charts, and that's it. But the real pain points are:

1. **Forgetting subscriptions** — Netflix, Spotify, gym, cloud storage... small amounts that add up to ₹5,000+/month without you realizing
2. **Missing bill deadlines** — Electricity, internet, insurance premiums due at irregular intervals
3. **No forward visibility** — You know what you spent last month, but not what you'll owe next week

## How Xpensio Solves This

### Recurring Transaction Detection Engine

The core of this app is a pattern detection algorithm in [`src/utils/recurringDetector.js`](src/utils/recurringDetector.js) that:

1. **Groups transactions** by normalized description (case-insensitive, stripped of reference numbers and dates)
2. **Analyzes timing intervals** between transactions in each group to detect weekly, biweekly, monthly, quarterly, or yearly patterns
3. **Checks amount consistency** — allows up to 10% variance (utility bills fluctuate)
4. **Scores confidence** by combining interval regularity + amount similarity
5. **Suggests detected patterns** to the user with one-click tracking

Once tracked, recurring transactions show:
- **Overdue alerts** — missed payments highlighted in red
- **Due soon warnings** — payments coming in the next 3 days
- **Monthly cost rollup** — total recurring expenses and income normalized to monthly
- **Mark as paid** — creates the actual transaction and advances the next due date
- **Pause/Resume** — temporarily disable tracking without losing history

### AI-Powered Financial Insights

A rule-based insights engine ([`src/utils/insightsEngine.js`](src/utils/insightsEngine.js)) analyzes your data and surfaces actionable alerts:

- Spending increased 30% vs last month? Critical alert.
- Saving less than 20% of income? Warning with a target.
- 3 overdue recurring payments? Shows up on your dashboard.
- Your recurring expenses total ₹8,000/month (₹96,000/year)? You should know that.

No external API calls. No data leaves your browser. All analysis runs client-side.

### AI Financial Assistant (CopilotKit / AG-UI)

Xpensio v3.1 integrates [CopilotKit](https://copilotkit.ai) to provide a conversational AI assistant that understands your financial data in real-time:

- **Natural language interaction** — Ask "How much did I spend on food this month?" or "Add ₹500 expense for groceries" and the assistant responds with context-aware answers
- **Full data visibility** — The assistant has read access to your financial summary, monthly trends, expense breakdown, categories, and recent transactions via `useCopilotReadable` hooks
- **Action execution** — Add transactions, delete transactions, search by keyword, get spending by category, and analyze monthly trends — all through conversation via `useCopilotAction` hooks
- **SaaS-style panel** — Modern right-side slide-in panel (not a floating bubble), pushes content on desktop, overlays on mobile/tablet
- **Responsive design** — Full-width on mobile, 380px overlay on tablet, 400px push-content on desktop
- **Keyboard shortcuts** — `⌘/` to toggle, `Escape` to close
- **Dark theme** — Fully styled to match Xpensio's dark UI with indigo accent gradients

The assistant is powered by CopilotKit's AG-UI protocol. Financial context is shared via [`src/components/CopilotProvider.jsx`](src/components/CopilotProvider.jsx), and the chat panel lives in [`src/components/AIChatPanel.jsx`](src/components/AIChatPanel.jsx).

### Smart Amount Input with Math Expressions

The transaction amount field supports inline math expressions — no need for a calculator:

| You type | Result |
|----------|--------|
| `500+200` | ₹700 |
| `1500*3` | ₹4,500 |
| `10000/4` | ₹2,500 |
| `(1200+800)*0.18` | ₹360 |
| `5000-1500+200` | ₹3,700 |

- Live preview shows the computed result while typing (with calculator icon)
- Expression auto-evaluates on blur
- Uses a safe recursive-descent parser ([`src/utils/mathEvaluator.js`](src/utils/mathEvaluator.js)) — no `eval()`, supports `+`, `-`, `*`, `/`, parentheses, decimals

### Other Features

- **Full transaction management** — Add, edit, delete, filter, search
- **Analytics dashboard** — 6-month trends, spending by day of week, category breakdown
- **Auth & cloud sync** — Supabase authentication with row-level security
- **Offline-capable** — IndexedDB for local storage, localStorage fallback for recurring data
- **5 languages** — English, Hindi, Tamil, Spanish, French (complete i18n, not just UI labels — insights, categories, and chart labels are all translated)
- **Smart amount input** — Type math expressions like `500+200` or `(1200+800)*0.18` directly in the amount field with live preview
- **Data export** — Download your transactions as JSON

### Progressive Web App (PWA)

Xpensio is a fully installable PWA. This isn't just a manifest slapped on — it's designed to work like a native app on your phone:

- **Install to home screen** — Launches in standalone mode without the browser chrome. A smart install prompt appears after 3 seconds with a 7-day dismiss cooldown so it's not annoying.
- **Offline-first** — Workbox precaches all static assets (JS, CSS, HTML, icons). Google Fonts are cached with a CacheFirst strategy (1-year TTL). The app loads instantly even without internet.
- **Background updates** — Service worker checks for updates every hour. When a new version is available, a non-intrusive prompt lets you refresh when ready.
- **iOS support** — Apple touch icon, `apple-mobile-web-app-capable` meta tags, `viewport-fit=cover` for edge-to-edge display.

### Mobile Responsive Design

Built mobile-first with Tailwind breakpoints at `sm` (640px), `md` (768px), and `lg` (1024px):

- **Sidebar** → Mobile overlay drawer with backdrop blur, hamburger menu in a fixed top header, auto-closes on navigation
- **Transaction table** → Collapses to compact card layout below 1024px with always-visible action buttons (no hover dependency on touch)
- **Recurring cards** → Stack vertically below 768px with wrapping metadata
- **Charts** → Pie chart and legend stack vertically on small screens, legend uses 2-column grid
- **Auth pages** → Reduced padding on small devices to maximize form space

## Technical Decisions Worth Noting

### Why IndexedDB + Supabase (not just one)?

Supabase handles auth and cloud sync, but I wanted the app to work when:
- The user's internet drops mid-session
- The Supabase free tier rate-limits requests
- The recurring_transactions table hasn't been created yet (graceful fallback to localStorage)

This dual-storage approach taught me more about data consistency and conflict resolution than any tutorial would.

### Why a custom i18n system instead of react-i18next?

The app needed to translate dynamic content — AI insight messages with interpolated values like "spending up {{percent}}%", category names inside sentences, chart labels. A lightweight Context-based system with JSON locale files gave me full control without the 40KB bundle cost of a library. Five language files, one `useTranslation` hook, zero dependencies.

### Why rule-based insights instead of calling an LLM?

Three reasons:
1. **Privacy** — Financial data shouldn't leave the browser
2. **Cost** — No API keys, no usage limits, no billing surprises
3. **Speed** — Instant analysis on every transaction change, no network latency

The detection engine uses statistical methods (interval matching with tolerance windows, amount deviation ratios) that are deterministic and explainable.

## Getting Started

### Prerequisites
- Node.js 16+
- Supabase account (free tier works)

### Setup

```bash
git clone https://github.com/devgg-source/finance-dashboard.git
cd finance-dashboard
npm install
```

Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
VITE_COPILOTKIT_PUBLIC_API_KEY=your_copilotkit_public_api_key
```

> Get a free CopilotKit API key at [cloud.copilotkit.ai](https://cloud.copilotkit.ai). The app works without it — the AI assistant panel simply won't connect.

Set up the database:
```sql
-- Transactions table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'savings')),
  category text not null,
  description text,
  amount numeric not null,
  date date not null,
  created_at timestamp with time zone default now()
);

-- Recurring transactions table
create table recurring_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense', 'savings')),
  category text not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  start_date date not null,
  next_due_date date not null,
  last_paid_date date,
  is_active boolean default true,
  is_auto_detected boolean default false,
  confidence integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS on both tables
alter table transactions enable row level security;
alter table recurring_transactions enable row level security;

-- RLS policies for transactions
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- RLS policies for recurring_transactions
create policy "Users can view own recurring" on recurring_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own recurring" on recurring_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own recurring" on recurring_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own recurring" on recurring_transactions for delete using (auth.uid() = user_id);
```

Run:
```bash
npm run dev
```

> **Note:** The recurring transactions feature works without the Supabase table — it falls back to localStorage automatically.

## Project Structure

```
src/
├── utils/
│   ├── recurringDetector.js   # Pattern detection algorithm
│   ├── insightsEngine.js      # Rule-based financial insights
│   └── mathEvaluator.js       # Safe recursive-descent math expression parser
├── context/
│   ├── RecurringContext.jsx    # Recurring transaction state + Supabase/localStorage sync
│   ├── FinanceContext.jsx      # Transaction state + computed metrics
│   ├── AuthContext.jsx         # Supabase auth
│   ├── LanguageContext.jsx     # i18n with 5 languages
│   ├── SettingsContext.jsx     # User preferences
│   ├── SidebarContext.jsx      # UI state + AI panel state
│   └── ToastContext.jsx        # Notification queue system
├── pages/
│   ├── RecurringPage.jsx       # Recurring transaction management
│   ├── TransactionsPage.jsx    # Transaction CRUD + filters + math expressions
│   ├── AnalyticsPage.jsx       # Charts and financial metrics
│   └── SettingsPage.jsx        # Profile, security, preferences
├── components/
│   ├── AIChatPanel.jsx         # CopilotKit right-side AI chat panel
│   ├── CopilotProvider.jsx     # Readable state + action hooks for CopilotKit
│   ├── AIInsights.jsx          # Dashboard insight cards
│   ├── Charts.jsx              # Recharts area + pie charts
│   ├── Sidebar.jsx             # Collapsible nav + mobile drawer + AI toggle
│   ├── PWAInstallPrompt.jsx    # Smart install-to-home-screen prompt
│   ├── PWAUpdatePrompt.jsx     # Service worker update notification
│   └── ui/                     # Button, Loader, ConfirmDialog
├── services/
│   ├── supabase.js             # Supabase client + transaction/recurring/auth services
│   └── indexedDB.js            # IndexedDB wrapper for offline support
├── locales/                    # en.json, hi.json, ta.json, es.json, fr.json
└── App.jsx                     # Routing, providers, CopilotKit wrapper
```

## Tech Stack

- **React 18** with Vite — code-split pages, lazy-loaded heavy components
- **CopilotKit (AG-UI)** — AI assistant with shared financial state and action execution
- **Tailwind CSS** — dark theme, mobile-first responsive layout
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Workbox (vite-plugin-pwa)** — service worker, precaching, runtime cache strategies
- **Recharts** — interactive area and pie charts
- **Lucide** — consistent icon set
- **React Router 6** — protected + public routes

## Roadmap

- [x] PWA with service worker for full offline support
- [x] AI financial assistant via CopilotKit (AG-UI)
- [x] Math expression support in amount input
- [ ] LangGraph agent backend for deeper AI reasoning
- [ ] CSV/PDF bank statement import
- [ ] Budget goals with threshold alerts
- [ ] Browser notifications for upcoming bills
- [ ] Light/dark theme toggle

## License

MIT

## Author

**Karthik** — [devgg-source](https://github.com/devgg-source)
