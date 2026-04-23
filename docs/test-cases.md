# Test Cases — Patiently 🧪

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

| # | Field | Input | Expected |
|---|-------|-------|----------|
| 1 | First Name | Any text | ✅ Pass |
| 2 | First Name | Empty string | ❌ Fail |
| 3 | First Name | Whitespace only | ❌ Fail |
| 4 | Email | Valid format (`john@example.com`) | ✅ Pass |
| 5 | Email | Missing `@` | ❌ Fail |
| 6 | Email | Empty string | ❌ Fail |
| 7 | Phone | Starts with `+66` | ✅ Pass |
| 8 | Phone | Local format (`08x`) | ✅ Pass |
| 9 | Phone | Number with spaces | ✅ Pass |
| 10 | Phone | Contains letters | ❌ Fail |
| 11 | Phone | Empty string | ❌ Fail |
| 12 | Last Name | Any text | ✅ Pass |
| 13 | Last Name | Empty string | ❌ Fail |
| 14 | Last Name | Whitespace only | ❌ Fail |
| 15 | Date of Birth | Valid date string | ✅ Pass |
| 16 | Date of Birth | Empty string | ❌ Fail |
| 17 | Date of Birth | Whitespace only | ❌ Fail |
| 18 | Address | Any non-empty text | ✅ Pass |
| 19 | Address | Empty string | ❌ Fail |
| 20 | Address | Whitespace only | ❌ Fail |
| 21 | Preferred Language | Any non-empty text | ✅ Pass |
| 22 | Preferred Language | Empty string | ❌ Fail |
| 23 | Preferred Language | Whitespace only | ❌ Fail |
| 24 | Nationality | Any non-empty text | ✅ Pass |
| 25 | Nationality | Empty string | ❌ Fail |
| 26 | Nationality | Whitespace only | ❌ Fail |
| 27 | Middle Name *(optional)* | Left blank | ✅ Pass |
| 28 | Middle Name *(optional)* | Filled in | ✅ Pass |
| 29 | Religion *(optional)* | Left blank | ✅ Pass |
| 30 | Religion *(optional)* | Filled in | ✅ Pass |
| 31 | Gender | `male` | ✅ Pass |
| 32 | Gender | `prefer_not_to_say` | ✅ Pass |
| 33 | Gender | Value outside allowed list | ❌ Fail |
| 34 | Emergency Contact | Both blank | ✅ Pass |
| 35 | Emergency Contact | Both filled | ✅ Pass |
| 36 | Emergency Contact | Name filled, relationship missing | ❌ Fail on relationship |
| 37 | Emergency Contact | Relationship filled, name missing | ❌ Fail on name |
| 38 | Required Fields Guard | Count of required fields | ✅ Exactly 9 |
| 39 | Required Fields Guard | All expected fields present | ✅ All 9 found |
| 40 | Required Fields Guard | No optional fields in required list | ✅ None sneaking in |
| 41 | Form Valid? | Fully empty form | ❌ Not valid |
| 42 | Form Valid? | All required fields valid | ✅ Valid |
| 43 | Form Valid? | One required field missing | ❌ Not valid |

---

### `src/hooks/useStaffView.test.ts` — 14 cases

| # | Group | Scenario | Expected |
|---|-------|----------|----------|
| 1 | Effective Status | `filling` + last activity > 30s ago | `inactive` |
| 2 | Effective Status | `filling` + last activity < 30s ago | `filling` |
| 3 | Effective Status | `filling` + last activity at 29s (edge case) | `filling` |
| 4 | Effective Status | `submitted` + any last activity | `submitted` |
| 5 | Effective Status | `inactive` + recent last activity | `inactive` |
| 6 | Show Session? | `inactive` + all fields empty | Hidden (ghost session) |
| 7 | Show Session? | `inactive` + at least one field filled | Shown |
| 8 | Show Session? | `filling` + all fields empty | Shown (just opened) |
| 9 | Show Session? | `submitted` + all fields empty | Shown |
| 10 | Show Session? | `filling` + timed out + all fields empty | Hidden (treated as inactive) |
| 11 | Relative Time | < 5 seconds ago | `"just now"` |
| 12 | Relative Time | 5–59 seconds ago | `"Xs ago"` |
| 13 | Relative Time | 60+ seconds ago | `"Xm ago"` |
| 14 | Relative Time | 60+ minutes ago | `"Xh ago"` |

---

### `src/lib/session.test.ts` — 2 cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Session key value | Exactly `"patiently_session_id"` |
| 2 | Session key value | Does not contain `"agnos"` (legacy name) |

---

## E2E Tests (25 cases)

### `tests/e2e/patient-form.spec.ts` — 6 cases

| # | Group | Scenario | Expected |
|---|-------|----------|----------|
| 1 | Happy Path | Open the form | Loads without crashing |
| 2 | Happy Path | Submit button on empty form | Disabled |
| 3 | Happy Path | Submit button after all required fields filled | Enabled |
| 4 | Happy Path | Click Submit | Success screen appears |
| 5 | Session Persistence | Fill a field, then reload the page | Data still there |
| 6 | Session Persistence | Submit, then reload | Success screen stays — no re-submit |

---

### `tests/e2e/form-structure.spec.ts` — 1 case

| # | Group | Scenario | Expected |
|---|-------|----------|----------|
| 1 | ARIA Snapshot | Form fields across all 3 sections + Submit button | Matches accessibility spec exactly |

---

### `tests/e2e/real-time-sync.spec.ts` — 3 cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Patient types first name | Staff see it within 2 seconds |
| 2 | Two patients open the form at once | Staff see two separate cards |
| 3 | Patient submits | Staff card flips to **Submitted** |

---

### `tests/e2e/regression.spec.ts` — 5 cases

| # | Group | Scenario | Expected |
|---|-------|----------|----------|
| 1 | SSR | Patient page loads | No console errors |
| 2 | SSR | Staff page loads | No console errors |
| 3 | Firebase unconfigured | Patient page | Error UI shown, no crash |
| 4 | Firebase unconfigured | Staff page | Error UI shown, no crash |
| 5 | Session Key | Key written to `sessionStorage` | Exactly `patiently_session_id` |

---

### `tests/e2e/validation-ux.spec.ts` — 6 cases

| # | Group | Scenario | Expected |
|---|-------|----------|----------|
| 1 | Blur Behaviour | Still typing (no blur yet) | No error shown |
| 2 | Blur Behaviour | Blur an empty required field | Error appears |
| 3 | Blur Behaviour | Fill the field correctly after error | Error clears |
| 4 | Blur Behaviour | Invalid email, then blur | Error appears |
| 5 | Emergency Contact | Name filled, relationship missing | Error on relationship field |
| 6 | Emergency Contact | Both fields filled | Error clears |

---

### `tests/e2e/staff-view.spec.ts` — 4 cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Patient hasn't typed a name yet | Card shows **"Anonymous"** |
| 2 | Patient fills first and last name | Card header shows full name |
| 3 | One filling session, one submitted | Filling card appears first in list |
| 4 | Patient fills more fields | Progress counter increments |
