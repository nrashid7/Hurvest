# Security Policy

## Secret Handling

Hurvest is a public repository. Do not commit production, staging, or personal credentials.

Keep real values in local environment files or the deployment provider's secret store. The repository should only contain `.env.example` with empty or clearly fake placeholders.

Never commit these values:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Supabase database passwords or connection strings
- Personal access tokens, deploy tokens, private keys, or webhook signing secrets

If a secret is committed, rotate it in the provider immediately, remove it from the repository, and review Git history before treating the incident as resolved.

## Reporting

Please open a private security advisory or contact the maintainer directly if you find a vulnerability or exposed credential. Include the affected file, commit, and enough detail to reproduce or verify the issue.

## Pre-Push Checklist

- Run `git status -sb` and confirm only intended files are staged.
- Confirm `.env.local` and other real env files are ignored.
- Search for secret-looking values before pushing.
- Run the relevant quality checks from `README.md`.
