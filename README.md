# Xpensio — Personal Finance Tracker with Recurring Transaction Detection

I built Xpensio because every free finance app I tried had the same problem: they tracked what I'd already spent, but never warned me about what was coming. Subscriptions I forgot about, bills due tomorrow, rent I hadn't budgeted for — the important stuff always slipped through.

So I built a tool that actually solves this. Xpensio scans your transaction history, detects recurring patterns (subscriptions, EMIs, rent, salary), and tells you what's due, what's overdue, and how much your recurring commitments actually cost per month/year. No more surprise charges.

![Xpensio](https://img.shields.io/badge/version-2.3-blue.svg)

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

### Other Features

- **Full transaction management** — Add, edit, delete, filter, search
- **Analytics dashboard** — 6-month trends, spending by day of week, category breakdown
- **Auth & cloud sync** — Supabase authentication with row-level security
- **Offline-capable** — IndexedDB for local storage, localStorage fallback for recurring data
- **5 languages** — English, Hindi, Tamil, Spanish, French (complete i18n, not just UI labels — insights, categories, and chart labels are all translated)
- **Data export** — Download your transactions as JSON

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
```

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
│   └── insightsEngine.js      # Rule-based financial insights
├── context/
│   ├── RecurringContext.jsx    # Recurring transaction state + Supabase/localStorage sync
│   ├── FinanceContext.jsx      # Transaction state + computed metrics
│   ├── AuthContext.jsx         # Supabase auth
│   ├── LanguageContext.jsx     # i18n with 5 languages
│   ├── SettingsContext.jsx     # User preferences
│   ├── SidebarContext.jsx      # UI state
│   └── ToastContext.jsx        # Notification queue system
├── pages/
│   ├── RecurringPage.jsx       # Recurring transaction management
│   ├── TransactionsPage.jsx    # Transaction CRUD + filters
│   ├── AnalyticsPage.jsx       # Charts and financial metrics
│   └── SettingsPage.jsx        # Profile, security, preferences
├── components/
│   ├── AIInsights.jsx          # Dashboard insight cards
│   ├── Charts.jsx              # Recharts area + pie charts
│   ├── Sidebar.jsx             # Collapsible nav
│   └── ui/                     # Button, Loader, ConfirmDialog
├── services/
│   ├── supabase.js             # Supabase client + transaction/recurring/auth services
│   └── indexedDB.js            # IndexedDB wrapper for offline support
├── locales/                    # en.json, hi.json, ta.json, es.json, fr.json
└── App.jsx                     # Routing, providers, lazy loading
```

## Tech Stack

- **React 18** with Vite — code-split pages, lazy-loaded heavy components
- **Tailwind CSS** — dark theme, responsive layout
- **Supabase** — PostgreSQL + Auth + Row Level Security
- **Recharts** — interactive area and pie charts
- **Lucide** — consistent icon set
- **React Router 6** — protected + public routes

## Roadmap

- [ ] CSV/PDF bank statement import
- [ ] Budget goals with threshold alerts
- [ ] PWA with service worker for full offline support
- [ ] Browser notifications for upcoming bills
- [ ] Light/dark theme toggle

## License

MIT

## Author

**Karthik** — [devgg-source](https://github.com/devgg-source)
