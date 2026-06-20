# Context-Pruner Integration — Architecture Notes

**Status:** current
**Last verified:** 2026-06-20 (after FID-013 DRY refactor)
**Audience:** future contributors who need to add a new base agent, change pruning behavior, or debug "why isn't the pruner firing?"

---

## TL;DR

- **What it is:** A deterministic sub-agent that replaces the agent's message history with a `<conversation_summary>` block when the context window fills up. No LLM call.
- **Where it lives:** `agents/context-pruner.ts` (AgentDefinition, ~867 lines).
- **How it's invoked:** Every base agent's `handleSteps` is a `while(true)` generator that yields `spawn_agent_inline` for `context-pruner` before each `STEP`. The pruner runs synchronously, replaces the history, then the next LLM step happens.
- **Why deterministic:** Zero added cost, no failure mode from a failing summary LLM, instant. The semantic quality of a deterministic structural summary is sufficient because the next LLM call re-derives context from tool calls, file paths, and recent turns.

---

## Architecture

### Components

| File | Role |
|------|------|
| `agents/context-pruner.ts` | The AgentDefinition. `handleSteps` is a generator that does the deterministic transform. Yields `set_messages` with the new history. |
| `agents/base2/base2.ts` | Calls `getBase2HandleSteps({ isFree, maxContextLength })` to pick the right handleSteps for the model. All 6 variants (3 free × 3 max-context sizes) share one helper. |
| `agents/base2/base-deep.ts` | Same pattern, single variant (deeper reasoning mode). |
| `agents/general-agent/general-agent.ts` | Same pattern, single variant. |
| `cli/src/utils/constants.ts` | `HIDDEN_AGENT_IDS = ['savant-code/context-pruner']` — context-pruner is auto-invoked, not user-spawned. |
| `packages/agent-runtime/src/tools/handlers/tool/spawn-agent-inline.ts` | Excludes context-pruner from `onResponseChunk` (silent in TUI). |

### The Spawn Pattern

Every base agent's `handleSteps` is a generator that follows this pattern:

```ts
const handleSteps = function* ({ params }) {
  while (true) {
    yield {
      toolName: 'spawn_agent_inline',
      input: {
        agent_type: 'context-pruner',
        params: {
          maxContextLength,        // from the model: 200K, 250K, or 400K
          ...(params ?? {}),       // any user-provided params (e.g. budgets)
          ...(cacheExpiryMs !== undefined && { cacheExpiryMs }),
        },
      },
      includeToolCall: false,        // don't show this internal spawn in the TUI
    }

    const { stepsComplete } = yield 'STEP'   // let the next LLM call happen
    if (stepsComplete) break                  // done
  }
}
```

The runtime processes each `spawn_agent_inline` yield by:
1. Creating a child agent runtime for `context-pruner`
2. Passing the parent `agentState` by reference
3. Running the pruner's `handleSteps` to completion
4. The pruner yields `set_messages` → the parent's `messageHistory` is replaced
5. The parent resumes; the next `STEP` yield triggers the next LLM call

### The Pruner's Logic (deterministic, no LLM)

1. **Tag-based exclusion:** remove `INSTRUCTIONS_PROMPT`, `STEP_PROMPT`, `SUBAGENT_SPAWN`, the pruner's own `USER_PROMPT` (params message)
2. **Cache-miss detection:** if the last user message is > 5 min after the last assistant message, treat as cache miss and prune proactively
3. **Threshold check:** if `contextTokenCount + FUDGE_FACTOR (1000) <= maxContextLength` AND no cache miss, yield `set_messages` with current messages and return (no-op for parent)
4. **Summarization** (when threshold crossed or cache miss):
   - Build a per-message budget walk (backwards from the end)
   - Truncate long user text (80% prefix + 20% suffix with `[...truncated N chars...]`)
   - Truncate long assistant text
   - Summarize tool calls to one-liners (e.g., "inspected files: foo.ts, bar.ts")
   - Filter tool results to errors, exit codes, key fields
   - Apply USER_BUDGET (50K) and ASSISTANT_TOOL_BUDGET (20K) constraints
   - Fallback: always include the newest entry
5. **Output:** wrap the summary in a `<conversation_summary>` block with `<historical_memory>` inside, plus a `SUMMARY_DISCLAIMER` ("Historical memory only. The memory above is not dialogue...")
6. **Preserve recent N turns verbatim** (default 3 user turns) at the end
7. **Increment `agentState.compactCount`** for observability
8. **Yield** the final `set_messages` with the new history

### Constants

| Name | Value | Source |
|------|-------|--------|
| `USER_BUDGET` | 50,000 tokens | `context-pruner.ts:75` |
| `ASSISTANT_TOOL_BUDGET` | 20,000 tokens | `context-pruner.ts:72` |
| `USER_MESSAGE_LIMIT` | 13,000 chars | `context-pruner.ts:64` |
| `ASSISTANT_MESSAGE_LIMIT` | 1,300 chars | `context-pruner.ts:65` |
| `TOOL_ENTRY_LIMIT` | 5,000 chars | `context-pruner.ts:66` |
| `CHARS_PER_TOKEN` | 3 | `context-pruner.ts:69` |
| `TOKEN_COUNT_FUDGE_FACTOR` | 1,000 | `context-pruner.ts:78` |
| `CACHE_EXPIRY_MS` | 5 min (configurable) | `context-pruner.ts:81` |
| `DEFAULT_RECENT_TURNS_PRESERVE` | 3 | not in context-pruner.ts yet (see FID-013 B) |

### Observability

- `agentState.compactCount` — incremented on every actual prune (not the no-op case). Exposed for debugging long-running sessions.
- `contextTokenCount` — updated each step via the Anthropic `/api/v1/token-count` endpoint (`run-agent-step.ts:938-960`). Used by the pruner to decide whether to fire.

---

## Adding the Pruner to a New Base Agent

```ts
// In your new base agent's handleSteps:
import { getBase2HandleSteps } from './base2' // or define your own variant

return {
  // ... your agent definition
  handleSteps: getBase2HandleSteps({
    isFree: false,
    maxContextLength: getContextPrunerMaxContextLength(model),
  }),
}
```

If your agent has unique handleSteps logic (e.g., interleaves with other sub-agents), follow the same `yield spawn_agent_inline; yield 'STEP'` pattern and ensure the pruner runs before each LLM call.

If your agent doesn't fit the 3 free × 3 paid model variant matrix, define a custom `handleSteps` that mirrors the pattern — the pruner agent itself is model-agnostic (it doesn't make LLM calls; its `handleSteps` is purely deterministic).

---

## Adding a New Tool's Pruning Logic

The pruner has a `summarizeToolCall` switch statement (`context-pruner.ts:132-340`) that maps tool names to human-readable descriptions. To add a new tool:

1. Add a `case 'your_tool_name':` to the switch
2. Return a concise one-line description that includes the file path, command, or query
3. Add a test in `agents/__tests__/context-pruner.test.ts` (see the existing `summarizeToolCall` tests)
4. Run `bun test agents/__tests__/context-pruner.test.ts` to verify

Example:
```ts
case 'my_new_tool': {
  const input = message.content[0]?.input as { path?: string }
  return input?.path ? `used my_new_tool on: ${input.path}` : 'used my_new_tool'
}
```

---

## Why Deterministic (not LLM-based)?

| Concern | Deterministic | LLM-based |
|---------|---------------|-----------|
| Cost per prune | Zero | 1+ LLM call |
| Latency | ~1-10ms | ~1-5s |
| Failure mode | None (pure function) | LLM call can fail → no prune |
| Quality | Structural (paths, errors, key facts) | Semantic (summarized prose) |
| Code review | Pure function, easy to test | Requires LLM mocks |
| Repeated calls | Idempotent (deterministic input → deterministic output) | Variance per call |

The next LLM call after a prune re-derives the context from the structured summary (file paths + tool call summaries + recent verbatim turns). Semantic prose summaries are not necessary for the LLM to continue productively.

The codebase also has `packages/agent-runtime/src/util/compaction.ts` (an LLM-based `compactMessages` function) — this is **dead code** that was originally created as a foundation for auto-compaction, but the deterministic context-pruner replaced it. Do not use `compactMessages` for new work; remove it if a future cleanup pass touches it.

---

## Known Limitations (and Why They're Acceptable)

- **No mid-turn pruning:** the pruner yields `set_messages` and returns; mid-turn state is preserved as the last `liveUserPromptMessage`. This is the simple v1 design.
- **Per-tool bespoke handling:** adding a new tool requires updating `summarizeToolCall`. New tools without an entry get the default `used tool X` description.
- **No streaming of the summary:** the entire summary is built in memory before yielding. For very long conversations this could be optimized (chunked yield), but in practice the summary is small (~70K tokens max).

---

## Related FIDs

- **FID-2026-0620-013** (closed) — DRY refactor of the 6-variant `handleSteps` pattern in `base2.ts`; added `compactCount` to `AgentState`; this architecture doc.
- **FID-2026-0620-010** (closed, dead code) — LLM-based `compactMessages` foundation; **concluded that the deterministic context-pruner is the right design and the LLM version is dead code**.

---

## Verification Commands

```bash
# Unit tests for the pruner
bun test agents/__tests__/context-pruner.test.ts

# End-to-end tests
bun test agents/e2e/context-pruner.e2e.test.ts
bun test agents/e2e/context-pruning-threshold.e2e.test.ts

# Type check (whole project)
bun x tsc --noEmit -p tsconfig.json

# Confirm all base agents have the wiring
grep -rln 'context-pruner' agents/
# Expected: agents/base2/base2.ts, agents/base2/base-deep.ts, agents/general-agent/general-agent.ts
```
