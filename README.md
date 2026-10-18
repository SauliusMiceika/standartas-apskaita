# Standartas Apskaita

Apskaitos sistema smulkiosioms įmonėms. Multi-tenant: viena sistema, kelios įmonės.

## Architektūra
- **DB + API + Auth:** Supabase (PostgreSQL, RLS)
- **FE:** TypeScript + Vite (statinis), talpinimas GitHub Pages
- **Dokumentų importas:** Google Drive / Gmail API (Service Account), AI atpažinimas
- **AI konsultantas** klientams kasdieniams klausimams

## Struktūra
- `supabase/migrations/` — DB migracijos
- `src/` — FE kodas
- `docs/` — README, DECISIONS, MIGRATIONS

## Svarbu
- `secrets/` niekada nepatenka į GitHub (žr. .gitignore)

## Žingsnių planas
1. [ ] Supabase projektas
2. [ ] DB schema: companies, user_companies, documents, transactions
3. [ ] FE griaučiai + login + įmonės pasirinkimas
4. [ ] Drive importo prototipas
