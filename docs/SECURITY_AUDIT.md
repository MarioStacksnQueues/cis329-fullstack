# Security Audit Report

**Project:** CIS329 Full-Stack SPA (React + Supabase, GCP)
**Auditor:** Backend Security Agent
**Date:** 2026-04-21
**Verdict:** PASS
**Overall Risk Rating:** Low

---

## Findings

**1. Medium - ProductCard.jsx (line 32) - Client-supplied `user_id` on order insert**

The Buy handler passes `user_id: user.id` explicitly in the insert payload. The `orders_insert_own` RLS policy's `WITH CHECK (user_id = auth.uid())` clause correctly rejects any mismatched value, so there is no actual exploit path. However, sending a client-supplied field that the DB will compare against the server-side `auth.uid()` is an anti-pattern. If the WITH CHECK clause were ever accidentally weakened or removed, a crafted client could forge orders under another user's ID.

Recommendation: Remove `user_id` from the insert payload entirely. Supabase resolves `auth.uid()` server-side; the column default can be set to `auth.uid()` in the schema, or the RLS policy's WITH CHECK already enforces it. Either way, not sending the field at all makes the intent clearer and removes the dependency on the WITH CHECK being present.

---

**2. Low - DEPLOYMENT.md (Option B nginx block) - Missing security headers**

The Compute Engine nginx config has no `server_tokens off`, no `X-Content-Type-Options`, no `X-Frame-Options`, and no `Referrer-Policy` header. The Cloud Run nginx block has the same gap. For a static SPA serving bearer-token-authenticated API calls these are hardening measures, not blockers.

Recommendation: Add the following to both nginx `server` blocks:

```nginx
server_tokens off;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

**3. Info - ProductCard.jsx (line 58) - Unvalidated `image_url` in `<img src>`**

Product image URLs are stored by admins and rendered directly into `<img src>`. React's JSX prevents `javascript:` execution via `src`, so there is no XSS vector here. A malicious or compromised admin could set an off-domain URL that loads a tracking pixel, but that is an insider-trust issue, not an RLS bypass. No fix required for the student project scope; worth noting in a production context.

---

**4. Info - ProtectedRoute.jsx - No comment clarifying UX-only nature**

The component correctly enforces session and role checks in the React layer but has no comment noting that real access control lives in RLS, not this component. A future developer maintaining the code might misunderstand which layer is authoritative.

Recommendation: Add a one-line comment above the `requireAdmin` branch: `// UX gate only - real enforcement is RLS on the Supabase side.`

---

## What Was Checked

- [x] `.env.example` contains no real credentials; only placeholder strings
- [x] `.gitignore` explicitly lists `.env`, `.env.local`, and `.env.*.local`
- [x] `README.md` calls out service role key as never-used and never-committed; no prompt to paste it anywhere
- [x] RLS enabled on `products`, `orders`, and `user_roles` (`schema.sql` lines 112-114)
- [x] Products: SELECT open to anon+authenticated; INSERT/UPDATE/DELETE gated by `is_admin()`
- [x] Orders: SELECT limited to own rows (plus admin override); INSERT WITH CHECK enforces `user_id = auth.uid()`; UPDATE and DELETE likewise scoped to own rows
- [x] `user_roles`: SELECT own row only; no insert/update/delete policy exists
- [x] `is_admin()`: SECURITY DEFINER, `set search_path = public`, revoked from public, re-granted to anon+authenticated
- [x] `handle_new_user()` trigger: SECURITY DEFINER, hardcodes `'customer'` role, uses ON CONFLICT DO NOTHING
- [x] `AuthContext.jsx`: role fetched from `user_roles` table via authenticated query, not from JWT claims or user metadata
- [x] `ProtectedRoute.jsx`: blocks unauthenticated users and non-admins at the route level; real enforcement backed by RLS
- [x] `AdminPage.jsx`: all mutations go through Supabase client with the anon key; RLS rejects non-admin callers server-side regardless of URL access
- [x] `ProductCard.jsx`: `user_id` sent from client but WITH CHECK clause makes it safe; flagged as anti-pattern above
- [x] No `dangerouslySetInnerHTML`, no raw `innerHTML`, no template string DOM injection found in any source file
- [x] `signInWithOAuth` sets `redirectTo: window.location.origin` - fixed to the app's own origin, not attacker-controlled
- [x] `supabaseClient.js`: `autoRefreshToken: true` handles token expiry silently; `signOut()` delegates to Supabase which clears the stored session
- [x] `signOut` in `ProfilePage.jsx` navigates to `/` after calling `signOut()`, clearing visible state
- [x] Deployment: `--allow-unauthenticated` is correct for a public storefront
- [x] Dockerfile: only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build args; service role key is never mentioned
- [x] nginx (Cloud Run): no directory listing (`autoindex` not present); `server_tokens` not explicitly disabled (see Finding 2)

---

## Positive Notes

1. **RLS is thorough and well-commented.** All three tables have RLS enabled before any policies are applied, the `is_admin()` function is SECURITY DEFINER with a locked search path, and the `user_roles` table has zero client-writable policies. Role escalation via the anon key is not possible.

2. **Role source of truth is the database, not JWT claims.** `AuthContext.jsx` fetches the role from `user_roles` via an authenticated query rather than reading `user.user_metadata` or a JWT claim. A user cannot self-promote by crafting a token with a custom claim.

3. **Secret hygiene is correct end-to-end.** No real credentials appear anywhere in the repository. The `.env.example` is placeholder-only, `.gitignore` covers all `.env` variants, the README explicitly states the service role key is never used, and the Dockerfile only accepts the public anon key.
