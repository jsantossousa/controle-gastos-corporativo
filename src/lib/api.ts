import type { Session } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
import { CategoryId, Expense, NewExpense, Profile, Theme } from '../types';
import { monthRange } from '../utils/constants';

// -----------------------------------------------------------------------------
// Login "nome.sobrenome" → e-mail interno do Supabase Auth
// -----------------------------------------------------------------------------

/** Internal (non-deliverable, RFC 2606 reserved) domain used for Supabase Auth. */
export const LOGIN_EMAIL_DOMAIN = 'corp.example.com';

export const USERNAME_PATTERN = /^[a-z]+\.[a-z]+$/;

/** Lowercases, trims and strips accents: "Álefe.França " → "alefe.franca". */
export function normalizeUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToEmail(username: string): string {
  return `${username}@${LOGIN_EMAIL_DOMAIN}`;
}

export const MIN_PASSWORD_LENGTH = 6;

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export async function signIn(username: string, password: string): Promise<void> {
  const { error } = await getSupabase().auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) {
    if (error.status === 400 || /invalid/i.test(error.message)) {
      throw new Error('Usuário ou senha inválidos.');
    }
    throw new Error('Não foi possível entrar. Verifique sua conexão e tente novamente.');
  }
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
}

/**
 * Re-validates the current password, sets the new one and clears the
 * "must change password" flag on the user's profile.
 */
export async function changePassword(
  session: Session,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const sb = getSupabase();
  const email = session.user.email;
  if (!email) throw new Error('Sessão inválida. Entre novamente.');

  const { error: reauthError } = await sb.auth.signInWithPassword({ email, password: currentPassword });
  if (reauthError) throw new Error('A senha atual está incorreta.');

  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) {
    if (/different from the old/i.test(error.message)) {
      throw new Error('A nova senha precisa ser diferente da atual.');
    }
    if (/weak|short|at least/i.test(error.message)) {
      throw new Error(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    }
    throw new Error('Não foi possível alterar a senha. Tente novamente.');
  }

  await updateProfile(session.user.id, { mustChangePassword: false });
}

// -----------------------------------------------------------------------------
// Profile
// -----------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  budget: number | string;
  theme: Theme;
  enable_audio: boolean;
  must_change_password: boolean;
}

const PROFILE_COLUMNS = 'id, username, display_name, budget, theme, enable_audio, must_change_password';

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    budget: Number(row.budget),
    theme: row.theme,
    enableAudio: row.enable_audio,
    mustChangePassword: row.must_change_password,
  };
}

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .single();
  if (error || !data) throw new Error('Não foi possível carregar seu perfil.');
  return toProfile(data as ProfileRow);
}

type ProfilePatch = Partial<Pick<Profile, 'budget' | 'theme' | 'enableAudio' | 'mustChangePassword'>>;

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.budget !== undefined) row.budget = patch.budget;
  if (patch.theme !== undefined) row.theme = patch.theme;
  if (patch.enableAudio !== undefined) row.enable_audio = patch.enableAudio;
  if (patch.mustChangePassword !== undefined) row.must_change_password = patch.mustChangePassword;

  const { error } = await getSupabase().from('profiles').update(row).eq('id', userId);
  if (error) throw new Error('Não foi possível salvar suas preferências.');
}

// -----------------------------------------------------------------------------
// Expenses
// -----------------------------------------------------------------------------

interface ExpenseRow {
  id: string;
  amount: number | string;
  description: string;
  category: CategoryId;
  spent_on: string;
  created_at: string;
}

const EXPENSE_COLUMNS = 'id, amount, description, category, spent_on, created_at';

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    description: row.description,
    category: row.category,
    date: row.spent_on,
    createdAt: new Date(row.created_at).getTime(),
  };
}

/** Expenses of the logged-in user for a given month (YYYY-MM). RLS also enforces ownership. */
export async function fetchExpenses(userId: string, monthKey: string): Promise<Expense[]> {
  const { start, end } = monthRange(monthKey);
  const { data, error } = await getSupabase()
    .from('expenses')
    .select(EXPENSE_COLUMNS)
    .eq('user_id', userId)
    .gte('spent_on', start)
    .lt('spent_on', end)
    .order('spent_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error('Não foi possível carregar seus gastos.');
  return (data as ExpenseRow[]).map(toExpense);
}

export async function createExpense(input: NewExpense): Promise<Expense> {
  // user_id is filled by the database default (auth.uid()) and checked by RLS.
  const { data, error } = await getSupabase()
    .from('expenses')
    .insert({
      amount: input.amount,
      description: input.description,
      category: input.category,
      spent_on: input.date,
    })
    .select(EXPENSE_COLUMNS)
    .single();
  if (error || !data) throw new Error('Não foi possível salvar o gasto.');
  return toExpense(data as ExpenseRow);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await getSupabase().from('expenses').delete().eq('id', id);
  if (error) throw new Error('Não foi possível excluir o gasto.');
}
