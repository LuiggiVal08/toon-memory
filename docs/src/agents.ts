import opencode from './assets/agents/opencode.svg';
import vscode from './assets/agents/vscode.svg';
import claude from './assets/agents/claude.svg';
import cursor from './assets/agents/cursor.svg';
import windsurf from './assets/agents/windsurf.svg';
import cline from './assets/agents/cline.svg';
import continueSvg from './assets/agents/continue.svg';
import codex from './assets/agents/codex.svg';
import gemini from './assets/agents/gemini.svg';
import zed from './assets/agents/zed.svg';
import antigravity from './assets/agents/antigravity.svg';
import aider from './assets/agents/aider.svg';
import kilocode from './assets/agents/kilocode.svg';
import openclaw from './assets/agents/openclaw.svg';
import kiro from './assets/agents/kiro.svg';
import qwen from './assets/agents/qwen.svg';
import kimi from './assets/agents/kimi.svg';
import goose from './assets/agents/goose.svg';
import junie from './assets/agents/junie.svg';
import amp from './assets/agents/amp.svg';
import grok from './assets/agents/grok.svg';
import trae from './assets/agents/trae.svg';

export interface AgentEntry {
  name: string;
  key: string;
  logo: { src: string; width: number; height: number };
}

export const AGENTS: AgentEntry[] = [
  { name: 'OpenCode', key: 'opencode', logo: opencode },
  { name: 'VS Code / Copilot', key: 'vscode', logo: vscode },
  { name: 'Claude', key: 'claude', logo: claude },
  { name: 'Cursor', key: 'cursor', logo: cursor },
  { name: 'Windsurf', key: 'windsurf', logo: windsurf },
  { name: 'Cline', key: 'cline', logo: cline },
  { name: 'Continue', key: 'continue', logo: continueSvg },
  { name: 'Codex', key: 'codex', logo: codex },
  { name: 'Gemini', key: 'gemini', logo: gemini },
  { name: 'Zed', key: 'zed', logo: zed },
  { name: 'Antigravity', key: 'antigravity', logo: antigravity },
  { name: 'Aider', key: 'aider', logo: aider },
  { name: 'KiloCode', key: 'kilocode', logo: kilocode },
  { name: 'OpenClaw', key: 'openclaw', logo: openclaw },
  { name: 'Kiro', key: 'kiro', logo: kiro },
  { name: 'Qwen', key: 'qwen', logo: qwen },
  { name: 'Kimi', key: 'kimi', logo: kimi },
  { name: 'Goose', key: 'goose', logo: goose },
  { name: 'Junie', key: 'junie', logo: junie },
  { name: 'Amp', key: 'amp', logo: amp },
  { name: 'Grok', key: 'grok', logo: grok },
  { name: 'Trae', key: 'trae', logo: trae },
];
