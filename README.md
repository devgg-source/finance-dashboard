# Xpensio v2.2

A modern, elegant personal finance app built with React and Supabase. Track your income, expenses, and savings with beautiful visualizations, AI-powered insights, user authentication, cloud sync, and multi-language support.

![Xpensio](https://img.shields.io/badge/version-2.2-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E.svg)

## ✨ Features

### 🔐 Authentication
- **User Registration** - Sign up with email and password
- **Secure Login** - Email/password authentication via Supabase
- **Password Recovery** - Forgot password with email reset link
- **Password Change** - Update password from settings
- **Protected Routes** - Secure access to dashboard features

### Dashboard
- **Real-time Statistics** - View total balance, income, expenses, and savings at a glance
- **Monthly Trends** - Track percentage changes compared to the previous month
- **Interactive Charts** - Visualize your financial data with beautiful area and pie charts
- **Recent Transactions** - Quick overview of your latest financial activity

### 🤖 AI Insights (New in v2.1)
- **Rule-Based AI Engine** - Smart financial analysis without external APIs
- **Spending Trends** - Compare this month vs last month spending
- **Savings Health** - Track savings rate with personalized recommendations
- **Category Analysis** - Detect unusual spending patterns and anomalies
- **Smart Tips** - Emergency fund tracking, consistency rewards
- **Priority Alerts** - Critical, warning, positive, and tip notifications

### Transactions
- **Full CRUD Operations** - Add, view, and delete transactions
- **Cloud Sync** - All transactions stored in Supabase database
- **Smart Filtering** - Filter by type (income/expense/savings), category, or search by description
- **Category Management** - Organized categories with icons for easy identification

### Analytics
- **Income vs Expenses** - 6-month trend visualization
- **Spending Patterns** - Analyze spending by day of the week
- **Category Breakdown** - See where your money goes with detailed pie charts
- **Key Metrics** - Average income, expense, and transaction counts

### 🌐 Multi-Language Support (New in v2.2)
- **5 Languages** - English, Hindi (हिन्दी), Tamil (தமிழ்), Spanish (Español), French (Français)
- **Complete i18n** - All UI text fully translated
- **Easy Switching** - Change language from Settings > Appearance
- **Persistent Preference** - Language choice saved in settings
- **Dynamic Content** - Charts, insights, categories, and transactions all translated

### ⚙️ Settings
- **Profile Management** - Update display name and email
- **Password Security** - Change password with validation
- **Currency Preferences** - Choose from INR, USD, EUR, GBP
- **Language Selection** - Switch between 4 supported languages
- **Data Export** - Export all transactions as JSON
- **Data Management** - Delete all transaction data with confirmation

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2 with Vite
- **Styling**: Tailwind CSS 3.x
- **Backend**: Supabase (Auth + PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM 6
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/devgg-source/finance-dashboard.git
cd finance-dashboard
git checkout finance-dashboard-v2.1
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file in root directory
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
```

4. Set up Supabase database

Create a `transactions` table in your Supabase project:
```sql
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

-- Enable Row Level Security
alter table transactions enable row level security;

-- Policy: Users can only see their own transactions
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own transactions
create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own transactions
create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own transactions
create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);
```

5. Start the development server
```bash
npm run dev
```

6. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Charts.jsx       # Area and Pie chart components
│   ├── Sidebar.jsx      # Collapsible navigation with user info
│   ├── StatCard.jsx     # Statistics display cards
│   ├── Toast.jsx        # Notification component
│   ├── TransactionList.jsx
│   ├── settings/        # Settings components
│   │   ├── ChangePasswordForm.jsx
│   │   ├── EditProfileForm.jsx
│   │   └── AppearanceForm.jsx
│   └── ui/              # Reusable UI primitives
│       ├── Button.jsx
│       ├── ConfirmDialog.jsx
│       └── Loader.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx      # Authentication state
│   ├── FinanceContext.jsx   # Finance data & operations
│   ├── LanguageContext.jsx  # Multi-language i18n support
│   ├── SettingsContext.jsx  # User preferences
│   ├── SidebarContext.jsx   # Sidebar collapse state
│   └── ToastContext.jsx     # Toast notifications
├── locales/             # Translation files
│   ├── en.json              # English translations
│   ├── hi.json              # Hindi translations
│   ├── ta.json              # Tamil translations
│   ├── es.json              # Spanish translations
│   └── fr.json              # French translations
├── pages/               # Route pages
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── ForgotPasswordPage.jsx
│   ├── TransactionsPage.jsx
│   ├── AnalyticsPage.jsx
│   └── SettingsPage.jsx
├── services/
│   └── supabase.js      # Supabase client & services
├── data/
│   └── mockData.js      # Categories data
├── App.jsx              # Main app with routing
└── main.jsx             # Entry point
```

## 🎨 Design Features

- **Dark Theme** - Easy on the eyes with a modern dark color palette
- **Glassmorphism** - Subtle glass effects and gradients
- **Responsive Layout** - Works on desktop and tablet devices
- **Smooth Animations** - Polished transitions and hover effects
- **Collapsible Sidebar** - More screen space when needed

## ⚡ Performance Optimizations

- **Code Splitting** - Lazy loading for pages and heavy components
- **Suspense Boundaries** - Graceful loading states
- **Memoized Calculations** - Efficient re-renders with useMemo
- **Optimized Context** - Minimal re-renders with useCallback

## 🔄 What's New in v2.2

- ✅ **Multi-Language Support (i18n)** - Full internationalization
- ✅ **5 Languages** - English, Hindi, Tamil, Spanish, French
- ✅ Complete translation of all UI components
- ✅ Translated AI Insights with dynamic messages
- ✅ Translated chart labels and legends
- ✅ Translated categories and transaction types
- ✅ Language selector in Settings > Appearance
- ✅ Custom i18n implementation with React Context

### Previous (v2.1.1)
- ✅ **Edit Transaction** - Edit existing transactions with pre-filled modal
- ✅ **Floored Currency Values** - All amounts display as whole numbers
- ✅ Improved UI with edit/delete action buttons on hover

### Previous (v2.1.0)
- ✅ **AI Insights Engine** - Rule-based smart financial analysis
- ✅ Spending trend analysis (this month vs last)
- ✅ Savings health calculator with recommendations
- ✅ Category spending anomaly detection
- ✅ Transaction pattern analysis
- ✅ Personalized smart tips
- ✅ Priority-based insight cards (critical, warning, positive, tip)
- ✅ Enhanced toast notification system with queue management

### Previous (v2.0)
- ✅ User authentication (signup, login, logout)
- ✅ Password recovery via email
- ✅ Cloud database with Supabase
- ✅ Row Level Security for user data isolation
- ✅ Settings page with profile management
- ✅ Change password functionality
- ✅ Multi-currency support (INR, USD, EUR, GBP)
- ✅ Data export as JSON
- ✅ Delete all data with confirmation
- ✅ Reusable UI components (Button, Loader, ConfirmDialog)
- ✅ Improved sidebar with user avatar and logout

## 🗺️ Roadmap

### Version 3.0 (Planned)
- [ ] AI Chat Assistant (OpenAI/Gemini integration)
- [ ] Light/Dark theme toggle
- [x] ~~Multi-language support (i18n)~~ ✅ Added in v2.2
- [ ] Data export as CSV/PDF
- [ ] Budget goals and alerts
- [ ] Recurring transactions
- [ ] Mobile responsive improvements
- [ ] PWA support

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Karthik** - [devgg-source](https://github.com/devgg-source)

---

<p align="center">
  Made with ❤️ using React, Tailwind CSS & Supabase
</p>
