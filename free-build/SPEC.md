# Savant-Free Spec

Savant-Free is a free-only variant of the Savant-Code CLI, distributed as a separate npm package (`savant-free`). It reuses the entire `cli/` package but builds with a compile-time flag that strips out paid features, subscription logic, credits display, and mode switching â€” leaving only the FREE mode experience.

---

## 1. Build-Time Flag

### Environment Variable

- **`SAVANT_FREE_MODE=true`** â€” set during the build to produce a Savant-Free binary.
- Injected via `--define process.env.SAVANT_FREE_MODE="true"` in `bun build`, following the same pattern as `SAVANT_CODE_IS_BINARY` and `SAVANT_CODE_CLI_VERSION`.

### Runtime Constant

Create a shared constant in `cli/src/utils/constants.ts`:

```ts
export const IS_SAVANT_FREE = process.env.SAVANT_FREE_MODE === 'true'
```

This enables dead-code elimination in production builds â€” all `if (!IS_SAVANT_FREE)` branches are removed by the bundler.

---

## 2. Branding Changes

| Area                  | Savant-Code                                                       | Savant-Free                                                       |
| --------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| Terminal title prefix | `Savant-Code: `                                                   | `Savant-Free: `                                                   |
| CLI commander name    | `savant-code`                                                     | `savant-free`                                                     |
| npm package name      | `savant-code`                                                     | `savant-free`                                                     |
| Binary name           | `savant-code`                                                     | `savant-free`                                                     |
| App header text       | "Savant-Code will run commands on your behalf to help you build." | "Savant-Free will run commands on your behalf to help you build." |
| ASCII logo            | `SAVANT_CODE` block letters                                       | `SAVANT-FREE` block letters (new logo)                            |
| Description           | "AI coding agent"                                              | "Free AI coding assistant"                                     |
| Homepage              | savant-code.dev                                                   | savant-code.dev/free (or same)                                    |
| `WEBSITE_URL` usage   | Points to savant-code.dev                                         | Same (login, feedback, etc. stay on savant-code.dev)              |

### Files to modify (conditional on `IS_SAVANT_FREE`)

- **`cli/src/utils/terminal-title.ts`** â€” Change `TITLE_PREFIX` from `'Savant-Code: '` to `'Savant-Free: '` when `IS_SAVANT_FREE`.
- **`cli/src/login/constants.ts`** â€” Add a `LOGO_SAVANT-FREE` ASCII art variant, select based on `IS_SAVANT_FREE`.
- **`cli/src/app.tsx`** â€” Conditional header text ("Savant-Free will run commands...").
- **`cli/src/index.tsx`** â€” Change commander `.name('savant-free')` and `.description(...)` when `IS_SAVANT_FREE`.

---

## 3. Mode Restrictions

Savant-Free only supports **FREE mode**. All mode-related features are stripped.

### Behavior

- `agentMode` is always `'FREE'` and never changes.
- The initial mode flag (`--free`, `--max`, `--plan`) CLI options are removed in Savant-Free; mode is hardcoded.
- No mode divider messages are ever inserted into chat history.

### Files to modify

- **`cli/src/utils/constants.ts`** â€” When `IS_SAVANT_FREE`, export a single-element `AGENT_MODES = ['FREE']` and `AGENT_MODE_TO_ID` with only the FREE entry. Or: the mode toggle component simply never renders.
- **`cli/src/components/agent-mode-toggle.tsx`** â€” Return `null` when `IS_SAVANT_FREE` (hide entirely).
- **`cli/src/components/build-mode-buttons.tsx`** â€” Return `null` when `IS_SAVANT_FREE` (hides mode-switching buttons in message UI).
- **`cli/src/components/mode-divider.tsx`** â€” Return `null` when `IS_SAVANT_FREE` (no mode transition markers).
- **`cli/src/utils/input-modes.ts`** â€” Set `showAgentModeToggle: false` for all input mode configs when `IS_SAVANT_FREE`.
- **`cli/src/index.tsx`** â€” Remove `--free`, `--max`, `--plan`, `--lite` CLI flags when `IS_SAVANT_FREE`; hardcode `initialMode = 'FREE'`.
- **`cli/src/state/chat-store.ts`** â€” Default `agentMode` to `'FREE'`; make `setAgentMode` a no-op when `IS_SAVANT_FREE`.

---

## 4. Slash Commands

### Commands to REMOVE in Savant-Free

| Command                                            | Reason                                                                                         |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/subscribe` (+ `/strong`, `/sub`, `/buy-credits`) | No subscription model                                                                          |
| `/usage` (+ `/credits`)                            | No credits display                                                                             |
| `/ads:enable`                                      | Ads always on, not toggleable                                                                  |
| `/ads:disable`                                     | Ads always on, not toggleable                                                                  |
| `/connect:claude` (+ `/claude`)                    | Claude subscription not available                                                              |
| `/refer-friends` (+ `/referral`, `/redeem`)        | Referrals earn credits, not applicable                                                         |
| `/mode:*` (all mode commands)                      | Only FREE mode                                                                                 |
| `/agent:gpt-5`                                     | Premium agent, not available in free tier                                                      |
| `/review`                                          | Uses thinker-gpt under the hood                                                                |
| `/publish`                                         | Agent publishing not available in free tier                                                    |
| `/image` (+ `/img`, `/attach`)                     | Image attachments unavailable with free models (Kimi K2.6, DeepSeek V4 Pro, DeepSeek V4 Flash) |

### Commands to KEEP

| Command                                   | Notes                          |
| ----------------------------------------- | ------------------------------ |
| `/help`                                   | Modified help content (see Â§6) |
| `/new` (+ `/clear`, `/reset`, `/n`, `/c`) | Clear conversation             |
| `/history` (+ `/chats`)                   | Browse past conversations      |
| `/feedback` (+ `/bug`, `/report`)         | Share feedback                 |
| `/bash` (+ `/!`)                          | Bash mode                      |
| `/theme:toggle`                           | Light/dark toggle              |
| `/logout` (+ `/signout`)                  | Sign out                       |
| `/exit` (+ `/quit`, `/q`)                 | Quit                           |
| `/login` (+ `/signin`)                    | Already-logged-in message      |
| Skill commands (`/skill:*`)               | Keep if skills are loaded      |

### Implementation

- **`cli/src/data/slash-commands.ts`** â€” Filter `SLASH_COMMANDS` based on `IS_SAVANT_FREE`. Remove mode commands, subscription commands, credits commands, ads commands, referral, review, publish, and gpt-5 agent commands.
- **`cli/src/commands/command-registry.ts`** â€” Filter `COMMAND_REGISTRY` similarly. Wrap removed commands in `!IS_SAVANT_FREE` guards.

---

## 5. Credits & Subscription UI

Savant-Free never displays credits, usage, subscription info, or out-of-credits states.

### Components to suppress (render `null` when `IS_SAVANT_FREE`)

| Component                  | File                                       | Behavior                                                                 |
| -------------------------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| `UsageBanner`              | `components/usage-banner.tsx`              | Never rendered                                                           |
| `OutOfCreditsBanner`       | `components/out-of-credits-banner.tsx`     | Never rendered                                                           |
| `SubscriptionLimitBanner`  | `components/subscription-limit-banner.tsx` | Never rendered                                                           |
| `BottomStatusLine`         | `components/bottom-status-line.tsx`        | Never rendered (Claude subscription status)                              |
| Credits in `MessageFooter` | `components/message-footer.tsx`            | Remove `CreditsOrSubscriptionIndicator` â€” no credits or "âœ“ Strong" shown |
| `ClaudeConnectBanner`      | `components/claude-connect-banner.tsx`     | Never rendered                                                           |

### Input modes to disable

When `IS_SAVANT_FREE`, these input modes should be unreachable:

- `outOfCredits` â€” never triggered
- `subscriptionLimit` â€” never triggered
- `usage` â€” no `/usage` command
- `connect:claude` â€” no `/connect:claude` command
- `referral` â€” no `/refer-friends` command

### Hooks to disable/skip

- **`use-usage-monitor.ts`** â€” Return early when `IS_SAVANT_FREE` (no credits to monitor).
- **`use-subscription-query.ts`** â€” Return empty/disabled when `IS_SAVANT_FREE`.
- **`use-claude-quota-query.ts`** â€” Return empty/disabled when `IS_SAVANT_FREE`.
- **`use-usage-query.ts`** â€” Still needed for server-side billing, but UI never shows it.

### Session credits tracking

- `sessionCreditsUsed` in `chat-store.ts` still accumulates (server tracks usage), but the UI never displays it.
- The `chat.tsx` ad banner continues to pass `isFreeMode={true}` (hardcoded).

---

## 6. Help Menu

The `/help` banner in Savant-Free should be simplified. Remove the **Credits** section entirely.

### Savant-Free Help Content

```
Shortcuts
  Ctrl+C / Esc  stop
  Ctrl+J / Opt+Enter  newline
  â†‘â†“  history
  Ctrl+T  collapse/expand agents

Features
  /  commands
  @files  mention
  @agents  use agent
  !bash  run command
```

No "Credits" section. No `/subscribe`, `/usage`, or `/ads:enable` references.

### File to modify

- **`cli/src/components/help-banner.tsx`** â€” Conditionally hide the Credits section when `IS_SAVANT_FREE`.

---

## 7. Ads Behavior

In Savant-Free, ads are **always enabled** and **cannot be disabled**.

- The ad banner always renders (when an ad is available).
- The "Hide ads" link in the info panel is replaced with "Ads are required in Free mode." (this already exists in `ad-banner.tsx` when `isFreeMode` is true).
- The `/ads:enable` and `/ads:disable` commands are removed (see Â§4).
- `getAdsEnabled()` always returns `true` when `IS_SAVANT_FREE`.

### Files to modify

- **`cli/src/commands/ads.ts`** â€” `getAdsEnabled()` returns `true` unconditionally when `IS_SAVANT_FREE`.
- **`cli/src/chat.tsx`** â€” Skip the `!hasSubscription` guard for ads when `IS_SAVANT_FREE`; always show.

---

## 8. Build & Release

### Directory Structure

The `savant-free/` directory is organized as a product-level directory with subdirectories for each surface (CLI, web, etc.):

```
savant-free/
â”œâ”€â”€ SPEC.md           # This file (product-level spec)
â”œâ”€â”€ README.md         # Product-level documentation
â”œâ”€â”€ cli/              # CLI build & release infrastructure
â”‚   â”œâ”€â”€ build.ts      # Build script that sets SAVANT_FREE_MODE=true
â”‚   â””â”€â”€ release/
â”‚       â”œâ”€â”€ package.json  # npm package metadata (name: "savant-free")
â”‚       â”œâ”€â”€ index.js      # Entry point (finds/runs binary)
â”‚       â”œâ”€â”€ postinstall.js# Downloads platform binary on install
â”‚       â””â”€â”€ README.md     # npm package README
â””â”€â”€ web/              # (Future) Savant-Free website code
```

This structure allows `savant-free/web/` (or other surfaces) to be added alongside the CLI without restructuring.

### Build Script (`savant-free/cli/build.ts`)

Wraps `cli/scripts/build-binary.ts` with:

```bash
SAVANT_FREE_MODE=true bun cli/scripts/build-binary.ts savant-free <version>
```

The existing `build-binary.ts` already supports a custom binary name argument and passes `NEXT_PUBLIC_*` env vars. We add `SAVANT_FREE_MODE` to the `defineFlags` array in `build-binary.ts`.

### Release Package (`savant-free/cli/release/package.json`)

Mirrors `cli/release/package.json` but with:

- `"name": "savant-free"`
- `"description": "Free AI coding assistant"`
- `"bin": { "savant-free": "index.js" }`
- Same `postinstall.js` pattern (downloads platform-specific binary from GitHub releases)
- Binary stored at `~/.config/savant-code/savant-free` (or `savant-free.exe` on Windows)

### GitHub Workflow

New file: `.github/workflows/savant-free-release.yml`

Mirrors `cli-release-prod.yml` with these changes:

- **Trigger**: `workflow_dispatch` (manual) or scheduled
- **Binary name**: `savant-free`
- **Version source**: `savant-free/cli/release/package.json`
- **Git tags**: `savant-free-v<version>`
- **npm publish**: `savant-free` package
- **Environment overrides**: `{"SAVANT_FREE_MODE": "true", "NEXT_PUBLIC_SC_ENVIRONMENT": "prod"}`
- **GitHub Release**: Creates releases in `savant-code/savant-code-community` (or a separate repo)

---

## 9. Changes to `cli/scripts/build-binary.ts`

Add `SAVANT_FREE_MODE` to the define flags so it's available at compile time:

```ts
const defineFlags = [
  ['process.env.NODE_ENV', '"production"'],
  ['process.env.SAVANT_CODE_IS_BINARY', '"true"'],
  ['process.env.SAVANT_CODE_CLI_VERSION', `"${version}"`],
  [
    'process.env.SAVANT_CODE_CLI_TARGET',
    `"${targetInfo.platform}-${targetInfo.arch}"`,
  ],
  // Savant-Free mode flag
  ['process.env.SAVANT_FREE_MODE', `"${process.env.SAVANT_FREE_MODE ?? 'false'}"`],
  ...nextPublicEnvVars,
]
```

---

## 10. Features That Stay Unchanged

These features work identically in Savant-Free:

- **Authentication** â€” Login/logout flow, API key storage
- **Chat** â€” Message history, streaming, agent spawning
- **File mentions** (`@files`) â€” Browse and attach files
- **Agent mentions** (`@agents`) â€” Use available agents (free-tier agents only)
- **Bash mode** â€” Run terminal commands
- **Image attachments** â€” Attach and paste images
- **Knowledge files** â€” `knowledge.md`
- **Chat history** â€” `/history`, resume conversations
- **Feedback** â€” `/feedback` command
- **Theme** â€” Light/dark toggle
- **Skills** â€” Loaded from `.agents/skills`
- **Local agents** â€” Loaded from `.agents/` directory

---

## 11. Analytics

When `IS_SAVANT_FREE`:

- `APP_LAUNCHED` event includes `isSavant-Free: true`
- All existing analytics events continue to fire (helps understand free vs paid usage)
- No new analytics events needed initially

---

## 12. Server-Side Considerations

The server already handles FREE mode correctly:

- `isFreeMode(costMode)` in `common/src/constants/free-agents.ts` recognizes the `'free'` cost mode
- `AGENT_MODE_TO_COST_MODE.FREE === 'free'` is already set
- Free-mode-allowed agent+model combos cost 0 credits
- Ad impressions in FREE mode already don't grant credits

No server-side changes are needed for Savant-Free, **except** the release download API (`/api/releases/download/`) must be configured to serve `savant-free-*` binary tarballs. This may require updating the download route to recognize Savant-Free release tags (`savant-free-v*`).

---

## 13. Testing Strategy

### Unit Tests

- Test that `IS_SAVANT_FREE` guards correctly hide/show components
- Test filtered slash commands list
- Test filtered command registry
- Test help banner content

### Integration Tests

- Build a Savant-Free binary and verify:
  - Title says "Savant-Free"
  - No mode toggle visible
  - `/subscribe`, `/usage` commands not found
  - Help menu has no Credits section
  - Ads always show

### E2E (tmux)

- Use `savant-code-local-cli` agent with `SAVANT_FREE_MODE=true` to verify visual output

---

## 14. Implementation Phases

### Phase 1: Core Flag & Branding

1. Add `IS_SAVANT_FREE` constant
2. Update `build-binary.ts` to pass through `SAVANT_FREE_MODE`
3. Conditional branding (title, logo, app header, CLI name)

### Phase 2: Feature Stripping

4. Filter slash commands and command registry
5. Hide agent mode toggle
6. Suppress credits/subscription UI components
7. Disable usage monitor hook
8. Simplify help banner

### Phase 3: Ads & Cleanup

9. Always-on ads behavior
10. Disable unreachable input modes
11. Hide `BuildModeButtons` and `ModeDivider` components

### Phase 4: Build & Release Infrastructure

11. Create `savant-free/cli/release/` package files
12. Create `savant-free/cli/build.ts` script
13. Create `.github/workflows/savant-free-release.yml`

### Phase 5: Testing

14. Add unit tests for IS_SAVANT_FREE guards
15. Add integration/E2E tests
16. Manual QA of built binary
