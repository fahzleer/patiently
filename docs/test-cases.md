# Test Cases — Patiently 🧪

## What's Inside

| Type | Files | Cases |
|------|-------|-------|
| Unit Tests | 3 | 59 |
| E2E Tests | 6 | 25 |
| **Total** | **9** | **84** |

**Quick pointer:**
- **Unit tests** check one tiny bit of code on its own. Like testing one Lego brick before you build the castle.
- **E2E tests** (end-to-end) check the whole journey, like a real person using the app from start to finish.

---

## Unit Tests (59 cases)

### `src/lib/validation.test.ts` — 43 cases

This file checks that each form field behaves itself. Think of it as a bouncer at the door — only the right input gets in.

**First Name (3 cases)**
1. Any text entered → passes ✅
2. Empty string → fails ❌
3. Only whitespace → fails ❌

**Email (3 cases)**
4. Valid email format → passes ✅
5. Missing the `@` → fails ❌
6. Empty string → fails ❌

**Phone (5 cases)**
7. Number starting with `+66` → passes ✅
8. Local number starting with `08x` → passes ✅
9. Number with spaces → passes ✅
10. Contains letters → fails ❌
11. Empty string → fails ❌

**Last Name (3 cases)**
12. Any text entered → passes ✅
13. Empty string → fails ❌
14. Only whitespace → fails ❌

**Date of Birth (3 cases)**
15. Valid date string → passes ✅
16. Empty string → fails ❌
17. Only whitespace → fails ❌

**Address (3 cases)**
18. Any non-empty text → passes ✅
19. Empty string → fails ❌
20. Only whitespace → fails ❌

**Preferred Language (3 cases)**
21. Any non-empty text → passes ✅
22. Empty string → fails ❌
23. Only whitespace → fails ❌

**Nationality (3 cases)**
24. Any non-empty text → passes ✅
25. Empty string → fails ❌
26. Only whitespace → fails ❌

**Middle Name — optional (2 cases)**
27. Left blank → passes ✅ (optional, no stress)
28. Filled in → passes ✅

**Religion — optional (2 cases)**
29. Left blank → passes ✅ (optional, no stress)
30. Filled in → passes ✅

**Gender (3 cases)**
31. `male` → passes ✅
32. `prefer_not_to_say` → passes ✅
33. Value outside the allowed list → fails ❌

**Emergency Contact — a pair (4 cases)**

This one comes as a pair: a name and a relationship. You fill in both, or neither.

34. Both blank → passes ✅ (the pair is tidy)
35. Both filled → passes ✅ (the pair is tidy)
36. Name filled, relationship missing → fails on the relationship field ❌
37. Relationship filled, name missing → fails on the name field ❌

**Required Fields Guard (3 cases)**

A little safety net, so no one quietly adds or removes required fields by mistake.

38. Exactly 9 required fields — no more, no less
39. All the fields we expect are on the list
40. No optional fields sneaking in

**Is the Form Valid? (3 cases)**
41. Fully empty form → not valid ❌
42. All required fields valid → valid ✅
43. One required field missing → not valid ❌

---

### `src/hooks/useStaffView.test.ts` — 14 cases

This file looks after the staff screen — the live view nurses and receptionists see.

**What's this patient up to? (5 cases)**

The app works out whether a patient is still filling the form, has gone quiet, or has submitted. "Last activity" covers anything they do — typing, clicking, tabbing — not just typing.

1. `filling` + last activity over 30 seconds ago → **inactive** (gone quiet)
2. `filling` + last activity under 30 seconds ago → still **filling**
3. `filling` + last activity right on the 29-second mark → still **filling** (edge case, handled)
4. `submitted` + any last activity → stays **submitted**
5. `inactive` + recent last activity → stays **inactive**

**Should we show this session on the staff screen? (5 cases)**

Empty, idle sessions shouldn't clutter the screen. Here's when a card shows up.

6. `inactive` + all fields empty → hidden (ghost session, nothing to see)
7. `inactive` + at least one field filled → shown (the patient started something)
8. `filling` + all fields empty → shown (just opened the form, give them a sec)
9. `submitted` + all fields empty → shown (they finished, they matter)
10. `filling` + timed out + all fields empty → hidden (treated as inactive)

**How long ago was that? (4 cases)**

Turns a timestamp into something readable, like "2m ago".

11. Under 5 seconds → `"just now"`
12. 5 to 59 seconds → `"Xs ago"`
13. 60 seconds or more → `"Xm ago"`
14. 60 minutes or more → `"Xh ago"`

---

### `src/lib/session.test.ts` — 2 cases

A tiny file, but important. It guards the session key's value.

**Session Key Guard (2 cases)**
1. The value is exactly `"patiently_session_id"`
2. It doesn't contain `"agnos"` (the legacy name, now retired)

---

## E2E Tests (25 cases)

These tests pretend to be a real user and click through the app for real.

### `tests/e2e/patient-form.spec.ts` — 6 cases

**Happy Path — the everything-goes-right journey (4 cases)**
1. The form loads without crashing
2. The Submit button is disabled on an empty form
3. The Submit button enables once every required field is filled
4. The success screen appears after submit

**Session Persistence — your work sticks around (2 cases)**
5. Form data survives a page reload
6. Once the form is submitted, the success screen stays after a reload — no double submits allowed

---

### `tests/e2e/form-structure.spec.ts` — 1 case

**Form Structure — ARIA Snapshot (1 case)**
1. The patient form fields match the accessibility spec. The ARIA tree is correct across all three sections — **Personal Information**, **Contact Information**, and **Additional Information** — plus the **Submit Registration** button. (This one keeps the form friendly for screen readers.)

---

### `tests/e2e/real-time-sync.spec.ts` — 3 cases

The clever bit — what the patient types shows up on the staff screen live.

1. Patient types a first name → staff see it within 2 seconds
2. Two patients open the form at once → staff see two cards
3. Patient submits → the staff card flips to **Submitted**

---

### `tests/e2e/regression.spec.ts` — 5 cases

Regression tests are the "please don't break again" tests. Bugs we've fixed before — we want to make sure they stay fixed.

**Server-side rendering — no crashes (2 cases)**
1. The patient page loads with no console errors
2. The staff page loads with no console errors

**When Firebase isn't configured (2 cases)**
3. The patient page shows an error UI instead of crashing
4. The staff page shows an error UI instead of crashing

**Session Key (1 case)**
5. The key stored in `sessionStorage` is `patiently_session_id`

---

### `tests/e2e/validation-ux.spec.ts` — 6 cases

Validation should feel kind, not naggy. Errors show up at the right moment, not while you're still typing.

**Blur Behaviour — errors wait their turn (4 cases)**

"Blur" means you've clicked away from a field. That's the polite moment to show an error.

1. No error is shown whilst you're still typing (before blur)
2. An error appears after blur on an empty required field
3. The error clears once the field is filled correctly
4. An invalid email shows an error after blur

**Emergency Contact — the pair (2 cases)**
5. Name filled, relationship missing → error on the relationship field
6. Both fields filled → error clears

---

### `tests/e2e/staff-view.spec.ts` — 4 cases

The staff screen, from a real user's point of view.

1. The card shows **"Anonymous"** before any name is filled
2. The card header shows the full name once the first and last names are filled
3. Filling sessions appear before submitted ones in the card list
4. The field progress counter increments as the patient fills the form
