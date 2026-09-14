import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LABS, PROJECTS } from "../src/consts";

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

describe("map lab", () => {
  it("adds a /map page using the shared layout pieces", () => {
    const source = readFileSync(mapPagePath, "utf-8");

    expect(source).toMatch(
      /import Header from ['"]\.\.\/components\/Header\.astro['"]/,
    );
    expect(source).toMatch(
      /import Footer from ['"]\.\.\/components\/Footer\.astro['"]/,
    );
    expect(source).not.toMatch(/import\(['"]cartis['"]\)/);
    expect(source).toMatch(/import\(['"]geoproximity['"]\)/);
    expect(source).not.toContain("mountCartis");
    expect(source).toContain("mountProximity");
    expect(source).toMatch(/title=\{`Map \| \$\{SITE_TITLE\}`\}/);
    expect(source).toContain("Rank places by distance.");
    expect(source).not.toContain("or style a map poster.");
    expect(source).toContain("basePath: '/map'");
    expect(source).toContain(
      "cartoApiKey: import.meta.env.PUBLIC_CARTO_API_KEY",
    );
    expect(source).toContain("data-proximity-host");
    expect(source).not.toContain("data-art-host");
    expect(source).not.toContain("data-map-mode");
    expect(source).not.toContain("map-mode-bar");
    expect(source).toContain("sample: true");
    expect(source).toContain("posterRedirectPath");
    expect(source).toContain('class="map-lab focus-mode"');
    expect(source).not.toContain("calc(100dvh - 10rem)");
    expect(source).toContain("flex: 1 1 0%");
    expect(source).toContain("height: 100dvh");
    expect(source).toMatch(/html\.map-lab body > main[\s\S]*overflow: hidden/);
    expect(source).toMatch(
      /html\.map-lab \[data-proximity-host\][\s\S]*z-index: 0/,
    );
  });

  it("links Map from the labs page as an internal lab", () => {
    const source = readFileSync(labsPagePath, "utf-8");
    const lab = LABS.find((entry) => entry.label === "Map");

    expect(lab).toBeDefined();
    expect(lab!.url).toBe("/map");
    expect(lab!.url.startsWith("http")).toBe(false);
    expect(lab!.description).toBe("Rank places by distance.");
    expect(source).toContain("LABS");
  });

  it("reserves the map slug so blog posts cannot take /map", () => {
    const slugSource = readFileSync(slugPagePath, "utf-8");
    const headerSource = readFileSync(headerLinkPath, "utf-8");

    expect(slugSource).toContain("'map'");
    expect(headerSource).toContain("'map'");
  });

  it("lists Geoproximity as a current project with a live map demo", () => {
    const project = PROJECTS.find((entry) => entry.id === "geoproximity");

    expect(project).toBeDefined();
    expect(project!.group).toBe("now");
    expect(
      PROJECTS.findIndex((entry) => entry.id === "geoproximity"),
    ).toBeLessThan(PROJECTS.findIndex((entry) => entry.id === "vim-dojo"));
    expect(project!.liveDemo).toBe("/map");
    expect(project!.sourceCode).toBe(
      "https://github.com/sabililhaq/geoproximity",
    );
    expect(project!.roadmap).toBeUndefined();
    expect(project!.image).toBeDefined();
    expect(
      existsSync(
        fileURLToPath(
          new URL(
            "../src/assets/projects/geoproximity.png",
            import.meta.url,
          ),
        ),
      ),
    ).toBe(true);
    expect(project!.overview.join(" ")).toMatch(/google maps/i);
    expect(project!.overview.join(" ")).toMatch(/entirely in the browser/i);
    expect(project!.overview.join(" ")).toMatch(/no backend/i);
    expect(project!.overview.join(" ")).toMatch(/locally/);
    expect(project!.overview.join(" ")).toMatch(/application server/i);
    expect(project!.overview.join(" ")).not.toMatch(/street routing|roadmap/i);
  });

  it("imports geoproximity as an external package", () => {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

    expect(pkg.dependencies.geoproximity).toMatch(/^(file:|github:)/);
    expect(pkg.dependencies.leaflet).toBeDefined();
    expect(pkg.scripts["dev:map"]).toBeUndefined();
    expect(pkg.scripts.build).toBe("astro build");
  });
});
