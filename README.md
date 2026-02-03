# Finance Dashboard v1.0

A modern, elegant personal finance dashboard built with React. Track your income, expenses, and savings with beautiful visualizations and a sleek dark UI.

![Finance Dashboard](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)

## ✨ Features

### Dashboard
- **Real-time Statistics** - View total balance, income, expenses, and savings at a glance
- **Monthly Trends** - Track percentage changes compared to the previous month
- **Interactive Charts** - Visualize your financial data with beautiful area and pie charts
- **Recent Transactions** - Quick overview of your latest financial activity

### Transactions
- **Full CRUD Operations** - Add, view, and delete transactions
- **Smart Filtering** - Filter by type (income/expense/savings), category, or search by description
- **Category Management** - Organized categories with icons for easy identification
- **Persistent Storage** - All data saved locally using IndexedDB

### Analytics
- **Income vs Expenses** - 6-month trend visualization
- **Spending Patterns** - Analyze spending by day of the week
- **Category Breakdown** - See where your money goes with detailed pie charts
- **Key Metrics** - Average income, expense, and transaction counts

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2 with Vite
- **Styling**: Tailwind CSS 3.x
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM 6
- **Storage**: IndexedDB (persistent local storage)
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/devgg-source/finance-dashboard.git
cd finance-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

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
│   ├── Sidebar.jsx      # Collapsible navigation sidebar
│   ├── StatCard.jsx     # Statistics display cards
│   ├── Toast.jsx        # Notification component
│   └── TransactionList.jsx
├── context/             # React Context providers
│   ├── FinanceContext.jsx   # Finance data & operations
│   ├── SidebarContext.jsx   # Sidebar collapse state
│   └── ToastContext.jsx     # Toast notifications
├── pages/               # Route pages
│   ├── TransactionsPage.jsx
│   ├── AnalyticsPage.jsx
│   └── SettingsPage.jsx     # (Hidden for V1)
├── services/
│   └── indexedDB.js     # IndexedDB service layer
├── data/
│   └── mockData.js      # Categories & initial data
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

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Settings page with user preferences
- [ ] Data export (CSV/PDF)
- [ ] Budget goals and alerts
- [ ] Recurring transactions
- [ ] Multiple currency support
- [ ] User authentication
- [ ] Cloud sync

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Karthik** - [devgg-source](https://github.com/devgg-source)

---

<p align="center">
  Made with ❤️ using React & Tailwind CSS
</p>
