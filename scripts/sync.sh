#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MSG="${1:-chore: sync project changes}"

echo "==> Staging changes..."
git add -A

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  echo "==> Committing: $MSG"
  git commit -m "$MSG"
fi

if git remote get-url origin >/dev/null 2>&1; then
  echo "==> Pushing to GitHub..."
  git push origin HEAD
else
  echo "⚠ No GitHub remote configured — skipping push."
fi

echo "==> Deploying to Vercel production..."
vercel deploy --prod --yes

echo "==> Done."
