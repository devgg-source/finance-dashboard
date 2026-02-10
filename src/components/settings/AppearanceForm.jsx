import { useSettings } from '../../context/SettingsContext';
import { useLanguage, supportedLanguages } from '../../context/LanguageContext';

const AppearanceForm = () => {
  const { currency, updateSetting } = useSettings();
  const { language, setLanguage } = useLanguage();

  const currencies = [
    { value: 'INR', label: 'Indian Rupee (₹)' },
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' }
  ];

  return (
    <div className="bg-[#12121a] rounded-2xl p-6 border border-white/[0.06]">
      <h3 className="text-lg font-semibold text-white mb-6">Preferences</h3>
      
      {/* Currency & Language */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Currency</label>
          <select
            value={currency}
            onChange={(e) => updateSetting('currency', e.target.value)}
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            {currencies.map((curr) => (
              <option key={curr.value} value={curr.value}>
                {curr.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1.5">
            Used for displaying amounts
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1.5">
            App interface language
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppearanceForm;
