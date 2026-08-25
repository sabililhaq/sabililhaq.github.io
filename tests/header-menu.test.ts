import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const headerPath = fileURLToPath(new URL('../src/components/Header.astro', import.meta.url));
const headPath = fileURLToPath(new URL('../src/components/BaseHead.astro', import.meta.url));
const header = readFileSync(headerPath, 'utf-8');
const head = readFileSync(headPath, 'utf-8');

describe('header sandwich menu', () => {
	it('puts a sandwich toggle on the right of the header', () => {
		expect(header).toContain('id="menu-toggle"');
		expect(header).toContain('id="header-menu"');
		expect(header).toContain('id="header-menu-panel"');
		expect(header).toContain('icon-bars');
		expect(header).toContain('icon-close');
		expect(header).toContain('class="header-menu"');
	});

	it('keeps the inline about / projects / blog / labs nav', () => {
		expect(header).toContain('class="primary-nav"');
		expect(header).toContain("{ href: '/about', label: 'about' }");
		expect(header).toContain("{ href: '/projects', label: 'projects' }");
		expect(header).toContain("{ href: '/blog', label: 'blog' }");
		expect(header).toContain("{ href: '/labs', label: 'labs' }");
		expect(header).toContain('<HeaderLink href={item.href}>{item.label}</HeaderLink>');
	});

	it('moves theme, hide-navbar, and language into the sandwich panel', () => {
		expect(header).toContain('id="theme-toggle"');
		expect(header).toContain('id="nav-toggle"');
		expect(header).toContain('Hide navbar');
		expect(header).toContain('Dark mode');
		expect(header).toContain('Language');
		expect(header).toContain('ENG');
		expect(header).toContain('INA');
	});

	it('keeps INA disabled until Indonesian copy exists', () => {
		expect(header).toContain('disabled title="Indonesian coming soon">INA</button>');
		expect(header).toContain('aria-pressed="true">ENG</button>');
	});

	it('persists navbar visibility and restores it before paint', () => {
		expect(header).toContain("const NAV_STORAGE_KEY = 'nav-hidden'");
		expect(header).toContain('localStorage.setItem(NAV_STORAGE_KEY');
		expect(head).toContain("localStorage.getItem('nav-hidden')");
		expect(head).toContain('dataset.navHidden');
	});

	it('exposes the primary links inside the menu when the navbar is hidden', () => {
		expect(header).toContain('id="menu-nav"');
		expect(header).toContain("html[data-nav-hidden='true']");
	});
});
