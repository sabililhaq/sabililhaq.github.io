import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LABS } from "../src/consts";

const posterPagePath = fileURLToPath(
  new URL("../src/pages/poster.astro", import.meta.url),
);
const mapPagePath = fileURLToPath(
  new URL("../src/pages/map.astro", import.meta.url),
);
const labsPagePath = fileURLToPath(
  new URL("../src/pages/labs.astro", import.meta.url),
);
const slugPagePath = fileURLToPath(
  new URL("../src/pages/[slug].astro", import.meta.url),
);
const headerLinkPath = fileURLToPath(
  new URL("../src/components/HeaderLink.astro", import.meta.url),
);
const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));

describe("poster lab", () => {
  it("adds a /poster page that mounts cartis", () => {
    const source = readFileSync(posterPagePath, "utf-8");

    expect(source).toMatch(
      /import Header from ['"]\.\.\/components\/Header\.astro['"]/,
    );
    expect(source).toMatch(
      /import Footer from ['"]\.\.\/components\/Footer\.astro['"]/,
    );
    expect(source).toMatch(/import\(['"]cartis['"]\)/);
    expect(source).not.toMatch(/import\(['"]geoproximity['"]\)/);
    expect(source).toContain("mountCartis");
    expect(source).toMatch(/title=\{`Poster \| \$\{SITE_TITLE\}`\}/);
    expect(source).toContain("Style a map poster.");
    expect(source).toContain("basePath: '/poster'");
    expect(source).toContain("data-art-host");
    expect(source).toContain('id="map-art-host"');
    expect(source).toContain('class="poster-lab focus-mode"');
    expect(source).toContain("fonts.googleapis.com");
    expect(source).toContain("flex: 1 1 0%");
    expect(source).toContain("height: 100dvh");
    expect(source).toMatch(
      /html\.poster-lab \[data-cartis\] aside[\s\S]*background:\s*rgb\(var\(--bg\)\)/,
    );
    expect(source).toMatch(
      /html\.poster-lab \[data-cartis\] \.input-field[\s\S]*background:\s*rgb\(var\(--surface\)\)/,
    );
    expect(source).toMatch(
      /html\.poster-lab\[data-theme='dark'\] \[data-cartis\] aside \.text-slate-900[\s\S]*color:\s*rgb\(var\(--black\)\)/,
    );
  });

  it("links Poster from the labs page as an internal lab after Map", () => {
    const source = readFileSync(labsPagePath, "utf-8");
    const poster = LABS.find((entry) => entry.label === "Poster");
    const mapIndex = LABS.findIndex((entry) => entry.label === "Map");
    const posterIndex = LABS.findIndex((entry) => entry.label === "Poster");

    expect(poster).toBeDefined();
    expect(poster!.url).toBe("/poster");
    expect(poster!.url.startsWith("http")).toBe(false);
    expect(poster!.description).toBe("Style a map poster.");
    expect(posterIndex).toBe(mapIndex + 1);
    expect(source).toContain("LABS");
  });

  it("reserves the poster slug so blog posts cannot take /poster", () => {
    const slugSource = readFileSync(slugPagePath, "utf-8");
    const headerSource = readFileSync(headerLinkPath, "utf-8");

    expect(slugSource).toContain("'poster'");
    expect(headerSource).toContain("'poster'");
  });

  it("redirects old combined map URLs to /poster", () => {
    const source = readFileSync(mapPagePath, "utf-8");

    expect(source).toContain("posterRedirectPath");
    expect(source).toContain("location.replace(next)");
  });

  it("imports cartis as an external package", () => {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    expect(pkg.dependencies.cartis).toMatch(/^github:/);
  });
});
