/**
 * Recurring Transaction Detector
 * 
 * Solves a real problem: people forget about subscriptions, rent,
 * and other recurring payments. This engine analyzes transaction
 * history to auto-detect patterns — similar descriptions appearing
 * at regular intervals with consistent amounts.
 * 
 * Detection strategy:
 * 1. Group transactions by normalized description
 * 2. For each group, check if transactions repeat at regular intervals
 * 3. Score each pattern by consistency (amount variance + timing regularity)
 * 4. Return high-confidence matches as detected recurring transactions
 */

import { v4 as uuidv4 } from 'uuid';

// Frequency types
export const FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
};

// Frequency in days (approximate)
const FREQUENCY_DAYS = {
  [FREQUENCY.DAILY]: 1,
  [FREQUENCY.WEEKLY]: 7,
  [FREQUENCY.BIWEEKLY]: 14,
  [FREQUENCY.MONTHLY]: 30,
  [FREQUENCY.QUARTERLY]: 90,
  [FREQUENCY.YEARLY]: 365,
};

// Tolerance for interval matching (in days)
const INTERVAL_TOLERANCE = {
  [FREQUENCY.DAILY]: 0,
  [FREQUENCY.WEEKLY]: 2,
  [FREQUENCY.BIWEEKLY]: 3,
  [FREQUENCY.MONTHLY]: 5,
  [FREQUENCY.QUARTERLY]: 15,
  [FREQUENCY.YEARLY]: 30,
};

/**
 * Normalize a transaction description for grouping
 * "Netflix Subscription" and "netflix subscription" should match
 * Strips extra whitespace, lowercases, removes dates/numbers that look like IDs
 */
const normalizeDescription = (desc) => {
  return desc
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    // Remove trailing reference numbers like #12345
    .replace(/#\d+/g, '')
    // Remove dates within description
    .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g, '')
    .trim();
};

/**
 * Calculate the similarity between two amounts
 * Returns a value between 0 and 1 (1 = identical)
 */
const amountSimilarity = (amounts) => {
  if (amounts.length < 2) return 1;
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  if (avg === 0) return 0;
  
  const maxDeviation = Math.max(...amounts.map(a => Math.abs(a - avg)));
  const deviationRatio = maxDeviation / avg;
  
  // Allow up to 10% deviation for recurring amounts
  return Math.max(0, 1 - deviationRatio);
};

/**
 * Detect the most likely frequency from a series of dates
 * Returns { frequency, confidence, avgInterval }
 */
const detectFrequency = (dates) => {
  if (dates.length < 2) return null;

  // Sort dates chronologically
  const sorted = [...dates].sort((a, b) => a - b);
  
  // Calculate intervals between consecutive transactions
  const intervals = [];
  for (let i = 1; i < sorted.length; i++) {
    const diffMs = sorted[i] - sorted[i - 1];
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }

  if (intervals.length === 0) return null;

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

  // Try to match against known frequencies
  let bestMatch = null;
  let bestScore = 0;

  for (const [freq, expectedDays] of Object.entries(FREQUENCY_DAYS)) {
    const tolerance = INTERVAL_TOLERANCE[freq];
    
    // Count how many intervals fall within tolerance
    const matchingIntervals = intervals.filter(
      interval => Math.abs(interval - expectedDays) <= tolerance
    );
    
    const matchRatio = matchingIntervals.length / intervals.length;
    
    if (matchRatio > bestScore && matchRatio >= 0.5) {
      bestScore = matchRatio;
      bestMatch = {
        frequency: freq,
        confidence: matchRatio,
        avgInterval,
        expectedDays,
      };
    }
  }

  return bestMatch;
};

/**
 * Calculate the next due date based on the last transaction date and frequency
 */
export const calculateNextDueDate = (lastDate, frequency) => {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case FREQUENCY.DAILY:
      date.setDate(date.getDate() + 1);
      break;
    case FREQUENCY.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;
    case FREQUENCY.BIWEEKLY:
      date.setDate(date.getDate() + 14);
      break;
    case FREQUENCY.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case FREQUENCY.QUARTERLY:
      date.setMonth(date.getMonth() + 3);
      break;
    case FREQUENCY.YEARLY:
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * Check if a recurring transaction is overdue
 */
export const isOverdue = (nextDueDate) => {
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Check if a recurring transaction is due soon (within 3 days)
 */
export const isDueSoon = (nextDueDate, daysThreshold = 3) => {
  const due = new Date(nextDueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffDays = (due - today) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= daysThreshold;
};

/**
 * Main detection function: analyze transactions and find recurring patterns
 * 
 * @param {Array} transactions - All user transactions
 * @param {Array} existingRecurring - Already tracked recurring transactions (to avoid duplicates)
 * @returns {Array} Detected recurring transaction patterns
 */
export const detectRecurringTransactions = (transactions, existingRecurring = []) => {
  if (!transactions || transactions.length < 3) return [];

  // Group by normalized description
  const groups = {};
  
  transactions.forEach(t => {
    const key = normalizeDescription(t.description);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(t);
  });

  const detected = [];
  const existingDescriptions = new Set(
    existingRecurring.map(r => normalizeDescription(r.description))
  );

  for (const [normalizedDesc, txns] of Object.entries(groups)) {
    // Need at least 2 transactions to detect a pattern
    if (txns.length < 2) continue;

    // Skip if already tracked
    if (existingDescriptions.has(normalizedDesc)) continue;

    // All transactions in the group should be the same type
    const types = new Set(txns.map(t => t.type));
    if (types.size > 1) continue;

    // Check amount consistency
    const amounts = txns.map(t => parseFloat(t.amount));
    const similarity = amountSimilarity(amounts);
    
    // Require at least 80% amount similarity
    if (similarity < 0.8) continue;

    // Check timing regularity
    const dates = txns.map(t => new Date(t.date));
    const frequencyResult = detectFrequency(dates);
    
    if (!frequencyResult || frequencyResult.confidence < 0.5) continue;

    // Calculate average amount
    const avgAmount = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
    
    // Get the most recent transaction
    const sortedTxns = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostRecent = sortedTxns[0];
    
    // Calculate next due date
    const nextDue = calculateNextDueDate(mostRecent.date, frequencyResult.frequency);

    // Overall confidence score (combines amount similarity + timing regularity)
    const overallConfidence = (similarity + frequencyResult.confidence) / 2;

    detected.push({
      id: uuidv4(),
      description: mostRecent.description, // Use original description (not normalized)
      amount: avgAmount,
      type: mostRecent.type,
      category: mostRecent.category,
      frequency: frequencyResult.frequency,
      confidence: Math.round(overallConfidence * 100),
      startDate: sortedTxns[sortedTxns.length - 1].date,
      nextDueDate: nextDue,
      lastPaidDate: mostRecent.date,
      isActive: true,
      isAutoDetected: true,
      occurrences: txns.length,
    });
  }

  // Sort by confidence (highest first)
  detected.sort((a, b) => b.confidence - a.confidence);

  return detected;
};

/**
 * Get a summary of monthly recurring costs
 */
export const getRecurringSummary = (recurringTransactions) => {
  const active = recurringTransactions.filter(r => r.isActive);
  
  const monthlyExpenses = active
    .filter(r => r.type === 'expense')
    .reduce((total, r) => {
      switch (r.frequency) {
        case FREQUENCY.DAILY: return total + (r.amount * 30);
        case FREQUENCY.WEEKLY: return total + (r.amount * 4.33);
        case FREQUENCY.BIWEEKLY: return total + (r.amount * 2.17);
        case FREQUENCY.MONTHLY: return total + r.amount;
        case FREQUENCY.QUARTERLY: return total + (r.amount / 3);
        case FREQUENCY.YEARLY: return total + (r.amount / 12);
        default: return total + r.amount;
      }
    }, 0);

  const monthlyIncome = active
    .filter(r => r.type === 'income')
    .reduce((total, r) => {
      switch (r.frequency) {
        case FREQUENCY.DAILY: return total + (r.amount * 30);
        case FREQUENCY.WEEKLY: return total + (r.amount * 4.33);
        case FREQUENCY.BIWEEKLY: return total + (r.amount * 2.17);
        case FREQUENCY.MONTHLY: return total + r.amount;
        case FREQUENCY.QUARTERLY: return total + (r.amount / 3);
        case FREQUENCY.YEARLY: return total + (r.amount / 12);
        default: return total + r.amount;
      }
    }, 0);

  const upcoming = active.filter(r => isDueSoon(r.nextDueDate, 7));
  const overdue = active.filter(r => isOverdue(r.nextDueDate));

  return {
    totalActive: active.length,
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlyIncome: Math.round(monthlyIncome),
    upcomingCount: upcoming.length,
    overdueCount: overdue.length,
    upcoming,
    overdue,
  };
};

/**
 * Get frequency display label
 */
export const getFrequencyLabel = (frequency) => {
  const labels = {
    [FREQUENCY.DAILY]: 'Daily',
    [FREQUENCY.WEEKLY]: 'Weekly',
    [FREQUENCY.BIWEEKLY]: 'Bi-weekly',
    [FREQUENCY.MONTHLY]: 'Monthly',
    [FREQUENCY.QUARTERLY]: 'Quarterly',
    [FREQUENCY.YEARLY]: 'Yearly',
  };
  return labels[frequency] || frequency;
};
