# Savant-Free

**The free coding agent.** No subscription. No configuration. Start in seconds.

An AI coding agent that runs in your terminal â€” describe what you want, and Savant-Free edits your code.

## Install

```bash
npm install -g savant-free
```

## Usage

```bash
cd ~/my-project
savant-free
```

## Why Savant-Free?

**Simple** â€” No modes. No config. Just works.

**Fast** â€” 5â€“10Ã— speed up. Faster models plus context gathering in seconds rather than minutes.

**Loaded** â€” Built-in web research, browser use, and more.

**Connect ChatGPT** â€” Link your ChatGPT subscription for planning and review.

## Features

- **File mentions** â€” Use `@filename` to reference specific files
- **Agent mentions** â€” Use `@AgentName` to invoke specialized agents
- **Bash mode** â€” Run terminal commands with `!command` or `/bash`
- **Chat history** â€” Resume past conversations with `/history`
- **Knowledge files** â€” Add `knowledge.md` to your project for context
- **Themes** â€” Toggle light/dark mode with `/theme:toggle`

## Commands

| Command         | Description                      |
| --------------- | -------------------------------- |
| `/help`         | Show keyboard shortcuts and tips |
| `/new`          | Start a new conversation         |
| `/history`      | Browse past conversations        |
| `/bash`         | Enter bash mode                  |
| `/init`         | Create a starter knowledge.md    |
| `/feedback`     | Share feedback                   |
| `/theme:toggle` | Toggle light/dark mode           |
| `/logout`       | Sign out                         |
| `/exit`         | Quit                             |

## FAQ

**How can it be free?** Savant-Free is supported by ads shown in the CLI.

**What models do you use?** DeepSeek V4 Pro (smartest, but its API collects data for training) or DeepSeek V4 Flash as the main coding agent. Gemini 3.1 Flash Lite handles file finding and research, and GPT-5.4 handles deep thinking if you connect your ChatGPT subscription.

**Are you training on my data?** No. We only use model providers that do not train on our requests. Your code stays yours.

**Which countries is Savant-Free available in?** Savant-Free is currently available in select countries. See [savant-free.com](https://savant-free.com) for the full list.

**What data do you store?** We don't store your codebase. We only collect minimal logs for debugging purposes.

## How It Works

Savant-Free connects to a cloud backend and uses models optimized for fast, high-quality assistance. Ads are shown to support the free tier.

## Project Structure

```
savant-free/
â”œâ”€â”€ cli/       # CLI build & npm release files
â””â”€â”€ web/       # Savant-Free website
```

## Building from Source

```bash
# From the repo root
bun savant-free/cli/build.ts 1.0.0
```

## Links

- [Documentation](https://savant-code.dev/docs)
- [GitHub](https://github.com/savant-code/savant-code)
- [Website](https://savant-code.dev)

## License

MIT
