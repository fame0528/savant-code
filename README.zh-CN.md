# Savant-Code & Savant-Free

[English](./README.md) | ç®€ä½“ä¸­æ–‡

**[Savant-Code](https://savant-code.dev)** æ˜¯ä¸€æ¬¾å¼€æºçš„ AI ç¼–ç¨‹åŠ©æ‰‹ï¼Œèƒ½æ ¹æ®è‡ªç„¶è¯­è¨€æŒ‡ä»¤ç›´æŽ¥ä¿®æ”¹ä½ çš„ä»£ç åº“ã€‚**[Savant-Free](https://www.npmjs.com/package/savant-free)** æ˜¯å®ƒçš„å…è´¹ã€å¹¿å‘Šæ”¯æŒç‰ˆæœ¬â€”â€”æ— éœ€è®¢é˜…ã€æ— éœ€ç§¯åˆ†ã€é›¶é…ç½®ã€‚

ä¸Žé‚£ç§"ä¸€ä¸ªæ¨¡åž‹å¹²æ‰€æœ‰äº‹"çš„å·¥å…·ä¸åŒï¼ŒSavant-Code ä¼šåè°ƒå¤šä¸ªä¸“ä¸šåŒ–çš„æ™ºèƒ½ä½“ï¼ˆagentï¼‰ååŒå·¥ä½œï¼Œç†è§£ä½ çš„é¡¹ç›®å¹¶åšå‡ºç²¾å‡†çš„æ”¹åŠ¨ã€‚

<div align="center">
  <img src="./assets/savant-code-vs-claude-code.png" alt="Savant-Code vs Claude Code" width="400">
</div>

åœ¨æˆ‘ä»¬çš„[è¯„æµ‹](evals/README.md)ä¸­ï¼ŒSavant-Code åœ¨ 175+ ä¸ªçœŸå®žå¼€æºä»“åº“çš„ç¼–ç ä»»åŠ¡ä¸Šä»¥ 61% å¯¹ 53% çš„æˆç»©é¢†å…ˆ Claude Codeã€‚


## å·¥ä½œåŽŸç†

å½“ä½ è®© Savant-Code "ç»™æˆ‘çš„ API åŠ ä¸Šèº«ä»½éªŒè¯"æ—¶ï¼Œå®ƒå¯èƒ½ä¼šè°ƒç”¨ï¼š

1. **File Picker Agent** â€”â€” æ‰«æä»£ç åº“ã€ç†è§£æž¶æž„ã€æ‰¾å‡ºç›¸å…³æ–‡ä»¶
2. **Planner Agent** â€”â€” è§„åˆ’å“ªäº›æ–‡ä»¶éœ€è¦æ”¹ã€æŒ‰ä»€ä¹ˆé¡ºåºæ”¹
3. **Editor Agent** â€”â€” æ‰§è¡Œç²¾ç¡®çš„ä¿®æ”¹
4. **Reviewer Agent** â€”â€” æ ¡éªŒæ”¹åŠ¨æ˜¯å¦æ­£ç¡®

<div align="center">
  <img src="./assets/multi-agents.png" alt="Savant-Code Multi-Agents" width="250">
</div>

ç›¸æ¯”å•æ¨¡åž‹å·¥å…·ï¼Œè¿™ç§å¤šæ™ºèƒ½ä½“æ–¹æ¡ˆèƒ½å¸¦æ¥æ›´å‡†çš„ä¸Šä¸‹æ–‡ç†è§£ã€æ›´ç²¾ç¡®çš„ä¿®æ”¹ï¼Œä»¥åŠæ›´å°‘çš„é”™è¯¯ã€‚

## CLIï¼šè£…å¥½å°±èƒ½å†™ä»£ç 

å®‰è£…ï¼š

```bash
npm install -g savant-code
```

è¿è¡Œï¼š

```bash
cd your-project
savant-code
```

ç„¶åŽç›´æŽ¥å‘Šè¯‰ Savant-Code ä½ æƒ³åšä»€ä¹ˆï¼Œå‰©ä¸‹çš„å®ƒè‡ªå·±æžå®šï¼š

- "ä¿®æŽ‰ç”¨æˆ·æ³¨å†Œé‡Œçš„ SQL æ³¨å…¥æ¼æ´ž"
- "ç»™æ‰€æœ‰ API ç«¯ç‚¹åŠ ä¸Šé™æµ"
- "é‡æž„æ•°æ®åº“è¿žæŽ¥ä»£ç ï¼Œæå‡æ€§èƒ½"

Savant-Code ä¼šæ‰¾åˆ°å¯¹åº”çš„æ–‡ä»¶ï¼Œè·¨å¤šä¸ªæ–‡ä»¶åšæ”¹åŠ¨ï¼Œå¹¶è·‘æµ‹è¯•ç¡®è®¤æ²¡æœ‰ç ´åçŽ°æœ‰åŠŸèƒ½ã€‚

## åˆ›å»ºè‡ªå®šä¹‰æ™ºèƒ½ä½“

è¦å¼€å§‹æž„å»ºè‡ªå·±çš„æ™ºèƒ½ä½“ï¼Œå…ˆå¯åŠ¨ Savant-Code ç„¶åŽæ‰§è¡Œ `/init`ï¼š

```bash
savant-code
```

è¿›å…¥ CLI åŽï¼š

```
/init
```

è¿™ä¼šç”Ÿæˆï¼š
```
knowledge.md               # Savant-Code ç”¨çš„é¡¹ç›®ä¸Šä¸‹æ–‡
.agents/
â””â”€â”€ types/                 # TypeScript ç±»åž‹å®šä¹‰
    â”œâ”€â”€ agent-definition.ts
    â”œâ”€â”€ tools.ts
    â””â”€â”€ util-types.ts
```

é€šè¿‡ç¼–å†™æ™ºèƒ½ä½“å®šä¹‰æ–‡ä»¶ï¼Œä½ å¯ä»¥æœ€å¤§ç¨‹åº¦åœ°æŽ§åˆ¶æ™ºèƒ½ä½“çš„è¡Œä¸ºã€‚

é€šè¿‡æŒ‡å®šå·¥å…·ã€å¯æ´¾ç”Ÿçš„å­æ™ºèƒ½ä½“å’Œæç¤ºè¯æ¥å®žçŽ°è‡ªå·±çš„å·¥ä½œæµã€‚æˆ‘ä»¬è¿˜æä¾›äº† TypeScript ç”Ÿæˆå™¨ï¼Œæ–¹ä¾¿ä½ ä»¥æ›´ç¨‹åºåŒ–çš„æ–¹å¼æŽ§åˆ¶æµç¨‹ã€‚

ä¸‹é¢æ˜¯ä¸€ä¸ª `git-committer` æ™ºèƒ½ä½“çš„ä¾‹å­ï¼Œå®ƒä¼šåŸºäºŽå½“å‰çš„ git çŠ¶æ€ç”Ÿæˆæäº¤ã€‚æ³¨æ„å®ƒå…ˆè·‘ `git diff` å’Œ `git log` åˆ†æžæ”¹åŠ¨ï¼Œç„¶åŽå†æŠŠå†³ç­–æƒäº¤ç»™ LLMï¼Œè®©å®ƒæ’°å†™æœ‰æ„ä¹‰çš„ commit message å¹¶å®Œæˆå®žé™…æäº¤ã€‚

```typescript
export default {
  id: 'git-committer',
  displayName: 'Git Committer',
  model: 'openai/gpt-5-nano',
  toolNames: ['read_files', 'run_terminal_command', 'end_turn'],

  instructionsPrompt:
    'You create meaningful git commits by analyzing changes, reading relevant files for context, and crafting clear commit messages that explain the "why" behind changes.',

  async *handleSteps() {
    // åˆ†æžæ”¹åŠ¨
    yield { tool: 'run_terminal_command', command: 'git diff' }
    yield { tool: 'run_terminal_command', command: 'git log --oneline -5' }

    // æš‚å­˜æ–‡ä»¶ï¼Œå¹¶ç”¨åˆé€‚çš„ message ç”Ÿæˆæäº¤
    yield 'STEP_ALL'
  },
}
```

## SDKï¼šåœ¨ç”Ÿäº§çŽ¯å¢ƒé‡Œè·‘æ™ºèƒ½ä½“

å®‰è£… [SDK åŒ…](https://www.npmjs.com/package/@savant-code/sdk)â€”â€”æ³¨æ„è¿™è·Ÿ CLI ç”¨çš„ savant-code åŒ…æ˜¯ä¸¤ä¸ªä¸åŒçš„åŒ…ã€‚

```bash
npm install @savant-code/sdk
```

å¼•å…¥ clientï¼Œå¼€å§‹è·‘æ™ºèƒ½ä½“ï¼š

```typescript
import { SavantClient } from '@savant-code/sdk'

// 1. åˆå§‹åŒ– client
const client = new SavantClient({
  apiKey: 'your-api-key',
  cwd: '/path/to/your/project',
  onError: (error) => console.error('Savant-Code error:', error.message),
})

// 2. è·‘ä¸€ä¸ªç¼–ç ä»»åŠ¡â€¦â€¦
const result = await client.run({
  agent: 'base', // Savant-Code é»˜è®¤çš„åŸºç¡€ç¼–ç æ™ºèƒ½ä½“
  prompt: 'Add error handling to all API endpoints',
  handleEvent: (event) => {
    console.log('Progress', event)
  },
})

// 3. ä¹Ÿå¯ä»¥è·‘è‡ªå®šä¹‰æ™ºèƒ½ä½“ï¼
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
  customToolDefinitions: [], // ä¹Ÿå¯ä»¥åŠ è‡ªå®šä¹‰å·¥å…·ï¼
  handleEvent: (event) => {
    console.log('Progress', event)
  },
})
```

æ›´å¤š SDK ç”¨æ³•è¯·çœ‹[è¿™é‡Œ](https://www.npmjs.com/package/@savant-code/sdk)ã€‚

## Savant-Freeï¼šå…è´¹çš„ç¼–ç¨‹æ™ºèƒ½ä½“

ä¸æƒ³è®¢é˜…ï¼Ÿ**[Savant-Free](https://www.npmjs.com/package/savant-free)** æ˜¯ Savant-Code çš„å…è´¹ç‰ˆæœ¬â€”â€”æ— éœ€è®¢é˜…ã€æ— éœ€ç§¯åˆ†ã€é›¶é…ç½®ï¼Œè£…ä¸Šå°±èƒ½ç”¨ã€‚

```bash
npm install -g savant-free
cd your-project
savant-free
```

Savant-Free ç”±å¹¿å‘Šæ”¯æŒï¼Œä½¿ç”¨ç»è¿‡ä¼˜åŒ–ã€å…¼é¡¾é€Ÿåº¦ä¸Žè´¨é‡çš„æ¨¡åž‹ã€‚å†…ç½®ç½‘é¡µæ£€ç´¢ã€æµè§ˆå™¨ä½¿ç”¨ç­‰èƒ½åŠ›ã€‚è¯¦æƒ…è§ [Savant-Free README](./savant-free/README.md)ã€‚

## ä¸ºä»€ä¹ˆé€‰ Savant-Code

**è‡ªå®šä¹‰å·¥ä½œæµ**ï¼šç”¨ TypeScript ç”Ÿæˆå™¨æŠŠ AI ç”Ÿæˆå’Œç¨‹åºåŒ–æŽ§åˆ¶æ··ç€ç”¨ã€‚æ™ºèƒ½ä½“å¯ä»¥æ´¾ç”Ÿå­æ™ºèƒ½ä½“ã€æŒ‰æ¡ä»¶åˆ†æ”¯ã€è·‘å¤šæ­¥æµç¨‹ã€‚

**OpenRouter ä¸Šçš„ä»»ä½•æ¨¡åž‹**ï¼šClaude Code æŠŠä½ é”æ­»åœ¨ Anthropic çš„æ¨¡åž‹ä¸Šï¼ŒSavant-Code ä¸ä¸€æ ·â€”â€”å®ƒæ”¯æŒ [OpenRouter](https://openrouter.ai/models) ä¸Šçš„æ‰€æœ‰æ¨¡åž‹ï¼Œä»Ž Claudeã€GPT åˆ° Qwenã€DeepSeek è¿™ç±»ä¸“ç”¨æ¨¡åž‹éƒ½è¡Œã€‚å¯ä»¥æŒ‰ä»»åŠ¡åˆ‡æ¢æ¨¡åž‹ï¼Œä¹Ÿèƒ½éšæ—¶ç”¨ä¸Šæœ€æ–°å‘å¸ƒçš„æ¨¡åž‹ï¼Œä¸å¿…ç­‰å¹³å°è·Ÿè¿›ã€‚

**å¤ç”¨å·²å‘å¸ƒçš„æ™ºèƒ½ä½“**ï¼šæŠŠç¤¾åŒº[å·²å‘å¸ƒçš„æ™ºèƒ½ä½“](https://www.savant-code.dev/store)æ‹¼èµ·æ¥ç”¨ï¼Œå°‘èµ°å¼¯è·¯ã€‚Savant-Code æ™ºèƒ½ä½“å°±æ˜¯æ–°ä¸€ä»£çš„ MCPï¼

**SDK**ï¼šæŠŠ Savant-Code åµŒè¿›ä½ è‡ªå·±çš„åº”ç”¨é‡Œã€‚å¯ä»¥åˆ›å»ºè‡ªå®šä¹‰å·¥å…·ã€å¯¹æŽ¥ CI/CDï¼Œæˆ–æŠŠç¼–ç èƒ½åŠ›å†…åµŒè¿›ä½ çš„äº§å“ã€‚

## è¿›é˜¶ç”¨æ³•

### è‡ªå®šä¹‰æ™ºèƒ½ä½“å·¥ä½œæµ

ç”¨ `/init` å‘½ä»¤åˆ›å»ºå¸¦ä¸“é—¨å·¥ä½œæµçš„æ™ºèƒ½ä½“ï¼š

```bash
savant-code
/init
```

è¿™ä¼šåœ¨ `.agents/` ä¸‹ç”Ÿæˆä¸€å¥—å¯è‡ªå®šä¹‰çš„æ™ºèƒ½ä½“ç»“æž„ã€‚

## å‚ä¸Žè´¡çŒ®

æˆ‘ä»¬ â¤ï¸ æ¥è‡ªç¤¾åŒºçš„è´¡çŒ®â€”â€”æ— è®ºæ˜¯ä¿® bugã€è°ƒæ•´æ™ºèƒ½ä½“ã€è¿˜æ˜¯æ”¹è¿›æ–‡æ¡£ã€‚

**æƒ³å‚ä¸Žï¼Ÿ** çœ‹ä¸€çœ¼[è´¡çŒ®æŒ‡å—](./CONTRIBUTING.md) å°±èƒ½ä¸Šæ‰‹ã€‚

### è¿è¡Œæµ‹è¯•

è·‘æµ‹è¯•å¥—ä»¶ï¼š

```bash
cd cli
bun test
```

**äº¤äº’å¼ç«¯åˆ°ç«¯æµ‹è¯•**éœ€è¦ tmuxï¼š

```bash
# macOS
brew install tmux

# Ubuntu/Debian
sudo apt-get install tmux

# Windowsï¼ˆé€šè¿‡ WSLï¼‰
wsl --install
sudo apt-get install tmux
```

æ›´å®Œæ•´çš„æµ‹è¯•æ–‡æ¡£è§ [cli/src/__tests__/README.md](cli/src/__tests__/README.md)ã€‚

å¯ä»¥å¸®å¿™çš„æ–¹å‘ï¼š

- ðŸ› **ä¿® bug** æˆ–æ–°å¢žåŠŸèƒ½
- ðŸ¤– **æ‰“é€ ä¸“ç”¨æ™ºèƒ½ä½“**å¹¶å‘å¸ƒåˆ° Agent Store
- ðŸ“š **å®Œå–„æ–‡æ¡£**æˆ–æ’°å†™æ•™ç¨‹
- ðŸ’¡ **åˆ†äº«æƒ³æ³•**ï¼šåœ¨ [GitHub Issues](https://github.com/savant-code/savant-code/issues) ç•™è¨€

## å¼€å§‹ä½¿ç”¨

### å®‰è£…

**CLI**ï¼š`npm install -g savant-code`

**SDK**ï¼š`npm install @savant-code/sdk`

**Savant-Freeï¼ˆå…è´¹ç‰ˆï¼‰**ï¼š`npm install -g savant-free`

### èµ„æº

**æ–‡æ¡£**ï¼š[savant-code.dev/docs](https://savant-code.dev/docs)

**ç¤¾åŒº**ï¼š[Discord](https://savant-code.dev/discord)

**Issue ä¸Žæƒ³æ³•**ï¼š[GitHub Issues](https://github.com/savant-code/savant-code/issues)

**è´¡çŒ®æŒ‡å—**ï¼š[CONTRIBUTING.md](./CONTRIBUTING.md) â€”â€”æƒ³è´¡çŒ®ä»Žè¿™é‡Œå¼€å§‹ï¼

**æ”¯æŒ**ï¼š[support@savant-code.dev](mailto:support@savant-code.dev)

## Star åŽ†å²

[![Star History Chart](https://api.star-history.com/svg?repos=savant-code/savant-code&type=Date)](https://www.star-history.com/#savant-code/savant-code&Date)
