export type CategoryId =
  | 'alimentacao'
  | 'mercado'
  | 'transporte'
  | 'saude'
  | 'moradia'
  | 'servicos'
  | 'educacao'
  | 'lazer'
  | 'outro';

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: CategoryId;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;

export type Theme = 'light' | 'dark';

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  budget: number;
  theme: Theme;
  enableAudio: boolean;
  mustChangePassword: boolean;
}
