import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { CategoryId, NewExpense } from '../types';
import { CATEGORIES, QUICK_SUGGESTIONS, getTodayDateString } from '../utils/constants';
import { sound } from '../utils/audio';
import { CategoryIcon } from './CategoryIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: NewExpense) => Promise<void>;
}

const labelClass = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5';
const inputClass =
  'w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition';

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('alimentacao');
  const [date, setDate] = useState(getTodayDateString());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset & focus amount input when opening modal
  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setDescription('');
      setCategory('alimentacao');
      setDate(getTodayDateString());
      setError('');
      setSaving(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectSuggestion = (label: string, cat: CategoryId) => {
    sound.playTap();
    setDescription(label);
    setCategory(cat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Accept "1.234,56", "1234,56" and "1234.56"
    const normalized = amountStr.includes(',')
      ? amountStr.replace(/\./g, '').replace(',', '.')
      : amountStr;
    const num = parseFloat(normalized);

    if (isNaN(num) || num <= 0) {
      sound.triggerHaptic('error');
      setError('Informe um valor maior que zero.');
      inputRef.current?.focus();
      return;
    }
    if (!date) {
      setError('Informe a data do gasto.');
      return;
    }

    const finalDescription = (description.trim() || CATEGORIES[category].name).slice(0, 120);

    setSaving(true);
    try {
      await onSave({ amount: Math.round(num * 100) / 100, description: finalDescription, category, date });
      sound.playSuccess();
      sound.triggerHaptic('medium');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border border-zinc-200 dark:border-zinc-800 animate-slide-up max-h-[92vh] overflow-y-auto pb-safe">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Novo gasto</h2>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Valor */}
          <div>
            <label htmlFor="amount" className={labelClass}>
              Valor
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-medium text-zinc-400">R$</span>
              <input
                id="amount"
                ref={inputRef}
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={e => {
                  setAmountStr(e.target.value.replace(/[^0-9,.]/g, ''));
                  setError('');
                }}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-2xl font-semibold tabular-nums rounded-xl border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 transition"
              />
            </div>
          </div>

          {/* Descrição + sugestões */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Descrição
            </label>
            <input
              id="description"
              type="text"
              maxLength={120}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex.: Almoço com cliente"
              className={inputClass}
            />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-2 -mx-1 px-1">
              {QUICK_SUGGESTIONS.map(sug => {
                const isSelected = description.toLowerCase() === sug.label.toLowerCase();
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug.label, sug.category)}
                    className={`shrink-0 py-1 px-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                        : 'bg-transparent text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {sug.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria */}
          <div>
            <span className={labelClass}>Categoria</span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as CategoryId[]).map(catKey => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setCategory(catKey);
                    }}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-zinc-900 dark:border-zinc-200 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <CategoryIcon category={catKey} className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data */}
          <div>
            <label htmlFor="date" className={labelClass}>
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              max={getTodayDateString()}
              onChange={e => setDate(e.target.value)}
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
            disabled={saving}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer touch-manipulation"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{saving ? 'Salvando…' : 'Salvar gasto'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
