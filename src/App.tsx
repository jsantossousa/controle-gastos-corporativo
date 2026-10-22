import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Plus, Loader2 } from 'lucide-react';
import { Expense, NewExpense, Profile, Theme } from './types';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  fetchProfile,
  fetchExpenses,
  createExpense,
  deleteExpense,
  updateProfile,
  signOut,
} from './lib/api';
import { sound } from './utils/audio';
import { formatMonthLabel, getCurrentMonthKey } from './utils/constants';

// Components
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseModal } from './components/AddExpenseModal';
import { BudgetModal } from './components/BudgetModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { SetupScreen } from './components/SetupScreen';

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthKey, setMonthKey] = useState<string>(getCurrentMonthKey);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [expensesLoading, setExpensesLoading] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('cg_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Sync theme to document element and meta tag
  useEffect(() => {
    const root = document.documentElement;
    const themeMeta = document.getElementById('theme-color-meta');

    if (theme === 'dark') {
      root.classList.add('dark');
      if (themeMeta) themeMeta.setAttribute('content', '#09090b');
    } else {
      root.classList.remove('dark');
      if (themeMeta) themeMeta.setAttribute('content', '#ffffff');
    }
  }, [theme]);

  // Load user profile & sync theme/audio
  const loadUserData = useCallback(async (userId: string) => {
    try {
      const prof = await fetchProfile(userId);
      setProfile(prof);
      if (prof.theme) {
        setTheme(prof.theme);
        try {
          localStorage.setItem('cg_theme', prof.theme);
        } catch {}
      }
      sound.setEnabled(prof.enableAudio);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }, []);

  // Load expenses for selected month
  const loadMonthlyExpenses = useCallback(async (userId: string, targetMonth: string) => {
    setExpensesLoading(true);
    try {
      const data = await fetchExpenses(userId, targetMonth);
      setExpenses(data);
    } catch (err) {
      console.error('Erro ao carregar despesas:', err);
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      if (initialSession) {
        loadUserData(initialSession.user.id);
        loadMonthlyExpenses(initialSession.user.id, monthKey);
      }
      setAuthLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession) {
        loadUserData(currentSession.user.id);
        loadMonthlyExpenses(currentSession.user.id, monthKey);
      } else {
        setProfile(null);
        setExpenses([]);
      }
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData, loadMonthlyExpenses, monthKey]);

  // Reload expenses when month changes
  const handleMonthChange = (newMonth: string) => {
    setMonthKey(newMonth);
    if (session) {
      loadMonthlyExpenses(session.user.id, newMonth);
    }
  };

  // Toggle theme
  const handleToggleTheme = async () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('cg_theme', nextTheme);
    } catch {}
    if (session && profile) {
      setProfile({ ...profile, theme: nextTheme });
      await updateProfile(session.user.id, { theme: nextTheme }).catch(() => {});
    }
  };

  // Toggle audio
  const handleToggleAudio = async () => {
    if (!profile || !session) return;
    const nextAudio = !profile.enableAudio;
    sound.setEnabled(nextAudio);
    setProfile({ ...profile, enableAudio: nextAudio });
    await updateProfile(session.user.id, { enableAudio: nextAudio }).catch(() => {});
  };

  // Sign out
  const handleSignOut = async () => {
    setShowSettingsModal(false);
    await signOut();
  };

  // Add Expense
  const handleAddExpense = async (expenseData: NewExpense) => {
    const created = await createExpense(expenseData);
    // If expense was created in the currently viewed month, prepend to state
    if (expenseData.date.startsWith(monthKey)) {
      setExpenses(prev => [created, ...prev]);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Update Budget
  const handleUpdateBudget = async (newBudget: number) => {
    if (!session || !profile) return;
    await updateProfile(session.user.id, { budget: newBudget });
    setProfile({ ...profile, budget: newBudget });
  };

  // Password changed callback
  const handlePasswordChanged = () => {
    if (profile) {
      setProfile({ ...profile, mustChangePassword: false });
    }
    setShowChangePasswordModal(false);
  };

  // If Supabase credentials are not set up yet
  if (!isSupabaseConfigured) {
    return <SetupScreen />;
  }

  // Initial auth check loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  // Not authenticated: render login screen
  if (!session) {
    return <LoginScreen theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  // First-access forced password change
  if (profile?.mustChangePassword) {
    return (
      <ChangePasswordForm
        session={session}
        forced
        onDone={handlePasswordChanged}
        onSignOut={handleSignOut}
      />
    );
  }

  const budget = profile?.budget ?? 0;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Top Bar */}
      <Header
        displayName={profile?.displayName || 'Usuário'}
        username={profile?.username || ''}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 pb-safe-nav space-y-5">
        {/* Summary Card with Budget, Total Spent, Remaining & Health Bar */}
        <SummaryCard
          budget={budget}
          totalSpent={totalSpent}
          periodLabel={formatMonthLabel(monthKey)}
          onEditBudget={() => setShowBudgetModal(true)}
        />

        {/* Expenses List with Month Navigation */}
        <ExpenseList
          expenses={expenses}
          monthKey={monthKey}
          loading={expensesLoading}
          onChangeMonth={handleMonthChange}
          onDeleteExpense={handleDeleteExpense}
        />

        {/* Corporate footer */}
        <footer className="pt-6 pb-4 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">
            Controle de Gastos Corporativo • Dados Isolados por Usuário
          </p>
        </footer>
      </main>

      {/* Floating Action Button for Adding Expense */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-safe bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent dark:from-zinc-950 dark:via-zinc-950/95 dark:to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              setShowAddModal(true);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-black dark:bg-zinc-100 dark:hover:bg-white dark:active:bg-zinc-200 text-white dark:text-zinc-900 text-base font-semibold shadow-lg shadow-zinc-900/15 dark:shadow-black/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Adicionar gasto</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddExpense}
      />

      <BudgetModal
        isOpen={showBudgetModal}
        currentBudget={budget}
        onClose={() => setShowBudgetModal(false)}
        onSave={handleUpdateBudget}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        username={profile?.username || ''}
        enableAudio={profile?.enableAudio ?? false}
        onToggleAudio={handleToggleAudio}
        onChangePassword={() => {
          setShowSettingsModal(false);
          setShowChangePasswordModal(true);
        }}
        onSignOut={handleSignOut}
      />

      {showChangePasswordModal && (
        <ChangePasswordForm
          session={session}
          onDone={() => setShowChangePasswordModal(false)}
          onCancel={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* iOS PWA Install Prompt */}
      <InstallPromptBanner />
    </div>
  );
};

export default App;
