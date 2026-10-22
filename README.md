# Controle de Gastos Corporativo

Sistema corporativo e multi-usuário para gestão financeira pessoal/empresarial com persistência segura em nuvem (Supabase / PostgreSQL) e isolamento rigoroso por **Row Level Security (RLS)**.

---

## 🚀 Funcionalidades

- **Identidade Visual Sóbria e Minimalista**: Design profissional com suporte a **Light Mode** e **Dark Mode**.
- **PWA Otimizado para iOS**: Suporte a Safe Areas, prevenção de zoom acidental, `manifest.json`, Service Worker offline-first e atalho de instalação.
- **Barra de Vida Financeira**: Termômetro visual de consumo do orçamento com alerta preventivo por faixa percentual.
- **Autenticação Corporativa**: Formato estrito `nome.sobrenome` com troca obrigatória de senha no primeiro acesso.
- **Isolamento de Dados (RLS)**: Cada colaborador tem acesso estritamente aos seus próprios dados de perfil, orçamento e lançamentos.
- **Histórico Mensal**: Navegação por período e agrupamento de lançamentos por data.

---

## 👥 Usuários Pré-cadastrados (Seed)

| Usuário | Senha Padrão | Perfil |
| :--- | :--- | :--- |
| `erick.rates` | `723647` | Primeiro acesso (solicita nova senha) |
| `beatriz.batista` | `473612` | Primeiro acesso (solicita nova senha) |
| `alefe.franca` | `938430` | Primeiro acesso (solicita nova senha) |

> No primeiro acesso de cada usuário, o sistema solicita automaticamente a criação de uma nova senha pessoal.

---

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend / Persistência**: Supabase (PostgreSQL 15+), Supabase Auth.
- **Segurança**: Row Level Security (RLS) com policies granulares por usuário autenticado (`auth.uid() = user_id`).
- **Deploy**: Vercel.

---

## 🗄️ Configuração do Banco de Dados (Supabase)

1. Crie um projeto novo e exclusivo no [Supabase Dashboard](https://supabase.com/dashboard).
2. Abra o **SQL Editor**.
3. Copie o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql) e execute. O script cria as tabelas `profiles`, `expenses`, ativa o RLS com as devidas políticas de segurança e realiza o seed dos 3 usuários.
4. Para auditar e validar a segurança, execute o script de teste em [`supabase/rls_test.sql`](./supabase/rls_test.sql).

---

## 🔑 Variáveis de Ambiente

Configure as seguintes variáveis na Vercel (ou em `.env.local` para desenvolvimento local):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
```
