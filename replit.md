# SHILP AI

## Run

This is a React + TypeScript TanStack Start application originally generated in
Lovable. Keep the existing Supabase, storage, and server-side AI helpers in
`src/lib/` when extending the UI.

The Replit workflow runs:

```sh
npm run dev -- --host 0.0.0.0 --port 5000
```

Use `npm run build` to validate a production build.

## Configuration

The Supabase client accepts `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_PROJECT_ID`, plus their
`VITE_` equivalents for browser builds. The optional server-only
`LOVABLE_API_KEY` enables hosted catalogue, translation, pricing, and business
coach responses. Never put service-role keys in browser code.

## Product flow

The root route in `src/routes/index.tsx` renders the complete mobile-first
SHILP journey. Demo mode provides a local fallback for the artisan dashboard,
product wizard, marketplace, and enquiry loop when Supabase is not available.
When authenticated with Supabase, the same flow uses the existing database,
storage, and AI functions.
