import React from 'react';
import { Pencil } from 'lucide-react';
import { formatCurrency } from '../utils/constants';
import { sound } from '../utils/audio';

interface SummaryCardProps {
  budget: number;
  totalSpent: number;
  periodLabel: string;
  onEditBudget: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  budget,
  totalSpent,
  periodLabel,
  onEditBudget,
}) => {
  const remaining = budget - totalSpent;
  const isOverBudget = remaining < 0;

  // Percentage remaining (clamped between 0 and 100 for display)
  const remainingPercent =
    budget > 0 ? Math.max(0, Math.min(100, Math.round((remaining / budget) * 100))) : 0;
  const usedPercent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Health bar ("barra de vida") status
  let barColor = 'bg-emerald-600 dark:bg-emerald-500';
  let statusText = `${remainingPercent}% disponível`;
  let statusClass = 'text-emerald-700 dark:text-emerald-400';
  let advice = 'Orçamento sob controle.';

  if (budget <= 0) {
    barColor = 'bg-zinc-400';
    statusText = 'Sem orçamento';
    statusClass = 'text-zinc-500';
    advice = 'Defina um orçamento mensal para acompanhar o consumo.';
  } else if (isOverBudget) {
    barColor = 'bg-red-600 dark:bg-red-500';
    statusText = 'Limite excedido';
    statusClass = 'text-red-700 dark:text-red-400';
    advice = `Gastos ${usedPercent - 100}% acima do orçamento definido.`;
  } else if (remainingPercent < 20) {
    barColor = 'bg-red-600 dark:bg-red-500';
    statusText = `${remainingPercent}% restante`;
    statusClass = 'text-red-700 dark:text-red-400';
    advice = 'Saldo crítico. Recomenda-se evitar novos gastos.';
  } else if (remainingPercent < 50) {
    barColor = 'bg-amber-500';
    statusText = `${remainingPercent}% restante`;
    statusClass = 'text-amber-700 dark:text-amber-400';
    advice = 'Mais da metade do orçamento já foi utilizada.';
  }

  return (
    <section className="w-full bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Remaining balance */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Saldo disponível
          </span>
          <p
            className={`text-3xl font-semibold tracking-tight mt-1 tabular-nums ${
              isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'
            }`}
          >
            {isOverBudget ? `− ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
          </p>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{periodLabel}</span>
      </div>

      {/* Termômetro visual / "barra de vida" financeira */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-zinc-500 dark:text-zinc-400">Termômetro do orçamento</span>
          <span className={`font-medium ${statusClass}`}>{statusText}</span>
        </div>
        <div
          className="relative w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={isOverBudget ? 0 : remainingPercent}
          aria-label="Percentual do orçamento disponível"
        >
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500 ease-out ${
              !isOverBudget && budget > 0 && remainingPercent < 20 ? 'animate-subtle-pulse' : ''
            }`}
            style={{ width: `${isOverBudget || budget <= 0 ? 100 : remainingPercent}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">{advice}</p>
      </div>

      {/* Budget | Spent */}
      <div className="grid grid-cols-2 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 divide-x divide-zinc-100 dark:divide-zinc-800">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onEditBudget();
          }}
          className="group text-left pr-4 cursor-pointer"
          title="Alterar orçamento mensal"
        >
          <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            Orçamento mensal
            <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
          </span>
          <span className="block text-base font-semibold text-zinc-900 dark:text-white mt-0.5 tabular-nums group-hover:underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600">
            {formatCurrency(budget)}
          </span>
        </button>

        <div className="pl-4">
          <span className="block text-xs text-zinc-500 dark:text-zinc-400">Total gasto</span>
          <span className="block text-base font-semibold text-zinc-900 dark:text-white mt-0.5 tabular-nums">
            {formatCurrency(totalSpent)}
          </span>
        </div>
      </div>
    </section>
  );
};
