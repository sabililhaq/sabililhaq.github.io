import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MEDIUM_POSTS, SOCIALS } from '../src/consts';

const blogPagePath = fileURLToPath(new URL('../src/pages/blog/index.astro', import.meta.url));
const homePagePath = fileURLToPath(new URL('../src/pages/index.astro', import.meta.url));
const blogSource = readFileSync(blogPagePath, 'utf-8');
const homeSource = readFileSync(homePagePath, 'utf-8');

describe('blog writings', () => {
	it('lists only the two curated Medium posts', () => {
		expect(MEDIUM_POSTS.map((post) => post.title)).toEqual([
			'Bahasa Indonesia: Fundamental Machine Learning: Kunci Era Baru Teknologi',
			'Drone as our future courier',
		]);
	});

	it('hosts Tag Aggressively as a local post', () => {
		const postPath = fileURLToPath(
			new URL('../src/content/blog/tag-aggressively.md', import.meta.url),
		);
		const post = readFileSync(postPath, 'utf-8');
		expect(post).toContain('title: "Tag Aggressively"');
		expect(post).toContain('tag aggressively');
		expect(post).toContain('/images/blog/tag-aggressively-notes.png');
	});

	it('points every Medium entry at a real Medium URL', () => {
		for (const post of MEDIUM_POSTS) {
			expect(post.url.startsWith('https://')).toBe(true);
			expect(post.url.includes('medium.com')).toBe(true);
			expect(post.title.length).toBeGreaterThan(0);
			expect(post.description.length).toBeGreaterThan(0);
		}
	});

	it('renders Medium writings on the blog page', () => {
		expect(blogSource).toContain('MEDIUM_POSTS');
		expect(blogSource).toContain('On Medium');
		expect(blogSource).toContain('SOCIALS.medium');
		expect(blogSource).toContain("target=\"_blank\"");
	});

	it('surfaces recent Medium writings on the home page', () => {
		expect(homeSource).toContain('MEDIUM_POSTS');
		expect(homeSource).toContain('post.url');
	});

	it('keeps the Medium profile URL', () => {
		expect(SOCIALS.medium).toBe('https://sabililhaq.medium.com/');
	});
});
