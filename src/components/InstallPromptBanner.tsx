import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Wallet } from 'lucide-react';
import { sound } from '../utils/audio';

const DISMISS_KEY = 'cg_install_banner_dismissed';

export const InstallPromptBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    const isDismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!isStandalone && !isDismissed && isIOS) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sound.playTap();
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 max-w-lg mx-auto bg-zinc-900/95 dark:bg-zinc-800/95 text-white p-4 rounded-2xl shadow-xl border border-zinc-700/60 backdrop-blur-md animate-slide-up flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-white text-zinc-900 flex items-center justify-center shrink-0">
        <Wallet className="w-[18px] h-[18px]" />
      </div>

      <div className="flex-1 pr-1">
        <h4 className="text-sm font-semibold mb-0.5">Instale o app</h4>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Toque em <b>Compartilhar</b> <Share className="w-3.5 h-3.5 inline mx-0.5" /> e depois em{' '}
          <b>Adicionar à Tela de Início</b> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fechar dica"
        className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
