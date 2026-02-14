import { useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  AlertCircle,
  AlertOctagon,
  CheckCircle, 
  Trophy,
  Target,
  DollarSign,
  PieChart,
  Zap,
  CreditCard,
  Shield,
  ShieldCheck,
  Edit3,
  CalendarCheck,
  Lightbulb,
  Brain
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useTranslation } from '../context/LanguageContext';
import { generateInsights, generateRecurringInsights, PRIORITY } from '../utils/insightsEngine';
import { useRecurring } from '../context/RecurringContext';

// Icon mapping
const iconMap = {
  'sparkles': Sparkles,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'alert-octagon': AlertOctagon,
  'check-circle': CheckCircle,
  'trophy': Trophy,
  'target': Target,
  'dollar-sign': DollarSign,
  'pie-chart': PieChart,
  'zap': Zap,
  'credit-card': CreditCard,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'edit-3': Edit3,
  'calendar-check': CalendarCheck,
  'lightbulb': Lightbulb,
  'bell-ring': AlertCircle,
  'refresh-cw': Sparkles,
};

// Priority-based styling
const priorityStyles = {
  critical: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    title: 'text-rose-300',
    badge: 'bg-rose-500/20 text-rose-300'
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    title: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-300'
  },
  positive: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    title: 'text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-300'
  },
  tip: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    icon: 'text-indigo-400',
    title: 'text-indigo-300',
    badge: 'bg-indigo-500/20 text-indigo-300'
  }
};

// Single Insight Card
const InsightCard = ({ insight, t }) => {
  const styles = priorityStyles[insight.priority] || priorityStyles.tip;
  const Icon = iconMap[insight.icon] || Lightbulb;

  // Get translated priority label
  const priorityLabel = t(`insights.${insight.priority}`);

  // Get translated title and message
  const getTranslatedText = (key, params = {}) => {
    let text = t(`insights.${key}`);
    // Replace template params like {{percent}}, {{category}}, {{months}}
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{{${param}}}`, value);
    });
    return text;
  };

  const title = insight.titleKey ? getTranslatedText(insight.titleKey, insight.params) : insight.title;
  const message = insight.messageKey ? getTranslatedText(insight.messageKey, insight.params) : insight.message;

  return (
    <div 
      className={`p-4 rounded-xl border ${styles.bg} ${styles.border} 
        transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${styles.title}`}>
              {title}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${styles.badge}`}>
              {priorityLabel}
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main AI Insights Component
const AIInsights = () => {
  const { transactions } = useFinance();
  const { t } = useTranslation();

  // Safely try to get recurring context (may not be available)
  let recurringTransactions = [];
  try {
    const recurring = useRecurring();
    recurringTransactions = recurring?.recurringTransactions || [];
  } catch {
    // RecurringContext not available — that's fine
  }

  const insights = useMemo(() => {
    const baseInsights = generateInsights(transactions);
    const recurringInsights = generateRecurringInsights(recurringTransactions);
    
    // Merge and re-sort by priority
    const all = [...recurringInsights, ...baseInsights];
    const priorityOrder = { critical: 0, warning: 1, positive: 2, tip: 3 };
    all.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return all.slice(0, 6);
  }, [transactions, recurringTransactions]);

  // Format insight count text
  const insightCountText = insights.length === 1 
    ? t('insights.insightCount').replace('{{count}}', insights.length)
    : t('insights.insightsCount').replace('{{count}}', insights.length);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
          <Brain className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{t('insights.title')}</h3>
          <p className="text-xs text-slate-500">{t('insights.subtitle')}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
            {insightCountText}
          </span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} t={t} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/[0.06]">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {t('insights.footer')}
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
