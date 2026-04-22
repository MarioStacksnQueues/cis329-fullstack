# WCAG 2.1 AA Accessibility Audit Report
**Rich Inter Storefront React SPA**
**Audit Date:** 2026-04-21

## Predicted Lighthouse Accessibility Score: 88

**Reasoning:** The codebase demonstrates strong semantic HTML, proper ARIA implementation, and good keyboard support. However, critical issues with screen reader announcements on route navigation and missing focus management on dynamic state changes will impact the score. The skip link implementation is proper, but the lack of focus movement after route changes is a known Lighthouse penalty that will prevent reaching 95+.

---

## Audit Findings

| Severity | Location | Issue | Fix |
|----------|----------|-------|-----|
| **Blocker** | App.jsx | No focus management on route changes. React Router does not automatically move focus to main on navigation, leaving screen reader cursor at previous location. | After Routes renders, imperatively move focus to #main-content or use a wrapper that calls focus on mount. |
| **Blocker** | LoginPage.jsx:45 | noValidate={false} is contradictory and confusing. Should be removed to enable browser validation or set to true to disable it. | Remove noValidate={false} entirely; let browser validation run or add explicit validation logic. |
| **Major** | AdminPage.jsx:105 | window.confirm() uses native browser dialog, which is not always accessible to all assistive technology users. Label and context are minimal. | Replace with accessible modal dialog component with role="alertdialog", aria-labelledby, and proper focus management. |
| **Major** | ProductCard.jsx:84 | Both disabled and aria-disabled are set. The disabled attribute already exposes disabled state to screen readers; aria-disabled is redundant and can cause confusion. | Remove aria-disabled={!inStock || pending} line. Keep only disabled={!inStock || pending}. |
| **Major** | globals.css:91 | Skip link uses left: -9999px for off-screen positioning, which can fail in RTL layouts and is outdated. | Use clip-path: inset(100%) or position: absolute; width: 1px; height: 1px; overflow: hidden instead. |
| **Minor** | ProfilePage.jsx, AdminPage.jsx | Table captions use generic text. While correct, they could be more concise for screen reader users. | Shorten captions to more focused descriptions, or keep as is (both pass WCAG). |
| **Minor** | HomePage.jsx:55-56, ProfilePage.jsx:91-92 | Error messages use role="alert" which is correct, but success message in ProductCard lacks aria-live wrapping. | Add aria-live="polite" region wrapper around success messages for consistency. |
| **Info** | Navbar.jsx:19 | Brand link has aria-label="Rich Inter Storefront home" which is good, but the link text is already descriptive. The aria-label is redundant. | Either keep the aria-label as is (passes) or remove it since the link text is sufficient. |

---

## Positive Findings

### Well-Implemented Features

1. **Semantic HTML Structure**
   - Proper use of header, nav, main, footer landmarks (App.jsx:17-44)
   - Every page has exactly one h1 with proper heading hierarchy (h1 to h2, no skipping)
   - Form labels correctly paired with inputs via htmlFor (LoginPage, SignupPage, AdminPage)

2. **Skip Link**
   - Skip-to-content link present as first focusable element (App.jsx:14-16)
   - Targets #main-content correctly
   - Focus-visible styling moves link on-screen with blue background

3. **Screen Reader Support**
   - Spinner component uses role="status" with sr-only label (Spinner.jsx:3-5)
   - Loading and error states properly announced
   - Image alt text present and descriptive (ProductCard.jsx:50-52)
   - Decorative elements properly marked aria-hidden="true" (ProductCard.jsx:60, LoginPage.jsx:81)

4. **Keyboard Navigation**
   - All interactive elements are keyboard-accessible
   - Button types correctly specified (type="button" or type="submit")
   - No click handlers on non-interactive elements
   - Focus-visible outline defined with 3px solid color and 2px offset (globals.css:75-79)

5. **Form Accessibility**
   - Required inputs marked with required attribute
   - Email and password inputs use correct type and autoComplete
   - Error messages have role="alert"
   - Min length constraints present (minLength={6})
   - Field hints provided (SignupPage.jsx:89)

6. **Color Contrast**
   - Dark text (#15171a) on light backgrounds exceeds 4.5:1
   - Primary button (#0f172a on white) has strong contrast
   - Focus ring (#2563eb) clearly visible against all backgrounds
   - Error messaging uses sufficient color contrast (7a2525 on #fbeaea)

7. **Animation and Motion**
   - Spinner animation respects prefers-reduced-motion (globals.css:189-192)
   - Transitions use short durations (120ms)
   - No auto-playing video or sound

8. **Table Accessibility**
   - Tables have captions (ProfilePage.jsx:103, AdminPage.jsx:234)
   - Column headers use scope="col" (ProfilePage.jsx:106-109, AdminPage.jsx:237-243)
   - Proper thead and tbody structure
   - Actions column has sr-only label (AdminPage.jsx:242)

9. **Input Validation**
   - Type attributes used appropriately (email, password, number, url)
   - Required fields marked
   - Number inputs have min/step constraints (AdminPage.jsx)

10. **Protected Routes**
    - Spinner with proper ARIA role shows loading state
    - Unauthenticated redirects to login preserve location context

---

## Must-Fix to Hit 95

To achieve a Lighthouse accessibility score of 95+, these items must be resolved:

### 1. Route Focus Management (Blocker)
**Location:** App.jsx

After Routes renders, imperatively move focus to #main-content on navigation. Add useEffect with location tracking or create a wrapper component that manages focus. This is a known Lighthouse penalty for SPAs.

### 2. Confirm Dialog Accessibility (Blocker)
**Location:** AdminPage.jsx:105

Replace window.confirm() with an accessible modal dialog component. Use role="alertdialog", aria-labelledby, aria-describedby, and proper focus management. Implement a custom modal or use a headless library.

### 3. Redundant aria-disabled (Major)
**Location:** ProductCard.jsx:84

Remove aria-disabled={!inStock || pending} line. The disabled attribute is sufficient and causes confusion when both are present.

---

## Summary

**Total Issues:** 8
**Blockers:** 2 (Route focus, Confirm dialog)
**Majors:** 2 (aria-disabled, Skip link positioning)
**Minors:** 2 (Table captions, Message consistency)
**Info:** 2 (Redundant aria-label, Message region wrap)

**Current Compliance:** Likely WCAG 2.1 Level AA with caveats on route navigation testing.
**File Edits Needed:** Yes (5 files: App.jsx, AdminPage.jsx, ProductCard.jsx, LoginPage.jsx, globals.css)
**Estimated Post-Fix Score:** 94-96

---

## Testing Recommendations

1. **Screen Reader Testing** (NVDA, JAWS, VoiceOver)
   - Navigate using Tab and route changes
   - Verify focus announcement after navigation
   - Test form submissions and error announcements

2. **Keyboard-Only Testing**
   - Tab through entire application
   - Verify all interactive elements are reachable
   - Confirm skip link functions properly

3. **Lighthouse Audit**
   - Run on each major page
   - Check DevTools for violations
   - Monitor focus management warnings

4. **Color Contrast Verification**
   - Use axe DevTools or WAVE
   - Test in high contrast mode

---

**Audit completed:** 2026-04-21
**Auditor:** Accessibility Testing Agent
