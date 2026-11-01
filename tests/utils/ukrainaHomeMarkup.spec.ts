import { describe, expect, it } from "vitest";
import { stripUkrainaScrapedHeader } from "~/utils/ukrainaHomeMarkup";

const FIXTURE = `
<section id="topbar"><a href="/">top</a></section>
<div class="burger"><span></span></div>
<nav class="hamburger">
  <div class="hamburger__inner">
    <ul><li><a href="/accommodation">Размещение</a></li></ul>
    <div id="lang-select-burger" class="language-select">Рус</div>
  </div>
</nav>
<header id="header" class="header">
  <a href="/" class="header__logo"><svg></svg></a>
  <div class="header__logo-raddison"><svg></svg></div>
  <h1>WELCOME TO THE EXCEPTIONAL</h1>
  <div class="header__social"><a href="#">yt</a></div>
  <div class="header__block">
    <a href="#" class="header__search"></a>
    <div id="lang-select" class="language-select">
      <div id="lang-curr"><span>Рус</span></div>
    </div>
  </div>
  <nav class="menu">
    <ul><li><a href="/accommodation">Размещение</a></li></ul>
  </nav>
</header>
`;

describe("stripUkrainaScrapedHeader", () => {
  it("удаляет логотип, меню, поиск и язык, оставляя героя", () => {
    const result = stripUkrainaScrapedHeader(FIXTURE);

    expect(result).not.toContain('id="topbar"');
    expect(result).not.toContain('class="burger"');
    expect(result).not.toContain('class="hamburger"');
    expect(result).not.toContain('class="header__logo"');
    expect(result).not.toContain('class="header__block"');
    expect(result).not.toContain('class="menu"');
    expect(result).not.toContain("header__search");
    expect(result).not.toContain("language-select");

    expect(result).toContain('class="header__logo-raddison"');
    expect(result).toContain("WELCOME TO THE EXCEPTIONAL");
    expect(result).toContain('class="header__social"');
    expect(result).toContain('id="header"');
  });

  it("чистит реальный HTML-фрагмент главной", async () => {
    const data = await import("~/assets/data/ukraina-home.generated.json");
    const result = stripUkrainaScrapedHeader(data.homeMarkupBeforeBooking);

    expect(result).not.toContain('class="header__block"');
    expect(result).not.toContain('class="header__logo"');
    expect(result).not.toContain('<nav class="menu"');
    expect(result).toContain("header__logo-raddison");
    expect(result).toContain('id="header"');
  });
});
