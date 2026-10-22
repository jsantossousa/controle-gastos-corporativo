import React from 'react';
import { Sun, Moon, LogOut, Settings } from 'lucide-react';
import { sound } from '../utils/audio';
import { Theme } from '../types';

interface HeaderProps {
  displayName: string;
  username: string;
  theme: Theme;
  onToggleTheme: () => void;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

const iconButton =
  'w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 transition-all cursor-pointer';

export const Header: React.FC<HeaderProps> = ({
  displayName,
  username,
  theme,
  onToggleTheme,
  onSignOut,
  onOpenSettings,
}) => {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return (
    <header className="w-full bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 pt-safe px-4 pb-3 transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        {/* User identification */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-semibold shrink-0">
            {initials || '?'}
          </div>
          <div className="flex flex-col min-w-0">
            <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white truncate">
              {displayName}
            </h1>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{username}</span>
          </div>
        </div>

        {/* Actions: theme, settings, sign out */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onToggleTheme();
            }}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className={iconButton}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onOpenSettings();
            }}
            aria-label="Configurações"
            title="Configurações"
            className={iconButton}
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onSignOut();
            }}
            aria-label="Sair"
            title="Sair"
            className={iconButton}
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
};
