import React, { useState } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import { Expense } from '../types';
import {
  CATEGORIES,
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../utils/constants';
import { sound } from '../utils/audio';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseListProps {
  expenses: Expense[];
  monthKey: string;
  loading: boolean;
  onChangeMonth: (monthKey: string) => void;
  onDeleteExpense: (id: string) => Promise<void> | void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  monthKey,
  loading,
  onChangeMonth,
  onDeleteExpense,
}) => {
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isCurrentMonth = monthKey >= getCurrentMonthKey();

  // Group expenses by date (sorted descending)
  const sortedExpenses = [...expenses].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.createdAt - a.createdAt;
  });

  const grouped = sortedExpenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    if (!acc[exp.date]) acc[exp.date] = [];
    acc[exp.date].push(exp);
    return acc;
  }, {});

  const dates = Object.keys(grouped);

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setDeleting(true);
    try {
      sound.playDelete();
      await onDeleteExpense(expenseToDelete.id);
    } finally {
      setDeleting(false);
      setExpenseToDelete(null);
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Title + month navigation (histórico) */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
          Lançamentos
          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium tabular-nums">
            {expenses.length}
          </span>
        </h2>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(monthKey, -1))}
            aria-label="Mês anterior"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[8.5rem] text-center">
            {formatMonthLabel(monthKey)}
          </span>
          <button
            type="button"
            onClick={() => onChangeMonth(shiftMonthKey(monthKey, 1))}
            disabled={isCurrentMonth}
            aria-label="Próximo mês"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 border border-zinc-200 dark:border-zinc-800 flex justify-center">
          <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800">
          <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
            <Inbox className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Nenhum lançamento</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {isCurrentMonth
              ? 'Registre seu primeiro gasto do mês pelo botão “Adicionar gasto”.'
              : 'Não há gastos registrados neste período.'}
          </p>
        </div>
      ) : (
        /* Date Grouped List */
        <div className="space-y-5">
          {dates.map(dateKey => {
            const dayExpenses = grouped[dateKey];
            const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">{formatDateLabel(dateKey)}</span>
                  <span className="tabular-nums">{formatCurrency(dayTotal)}</span>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                  {dayExpenses.map(exp => {
                    const cat = CATEGORIES[exp.category] || CATEGORIES.outro;
                    return (
                      <div key={exp.id} className="flex items-center justify-between px-4 py-3.5">
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                          <CategoryIcon category={exp.category} badge />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                              {exp.description}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">{cat.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                            − {formatCurrency(exp.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playTap();
                              setExpenseToDelete(exp);
                            }}
                            title="Excluir lançamento"
                            aria-label={`Excluir gasto ${exp.description}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-zinc-200 dark:border-zinc-800 animate-slide-up">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5">Excluir lançamento?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              “{expenseToDelete.description}” — {formatCurrency(expenseToDelete.amount)}. O valor retornará ao saldo
              disponível. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
