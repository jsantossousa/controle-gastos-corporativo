import { Category, CategoryId } from '../types';

export const APP_NAME = 'Controle de Gastos';

export const CATEGORIES: Record<CategoryId, Category> = {
  alimentacao: { id: 'alimentacao', name: 'Alimentação', color: '#c2410c' },
  mercado: { id: 'mercado', name: 'Mercado', color: '#047857' },
  transporte: { id: 'transporte', name: 'Transporte', color: '#1d4ed8' },
  saude: { id: 'saude', name: 'Saúde', color: '#0e7490' },
  moradia: { id: 'moradia', name: 'Moradia', color: '#6d28d9' },
  servicos: { id: 'servicos', name: 'Serviços', color: '#4338ca' },
  educacao: { id: 'educacao', name: 'Educação', color: '#a16207' },
  lazer: { id: 'lazer', name: 'Lazer', color: '#be123c' },
  outro: { id: 'outro', name: 'Outros', color: '#52525b' },
};

export const QUICK_SUGGESTIONS: { label: string; category: CategoryId }[] = [
  { label: 'Almoço', category: 'alimentacao' },
  { label: 'Café', category: 'alimentacao' },
  { label: 'Mercado', category: 'mercado' },
  { label: 'Combustível', category: 'transporte' },
  { label: 'Transporte por app', category: 'transporte' },
  { label: 'Farmácia', category: 'saude' },
  { label: 'Aluguel', category: 'moradia' },
  { label: 'Energia', category: 'moradia' },
  { label: 'Internet', category: 'servicos' },
  { label: 'Assinatura', category: 'servicos' },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Current month key in YYYY-MM format. */
export function getCurrentMonthKey(): string {
  return getTodayDateString().slice(0, 7);
}

/** Shift a YYYY-MM month key by `delta` months. */
export function shiftMonthKey(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Inclusive start / exclusive end dates (YYYY-MM-DD) for a month key. */
export function monthRange(monthKey: string): { start: string; end: string } {
  return { start: `${monthKey}-01`, end: `${shiftMonthKey(monthKey, 1)}-01` };
}

export function formatMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const diffTime = todayDate.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';

  // Format e.g.: "Sexta-feira, 16 de outubro"
  const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(target);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(target);

  return `${capitalizedWeekday}, ${dayMonth}`;
}
