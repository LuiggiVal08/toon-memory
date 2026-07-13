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
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
			},
			sidebar: [
				{
					label: 'Getting Started',
					translations: { es: 'Primeros pasos' },
					items: [
						{ label: 'Quick Start', translations: { es: 'Inicio rápido' }, slug: 'getting-started/quickstart' },
						{ label: 'Installation', translations: { es: 'Instalación' }, slug: 'getting-started/installation' },
					],
				},
				{
					label: 'Features',
					translations: { es: 'Características' },
					items: [
						{ label: 'MCP Tools', translations: { es: 'Herramientas MCP' }, slug: 'features/tools' },
						{ label: 'CLI Commands', translations: { es: 'Comandos CLI' }, slug: 'features/cli' },
						{ label: 'Encryption', translations: { es: 'Encriptación' }, slug: 'features/encryption' },
						{ label: 'Watch Mode', translations: { es: 'Modo watch' }, slug: 'features/watch' },
						{ label: 'Auto-Archive', translations: { es: 'Auto-archivado' }, slug: 'features/archive' },
					],
				},
				{
					label: 'Configuration',
					translations: { es: 'Configuración' },
					items: [
						{ label: 'Supported Agents', translations: { es: 'Agentes compatibles' }, slug: 'configuration/agents' },
						{ label: 'Manual Setup', translations: { es: 'Configuración manual' }, slug: 'configuration/manual' },
					],
				},
				{
					label: 'Advanced',
					translations: { es: 'Avanzado' },
					items: [
						{ label: 'TOON Format', translations: { es: 'Formato TOON' }, slug: 'advanced/toon' },
						{ label: 'File Structure', translations: { es: 'Estructura de archivos' }, slug: 'advanced/files' },
					],
				},
				{
					label: 'Community',
					translations: { es: 'Comunidad' },
					items: [
						{ label: 'Contributing', translations: { es: 'Cómo contribuir' }, slug: 'community/contributing' },
						{ label: 'Code of Conduct', translations: { es: 'Código de conducta' }, slug: 'community/code-of-conduct' },
						{ label: 'License', translations: { es: 'Licencia' }, slug: 'community/license' },
					],
				},
				{
					label: 'Blog',
					translations: { es: 'Blog' },
					items: [
						{ label: 'How toon-memory Makes Your Agent Smarter', translations: { es: 'Cómo toon-memory hace tu agente más inteligente' }, slug: 'blog' },
					],
				},
			],
		}),
	],
});
