import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { LABS } from "../src/consts";

const canvasPagePath = fileURLToPath(
  new URL("../src/pages/canvas.astro", import.meta.url),
);
const canvasComponentPath = fileURLToPath(
  new URL("../src/components/canvas/CanvasNotepad.astro", import.meta.url),
);

describe("canvas lab", () => {
  it("registers Canvas in LABS catalog under Playground with relative URL", () => {
    const canvasLab = LABS.find((lab) => lab.label === "Canvas");
    expect(canvasLab).toBeDefined();
    expect(canvasLab!.url).toBe("/canvas");
    expect(canvasLab!.group).toBe("Playground");
    expect(canvasLab!.description).toMatch(/drawable/i);
    expect(canvasLab!.note).toBeUndefined();
  });

  it("creates src/pages/canvas.astro with shared components and focus mode", () => {
    expect(existsSync(canvasPagePath)).toBe(true);
    const source = readFileSync(canvasPagePath, "utf-8");

    expect(source).toMatch(/import Header from ['"]\.\.\/components\/Header\.astro['"]/);
    expect(source).toMatch(/import Footer from ['"]\.\.\/components\/Footer\.astro['"]/);
    expect(source).toMatch(/import FocusMode from ['"]\.\.\/components\/FocusMode\.astro['"]/);
    expect(source).toMatch(/import CanvasNotepad from ['"]\.\.\/components\/canvas\/CanvasNotepad\.astro['"]/);
    expect(source).toContain('class="canvas-lab focus-mode"');
    expect(source).toContain("100dvh");
    expect(source).toContain("data-canvas-stage");
  });

  it("creates CanvasNotepad component with drawing tools and canvas", () => {
    expect(existsSync(canvasComponentPath)).toBe(true);
    const source = readFileSync(canvasComponentPath, "utf-8");

    expect(source).toContain('id="paint-canvas"');
    expect(source).toContain('id="tool-pen"');
    expect(source).toContain('id="tool-eraser"');
    expect(source).toContain('id="tool-paper"');
    expect(source).toContain('id="tool-undo"');
    expect(source).toContain('id="tool-redo"');
    expect(source).toContain('id="tool-clear"');
    expect(source).toContain('id="tool-download"');
    expect(source).toContain("touch-action: none");
  });
});
