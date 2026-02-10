/**
 * Rule-Based AI Insights Engine
 * Analyzes financial data and generates smart recommendations
 */

// Insight priority levels
export const PRIORITY = {
  CRITICAL: 'critical',  // Red - urgent issues
  WARNING: 'warning',    // Yellow - needs attention
  POSITIVE: 'positive',  // Green - achievements
  TIP: 'tip'            // Blue - suggestions
};

// Insight categories
export const CATEGORY = {
  SPENDING: 'spending',
  SAVINGS: 'savings',
  BUDGET: 'budget',
  TREND: 'trend',
  CATEGORY_ANALYSIS: 'category'
};

/**
 * Main function to generate all insights
 * @param {Array} transactions - All user transactions
 * @returns {Array} Array of insight objects
 */
export const generateInsights = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [{
      id: 'no-data',
      priority: PRIORITY.TIP,
      category: CATEGORY.BUDGET,
      titleKey: 'getStarted',
      messageKey: 'getStartedMessage',
      icon: 'sparkles'
    }];
  }

  const insights = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Categorize transactions by time period
  const { thisMonth, lastMonth, thisYear } = categorizeByPeriod(transactions, currentMonth, currentYear);

  // Generate various insights
  insights.push(...analyzeSpendingTrends(thisMonth, lastMonth));
  insights.push(...analyzeSavingsHealth(thisMonth));
  insights.push(...analyzeCategorySpending(thisMonth, transactions));
  insights.push(...analyzeTransactionPatterns(transactions));
  insights.push(...generateSmartTips(thisMonth, lastMonth, transactions));

  // Sort by priority (critical first, then warning, positive, tip)
  const priorityOrder = { critical: 0, warning: 1, positive: 2, tip: 3 };
  insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 5 most relevant insights
  return insights.slice(0, 5);
};

/**
 * Categorize transactions by time period
 */
const categorizeByPeriod = (transactions, currentMonth, currentYear) => {
  const thisMonth = [];
  const lastMonth = [];
  const thisYear = [];

  transactions.forEach(t => {
    const date = new Date(t.date);
    const month = date.getMonth();
    const year = date.getFullYear();

    if (year === currentYear) {
      thisYear.push(t);
      if (month === currentMonth) {
        thisMonth.push(t);
      } else if (month === currentMonth - 1 || (currentMonth === 0 && month === 11 && year === currentYear - 1)) {
        lastMonth.push(t);
      }
    }
  });

  return { thisMonth, lastMonth, thisYear };
};

/**
 * Calculate totals for a set of transactions
 */
const calculateTotals = (transactions) => {
  return transactions.reduce((acc, t) => {
    const amount = parseFloat(t.amount) || 0;
    if (t.type === 'income') acc.income += amount;
    else if (t.type === 'expense') acc.expense += amount;
    else if (t.type === 'savings') acc.savings += amount;
    return acc;
  }, { income: 0, expense: 0, savings: 0 });
};

/**
 * Analyze spending trends (this month vs last month)
 */
const analyzeSpendingTrends = (thisMonth, lastMonth) => {
  const insights = [];
  const thisMonthTotals = calculateTotals(thisMonth);
  const lastMonthTotals = calculateTotals(lastMonth);

  // Skip if no last month data
  if (lastMonthTotals.expense === 0) return insights;

  const spendingChange = ((thisMonthTotals.expense - lastMonthTotals.expense) / lastMonthTotals.expense) * 100;

  if (spendingChange > 30) {
    insights.push({
      id: 'spending-spike',
      priority: PRIORITY.CRITICAL,
      category: CATEGORY.SPENDING,
      titleKey: 'spendingAlert',
      messageKey: 'spendingAlertMessage',
      icon: 'trending-up',
      value: spendingChange,
      params: { percent: Math.round(spendingChange) }
    });
  } else if (spendingChange > 15) {
    insights.push({
      id: 'spending-increase',
      priority: PRIORITY.WARNING,
      category: CATEGORY.SPENDING,
      titleKey: 'spendingUp',
      messageKey: 'spendingUpMessage',
      icon: 'alert-triangle',
      value: spendingChange,
      params: { percent: Math.round(spendingChange) }
    });
  } else if (spendingChange < -15) {
    insights.push({
      id: 'spending-decrease',
      priority: PRIORITY.POSITIVE,
      category: CATEGORY.SPENDING,
      titleKey: 'greatSavings',
      messageKey: 'greatSavingsMessage',
      icon: 'trending-down',
      value: spendingChange,
      params: { percent: Math.abs(Math.round(spendingChange)) }
    });
  }

  // Income comparison
  if (lastMonthTotals.income > 0) {
    const incomeChange = ((thisMonthTotals.income - lastMonthTotals.income) / lastMonthTotals.income) * 100;
    if (incomeChange > 20) {
      insights.push({
        id: 'income-increase',
        priority: PRIORITY.POSITIVE,
        category: CATEGORY.TREND,
        titleKey: 'incomeBoost',
        messageKey: 'incomeBoostMessage',
        icon: 'dollar-sign',
        value: incomeChange,
        params: { percent: Math.round(incomeChange) }
      });
    } else if (incomeChange < -20) {
      insights.push({
        id: 'income-decrease',
        priority: PRIORITY.WARNING,
        category: CATEGORY.TREND,
        titleKey: 'incomeDrop',
        messageKey: 'incomeDropMessage',
        icon: 'alert-circle',
        value: incomeChange,
        params: { percent: Math.abs(Math.round(incomeChange)) }
      });
    }
  }

  return insights;
};

/**
 * Analyze savings health
 */
const analyzeSavingsHealth = (thisMonth) => {
  const insights = [];
  const totals = calculateTotals(thisMonth);

  if (totals.income === 0) return insights;

  const savingsRate = ((totals.savings) / totals.income) * 100;
  const expenseRate = (totals.expense / totals.income) * 100;

  // Savings rate analysis
  if (savingsRate >= 30) {
    insights.push({
      id: 'excellent-savings',
      priority: PRIORITY.POSITIVE,
      category: CATEGORY.SAVINGS,
      titleKey: 'savingsChampion',
      messageKey: 'savingsChampionMessage',
      icon: 'trophy',
      value: savingsRate,
      params: { percent: Math.round(savingsRate) }
    });
  } else if (savingsRate >= 20) {
    insights.push({
      id: 'good-savings',
      priority: PRIORITY.POSITIVE,
      category: CATEGORY.SAVINGS,
      titleKey: 'goodSavings',
      messageKey: 'goodSavingsMessage',
      icon: 'check-circle',
      value: savingsRate,
      params: { percent: Math.round(savingsRate) }
    });
  } else if (savingsRate >= 10) {
    insights.push({
      id: 'moderate-savings',
      priority: PRIORITY.TIP,
      category: CATEGORY.SAVINGS,
      titleKey: 'lowSavings',
      messageKey: 'lowSavingsMessage',
      icon: 'target',
      value: savingsRate,
      params: { percent: Math.round(savingsRate) }
    });
  } else if (savingsRate > 0) {
    insights.push({
      id: 'low-savings',
      priority: PRIORITY.WARNING,
      category: CATEGORY.SAVINGS,
      titleKey: 'lowSavings',
      messageKey: 'lowSavingsMessage',
      icon: 'alert-triangle',
      value: savingsRate,
      params: { percent: Math.round(savingsRate) }
    });
  } else {
    insights.push({
      id: 'no-savings',
      priority: PRIORITY.CRITICAL,
      category: CATEGORY.SAVINGS,
      titleKey: 'noSavings',
      messageKey: 'noSavingsMessage',
      icon: 'alert-circle',
      value: 0
    });
  }

  // Expense to income ratio
  if (expenseRate > 90) {
    insights.push({
      id: 'high-expense-ratio',
      priority: PRIORITY.CRITICAL,
      category: CATEGORY.BUDGET,
      titleKey: 'overspending',
      messageKey: 'overspendingMessage',
      icon: 'alert-octagon',
      value: expenseRate,
      params: { percent: Math.round(expenseRate) }
    });
  }

  return insights;
};

/**
 * Analyze spending by category
 */
const analyzeCategorySpending = (thisMonth, allTransactions) => {
  const insights = [];
  
  // Get expenses only
  const thisMonthExpenses = thisMonth.filter(t => t.type === 'expense');
  if (thisMonthExpenses.length === 0) return insights;

  // Group by category
  const categoryTotals = {};
  thisMonthExpenses.forEach(t => {
    const category = t.category || 'Other';
    categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(t.amount);
  });

  // Find highest spending category
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const [topCategory, topAmount] = sortedCategories[0] || ['Unknown', 0];
  const totalExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const topCategoryPercent = (topAmount / totalExpenses) * 100;

  if (topCategoryPercent > 40) {
    insights.push({
      id: 'high-category-spending',
      priority: PRIORITY.WARNING,
      category: CATEGORY.CATEGORY_ANALYSIS,
      titleKey: 'topCategory',
      messageKey: 'topCategoryMessage',
      icon: 'pie-chart',
      value: topCategoryPercent,
      params: { category: topCategory, percent: Math.round(topCategoryPercent) },
      metadata: { category: topCategory }
    });
  }

  // Calculate historical average for top category
  const allExpenses = allTransactions.filter(t => t.type === 'expense' && t.category === topCategory);
  if (allExpenses.length > thisMonthExpenses.filter(t => t.category === topCategory).length) {
    const historicalAvg = allExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0) / 
                          Math.max(1, new Set(allExpenses.map(t => new Date(t.date).getMonth())).size);
    
    if (topAmount > historicalAvg * 1.5) {
      insights.push({
        id: 'category-spike',
        priority: PRIORITY.WARNING,
        category: CATEGORY.CATEGORY_ANALYSIS,
        titleKey: 'highSpendingCategory',
        messageKey: 'highSpendingCategoryMessage',
        icon: 'zap',
        value: topAmount,
        params: { category: topCategory, percent: Math.round((topAmount / historicalAvg - 1) * 100) },
        metadata: { category: topCategory, average: historicalAvg }
      });
    }
  }

  return insights;
};

/**
 * Analyze transaction patterns
 */
const analyzeTransactionPatterns = (transactions) => {
  const insights = [];

  // Check transaction frequency
  const thisMonthTxns = transactions.filter(t => {
    const date = new Date(t.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const dayOfMonth = new Date().getDate();
  const expectedTxns = Math.ceil(dayOfMonth / 3); // Expect at least 1 transaction every 3 days

  if (thisMonthTxns.length < expectedTxns && dayOfMonth > 7) {
    insights.push({
      id: 'low-tracking',
      priority: PRIORITY.TIP,
      category: CATEGORY.BUDGET,
      titleKey: 'budgetTip',
      messageKey: 'budgetTipMessage',
      icon: 'edit-3',
      value: thisMonthTxns.length
    });
  }

  // Check for large single transactions
  const largeTransactions = transactions.filter(t => {
    const amount = parseFloat(t.amount);
    const avgAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0) / transactions.length;
    return amount > avgAmount * 3 && t.type === 'expense';
  });

  if (largeTransactions.length > 0) {
    const largest = largeTransactions.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))[0];
    const date = new Date(largest.date);
    const isRecent = (new Date() - date) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
    
    if (isRecent) {
      insights.push({
        id: 'large-expense',
        priority: PRIORITY.TIP,
        category: CATEGORY.SPENDING,
        titleKey: 'reviewSubscriptions',
        messageKey: 'reviewSubscriptionsMessage',
        icon: 'credit-card',
        value: parseFloat(largest.amount),
        metadata: { transaction: largest }
      });
    }
  }

  return insights;
};

/**
 * Generate smart personalized tips
 */
const generateSmartTips = (thisMonth, lastMonth, allTransactions) => {
  const insights = [];
  const thisMonthTotals = calculateTotals(thisMonth);

  // Tip: Emergency fund
  if (thisMonthTotals.savings > 0 && allTransactions.length > 20) {
    const totalSavings = allTransactions
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const monthlyExpense = thisMonthTotals.expense || 
      (allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0) / 6);
    
    const monthsCovered = totalSavings / monthlyExpense;
    
    if (monthsCovered < 3) {
      insights.push({
        id: 'emergency-fund',
        priority: PRIORITY.TIP,
        category: CATEGORY.SAVINGS,
        titleKey: 'emergencyFund',
        messageKey: 'emergencyFundMessage',
        icon: 'shield',
        value: monthsCovered,
        params: { months: monthsCovered.toFixed(1) }
      });
    } else if (monthsCovered >= 6) {
      insights.push({
        id: 'strong-emergency-fund',
        priority: PRIORITY.POSITIVE,
        category: CATEGORY.SAVINGS,
        titleKey: 'consistentSaver',
        messageKey: 'consistentSaverMessage',
        icon: 'shield-check',
        value: monthsCovered,
        params: { months: monthsCovered.toFixed(1) }
      });
    }
  }

  // Tip: Consistent tracking
  const daysWithTransactions = new Set(
    thisMonth.map(t => new Date(t.date).toDateString())
  ).size;
  
  if (daysWithTransactions >= 15) {
    insights.push({
      id: 'consistent-tracking',
      priority: PRIORITY.POSITIVE,
      category: CATEGORY.BUDGET,
      titleKey: 'consistentSaver',
      messageKey: 'consistentSaverMessage',
      icon: 'calendar-check',
      value: daysWithTransactions,
      params: { months: daysWithTransactions }
    });
  }

  return insights;
};

export default generateInsights;
