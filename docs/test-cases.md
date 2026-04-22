## Test Cases — Patiently

---

### Overview

| Type | Files | Count |
|------|-------|-------|
| Unit Tests | 3 files | 59 cases |
| E2E Tests | 5 files | 24 cases |
| **Total** | **8 files** | **83 cases** |

---

## Unit Tests (59 cases)

### `src/lib/validation.test.ts` — 43 cases

**validateField — firstName (3 cases)**
1. Non-empty value → passes
2. Empty string → fails
3. Whitespace-only → fails

**validateField — email (3 cases)**
4. Valid format → passes
5. Missing `@` → fails
6. Empty string → fails

**validateField — phone (5 cases)**
7. `+66` format → passes
8. Local format `08x` → passes
9. Spaced format → passes
10. Contains letters → fails
11. Empty string → fails

**validateField — lastName (3 cases)**
12. Non-empty value → passes
13. Empty string → fails
14. Whitespace-only → fails

**validateField — dateOfBirth (3 cases)**
15. Valid date string → passes
16. Empty string → fails
17. Whitespace-only → fails

**validateField — address (3 cases)**
18. Non-empty string → passes
19. Empty string → fails
20. Whitespace-only → fails

**validateField — preferredLanguage (3 cases)**
21. Non-empty string → passes
22. Empty string → fails
23. Whitespace-only → fails

**validateField — nationality (3 cases)**
24. Non-empty string → passes
25. Empty string → fails
26. Whitespace-only → fails

**validateField — middleName (optional, 2 cases)**
27. Empty string → passes
28. Non-empty string → passes

**validateField — religion (optional, 2 cases)**
29. Empty string → passes
30. Non-empty string → passes

**validateField — gender (3 cases)**
31. `male` → passes
32. `prefer_not_to_say` → passes
33. Value outside enum → fails

**validateEmergencyContact (4 cases)**
34. Both fields empty → passes
35. Both fields filled → passes
36. Name filled, relationship missing → fails on relationship
37. Relationship filled, name missing → fails on name

**REQUIRED_FIELDS regression guard (3 cases)**
38. Exactly 9 fields present
39. All expected fields included
40. No optional fields mixed in

**isFormValid (3 cases)**
41. Fully empty form → `false`
42. All required fields valid → `true`
43. One required field missing → `false`

---

### `src/hooks/useStaffView.test.ts` — 14 cases

**getEffectiveStatus (5 cases)**
1. `filling` + last activity over 30s ago → `inactive`
2. `filling` + last activity under 30s ago → `filling`
3. `filling` + last activity at 29s boundary → `filling`
4. `submitted` + any last activity → `submitted`
5. `inactive` + recent last activity → `inactive`

**shouldShowSession (5 cases)**
6. `inactive` + all fields empty → hidden (ghost session)
7. `inactive` + at least one field filled → shown
8. `filling` + all fields empty → shown (just opened)
9. `submitted` + all fields empty → shown
10. `filling` + timed out + all fields empty → hidden (effective status = `inactive`)

**formatRelativeTime (4 cases)**
11. Under 5s → `"just now"`
12. 5–59s → `"Xs ago"`
13. 60s or more → `"Xm ago"`
14. 60 min or more → `"Xh ago"`

---

### `src/lib/session.test.ts` — 2 cases

**SESSION_ID_KEY regression guard (2 cases)**
1. Value must be exactly `"patiently_session_id"`
2. Must not contain `"agnos"` (legacy name)

---

## E2E Tests (24 cases)

### `tests/e2e/patient-form.spec.ts` — 6 cases

**Happy Path (4 cases)**
1. Form loads without crashing
2. Submit button is disabled on empty form
3. Submit button enables once all required fields are filled
4. Success screen appears after submit

**Session Persistence (2 cases)**
5. Form data survives a page reload
6. Success screen stays after reload — no re-submit allowed

---

### `tests/e2e/real-time-sync.spec.ts` — 3 cases

1. Patient types first name → staff sees it within 2 seconds
2. Two patients open simultaneously → staff sees two cards
3. Patient submits → staff card flips to Submitted

---

### `tests/e2e/regression.spec.ts` — 5 cases

**SSR — No crash (2 cases)**
1. Patient page loads with no console errors
2. Staff page loads with no console errors

**Firebase not configured (2 cases)**
3. Patient page shows error UI instead of crashing
4. Staff page shows error UI instead of crashing

**Session Key (1 case)**
5. Key in `sessionStorage` must be `patiently_session_id`

---

### `tests/e2e/validation-ux.spec.ts` — 6 cases

**Blur Behaviour (4 cases)**
1. No error shown whilst typing (before blur)
2. Error appears after blur on empty required field
3. Error clears once field is filled correctly
4. Invalid email shows error after blur

**Emergency Contact Group (2 cases)**
5. Name filled, relationship missing → error on relationship field
6. Both fields filled → error clears

---

### `tests/e2e/staff-view.spec.ts` — 4 cases

1. Card shows "Anonymous" before any name is filled
2. Card header shows full name once first and last name are filled
3. Filling session appears before submitted in the card list
4. Field progress counter increments as patient fills the form
