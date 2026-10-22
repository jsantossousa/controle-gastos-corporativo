import React from 'react';
import { X, KeyRound, Volume2, VolumeX, LogOut, Share, PlusSquare, ShieldCheck, ChevronRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { APP_NAME } from '../utils/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  enableAudio: boolean;
  onToggleAudio: () => void;
  onChangePassword: () => void;
  onSignOut: () => void;
}

const rowClass =
  'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  username,
  enableAudio,
  onToggleAudio,
  onChangePassword,
  onSignOut,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-slide-up max-h-[92vh] overflow-y-auto pb-safe">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Configurações</h2>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conta */}
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1">Conta</h3>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <ShieldCheck className="w-[18px] h-[18px] text-zinc-500" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{username}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Dados isolados por usuário</p>
            </div>
          </div>
          <button type="button" onClick={onChangePassword} className={rowClass}>
            <span className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
              <KeyRound className="w-[18px] h-[18px] text-zinc-500" />
              Alterar senha
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
          <button type="button" onClick={onSignOut} className={rowClass}>
            <span className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
              <LogOut className="w-[18px] h-[18px]" />
              Sair da conta
            </span>
          </button>
        </div>

        {/* Preferências */}
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1">
          Preferências
        </h3>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
          <button
            type="button"
            onClick={() => {
              onToggleAudio();
              if (!enableAudio) setTimeout(() => sound.playSuccess(), 50);
            }}
            className={rowClass}
            role="switch"
            aria-checked={enableAudio}
          >
            <span className="flex items-center gap-3 text-sm text-zinc-900 dark:text-white">
              {enableAudio ? (
                <Volume2 className="w-[18px] h-[18px] text-zinc-500" />
              ) : (
                <VolumeX className="w-[18px] h-[18px] text-zinc-500" />
              )}
              Sons de interação
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
                enableAudio ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white dark:bg-zinc-900 shadow transition-transform ${
                  enableAudio ? 'translate-x-5' : ''
                }`}
              />
            </span>
          </button>
        </div>

        {/* Instalação no iPhone */}
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2 px-1">
          Instalar no iPhone
        </h3>
        <ol className="rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 mb-6">
          <li className="flex gap-3 px-4 py-3">
            <span className="text-zinc-400 tabular-nums">1.</span>
            <span>
              No Safari, toque em <b>Compartilhar</b> <Share className="w-4 h-4 inline -mt-0.5" />.
            </span>
          </li>
          <li className="flex gap-3 px-4 py-3">
            <span className="text-zinc-400 tabular-nums">2.</span>
            <span>
              Selecione <b>Adicionar à Tela de Início</b> <PlusSquare className="w-4 h-4 inline -mt-0.5" />.
            </span>
          </li>
          <li className="flex gap-3 px-4 py-3">
            <span className="text-zinc-400 tabular-nums">3.</span>
            <span>
              Confirme em <b>Adicionar</b>.
            </span>
          </li>
        </ol>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">{APP_NAME} · v2.0</p>
      </div>
    </div>
  );
};
