# Submission Notes

This document summarizes my approach, decisions, and trade-offs for the Houston Astros Staff SWE technical assessment. Development practices answers live in [`QUESTIONS.md`](./QUESTIONS.md).

---

## Approach & Time Management

I treated this as a 2–3 hour exercise focused on demonstrating engineering judgment, not building a production app.

**Order of work:**

1. **Repository hygiene first** — pre-commit, CI, typecheck scripts. Fast feedback before feature work.
2. **Backend structure and APIs** — modular Flask layout, pagination, filtering, tests against the real SQLite DB.
3. **Frontend integration** — typed API client, reusable table/filter components, player detail view.
4. **Tests last** — backend integration tests first (higher signal), then a frontend smoke test mocking at the API boundary.

I committed in small, logical increments so the history tells the story of the build.

---

## Assessment Questions → Features

| Question from the brief | How I addressed it |
|-------------------------|-------------------|
| What pitches did player X throw or see? | Pitch filters by `player_id`, `pitcher_id`, `batter_id`; player detail page with thrown/seen counts |
| How many pitches did player X throw or see? | `GET /pitches/count` with the same filters as the list endpoint |
| Pitches at 95+ mph? | `min_speed` / `max_speed` filters; `SpeedFilterControl` (single threshold or range) |
| What players were on team X? | `GET /players?team=...` with multi-team support |

---

## Backend Decisions

### Modular structure over a monolithic `main.py`

I split the backend into domain modules (`players/`, `pitches/`, `health/`) with routes, services, and constants. `main.py` only wires the app via `create_app()`.

**Why:** Matches how I structure real Flask services — easier to test, extend, and onboard.

### Pagination as shared infrastructure

`utils/pagination.py` centralizes page/limit parsing and response shape (`total`, `page`, `total_pages`). Both players and pitches use it.

**Why:** Consistent API contracts and one place to change behavior later.

### Dynamic pitch columns via schema reflection

Rather than hardcoding pitch fields, `pitches/services.py` reflects the DB schema, orders columns by priority, hides internal IDs from the UI, and enriches rows with `pitcher_name` / `batter_name`.

**Why:** The pitches table has 50+ columns; reflection keeps the API honest to the data without maintaining a giant field list.

### Metadata endpoints for the UI

- `GET /players/meta` — distinct teams and positions for filter dropdowns
- `GET /players/options` — lightweight searchable player list
- `GET /pitches/columns` — consistent column ordering

**Why:** Avoids loading full tables into the frontend just to populate filters.

---

## Frontend Decisions

### API boundary mocking in tests

`App.test.tsx` mocks `ApiService`, not internal component state. Tests assert on rendered user-visible output.

**Why:** Aligns with how I organize suites in production — stable under refactors.

### Reusable, domain-agnostic table components

`PlayerTable`, `PitchTable`, `Pagination`, and shared `columns.ts` formatting keep presentation consistent across dashboard and detail views.

**Why:** The assessment UI is simple; the pattern scales if more entity types are added.

### Player detail as a drill-down, not a separate route

Clicking a player swaps to `PlayerDetailPage` in-app (profile + pitch stats + filtered pitch table).

**Why:** Faster to implement within the time box; routing would be a natural next step.

### Styling

Layout/CSS was partly AI-assisted. Components use shared class names so tables look consistent across breakpoints.

---

## Testing Strategy

**Backend:** Integration tests via Flask test client against the real `baseball.db`. Assertions focus on contracts — status codes, JSON shape, filter correctness, pagination math, count/list consistency.

**Frontend:** One Vitest/RTL smoke test proving the dashboard loads and renders mocked API data.

**Deferred:** Playwright/E2E, component-level tests for every filter control. Per `QUESTIONS.md`, those belong in nightly/pre-release, not every commit.

---

## CI/CD

GitHub Actions runs three parallel jobs:

- **pre-commit** — formatting/lint hooks
- **backend** — `pytest`
- **frontend** — `npm run typecheck` + `npm test -- --run`

This mirrors the "fast and boring" pipeline described in `QUESTIONS.md`.

---

## Trade-offs & What I'd Do With More Time

| Done | Deferred |
|------|----------|
| Full read APIs with filtering & pagination | Auth, rate limiting, input validation middleware |
| Player + pitch dashboards with drill-down | React Router, URL-synced filter state |
| Backend integration tests + frontend smoke test | Broad component test coverage, E2E suite |
| CI with typecheck and tests | Deploy pipeline, migration tooling (Alembic) |
| Basic error states in the UI | Toast notifications, retry logic, empty-state polish |

**With another hour:** URL-based routing for player detail, a few more RTL tests on filter controls.

**With a day:** Postgres swap, Alembic migrations, export CSV, and performance profiling on pitch queries with indexes on `pitcher`, `batter`, `release_speed`.

---

## AI Usage

I used AI assistance for:

- Accelerating boilerplate (table components, CSS layout)
- Expanding backend test coverage after the core API shape was defined
- Drafting and refining `QUESTIONS.md` answers

All architectural choices, module boundaries, API design, and commit sequencing were mine. I reviewed and adjusted generated code — e.g. fixing pitch player-involvement filter logic and import issues caught by tests.

---

## Feedback on the Assessment

**What worked well:**

- Realistic dataset size (14k pitches) — pagination and filtering matter immediately
- Starter scaffold without over-prescribing structure — room to show how I'd organize a service
- Optional thought-process doc — this file

**Suggestions:**

- README feature checklist could be pre-checked as a template to reduce submission friction
- Minor README path references (`backend/app/schemas.py` vs actual `backend/schemas.py`) — corrected in this submission

Overall: a solid 2–3 hour signal on full-stack structure, testing philosophy, and staff-level trade-off thinking.

---

## Quick Reference

- **Dev practices:** [`QUESTIONS.md`](./QUESTIONS.md)
- **Setup & run:** [`README.md`](./README.md)
- **Backend entry:** `backend/main.py`
- **Frontend entry:** `frontend/src/App.tsx`
- **CI:** `.github/workflows/ci.yml`
