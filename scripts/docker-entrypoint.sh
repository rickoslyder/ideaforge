#!/bin/sh
set -e

# Validate required environment variables
required_vars="CLERK_SECRET_KEY NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY"

for var in $required_vars; do
  eval value=\$$var
  if [ -z "$value" ]; then
    echo "Error: Required environment variable $var is not set"
    exit 1
  fi
done

# Optional: Wait for dependencies (if needed)
# Example: wait for database
# while ! nc -z db 5432; do
#   echo "Waiting for database..."
#   sleep 1
# done

echo "Starting IdeaForge..."
exec "$@"
