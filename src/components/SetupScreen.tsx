import React from 'react';
import { Database, ExternalLink, Key, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

export const SetupScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {APP_NAME}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aguardando conexão com o Supabase
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-white">
            <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Configurar Variáveis de Ambiente
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Para ativar a persistência multi-usuário com Row Level Security (RLS), adicione as seguintes variáveis no painel da Vercel (ou no arquivo <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[11px]">.env.local</code>):
          </p>
          <ul className="text-xs font-mono space-y-1.5 pt-2 text-zinc-800 dark:text-zinc-200">
            <li className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              NEXT_PUBLIC_SUPABASE_URL
            </li>
            <li className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </li>
          </ul>
        </div>

        <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
            Passo a passo no Supabase:
          </h3>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Crie um novo projeto no <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 underline inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></li>
            <li>Abra o <b>SQL Editor</b> do novo projeto</li>
            <li>Cole e execute o script contido em <code className="font-mono text-zinc-800 dark:text-zinc-200">supabase/schema.sql</code></li>
            <li>Vá em <b>Project Settings &gt; API</b> e copie a <b>Project URL</b> e a chave <b>anon (public)</b></li>
            <li>Cole na Vercel em <b>Settings &gt; Environment Variables</b> e faça o Redeploy</li>
          </ol>
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Seed inicial incluído: erick, beatriz, alefe
          </span>
        </div>
      </div>
    </div>
  );
};
