import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const PWAUpdatePrompt = () => {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Check for SW updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:top-6 md:w-96 z-[60] animate-slide-down">
      <div className="bg-[#1a1a24] border border-indigo-500/30 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-0.5">
              {t('pwa.updateTitle') || 'Update Available'}
            </h3>
            <p className="text-xs text-slate-400">
              {t('pwa.updateDescription') || 'A new version of Xpensio is available. Refresh to update.'}
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('pwa.refresh') || 'Refresh'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-slate-400 hover:text-white text-xs font-medium rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {t('pwa.later') || 'Later'}
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-500 hover:text-white rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
