import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, LogIn, Moon, Sun, Wallet } from 'lucide-react';
import { Theme } from '../types';
import { APP_NAME } from '../utils/constants';
import { isValidUsername, normalizeUsername, signIn } from '../lib/api';

interface LoginScreenProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ theme, onToggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUsername(username);

    if (!isValidUsername(normalized)) {
      setError('Use o formato nome.sobrenome (ex.: maria.silva).');
      return;
    }
    if (!password) {
      setError('Informe sua senha.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signIn(normalized, password);
      // App reacts to the auth state change.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col pt-safe pb-safe px-5 transition-colors">
      <div className="flex justify-end max-w-sm w-full mx-auto">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto pb-16">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-5">
            <Wallet className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Entre com seu usuário corporativo para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="nome.sobrenome"
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-3.5 pr-11 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 animate-shake">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>{loading ? 'Entrando…' : 'Entrar'}</span>
          </button>
        </form>

        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-8 leading-relaxed">
          Problemas de acesso? Procure o administrador do sistema para redefinir sua senha.
        </p>
      </div>
    </div>
  );
};
