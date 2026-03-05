import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { useFinance } from "../context/FinanceContext";
import { useRecurring } from "../context/RecurringContext";
import { useTranslation } from "../context/LanguageContext";

/**
 * CopilotProvider - Shares app state and actions with the CopilotKit agent.
 * 
 * This component doesn't render anything visible. It uses CopilotKit hooks to:
 * 1. Share financial data as readable context (so the agent knows your finances)
 * 2. Register actions that the agent can trigger (add transactions, navigate, etc.)
 */
export default function CopilotProvider({ children }) {
  const {
    transactions,
    categories,
    totals,
    balance,
    expensesByCategory,
    monthlyData,
    monthlyTrends,
    addTransaction,
    deleteTransaction,
  } = useFinance();

  const { recurringTransactions, summary: recurringSummary } = useRecurring();
  const { t } = useTranslation();

  // ─── Share financial state with the agent ────────────────────────────

  useCopilotReadable({
    description: "The user's financial summary including total income, expenses, savings, and current balance",
    value: JSON.stringify({
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      totalSavings: totals.savings,
      currentBalance: balance,
      currency: "INR (₹)",
    }),
  });

  useCopilotReadable({
    description: "Monthly trends comparing current month vs last month for income, expenses, savings, and balance",
    value: JSON.stringify(monthlyTrends),
  });

  useCopilotReadable({
    description: "The user's recent transactions (last 50). Each has id, type (income/expense/savings), category, description, amount, and date",
    value: JSON.stringify(transactions.slice(0, 50)),
  });

  useCopilotReadable({
    description: "Expense breakdown by category with category name, total amount, and color",
    value: JSON.stringify(expensesByCategory),
  });

  useCopilotReadable({
    description: "Monthly income, expense, and savings data for the last 6 months (for trend analysis)",
    value: JSON.stringify(monthlyData),
  });

  useCopilotReadable({
    description: "Available transaction categories",
    value: JSON.stringify(categories),
  });

  useCopilotReadable({
    description: "Recurring transactions and bills detected from the user's spending patterns",
    value: JSON.stringify({
      recurring: recurringTransactions?.slice(0, 20) || [],
      summary: recurringSummary || null,
    }),
  });

  useCopilotReadable({
    description: "Today's date for reference in financial analysis",
    value: new Date().toISOString().split("T")[0],
  });

  // ─── Register actions the agent can perform ──────────────────────────

  useCopilotAction({
    name: "addTransaction",
    description: "Add a new transaction (income, expense, or savings) to the user's records. Always confirm with the user before adding.",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Transaction type: 'income', 'expense', or 'savings'",
        required: true,
      },
      {
        name: "category",
        type: "string",
        description: "Category ID: food, transport, shopping, entertainment, utilities, health, income, or savings",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "A short description of the transaction",
        required: true,
      },
      {
        name: "amount",
        type: "number",
        description: "The transaction amount in INR",
        required: true,
      },
      {
        name: "date",
        type: "string",
        description: "Transaction date in YYYY-MM-DD format",
        required: true,
      },
    ],
    handler: async ({ type, category, description, amount, date }) => {
      try {
        await addTransaction({ type, category, description, amount, date });
        return `Successfully added ${type} transaction: "${description}" for ₹${amount}`;
      } catch (error) {
        return `Failed to add transaction: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "deleteTransaction",
    description: "Delete a transaction by its ID. Always confirm with the user before deleting.",
    parameters: [
      {
        name: "id",
        type: "string",
        description: "The unique ID of the transaction to delete",
        required: true,
      },
    ],
    handler: async ({ id }) => {
      try {
        await deleteTransaction(id);
        return `Transaction deleted successfully.`;
      } catch (error) {
        return `Failed to delete transaction: ${error.message}`;
      }
    },
  });

  useCopilotAction({
    name: "getSpendingByCategory",
    description: "Analyze spending breakdown across all categories. Use this when the user asks about category-wise spending.",
    parameters: [],
    handler: async () => {
      const total = expensesByCategory.reduce((sum, cat) => sum + cat.value, 0);
      const breakdown = expensesByCategory
        .sort((a, b) => b.value - a.value)
        .map((cat) => ({
          category: cat.name,
          amount: cat.value,
          percentage: total > 0 ? ((cat.value / total) * 100).toFixed(1) + "%" : "0%",
        }));
      return JSON.stringify({ totalExpenses: total, breakdown });
    },
  });

  useCopilotAction({
    name: "getMonthlyTrend",
    description: "Get the income/expense/savings trend for the last 6 months. Use for trend analysis questions.",
    parameters: [],
    handler: async () => {
      return JSON.stringify(monthlyData);
    },
  });

  useCopilotAction({
    name: "searchTransactions",
    description: "Search through transactions by description, category, type, or amount range",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "Search text to match against transaction descriptions",
        required: false,
      },
      {
        name: "type",
        type: "string",
        description: "Filter by type: 'income', 'expense', or 'savings'",
        required: false,
      },
      {
        name: "category",
        type: "string",
        description: "Filter by category ID",
        required: false,
      },
      {
        name: "minAmount",
        type: "number",
        description: "Minimum amount filter",
        required: false,
      },
      {
        name: "maxAmount",
        type: "number",
        description: "Maximum amount filter",
        required: false,
      },
    ],
    handler: async ({ query, type, category, minAmount, maxAmount }) => {
      let results = [...transactions];

      if (query) {
        const q = query.toLowerCase();
        results = results.filter((t) =>
          t.description.toLowerCase().includes(q)
        );
      }
      if (type) results = results.filter((t) => t.type === type);
      if (category) results = results.filter((t) => t.category === category);
      if (minAmount != null) results = results.filter((t) => t.amount >= minAmount);
      if (maxAmount != null) results = results.filter((t) => t.amount <= maxAmount);

      return JSON.stringify({
        count: results.length,
        transactions: results.slice(0, 20),
      });
    },
  });

  return <>{children}</>;
}
