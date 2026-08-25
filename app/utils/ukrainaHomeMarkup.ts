function findElementEnd(html: string, tag: string, afterOpen: number): number {
  const openRe = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  const closeRe = new RegExp(`</${tag}\\s*>`, "gi");
  let depth = 1;
  let cursor = afterOpen;

  while (cursor < html.length && depth > 0) {
    openRe.lastIndex = cursor;
    closeRe.lastIndex = cursor;
    const openMatch = openRe.exec(html);
    const closeMatch = closeRe.exec(html);

    if (!closeMatch) return -1;

    if (openMatch && openMatch.index < closeMatch.index) {
      cursor = openMatch.index + openMatch[0].length;
      if (!openMatch[0].endsWith("/>")) {
        depth += 1;
      }
      continue;
    }

    depth -= 1;
    cursor = closeMatch.index + closeMatch[0].length;
  }

  return depth === 0 ? cursor : -1;
}

function removeFirstMatchingElement(
  html: string,
  tag: string,
  openTagNeedle: string,
): string {
  const tagOpen = `<${tag}`;
  let searchFrom = 0;

  while (searchFrom < html.length) {
    const start = html.indexOf(tagOpen, searchFrom);
    if (start < 0) return html;

    const gt = html.indexOf(">", start);
    if (gt < 0) return html;

    const openTag = html.slice(start, gt + 1);
    if (!openTag.includes(openTagNeedle)) {
      searchFrom = gt + 1;
      continue;
    }

    if (openTag.endsWith("/>")) {
      return html.slice(0, start) + html.slice(gt + 1);
    }

    const end = findElementEnd(html, tag, gt + 1);
    if (end < 0) return html;
    return html.slice(0, start) + html.slice(end);
  }

  return html;
}

const SCRAPED_HEADER_TARGETS: { tag: string; needle: string }[] = [
  { tag: "section", needle: 'id="topbar"' },
  { tag: "div", needle: 'class="burger"' },
  { tag: "nav", needle: 'class="hamburger"' },
  { tag: "a", needle: 'class="header__logo"' },
  { tag: "div", needle: 'class="header__block"' },
  { tag: "nav", needle: 'class="menu"' },
];

/**
 * Убирает из скрапленного HTML отеля верхнюю навигацию:
 * логотип, burger/menu, поиск и переключатель языка.
 * Герой (фон, центральный логотип, заголовок, соцсети) остаётся.
 */
export function stripUkrainaScrapedHeader(html: string): string {
  return SCRAPED_HEADER_TARGETS.reduce(
    (markup, target) =>
      removeFirstMatchingElement(markup, target.tag, target.needle),
    html,
  );
}
