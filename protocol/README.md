# ECHO Protocol Scaffold — Savant-Code

This directory contains an in-tree copy of the **ECHO Protocol v0.1.3** for the
`savant-code` monorepo. The canonical source of truth for the protocol lives at
[C:\Users\spenc\dev\savant-protocol](../../../../../savant-protocol) (or the
public `fame0528/savant-protocol` repo on GitHub). This scaffold is a
**synchronized fork** — keep these files in sync with the source repo when the
protocol is updated.

## Layout

```text
protocol/
├── ECHO.md                      # Universal agent bootstrap spec (READ FIRST)
├── README.md                    # This file — scaffold notes for savant-code
├── protocol.config.yaml         # Configured for TypeScript / Bun monorepo
├── STARTER-PROMPT.md            # Universal + per-language agent activation prompts
├── MIGRATION.md                 # Retrofit guide (followed to produce this scaffold)
├── VERSION                      # 0.1.3 — must match savant-protocol/VERSION
├── CHANGELOG.md                 # Protocol changelog (sourced from upstream)
├── LICENSE                      # MIT
├── .markdownlint.json
├── overview.jpg
├── coding-standards/
│   ├── typescript.md            # Active standard for this project
│   ├── rust.md
│   ├── python.md
│   ├── go.md
│   ├── java.md
│   ├── csharp.md
│   ├── x402.md                  # Payment standard
│   └── release-workflow.md
├── templates/
│   ├── FID-TEMPLATE.md
│   └── SESSION-SUMMARY.md
└── scripts/
    ├── release.py               # Release workflow helper
    └── sync-agents.py           # Multi-agent distribution
```

The protocol's runtime state (FIDs, session summaries, LEARNINGS) lives at the
**repository root** in `./dev/` — not under `./protocol/dev/`. This matches the
ECHO Protocol's default layout and is gitignored except for marker files
(`.gitkeep`) and the tracked `LEARNINGS.md`.

## What Was Changed for This Project

1. **`protocol.config.yaml`** is configured for the Savant-Code monorepo:
   - `language: "typescript"` (no longer `CHANGE_ME`)
   - `commands.*` point at `bun` scripts in the root `package.json`
   - `paths.src` lists the monorepo's workspace packages
   - Quality overrides from `coding-standards/typescript.md` applied
     (`max_file_lines: 400`, `max_function_lines: 60`)
   - `project.name` and `project.version` set from the root `package.json`

2. **`./dev/`** (root-level, not under `protocol/`) holds:
   - `LEARNINGS.md` — cross-session knowledge (tracked)
   - `fids/` — active FIDs (gitignored, archive/ tracked via `.gitkeep`)
   - `fids/archive/` — closed FIDs (gitignored, `.gitkeep` tracked)
   - `session-summaries/` — session summaries (gitignored, `.gitkeep` tracked)

3. **Root `.gitignore`** updated to track the ECHO runtime markers while
   ignoring ephemeral FIDs/sessions.

## Boot Sequence

To activate the protocol for an agent session, copy the appropriate prompt from
`protocol/STARTER-PROMPT.md` into the agent's system prompt (use the **Universal**
prompt unless the work is Rust/Python/Go/Java/C#-specific). The agent must
complete the 8-step boot sequence before any work begins.

## Syncing with Upstream

When `savant-protocol` is updated at the source repo, copy these files into
`./protocol/` to sync (preserve `./protocol/protocol.config.yaml` and
`./protocol/README.md` — those are project-specific):

```text
ECHO.md
STARTER-PROMPT.md
MIGRATION.md
VERSION
CHANGELOG.md
LICENSE
.markdownlint.json
overview.jpg
coding-standards/
templates/
scripts/
```

Update `./protocol/VERSION` first, then propagate the same value to
`./protocol/protocol.config.yaml` → `protocol.version`.

## See Also

- [protocol/ECHO.md](ECHO.md) — the single source of truth for agent behavior
- [protocol/coding-standards/typescript.md](coding-standards/typescript.md) —
  TypeScript-specific naming, patterns, and quality overrides
- [dev/LEARNINGS.md](../dev/LEARNINGS.md) — cross-session lessons learned
