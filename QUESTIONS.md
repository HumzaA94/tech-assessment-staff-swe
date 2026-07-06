# Development practices questions

Please provide thoughtful responses to the following questions. Your answers should demonstrate your understanding of modern development practices and architectural considerations.

## DevOps Practices

### 1. CI/CD Pipeline Design

**Question:** How do you design CI/CD pipelines for applications like this? What are your must-have checks?

**Your Answer:**

For something this size I try to keep CI fast and kind of boring, that's really the goal. Backend and frontend run as separate jobs in parallel on every push and PR.

Must haves:

- Lint and typecheck first, catches dumb stuff cheaply before anything else runs.
- Unit and integration tests, API tests against the SQLite schema, component tests on whatever UI paths actually matter.
- Build verification, make sure the bundle builds and the backend actually boots with real config, not just "it imports fine."
- Dependency scanning on a schedule, pip-audit / npm audit.

I don't run full end to end tests on every commit, too slow and too flaky for that. Those go in a nightly or pre-release stage instead. And for deploys I want the exact artifact that passed CI to move through staging into prod, not something rebuilt at deploy time. Migrations are their own explicit step too, never something that just happens quietly on app boot.

### 2. Infrastructure as Code

**Question:** How would you approach infrastructure-as-code for deploying this project in a cloud environment?

**Your Answer:**

I'd split backend and frontend into separate deployable units in Terraform.

Backend: containerized Flask app on ECS/Fargate or Cloud Run, env vars for the DB connection. SQLite's fine for a demo but real production means Postgres with Alembic handling migrations.

Frontend: static assets on S3 behind CloudFront, API URL baked in at build time.

Networking wise, ALB or API Gateway in front, CORS locked to the frontend origin only. Secrets live in Secrets Manager or SSM, never baked into an image. Terraform state stays remote with locking, split by environment so dev/staging/prod can't step on each other. I'd build modules for the reusable pieces (VPC, ECS service, CDN) so a new environment is basically just variable changes, not copy paste.

### 3. Monitoring and Alerting

**Question:** What strategies do you recommend for monitoring and alerting in production?

**Your Answer:**

Main layers being infrastructure and application:
1. Infrastructure: CPU, memory, restarts, 5xx rate, p95 latency off the load balancer.
2. Application: structured JSON logs with request ID, endpoint, duration, stack traces, plus a health check hit by synthetic probes.


Alerts need to mean something or people start ignoring them. Page on sustained 5xx or a failed health check, Slack/email for latency creeping or error rate trending the wrong way. I'd pair whatever metrics tool (Datadog, CloudWatch, Prometheus) with trace sampling on slow requests, and keep one dashboard that's just "is the user facing stuff healthy" so on-call isn't digging through ten dashboards at 2am.

## Legacy Systems

### 4. Legacy Modernization

**Question:** Walk through your process for modernizing a legacy codebase with minimal disruption.

**Your Answer:**

First thing is figuring out what actually changes together, that tells you the real boundaries, not whatever the org chart or folder structure says. Then go after the highest risk, highest value seams, usually data access or API contracts.

From there it's fairly mechanical:

- Write characterization tests before touching anything.
- Add observability so regressions show up early instead of via a customer complaint.
- Strangle it piece by piece, new read API behind the old UI, swap one module at a time, keep the monolith deployable the whole way through.
- Avoid big bang rewrites unless the domain's genuinely well understood and the team can afford to run two systems in parallel for a while.
- Migrate data carefully, backfills, dual write/dual read windows, an actual rollback plan and not just hope.

Honestly half of this is communication anyway. feature flags and steady visible progress matter as much as the code, stakeholders panic at surprises way more than at slow progress.

### 5. Test Suite Organization

**Question:** What patterns and practices inform your test suite organization?

**Your Answer:**

I organize around behavior and risk, not folder structure. Unit tests cover pure functions and query builders, fast, no I/O. Integration tests hit the Flask test client against a real SQLite file to check routes, filters, serialization actually work end to end. Component tests use React Testing Library and mock at the API boundary rather than mocking implementation details. Load tests exist just to make sure the thing doesn't fall over under real traffic. Full Playwright/Selenium browser flows, filtering, pagination, detail pages, run nightly or pre-release, not on every commit, they're slow and a little flaky by nature.

Naming's test_<behavior>_<expected_outcome>, fixtures own setup/teardown, and tests assert on contracts (status codes, JSON shape) not internals so a refactor doesn't blow up the whole suite for no reason.

## Architecture

### 6. Scaling Architecture

**Question:** What architectural choices would you make if tasked to scale this system for millions of daily active users?

**Your Answer:**

Monolith + SQLite is fine for what this is, but at real scale I'd move toward:

Stateless Flask/FastAPI containers behind a load balancer.
Postgres with read replicas, maybe partitioned by season or game date for pitch data.
Redis in front for hot lookups, teams, positions, that kind of thing.
Elasticsearch or a warehouse like BigQuery if the analytics get heavy, so it's not hammering the OLTP database.
CDN for the frontend, rate limiting and auth once the API's public.
Queue (SQS/Kafka) plus workers if live game feeds ever come into play, not synchronous writes.

Before splitting anything into microservices though I want actual traffic data on which endpoints dominate. cutting things apart too early usually just adds latency and ops overhead without buying you much.

## Opinion

### 7. Overrated Practice

**Question:** What's one commonly-used pattern/practice you think is overrated, and what alternative do you recommend?

**Your Answer:**

Reaching for microservices, or a service per entity, early on just because it feels modern. Same with caching, bolting it on before you've actually pushed on backend scalability is basically tape on an open wound. Fix the actual bottleneck first, then decide if you even still need the cache.
