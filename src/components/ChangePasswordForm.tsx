import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { KeyRound, Loader2, X, LogOut, Check } from 'lucide-react';
import { changePassword, MIN_PASSWORD_LENGTH } from '../lib/api';

interface ChangePasswordFormProps {
  session: Session;
  /** First-access mode: rendered full-screen, cannot be dismissed. */
  forced?: boolean;
  onDone: () => void;
  onCancel?: () => void;
  onSignOut?: () => void;
}

const inputClass =
  'w-full px-3.5 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition';

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  session,
  forced,
  onDone,
  onCancel,
  onSignOut,
}) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return setError('Informe a senha atual.');
    if (next.length < MIN_PASSWORD_LENGTH)
      return setError(`A nova senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (next === current) return setError('A nova senha precisa ser diferente da atual.');
    if (next !== confirm) return setError('A confirmação não confere com a nova senha.');

    setError('');
    setLoading(true);
    try {
      await changePassword(session, current, next);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Hidden username helps password managers associate the new password */}
      <input type="text" name="username" autoComplete="username" value={session.user.email ?? ''} readOnly hidden />

      <div>
        <label htmlFor="current-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {forced ? 'Senha padrão (atual)' : 'Senha atual'}
        </label>
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={e => setCurrent(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={e => setNext(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-zinc-500 mt-1.5">Mínimo de {MIN_PASSWORD_LENGTH} caracteres.</p>
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Confirmar nova senha
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        <span>{loading ? 'Salvando…' : 'Salvar nova senha'}</span>
      </button>
    </form>
  );

  if (forced) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col pt-safe pb-safe px-5">
        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto py-10">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-5">
            <KeyRound className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Defina uma nova senha</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-7">
            Este é seu primeiro acesso. Por segurança, substitua a senha padrão por uma senha pessoal.
          </p>
          {form}
          {onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              className="mt-6 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 inline-flex items-center gap-1.5 self-center cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl animate-slide-up max-h-[92vh] overflow-y-auto pb-safe">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Alterar senha</h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {form}
      </div>
    </div>
  );
};
