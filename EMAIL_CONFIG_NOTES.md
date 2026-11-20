# ==============================================================================
# ORIGINYX — Email API Configuration Notes
# ==============================================================================
# This file documents the NEW environment variables required for the email
# feature additions. These must be added to Vercel project settings and
# to your local .env.local file.
#
# DO NOT commit .env.local or this file with real values to source control.
# ==============================================================================

# --- Already configured (do not change) ---
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# RESEND_API_KEY=...

# --- NEW: Required for auth/welcome and auth/logout-notify API endpoints ---
#
# SUPABASE_SERVICE_ROLE_KEY must be added to:
#   1. Vercel → Project Settings → Environment Variables
#   2. Your local .env.local file (for local development)
#
# To find your service role key:
#   Supabase Dashboard → Project Settings → API → service_role (secret)
#
# WARNING: This key bypasses Row-Level Security. NEVER expose it in:
#   - Frontend code (HTML, JS loaded in the browser)
#   - Public git repositories
#   - Client-side environment variables (VITE_* prefix)
#
# It is ONLY used server-side in Vercel serverless functions:
#   - /api/auth/welcome.js
#   - /api/auth/logout-notify.js
#
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ==============================================================================
# Supabase Dashboard Configuration Required
# ==============================================================================
#
# 1. EMAIL TEMPLATES (Authentication → Email Templates):
#
#    a. "Confirm signup" template:
#       - Open supabase/email-templates/verification.html
#       - Paste the entire contents into the HTML body field
#       - Subject line: Verify Your Originyx Account
#       - Ensure "{{ .ConfirmationURL }}" is preserved in the HTML
#
#    b. All other templates (magic link, reset password, etc.) remain unchanged.
#
# 2. DATABASE MIGRATION:
#    Apply the migration:  supabase/migrations/018_email_sent_log.sql
#    Either via the Supabase Dashboard SQL editor or:
#      npx supabase db push
#
# 3. EMAIL PROVIDER (Authentication → SMTP Settings):
#    Verify that Resend SMTP is configured:
#      Host: smtp.resend.com
#      Port: 587
#      Username: resend
#      Password: your_resend_api_key
#      Sender: noreply@originyx.in
#      Sender name: Originyx
#
# ==============================================================================
