# WORKFLOW.md — Engineering Workflow, Branching & Pull Request Standard

> **Document Version:** 1.0.0 (Ratified October 2026)  
> **Repository:** `https://github.com/Usamabhanbhro/restaurant-ordering-system-pk.git`  
> **Stack:** Turborepo monorepo (`apps/web`, `apps/api`, `packages/db`, `packages/types`, `packages/tsconfig`)  
> **Policy:** Strict Zero-Emoji Rule across all code, tests, commit messages, and PR descriptions.

---

## 1. Principles of Engineering Velocity

QueueLess operates under a high-velocity, trunk-based development workflow designed to minimize merge conflicts, eliminate review lag, and guarantee that the `main` branch is continuously buildable and deployable:

1. **Atomic, Right-Sized Changes:** Pull requests should target 150 to 350 lines of code (LoC). Small PRs are reviewed and merged in minutes; large PRs create review fatigue and hide regressions.
2. **Automated Quality Gates:** Machines handle linting, type safety, and build verification. Human reviews focus exclusively on architecture, domain logic, performance, and security.
3. **Linear, Revertible History:** All feature branches are consolidated via **Squash and Merge** into `main`, ensuring every merge commit represents an isolated, single-commit revertible unit.
4. **Zero-Emoji Discipline:** All commit messages, branch names, code comments, tests, UI badges, and PR descriptions must strictly use text or vector assets. No Unicode emojis are permitted.

---

## 2. Branching Strategy & Naming Taxonomy

QueueLess uses a **Trunk-Based Development** model with short-lived feature branches branching from and returning to `main`.

### 2.1 Branch Taxonomy

Branch names must follow the format `<type>/<scope>-<short-description>`:

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feat/` | New user-facing or platform features | `feat/kds-swimlanes`, `feat/customer-auth-sheet` |
| `fix/` | Bug fixes and patches | `fix/cart-stepper-overflow`, `fix/phone-regex-leading-zero` |
| `refactor/` | Code structure improvements without behavior changes | `refactor/split-cart-selectors`, `refactor/db-client-factory` |
| `perf/` | Performance optimizations | `perf/next-image-lqip`, `perf/fastify-route-serialization` |
| `docs/` | Architecture specs, runbooks, and roadmaps | `docs/adr-0010-kds-undo`, `docs/workflow-guide` |
| `chore/` | Dependency updates, tooling, and build configuration | `chore/turbo-cache-config`, `chore/pnpm-upgrade` |

### 2.2 Branch Hygiene Rules
- **Branch Lifespan:** Feature branches should live for **no more than 2 to 3 days**. If a feature takes longer, decompose it into sequential sub-phases using the Stacked PR pattern.
- **Continuous Rebasing:** Rebase feature branches against `origin/main` frequently:
  ```powershell
  git fetch origin
  git rebase origin/main
  ```
- **Automated Branch Deletion:** Branches are deleted automatically on GitHub once merged into `main`.

---

## 3. Local Pre-Flight Verification Protocol

Before pushing a branch to remote or opening a Pull Request, every engineer must execute the local quality gates:

### Step 1: Type Checking Across All Monorepo Packages
```powershell
pnpm run check-types
```
*Requirement:* Must pass with 0 errors across `@queueless/web`, `@queueless/api`, `@queueless/types`, and `@queueless/db`. TypeScript strict mode (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) is enforced.

### Step 2: Production Build Validation
```powershell
pnpm run build
```
*Requirement:* Validates that Next.js 15 App Router static generation, server bundles, and Fastify TypeScript compilation complete without warnings or route errors.

### Step 3: Git Push with Windows SSL Flag
In Windows development environments, Git pushes must use the explicit SSL verification flag:
```powershell
git -c http.sslVerify=false push origin <branch-name>
```

---

## 4. Pull Request (PR) Lifecycle

```
[ Local Branch ] ──> [ Pre-Flight Checks ] ──> [ Push ] ──> [ Open PR / Draft ]
       │                                                              │
       └────────────────── [ Squash & Merge ] <────── [ CI Passes & Self-Review ]
```

### 4.1 Drafting and Stacking PRs
- **Draft PRs:** If you need architectural feedback before finalizing tests or UI styles, open the PR with status **Draft**. This signals to team members that the branch is work-in-progress.
- **Stacked PRs:** When building multi-layered features (e.g. database schema -> API endpoints -> UI components), submit dependent PRs sequentially rather than waiting to assemble a massive multi-thousand-line PR:
  1. `PR #1: feat(db): add kds ticket persistence schema` (merges into `main`)
  2. `PR #2: feat(api): add kds websocket swimlane broadcast` (branches from `main` after #1 merges)
  3. `PR #3: feat(web): implement 5-lane staff kds dashboard` (branches from `main` after #2 merges)

### 4.2 Mandatory 3-Minute Author Self-Review
Before requesting peer review or merging, the author must open the GitHub **"Files changed"** tab and perform a self-review:
- Verify that no debug `console.log` statements remain.
- Verify that no untracked secrets, `.env` files, or test output files are present.
- Verify that no Unicode emojis were introduced in mock data or badges.
- Verify that file diffs only contain intentional changes (no rogue whitespace or unintended lockfile bumps).

### 4.3 Standard PR Description
Every PR must adhere to the standardized Pull Request template located at `.github/pull_request_template.md`.

---

## 5. Commit Standards (Conventional Commits)

Commit messages must be concise, descriptive, and follow the Conventional Commits specification:

```
<type>(<scope>): <short summary in imperative mood>

[optional body explaining context, rationale, and tradeoffs]

[optional footer referencing roadmap sitting or issues]
```

### 5.1 Permitted Types
- `feat`: A new feature or capability.
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding or correcting tests.
- `docs`: Documentation changes only.
- `chore`: Build tooling, dependency bumps, or repository configuration.

### 5.2 Examples of Valid Commits
- `feat(web): implement customer checkout drawer with Pakistani payment rails`
- `fix(types): enforce mandatory +92 phone regex with 9-digit suffix`
- `refactor(db): isolate identity client factory from tenant runtime client`
- `docs(roadmap): mark sitting 5 customer pwa as completed`

---

## 6. Merge Strategy & Release Tagging

### 6.1 Squash and Merge Standard
- **Strategy:** All feature branches must be merged via **Squash and Merge**.
- **Rationale:**
  - Keeps the `main` branch Git log linear, readable, and noise-free.
  - Ensures each feature corresponds to exactly one commit on `main`.
  - Makes incident rollback trivial (`git revert <squash-commit-hash>`).

### 6.2 Commit Message on Squash
When completing the Squash and Merge on GitHub:
1. Ensure the title follows Conventional Commits format with the PR number:
   ```
   feat(web): implement unified staff kds dashboard lanes (#24)
   ```
2. Clean up the squashed commit body to list key achievements rather than raw commit histories (`fix typo`, `wip`).

---

## 7. Automated CI/CD Pipeline Gates

Pull requests are gated by GitHub Actions CI (`.github/workflows/ci.yml`). Every PR must pass the following four checks before being eligible for merge:

1. **Workspace Dependency Integrity:** `pnpm install --frozen-lockfile`
2. **Type Check:** `pnpm run check-types` across all 5 monorepo packages.
3. **Lint & Code Style:** Strict zero-emoji check and code format validation.
4. **Production Build:** `turbo run build` caching outputs for subsequent runs.

---

## 8. Development Sitting Alignment

All feature work is tracked against the development sittings in [`ROADMAP.md`](./ROADMAP.md):

| Sitting | Focus Area | Status | Primary Output |
| :--- | :--- | :--- | :--- |
| **Sitting 1** | Monorepo Foundation & Turborepo | **Completed** | `pnpm-workspace.yaml`, `turbo.json`, `packages/tsconfig` |
| **Sitting 2** | Domain Types & Validation Contracts | **Completed** | `packages/types` with Zod schemas |
| **Sitting 3** | Multi-Tenant Database Layer | **Completed** | `packages/db` with Drizzle ORM & RLS |
| **Sitting 4** | Backend Fastify API & WebSocket Hub | **Completed** | `apps/api` Fastify server & real-time hub |
| **Sitting 5** | Customer PWA (Next.js 15) | **Completed** | `apps/web` customer ordering, Vaul drawers, cart |
| **Sitting 6** | Unified Staff KDS Dashboard | **Active** | `apps/web` 5-swimlane kitchen & cashier dashboard |
| **Sitting 7** | Production Verification & Pilot Launch | *Pending* | Multi-device QA audit, FDE venue deployment |
