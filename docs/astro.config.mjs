// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://luiggival08.github.io',
	base: '/toon-memory',
	integrations: [
		sitemap(),
		starlight({
			title: 'toon-memory — The Continuity Layer for AI Agents',
			description: 'The Continuity Layer for AI Agents: AI agents shouldn\'t have to relearn your project every session. toon-memory preserves project knowledge, decisions, and conventions across sessions — offline, token-efficient, over MCP.',
			logo: {
				src: './src/assets/logo.svg',
				alt: 'toon-memory logo',
			},
			customCss: ['./src/styles/custom.css'],
			head: [
				{
					tag: 'script',
					attrs: { src: '/toon-memory/scripts/animations.js' },
				},
				{
					tag: 'meta',
					attrs: { name: 'keywords', content: 'AI memory, continuity layer, AI agents, persistent memory, AI coding agent memory, project knowledge, Model Context Protocol, Claude memory, Cursor memory, OpenCode memory, agent session continuity, token-efficient memory, BM25 recall, knowledge graph memory' },
				},
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/LuiggiVal08/toon-memory' },
				{ icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/toon-memory' },
			],
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
				zh: { label: '简体中文', lang: 'zh' },
				ja: { label: '日本語', lang: 'ja' },
				ko: { label: '한국어', lang: 'ko' },
				'pt-br': { label: 'Português (BR)', lang: 'pt-BR' },
				de: { label: 'Deutsch', lang: 'de' },
				fr: { label: 'Français', lang: 'fr' },
			},
			sidebar: [
				{
					label: 'Getting Started',
					translations: { es: 'Primeros pasos', zh: '快速开始', ja: 'はじめに', ko: '시작하기', 'pt-br': 'Primeiros passos', de: 'Erste Schritte', fr: 'Pour commencer' },
					items: [
						{ label: 'Quick Start', translations: { es: 'Inicio rápido', zh: '快速入门', ja: 'クイックスタート', ko: '빠른 시작', 'pt-br': 'Início rápido', de: 'Schnellstart', fr: 'Démarrage rapide' }, slug: 'getting-started/quickstart' },
						{ label: 'Installation', translations: { es: 'Instalación', zh: '安装', ja: 'インストール', ko: '설치', 'pt-br': 'Instalação', de: 'Installation', fr: 'Installation' }, slug: 'getting-started/installation' },
					],
				},
				{
					label: 'Learn',
					translations: { es: 'Aprender', zh: '学习', ja: '学ぶ', ko: '배우기', 'pt-br': 'Aprender', de: 'Lernen', fr: 'Apprendre' },
					items: [
						{ label: 'What is MCP Memory?', translations: { es: 'Qué es MCP Memory?', zh: '什么是 MCP Memory？', ja: 'MCP Memoryとは？', ko: 'MCP Memory란?', 'pt-br': 'O que é MCP Memory?', de: 'Was ist MCP Memory?', fr: 'Qu\'est-ce que MCP Memory?' }, slug: 'learn/what-is-mcp-memory' },
						{ label: 'Memory for AI Agents', translations: { es: 'Memoria para agentes de IA', zh: 'AI 代理的记忆', ja: 'AIエージェントのメモリ', ko: 'AI 에이전트용 메모리', 'pt-br': 'Memória para agentes de IA', de: 'Speicher für KI-Agenten', fr: 'Mémoire pour agents IA' }, slug: 'learn/memory-for-ai-agents' },
						{ label: 'MCP Server for Persistent Memory', translations: { es: 'Servidor MCP para memoria persistente', zh: '持久化记忆的 MCP 服务器', ja: '永続メモリ用MCPサーバー', ko: '영구 메모리용 MCP 서버', 'pt-br': 'Servidor MCP para memória persistente', de: 'MCP-Server für persistenten Speicher', fr: 'Serveur MCP pour mémoire persistante' }, slug: 'learn/mcp-server-memory' },
						{ label: 'Token-Efficient Memory', translations: { es: 'Memoria eficiente en tokens', zh: '高效 Token 记忆', ja: 'トークン効率の高いメモリ', ko: '토큰 효율적인 메모리', 'pt-br': 'Memória eficiente em tokens', de: 'Token-effizienter Speicher', fr: 'Mémoire efficace en tokens' }, slug: 'learn/token-efficient-memory' },
						{ label: 'Remember Context Between Sessions', translations: { es: 'Recordar contexto entre sesiones', zh: '跨会话记忆上下文', ja: 'セッション間のコンテキストを記憶', ko: '세션 간 컨텍스트 기억', 'pt-br': 'Lembrar contexto entre sessões', de: 'Kontext zwischen Sitzungen merken', fr: 'Retenir le contexte entre les sessions' }, slug: 'learn/remember-context-between-sessions' },
						{ label: 'Memory for Claude, Cursor & OpenCode', translations: { es: 'Memoria para Claude, Cursor y OpenCode', zh: 'Claude、Cursor 和 OpenCode 的记忆', ja: 'Claude、Cursor、OpenCode用メモリ', ko: 'Claude, Cursor 및 OpenCode용 메모리', 'pt-br': 'Memória para Claude, Cursor e OpenCode', de: 'Speicher für Claude, Cursor & OpenCode', fr: 'Mémoire pour Claude, Cursor & OpenCode' }, slug: 'learn/memory-claude-code' },
					],
				},
				{
					label: 'Features',
					translations: { es: 'Características', zh: '功能', ja: '機能', ko: '기능', 'pt-br': 'Recursos', de: 'Funktionen', fr: 'Fonctionnalités' },
					items: [
						{ label: 'MCP Tools', translations: { es: 'Herramientas MCP', zh: 'MCP 工具', ja: 'MCPツール', ko: 'MCP 도구', 'pt-br': 'Ferramentas MCP', de: 'MCP-Tools', fr: 'Outils MCP' }, slug: 'features/tools' },
						{ label: 'CLI Commands', translations: { es: 'Comandos CLI', zh: 'CLI 命令', ja: 'CLIコマンド', ko: 'CLI 명령어', 'pt-br': 'Comandos CLI', de: 'CLI-Befehle', fr: 'Commandes CLI' }, slug: 'features/cli' },
						{ label: 'Encryption', translations: { es: 'Encriptación', zh: '加密', ja: '暗号化', ko: '암호화', 'pt-br': 'Criptografia', de: 'Verschlüsselung', fr: 'Chiffrement' }, slug: 'features/encryption' },
						{ label: 'Watch Mode', translations: { es: 'Modo watch', zh: '监视模式', ja: 'ウォッチモード', ko: '감시 모드', 'pt-br': 'Modo watch', de: 'Watch-Modus', fr: 'Mode surveillance' }, slug: 'features/watch' },
						{ label: 'Auto-Archive', translations: { es: 'Auto-archivado', zh: '自动归档', ja: '自動アーカイブ', ko: '자동 아카이브', 'pt-br': 'Arquivamento automático', de: 'Auto-Archivierung', fr: 'Archivage automatique' }, slug: 'features/archive' },
					],
				},
				{
					label: 'Configuration',
					translations: { es: 'Configuración', zh: '配置', ja: '設定', ko: '설정', 'pt-br': 'Configuração', de: 'Konfiguration', fr: 'Configuration' },
					items: [
						{ label: 'Supported Agents', translations: { es: 'Agentes compatibles', zh: '支持的代理', ja: '対応エージェント', ko: '지원 에이전트', 'pt-br': 'Agentes suportados', de: 'Unterstützte Agenten', fr: 'Agents supportés' }, slug: 'configuration/agents' },
						{ label: 'Manual Setup', translations: { es: 'Configuración manual', zh: '手动配置', ja: '手動セットアップ', ko: '수동 설정', 'pt-br': 'Configuração manual', de: 'Manuelle Einrichtung', fr: 'Configuration manuelle' }, slug: 'configuration/manual' },
					],
				},
				{
					label: 'Advanced',
					translations: { es: 'Avanzado', zh: '进阶', ja: '上級', ko: '고급', 'pt-br': 'Avançado', de: 'Fortgeschritten', fr: 'Avancé' },
					items: [
						{ label: 'TOON Format', translations: { es: 'Formato TOON', zh: 'TOON 格式', ja: 'TOONフォーマット', ko: 'TOON 형식', 'pt-br': 'Formato TOON', de: 'TOON-Format', fr: 'Format TOON' }, slug: 'advanced/toon' },
						{ label: 'File Structure', translations: { es: 'Estructura de archivos', zh: '文件结构', ja: 'ファイル構造', ko: '파일 구조', 'pt-br': 'Estrutura de arquivos', de: 'Dateistruktur', fr: 'Structure des fichiers' }, slug: 'advanced/files' },
					],
				},
				{
					label: 'Community',
					translations: { es: 'Comunidad', zh: '社区', ja: 'コミュニティ', ko: '커뮤니티', 'pt-br': 'Comunidade', de: 'Gemeinschaft', fr: 'Communauté' },
					items: [
						{ label: 'Contributing', translations: { es: 'Cómo contribuir', zh: '贡献', ja: 'コントリビュート', ko: '기여하기', 'pt-br': 'Contribuir', de: 'Beitragen', fr: 'Contribuer' }, slug: 'community/contributing' },
						{ label: 'Code of Conduct', translations: { es: 'Código de conducta', zh: '行为准则', ja: '行動規範', ko: '행동 강령', 'pt-br': 'Código de conduta', de: 'Verhaltenskodex', fr: 'Code de conduite' }, slug: 'community/code-of-conduct' },
						{ label: 'License', translations: { es: 'Licencia', zh: '许可证', ja: 'ライセンス', ko: '라이선스', 'pt-br': 'Licença', de: 'Lizenz', fr: 'Licence' }, slug: 'community/license' },
					],
				},
				{
					label: 'Blog',
					translations: { es: 'Blog', zh: '博客', ja: 'ブログ', ko: '블로그', 'pt-br': 'Blog', de: 'Blog', fr: 'Blog' },
					items: [
						{ label: 'How toon-memory Makes Your Agent Smarter', translations: { es: 'Cómo toon-memory hace tu agente más inteligente', zh: 'toon-memory 如何让你的代理更智能', ja: 'toon-memoryでエージェントを賢くする方法', ko: 'toon-memory가 에이전트를 더 똑똑하게 만드는 방법', 'pt-br': 'Como toon-memory torna seu agente mais inteligente', de: 'So macht toon-memory Ihren Agenten klüger', fr: 'Comment toon-memory rend votre agent plus intelligent' }, slug: 'blog' },
						{ slug: 'blog/mcp-memory-guide', label: 'MCP Memory Server: Complete Guide' },
						{ slug: 'blog/memory-solutions-compared', label: 'AI Memory Solutions Compared' },
						{ slug: 'blog/setup-persistent-memory', label: 'Setup Persistent Memory for Claude, Cursor & OpenCode' },
					],
				},
			],
		}),
	],
});
