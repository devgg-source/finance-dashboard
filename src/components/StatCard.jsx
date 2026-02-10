import { TrendingUp, TrendingDown } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../context/LanguageContext';

const StatCard = ({ title, amount, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const { formatCurrency } = useSettings();
  const { t } = useTranslation();
  
  const colorConfig = {
    primary: {
      gradient: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/20',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
    },
    green: {
      gradient: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
    },
    red: {
      gradient: 'from-rose-400 to-pink-500',
      shadow: 'shadow-rose-500/20',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
    },
    orange: {
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
    },
  };

  const config = colorConfig[color] || colorConfig.primary;

  return (
    <div className="group relative bg-[#12121a] rounded-2xl p-6 border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300 overflow-hidden">
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{formatCurrency(amount)}</h3>
          
          <div className="flex items-center gap-2">
            {trendValue === 0 ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400">
                {t('dashboard.noChange')}
              </div>
            ) : (
              <>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  trend === 'up' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trendValue}%
                </div>
                <span className="text-slate-500 text-xs">{t('dashboard.vsLastMonth')}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Icon with gradient background */}
        <div className="relative">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg ${config.shadow}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={`absolute -inset-1 bg-gradient-to-br ${config.gradient} rounded-xl blur opacity-25`} />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
};

export default StatCard;
