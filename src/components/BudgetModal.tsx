import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Plus, Loader2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface BudgetModalProps {
  isOpen: boolean;
  currentBudget: number;
  onClose: () => void;
  onSave: (newBudget: number) => Promise<void>;
}

function parseAmount(str: string): number {
  const normalized = str.includes(',') ? str.replace(/\./g, '').replace(',', '.') : str;
  return parseFloat(normalized);
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, currentBudget, onClose, onSave }) => {
  const [budgetStr, setBudgetStr] = useState(String(currentBudget));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBudgetStr(currentBudget ? String(currentBudget).replace('.', ',') : '');
      setError('');
      setSaving(false);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 150);
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleAddQuick = (amount: number) => {
    sound.playTap();
    const current = parseAmount(budgetStr) || 0;
    setBudgetStr(String(Math.round(current + amount)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseAmount(budgetStr);

    if (isNaN(num) || num < 0) {
      sound.triggerHaptic('error');
      setError('Informe um valor válido.');
      return;
    }

    setSaving(true);
    try {
      await onSave(Math.round(num * 100) / 100);
      sound.playSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-slide-up pb-safe">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Orçamento mensal</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Valor disponível para o mês. Os gastos lançados são subtraídos deste total.
          </p>

          <div className="relative flex items-center">
            <span className="absolute left-4 text-xl font-medium text-zinc-400">R$</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              value={budgetStr}
              onChange={e => {
                setBudgetStr(e.target.value.replace(/[^0-9,.]/g, ''));
                setError('');
              }}
              placeholder="0,00"
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-2xl font-semibold tabular-nums rounded-xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleAddQuick(val)}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                R$ {val}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Salvar orçamento</span>
          </button>
        </form>
      </div>
    </div>
  );
};
