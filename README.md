# Savant-Code & Savant-Free

English | [ç®€ä½“ä¸­æ–‡](./README.zh-CN.md)

**[Savant-Code](https://savant-code.dev)** is an open-source AI coding assistant that edits your codebase through natural language instructions. **[Savant-Free](https://www.npmjs.com/package/savant-free)** is the free, ad-supported version â€” no subscription, no credits, no configuration.

Instead of using one model for everything, Savant-Code coordinates specialized agents that work together to understand your project and make precise changes.

<div align="center">
  <img src="./assets/savant-code-vs-claude-code.png" alt="Savant-Code vs Claude Code" width="400">
</div>

Savant-Code beats Claude Code at 61% vs 53% on [our evals](evals/README.md) across 175+ coding tasks over multiple open-source repos that simulate real-world tasks.


## How it works

When you ask Savant-Code to "add authentication to my API," it might invoke:

1. A **File Picker Agent** to scan your codebase to understand the architecture and find relevant files
2. A **Planner Agent** to plan which files need changes and in what order
3. An **Editor Agent** to make precise edits
4. A **Reviewer Agent** to validate changes

<div align="center">
  <img src="./assets/multi-agents.png" alt="Savant-Code Multi-Agents" width="250">
</div>

This multi-agent approach gives you better context understanding, more accurate edits, and fewer errors compared to single-model tools.

## CLI: Install and start coding

Install:

```bash
npm install -g savant-code
```

Run:

```bash
cd your-project
savant-code
```

Then just tell Savant-Code what you want and it handles the rest:

- "Fix the SQL injection vulnerability in user registration"
- "Add rate limiting to all API endpoints"
- "Refactor the database connection code for better performance"

Savant-Code will find the right files, makes changes across your codebase, and runs tests to make sure nothing breaks.

## Create custom agents

To get started building your own agents, start Savant-Code and run the `/init` command:

```bash
savant-code
```

Then inside the CLI:

```
/init
```

This creates:
```
knowledge.md               # Project context for Savant-Code
.agents/
â””â”€â”€ types/                 # TypeScript type definitions
    â”œâ”€â”€ agent-definition.ts
    â”œâ”€â”€ tools.ts
    â””â”€â”€ util-types.ts
```

You can write agent definition files that give you maximum control over agent behavior.

Implement your workflows by specifying tools, which agents can be spawned, and prompts. We even have TypeScript generators for more programmatic control.

For example, here's a `git-committer` agent that creates git commits based on the current git state. Notice that it runs `git diff` and `git log` to analyze changes, but then hands control over to the LLM to craft a meaningful commit message and perform the actual commit.

```typescript
export default {
  id: 'git-committer',
  displayName: 'Git Committer',
  model: 'openai/gpt-5-nano',
  toolNames: ['read_files', 'run_terminal_command', 'end_turn'],

  instructionsPrompt:
    'You create meaningful git commits by analyzing changes, reading relevant files for context, and crafting clear commit messages that explain the "why" behind changes.',

  async *handleSteps() {
    // Analyze what changed
    yield { tool: 'run_terminal_command', command: 'git diff' }
    yield { tool: 'run_terminal_command', command: 'git log --oneline -5' }

    // Stage files and create commit with good message
    yield 'STEP_ALL'
  },
}
```

## SDK: Run agents in production

Install the [SDK package](https://www.npmjs.com/package/@savant-code/sdk) -- note this is different than the CLI savant-code package.

```bash
npm install @savant-code/sdk
```

Import the client and run agents!

```typescript
import { SavantClient } from '@savant-code/sdk'

// 1. Initialize the client
const client = new SavantClient({
  apiKey: 'your-api-key',
  cwd: '/path/to/your/project',
  onError: (error) => console.error('Savant-Code error:', error.message),
})

// 2. Do a coding task...
const result = await client.run({
  agent: 'base', // Savant-Code's base coding agent
  prompt: 'Add error handling to all API endpoints',
  handleEvent: (event) => {
    console.log('Progress', event)
  },
})

// 3. Or, run a custom agent!
const myCustomAgent: AgentDefinition = {
  id: 'greeter',
  displayName: 'Greeter',
  model: 'openai/gpt-5.1',
  instructionsPrompt: 'Say hello!',
}
await client.run({
  agent: 'greeter',
  agentDefinitions: [myCustomAgent],
  prompt: 'My name is Bob.',
  customToolDefinitions: [], // Add custom tools too!
  handleEvent: (event) => {
    console.log('Progress', event)
  },
})
```

Learn more about the SDK [here](https://www.npmjs.com/package/@savant-code/sdk).

## Savant-Free: The free coding agent

Don't want a subscription? **[Savant-Free](https://www.npmjs.com/package/savant-free)** is a free variant of Savant-Code â€” no subscription, no credits, no configuration. Just install and start coding.

```bash
npm install -g savant-free
cd your-project
savant-free
```

Savant-Free is ad-supported and uses models optimized for fast, high-quality assistance. It includes built-in web research, browser use, and more. Learn more in the [Savant-Free README](./savant-free/README.md).

## Why choose Savant-Code

**Custom workflows**: TypeScript generators let you mix AI generation with programmatic control. Agents can spawn subagents, branch on conditions, and run multi-step processes.

**Any model on OpenRouter**: Unlike Claude Code which locks you into Anthropic's models, Savant-Code supports any model available on [OpenRouter](https://openrouter.ai/models) - from Claude and GPT to specialized models like Qwen, DeepSeek, and others. Switch models for different tasks or use the latest releases without waiting for platform updates.

**Reuse any published agent**: Compose existing [published agents](https://www.savant-code.dev/store) to get a leg up. Savant-Code agents are the new MCP!

**SDK**: Build Savant-Code into your applications. Create custom tools, integrate with CI/CD, or embed coding assistance into your products.

## Advanced Usage

### Custom Agent Workflows

Create your own agents with specialized workflows using the `/init` command:

```bash
savant-code
/init
```

This creates a custom agent structure in `.agents/` that you can customize.

## Contributing to Savant-Code

We â¤ï¸ contributions from the community - whether you're fixing bugs, tweaking our agents, or improving documentation.

**Want to contribute?** Check out our [Contributing Guide](./CONTRIBUTING.md) to get started.

### Running Tests

To run the test suite:

```bash
cd cli
bun test
```

**For interactive E2E testing**, install tmux:

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt-get install tmux

# Windows (via WSL)
wsl --install
sudo apt-get install tmux
```

See [cli/src/__tests__/README.md](cli/src/__tests__/README.md) for comprehensive testing documentation.

Some ways you can help:

- ðŸ› **Fix bugs** or add features
- ðŸ¤– **Create specialized agents** and publish them to the Agent Store
- ðŸ“š **Improve documentation** or write tutorials
- ðŸ’¡ **Share ideas** in our [GitHub Issues](https://github.com/savant-code/savant-code/issues)

## Get started

### Install

**CLI**: `npm install -g savant-code`

**SDK**: `npm install @savant-code/sdk`

**Savant-Free (free)**: `npm install -g savant-free`

### Resources

**Documentation**: [savant-code.dev/docs](https://savant-code.dev/docs)

**Community**: [Discord](https://savant-code.dev/discord)

**Issues & Ideas**: [GitHub Issues](https://github.com/savant-code/savant-code/issues)

**Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md) - Start here to contribute!

**Support**: [support@savant-code.dev](mailto:support@savant-code.dev)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=savant-code/savant-code&type=Date)](https://www.star-history.com/#savant-code/savant-code&Date)
