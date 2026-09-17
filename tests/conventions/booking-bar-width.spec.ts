import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function styleBlock(source: string) {
  return source.match(/<style\b[^>]*>[\s\S]*?<\/style>/)?.[0] ?? "";
}

describe("booking bar: no shrink-to-fit collapse", () => {
  it("steps layout stretches page and breadcrumbs to wrapper width", () => {
    const style = styleBlock(read("app/layouts/steps.vue"));
    expect(style).toMatch(
      /\.wrapper\s*\{[\s\S]*?> \*\s*\{[\s\S]*?width:\s*100%/,
    );
  });

  it("rooms page container has width 100% next to max-width + auto margins", () => {
    const style = styleBlock(read("app/pages/rooms/index.vue"));
    expect(style).toMatch(/\.container\s*\{[\s\S]*?width:\s*100%/);
    expect(style).toMatch(/\.container\s*\{[\s\S]*?max-width:/);
    expect(style).toMatch(/\.container\s*\{[\s\S]*?margin:\s*0 auto/);
  });

  it("desktopMedium booking grid keeps non-zero track mins and a fixed search column", () => {
    const style = styleBlock(read("app/components/booking/Booking.vue"));
    const desktopBlock =
      style.match(
        /@media \(min-width: #\{size\.\$desktopMedium\}\) \{[\s\S]*?grid-template-columns:[\s\S]*?;/,
      )?.[0] ?? "";
    expect(desktopBlock).toMatch(
      /minmax\(rem\(220\),\s*1\.25fr\)[\s\S]*minmax\(rem\(180\),\s*1fr\)[\s\S]*minmax\(rem\(160\),\s*0\.8fr\)[\s\S]*rem\(272\)/,
    );
    expect(desktopBlock).not.toMatch(/minmax\(\s*0\s*,/);
  });

  it("booking Input/Select wrappers keep an intrinsic min-width under cqi containment", () => {
    expect(styleBlock(read("app/components/ui/Input.vue"))).toMatch(
      /\.booking\s*\{[\s\S]*?min-width:\s*rem\(160\)/,
    );
    expect(styleBlock(read("app/components/ui/Select.vue"))).toMatch(
      /\.booking\s*\{[\s\S]*?min-width:\s*rem\(160\)/,
    );
  });
});
