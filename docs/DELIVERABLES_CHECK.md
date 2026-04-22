# Deliverables Check - CIS329 Full-Stack

Final pre-submission verification pass. Repository: `full-stack/`. Date: 2026-04-21.

## Rubric Checklist

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | `products` table with required columns | Complete | `database/schema.sql` lines 13-21 | UUID PK, name/description/price/category/image_url/stock_quantity all present with correct types and constraints. |
| 2 | Supabase Auth (email + OAuth Google) | Complete | `README.md` lines 46-49 and `app/src/pages/LoginPage.jsx` line 35, `app/src/pages/SignupPage.jsx` line 41 | README documents enabling Email + Google; both auth pages call `signInWithOAuth('google')`. |
| 3 | Component hierarchy map | Complete | `docs/component-hierarchy.md` | Full tree, state flow table, auth sequence diagram. QA_REVIEW flagged hierarchy listed some non-existent components; current file matches the real 6 pages. |
| 4 | Persistent storage, no hardcoded product arrays | Complete | Grep of `app/src/` for `products = [` returned no matches; `HomePage.jsx` line 14 and `AdminPage.jsx` line 26 both query `supabase.from('products')` | Clean. |
| 5 | Login + registration + logout wired through Supabase Auth | Complete | `app/src/context/AuthContext.jsx` lines 60-72 exposes `signIn`, `signUp`, `signOut`, `signInWithOAuth`; used in LoginPage, SignupPage, ProfilePage, Navbar | All four actions are wired to Supabase Auth client. |
| 6 | Protected routes `/admin` and `/profile` gated | Complete | `app/src/App.jsx` lines 39-54 | Both wrap in `ProtectedRoute`; `/admin` passes `requireAdmin`. |
| 7 | `useEffect` fetch of 10+ products on mount | Complete | `app/src/pages/HomePage.jsx` lines 25-27; `database/seed-data.sql` inserts 12 rows | 12 products across 4 categories. |
| 8 | Responsive mobile-first UI | Complete | `app/src/styles/globals.css` uses CSS Grid with `auto-fill minmax(260px, 1fr)` (line 247), flex layouts throughout, and `@media (max-width: 540px)` block at line 457 | Responsive. |
| 9 | Accessibility (Lighthouse 90+ aimed) | Complete | `docs/ACCESSIBILITY_AUDIT.md` exists; App.jsx now has route-focus management (lines 20-26); ProductCard's redundant `aria-disabled` is not present; ConfirmDelete is an in-page accessible group (AdminPage lines 263-280) | Audit file predicted 88 with blockers pending, but the three blockers it called out are visibly resolved in the code. Post-fix estimate in audit is 94-96. Student should re-run Lighthouse to confirm. |
| 10 | Role-based access, three tiers | Complete | Public: HomePage queries `products` under `products_select_all` RLS (rls-policies.sql line 17). Customer: ProfilePage queries own `orders` (ProfilePage.jsx line 34). Admin: AdminPage has insert/update/delete (AdminPage.jsx lines 86-114) gated by `is_admin()` policies (rls-policies.sql lines 26-43) | Fully implemented server-side and client-side. |
| 11 | Demo video | Student action required | `README.md` line 109 lists it; `docs/component-hierarchy.md` provides walk-through material | Student must record and attach. |
| 12 | DB / Auth / Code / AI-reflection walkthrough | Student action required (support docs present) | `docs/component-hierarchy.md`, `docs/ACCESSIBILITY_AUDIT.md`, `docs/SECURITY_AUDIT.md`, `docs/QA_REVIEW.md` | Enough written material to drive the four spoken segments. |
| 13 | GCP hosting instructions | Complete | `docs/DEPLOYMENT.md` | Both Cloud Run (preferred) and Compute Engine VM paths documented end to end. |
| 14 | Environment variables via `.env` | Complete | `app/.env.example` exists with placeholders only; `app/.gitignore` lines 4-6 exclude `.env`, `.env.local`, `.env.*.local`; grep for `https://*.supabase.co` finds only the placeholder in `.env.example` | No real keys committed. No JWT-shaped tokens found. |
| 15 | Live GCP URL | Student action required | `docs/DEPLOYMENT.md` step 4 produces the URL | Needs actual deploy. |
| 16 | GitHub repo + detailed README | Complete | `full-stack/README.md` | Covers layout, prerequisites, Supabase setup, local run, build, deployment, env vars. |
| 17 | Demo video submission | Student action required | See item 11 | |
| 18 | Lighthouse PDF | Student action required (guide complete) | `docs/LIGHTHOUSE.md` | Step-by-step for generating the PDF against the production build. |
| 19 | SQL export | Complete | `database/schema.sql` (also `rls-policies.sql` and `seed-data.sql`) | 3-file export. |

## Hygiene Checks

| Check | Status | Evidence |
|-------|--------|----------|
| Em dashes (U+2014) in code/docs | Pass (with 1 self-referential note) | Grep of full-stack tree: zero hits in `.jsx`, `.js`, `.css`, `.html`, `.sql`. The only U+2014 hits are in `docs/QA_REVIEW.md` where they appear inside backtick-quoted findings describing an em dash that was subsequently removed from `ProfilePage.jsx`. ProfilePage.jsx line 8 now returns `'Unknown'`, not an em dash. |
| AI-tell phrases in comments | Pass | Grep for "This function will", "Let me", "Now we", "In this code", "We'll implement" produced zero hits in source or docs (sole hits in QA_REVIEW.md are quoted in an AI-tell hunt summary, not authored prose). |
| Empty unused folders in `app/src/` | Pass | Only `components`, `context`, `lib`, `pages`, `styles` exist, all populated. The `hooks/` directory flagged in QA_REVIEW has been removed. |
| No committed Supabase secrets | Pass | Grep for `.supabase.co` found only the placeholder `your-project-ref.supabase.co` in `app/.env.example`. No JWT-shaped tokens (`eyJ...`) found. |

## Summary

- Complete in-repo items: 14 of 19
- Student-action items: 5 of 19 (video, video walkthrough, GCP deploy URL, Lighthouse PDF, GitHub push)
- Missing items: 0

All code, database, and documentation deliverables are present and consistent with the rubric. The remaining work is the student-executed submission artifacts (video, deployment, Lighthouse run, repo push).
