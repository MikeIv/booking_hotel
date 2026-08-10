import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const IMPORTANT_TARGETS = [
  "app/components/booking/BookingSummary.vue",
  "app/components/booking/Booking.vue",
] as const;

const TOKEN_TARGETS = [
  "app/components/main/AdvantageSection.vue",
  "app/components/main/EventsSection.vue",
  "app/components/main/PlacementSection.vue",
  "app/components/main/RestSection.vue",
  "app/components/main/TemporarySlider.vue",
  "app/components/main/LazyBlock.vue",
  "app/components/layout/footer.vue",
] as const;

/** HEX в style-блоке (не HTML-entities вроде &#10094;) */
function hexInStyles(source: string): string[] {
  const styleBlocks = source.match(/<style\b[^>]*>[\s\S]*?<\/style>/g) ?? [];
  const hits: string[] = [];
  for (const block of styleBlocks) {
    const matches = block.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    hits.push(...matches);
  }
  return hits;
}

/** «голые» px в style-блоке (не внутри rem()/var() и не в media через #{$…}) — упрощённо: Npx */
function barePxInStyles(source: string): string[] {
  const styleBlocks = source.match(/<style\b[^>]*>[\s\S]*?<\/style>/g) ?? [];
  const hits: string[] = [];
  for (const block of styleBlocks) {
    // допускаем breakpoints в @media через resolution vars; ловим сырые значения свойств
    const matches = block.match(/(?<![\w-])\d+px\b/g) ?? [];
    hits.push(...matches);
  }
  return hits;
}

describe("Wave 9: no homemade !important", () => {
  it.each(IMPORTANT_TARGETS)("%s без !important", (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), relativePath), "utf8");
    expect(source).not.toMatch(/!important/);
  });
});

describe("Wave 9: landing/footer tokens and rem()", () => {
  it.each(TOKEN_TARGETS)("%s без HEX в style", (relativePath) => {
    expect(
      hexInStyles(readFileSync(resolve(process.cwd(), relativePath), "utf8")),
    ).toEqual([]);
  });

  it.each(TOKEN_TARGETS)("%s без голых px в style", (relativePath) => {
    expect(
      barePxInStyles(
        readFileSync(resolve(process.cwd(), relativePath), "utf8"),
      ),
    ).toEqual([]);
  });
});
