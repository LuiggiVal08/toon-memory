// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://luiggival08.github.io',
	base: '/toon-memory',
	integrations: [
		starlight({
			title: 'toon-memory',
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
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/LuiggiVal08/toon-memory' },
				{ icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/toon-memory' },
			],
			sidebar: [
		{
				label: 'Getting Started',
				items: [
					{ label: 'Quick Start', slug: 'getting-started/quickstart' },
					{ label: 'Installation', slug: 'getting-started/installation' },
				],
			},
				{
					label: 'Features',
					items: [
						{ label: 'MCP Tools', slug: 'features/tools' },
						{ label: 'CLI Commands', slug: 'features/cli' },
						{ label: 'Encryption', slug: 'features/encryption' },
						{ label: 'Watch Mode', slug: 'features/watch' },
						{ label: 'Auto-Archive', slug: 'features/archive' },
					],
				},
				{
					label: 'Configuration',
					items: [
						{ label: 'Supported Agents', slug: 'configuration/agents' },
						{ label: 'Manual Setup', slug: 'configuration/manual' },
					],
				},
				{
					label: 'Advanced',
					items: [
						{ label: 'TOON Format', slug: 'advanced/toon' },
						{ label: 'File Structure', slug: 'advanced/files' },
					],
				},
				{
					label: 'Community',
					items: [
						{ label: 'Contributing', slug: 'community/contributing' },
						{ label: 'Code of Conduct', slug: 'community/code-of-conduct' },
						{ label: 'License', slug: 'community/license' },
					],
				},
				{
					label: 'Blog',
					items: [
						{ label: 'How toon-memory Makes Your Agent Smarter', slug: 'blog' },
					],
				},
			],
		}),
	],
});
