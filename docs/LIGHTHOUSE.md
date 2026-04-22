# Generating the Lighthouse Audit PDF

The rubric asks for a score of 90+, so run Lighthouse against the
production build, not the dev server. The dev server skips
minification and caching, which tanks the Performance score.

## Steps

1. Build and preview the production bundle:

   ```bash
   cd full-stack/app
   npm run build
   npm run preview
   ```

   This serves the built `dist/` folder at http://localhost:4173.

2. Open the URL in **Google Chrome** (not Chromium or Edge for the
   audit PDF - Chrome's Lighthouse export is the cleanest).

3. Open DevTools (F12) > **Lighthouse** panel.

4. Settings:
   - Mode: Navigation (Default)
   - Device: Mobile (harder bar; if you also want Desktop, run a
     second pass)
   - Categories: check all four (Performance, Accessibility, Best
     Practices, SEO)

5. Click **Analyze page load**. Wait for the report.

6. In the report header, click the **three dot menu** and pick
   **Save as PDF** (or Print > Save as PDF).

7. Save the file as `lighthouse-report.pdf` next to this guide and
   include it in the submission.

## Pages to audit

Run the audit on at least these two, include both PDFs if you have
time (the submission only requires one):

- `/` - the product catalog home
- `/profile` - after signing in (this page pulls a Supabase query)

## Common score killers and how the code already handles them

- **No image `alt` attributes** - every product image uses the
  product name as alt text in `ProductCard`.
- **Color contrast** - the palette in `globals.css` was picked to
  clear 4.5:1 on body text and 3:1 on large text.
- **Buttons without accessible names** - icon-only buttons carry
  `aria-label`; text buttons are self-describing.
- **Heading order** - one `<h1>` per page, `<h2>` for sections only.
- **Landmarks** - every page sits inside `<main id="main-content">`
  with a skip link above it.
- **No explicit `lang`** - `<html lang="en">` is set in `index.html`.

## If you score below 90

Most common reasons, in rough order of likelihood:

1. You audited the dev server instead of `npm run preview`.
2. Network throttling was set to a slow profile - switch to "No
   throttling" if your connection is poor, or re-run twice and take
   the higher score (Lighthouse's own guidance).
3. A product image URL is very large. Swap for a smaller Unsplash
   size or reduce the grid on mobile.
4. Google Fonts or similar external resource was added. This project
   uses system fonts on purpose to stay fast.
