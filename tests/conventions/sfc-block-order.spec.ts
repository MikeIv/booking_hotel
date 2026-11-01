import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Канонический порядок блоков SFC: script → template → style
 * (nuxt-template.mdc).
 */
const TARGETS = [
  "app/layouts/default.vue",
  "app/layouts/steps.vue",
  "app/layouts/main.vue",
  "app/layouts/home-copy.vue",
  "app/components/ui/Tabs.vue",
  "app/components/NotificationToast.vue",
  "app/components/layout/InitialLoadOverlay.vue",
] as const;

function blockPositions(source: string) {
  const script = source.search(/<script\b/);
  const template = source.search(/<template\b/);
  const style = source.search(/<style\b/);
  return { script, template, style };
}

describe("SFC block order (Wave 8)", () => {
  it.each(TARGETS)("%s: script → template → style", (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
    const { script, template, style } = blockPositions(source);

    expect(template).toBeGreaterThanOrEqual(0);
    expect(style).toBeGreaterThanOrEqual(0);
    expect(template).toBeLessThan(style);
    // Пустой script не обязателен; если есть — только перед template
    if (script >= 0) {
      expect(script).toBeLessThan(template);
    }
  });

  it("NotificationToast и InitialLoadOverlay без dual scoped/module", () => {
    for (const relativePath of [
      "app/components/NotificationToast.vue",
      "app/components/layout/InitialLoadOverlay.vue",
    ] as const) {
      const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
      expect(source).toMatch(/<style module/);
      expect(source).not.toMatch(/<style scoped/);
      const styleBlocks = source.match(/<style\b/g) ?? [];
      expect(styleBlocks).toHaveLength(1);
    }
  });
});
