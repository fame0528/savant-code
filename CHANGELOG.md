# Changelog

All notable changes to this project are documented here.

**Version source of truth:** `package.json` at the repo root and in each workspace.

---

## v0.0.1 — 2026-06-20

Base release. Public rebrand of the `savant-code` monorepo.

- [LOW] **FID-2026-0620-001** — Re-brand as `savant-code` base v0.0.1. Reset all 10 workspace `package.json` versions to `0.0.1` (sdk 0.10.7 → 0.0.1 per user approval). Renamed `savant-free` → `free-build` in root `package.json` workspaces array (was broken — directory was `free-build/`, not `savant-free/`). Added `"ignoreDeprecations": "5.0"` to `tsconfig.base.json` (silences TS 6.0 `baseUrl` deprecation). Added `"globals": "^15.14.0"` to root devDependencies (was missing despite `eslint.config.js` importing it). Patched `AGENTS.md` repo map (`savant-free/` → `free-build/`). Removed `> Built on the [Savant-Code] platform` line from `free-build/README.md`. Rewrote root `README.md` following the savant-bot template (Overview, Key Tech, Features, Repo Map, Quick Start, Commands, Configuration, Validation, Conventions, ECHO Protocol, Sister Projects, Documentation, License).
- [HIGH] **Security — Dependabot alerts #1-6 (CLOSED)** — Bumped `lodash` from `4.17.23` to `^4.18.0` (resolved `4.18.1`) in 3 manifests: root `package.json`, `common/package.json`, `packages/agent-runtime/package.json`. Closes CVE-2026-4800 (HIGH, code injection in `_.template` imports) and CVE-2026-2950 (MEDIUM, prototype pollution via `_.unset`/`_.omit`). All 6 Dependabot alerts auto-closed after push. `bun x tsc --noEmit -p tsconfig.json` exits 0 — no type regressions.

### Verification

- `type_check` (`bun x tsc --noEmit -p tsconfig.json`): PASS (exit 0, 0 errors).
- `lint` (`bun x eslint . --max-warnings 0`): NOT PASS — pre-existing ESLint 10 / typescript-eslint 7 incompat (FID-003).
- `format` (`bun x prettier --check .`): NOT PASS — pre-existing 1456 unformatted lines (out of scope).
- `build` (`bun run build:sdk && bun run build:savant-free`): NOT VERIFIED — pre-existing `canvas` dep fails Windows install (FID-002).
- `test` (`bun test`): NOT VERIFIED — 197 test files discovered but not yet run in this session.

### Known Issues

- **FID-2026-0620-002** (MEDIUM) — `canvas` dep fails Windows `bun install` (GTK3 runtime missing). Affects onboarding + CI gates.
- **FID-2026-0620-003** (MEDIUM) — ESLint 10.5.0 vs `typescript-eslint` 7.17.0 incompat. `bun x eslint` exits 2 with `TypeError: Class extends value undefined`. Pin ESLint to `^9.0.0` or upgrade typescript-eslint to `^8.0.0`.

---

<!-- New entries above this line -->
