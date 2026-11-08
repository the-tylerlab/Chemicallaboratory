# Data workflow and development safety

## Live data writes

Supabase is the source of truth. The server must finish and check the Supabase
write before it reports a successful data change or sends a Google Sheets
backup. Google Sheets is a secondary backup/reporting destination; browser code
must not write to it directly or read its rows back into the live application.

If the Supabase write fails, the API must return an error and leave the local
cache and Google Sheets unchanged. If the primary write succeeds but the Sheets
backup fails, keep the primary change and report that the backup is pending or
failed so it can be retried. Do not describe a fire-and-forget/no-cors request
as a successful backup.

Full backup operations should read their rows from the primary store, then
write them to Sheets. Do not use a destructive whole-sheet replacement until
backup-only rows have been reconciled and preserved or explicitly approved for
removal.

## Local development

- `NODE_ENV=development` writes JSON state under `data/development/` by default.
- Local development ignores production `SUPABASE_URL` and `SUPABASE_KEY`.
- To use cloud data while developing, set `SUPABASE_DEV_URL` and
  `SUPABASE_DEV_KEY` to a separate Supabase project containing mock data only.
- Seed/test users and records must be synthetic. Never import a production
  export into the development database or directory.
- Production uses `NODE_ENV=production`, `SUPABASE_URL`, and
  `SUPABASE_SERVICE_ROLE_KEY`.

This separation protects future code changes from accidentally reading or
changing production records during local development.
