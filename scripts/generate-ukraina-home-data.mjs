import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const htmlPath = resolve(projectRoot, "app/assets/html/ukraina-home-body.html");
const cssPath = resolve(projectRoot, "app/assets/vendor/ukraina/home.combined.css");
const outPath = resolve(projectRoot, "app/assets/data/ukraina-home.generated.json");

const UKRAINA_SITE_ORIGIN = "https://www.ukraina-hotel.ru";
const UKRAINA_ASSET_ORIGIN = "https://www.ukraina-hotel.ru";
const UKRAINA_CSS_BASE = `${UKRAINA_ASSET_ORIGIN}/css/`;
const LOCAL_ASSET_PROXY_PREFIX = "/ukraina-assets";

const toAbsoluteUrl = (rawUrl, base) => {
  const trimmedUrl = rawUrl.trim();

  if (
    /^(data:|https?:|\/\/|#)/i.test(trimmedUrl) ||
    trimmedUrl.startsWith("/ukraina-assets/")
  ) {
    return trimmedUrl;
  }

  return new URL(trimmedUrl, base).toString();
};

const toLocalAssetProxyUrl = (rawUrl) => {
  const trimmedUrl = rawUrl.trim();
  if (!trimmedUrl || /^data:/i.test(trimmedUrl) || trimmedUrl.startsWith("#")) {
    return trimmedUrl;
  }
  if (trimmedUrl.startsWith("/ukraina-assets/")) {
    return trimmedUrl;
  }

  let absoluteUrl;
  if (/^https?:\/\//i.test(trimmedUrl)) {
    absoluteUrl = new URL(trimmedUrl);
  } else if (trimmedUrl.startsWith("//")) {
    absoluteUrl = new URL(`https:${trimmedUrl}`);
  } else {
    absoluteUrl = new URL(trimmedUrl, `${UKRAINA_ASSET_ORIGIN}/`);
  }

  const pathWithSearch = `${absoluteUrl.pathname}${absoluteUrl.search}`;
  return `${LOCAL_ASSET_PROXY_PREFIX}${pathWithSearch}`;
};

const absolutizeCssUrls = (cssText) =>
  cssText.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, rawUrl) => {
    const absoluteUrl = toAbsoluteUrl(rawUrl, UKRAINA_CSS_BASE);
    const localProxyUrl = toLocalAssetProxyUrl(absoluteUrl);
    if (localProxyUrl === rawUrl.trim()) return match;
    return `url(${quote}${localProxyUrl}${quote})`;
  });

const disableLocalGothaSources = (cssText) =>
  cssText.replace(/src:\s*local\("GothaPro[^"]+"\),/g, "src:");

const stripEmbeddedGothaFontFaces = (cssText) =>
  cssText.replace(/@font-face\{font-family:GothaPro[^}]+\}/g, "");

const absolutizeHtmlAssetUrls = (html) => {
  const withAbsoluteAttributes = html.replace(
    /(src|href|poster)=("|')([^"']+)\2/g,
    (fullMatch, attributeName, quote, rawUrl) => {
      const base =
        attributeName === "href"
          ? `${UKRAINA_SITE_ORIGIN}/`
          : `${UKRAINA_ASSET_ORIGIN}/`;
      const absoluteUrl = toAbsoluteUrl(rawUrl, base);
      const finalUrl =
        attributeName === "href" ? absoluteUrl : toLocalAssetProxyUrl(absoluteUrl);
      if (finalUrl === rawUrl.trim()) return fullMatch;
      return `${attributeName}=${quote}${finalUrl}${quote}`;
    },
  );

  return withAbsoluteAttributes.replace(
    /url\((['"]?)([^'")]+)\1\)/g,
    (match, quote, rawUrl) => {
      const absoluteUrl = toAbsoluteUrl(rawUrl, `${UKRAINA_ASSET_ORIGIN}/`);
      const localProxyUrl = toLocalAssetProxyUrl(absoluteUrl);
      if (localProxyUrl === rawUrl.trim()) return match;
      return `url(${quote}${localProxyUrl}${quote})`;
    },
  );
};

const removeLegacyBookingArtifacts = (html) =>
  html
    .replace(
      /<div class="header__searchBarForm"[^>]*>[\s\S]*?<\/form>\s*<\/div>/g,
      "",
    )
    .replace(/<a[^>]*class="searchBarForm cruise"[^>]*>[\s\S]*?<\/a>/g, "")
    .replace(
      /<div id="modal-fullscreen-mobil"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
      "",
    )
    .replace(
      /<div id="modal-fullscreen"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
      "",
    )
    .replace(/<button[^>]*id="btn-event-reservation"[^>]*>[\s\S]*?<\/button>/g, "")
    .replace(/<div[^>]*class="frame-container"[^>]*>[\s\S]*?<\/div>/g, "");

const cleanText = (text) =>
  text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const cleanAdvantageHtml = (html) =>
  html
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\slang="[^"]*"/g, "")
    .replace(/<span[^>]*>/g, "")
    .replace(/<\/span>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/<p>\s*<\/p>/g, "")
    .trim();

const cleanPlacementHtml = (html) =>
  html
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\slang="[^"]*"/g, "")
    .replace(/<span[^>]*>/g, "")
    .replace(/<\/span>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const cleanEventsHtml = (html) =>
  html
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/<img[^>]*>/g, "")
    .replace(/<br\s*\/?>/gi, "<br/>")
    .replace(/&nbsp;/g, " ")
    .trim();

const extractData = (homeMarkupRaw, homeCssRaw) => {
  const bookingSlotMarker = "<!--PROJECT_BOOKING_SLOT-->";
  const temporaryStartMarker = '<div class="container container_temporary-new">';
  const temporaryEndMarker = '<section class="advantage">';
  const advantageStartMarker = '<section class="advantage">';
  const restStartMarker = '<section class="rest">';
  const restEndMarker = '<section class="placement">';
  const placementStartMarker = '<section class="placement">';
  const placementEndMarker = '<section class="events">';
  const eventsStartMarker = '<section class="events">';
  const eventsEndMarker = '<section class="rest">';
  const restaurantsRestStartMarker = '<section class="rest">';
  const restaurantsRestEndMarker = '<section class="service">';
  const serviceStartMarker = '<section class="service">';
  const serviceEndMarker = '<footer class="footer">';

  const [homeMarkupBeforeBookingRaw = homeMarkupRaw, homeMarkupAfterBookingRaw = ""] =
    homeMarkupRaw.split(bookingSlotMarker);

  const homeMarkupBeforeBooking = removeLegacyBookingArtifacts(
    absolutizeHtmlAssetUrls(homeMarkupBeforeBookingRaw),
  );
  const homeMarkupAfterBooking = absolutizeHtmlAssetUrls(homeMarkupAfterBookingRaw);
  const homeMarkupAfterBookingClean =
    removeLegacyBookingArtifacts(homeMarkupAfterBooking);

  const temporaryStartIndex = homeMarkupAfterBookingClean.indexOf(temporaryStartMarker);
  const temporaryEndIndex = homeMarkupAfterBookingClean.indexOf(temporaryEndMarker);
  const hasTemporaryBlock =
    temporaryStartIndex >= 0 && temporaryEndIndex > temporaryStartIndex;

  const temporaryBlockHtml = hasTemporaryBlock
    ? homeMarkupAfterBookingClean.slice(temporaryStartIndex, temporaryEndIndex)
    : "";
  const homeMarkupAfterBookingBeforeTemporary = hasTemporaryBlock
    ? homeMarkupAfterBookingClean.slice(0, temporaryStartIndex)
    : homeMarkupAfterBookingClean;
  const homeMarkupAfterBookingAfterTemporary = hasTemporaryBlock
    ? `${temporaryEndMarker}${homeMarkupAfterBookingClean.slice(
        temporaryEndIndex + temporaryEndMarker.length,
      )}`
    : "";

  const advantageStartIndex = homeMarkupAfterBookingAfterTemporary.indexOf(advantageStartMarker);
  const advantageEndIndex =
    advantageStartIndex >= 0
      ? homeMarkupAfterBookingAfterTemporary.indexOf("</section>", advantageStartIndex)
      : -1;
  const hasAdvantageBlock = advantageStartIndex >= 0 && advantageEndIndex >= 0;
  const advantageEndOffset = hasAdvantageBlock ? advantageEndIndex + "</section>".length : -1;
  const advantageBlockHtml = hasAdvantageBlock
    ? homeMarkupAfterBookingAfterTemporary.slice(advantageStartIndex, advantageEndOffset)
    : "";
  const homeMarkupBeforeAdvantage = hasAdvantageBlock
    ? homeMarkupAfterBookingAfterTemporary.slice(0, advantageStartIndex)
    : homeMarkupAfterBookingAfterTemporary;
  const homeMarkupAfterAdvantage = hasAdvantageBlock
    ? homeMarkupAfterBookingAfterTemporary.slice(advantageEndOffset)
    : "";

  const restStartIndex = homeMarkupAfterAdvantage.indexOf(restStartMarker);
  const restEndIndex = homeMarkupAfterAdvantage.indexOf(restEndMarker);
  const hasRestBlock = restStartIndex >= 0 && restEndIndex > restStartIndex;
  const restBlockHtml = hasRestBlock
    ? homeMarkupAfterAdvantage.slice(restStartIndex, restEndIndex)
    : "";
  const homeMarkupBeforeRest = hasRestBlock
    ? homeMarkupAfterAdvantage.slice(0, restStartIndex)
    : homeMarkupAfterAdvantage;
  const homeMarkupAfterRest = hasRestBlock
    ? `${restEndMarker}${homeMarkupAfterAdvantage.slice(restEndIndex + restEndMarker.length)}`
    : "";

  const placementStartIndex = homeMarkupAfterRest.indexOf(placementStartMarker);
  const placementEndIndex = homeMarkupAfterRest.indexOf(placementEndMarker);
  const hasPlacementBlock =
    placementStartIndex >= 0 && placementEndIndex > placementStartIndex;
  const placementBlockHtml = hasPlacementBlock
    ? homeMarkupAfterRest.slice(placementStartIndex, placementEndIndex)
    : "";
  const homeMarkupBeforePlacement = hasPlacementBlock
    ? homeMarkupAfterRest.slice(0, placementStartIndex)
    : homeMarkupAfterRest;
  const homeMarkupAfterPlacement = hasPlacementBlock
    ? `${placementEndMarker}${homeMarkupAfterRest.slice(
        placementEndIndex + placementEndMarker.length,
      )}`
    : "";

  const eventsStartIndex = homeMarkupAfterPlacement.indexOf(eventsStartMarker);
  const eventsEndIndex = homeMarkupAfterPlacement.indexOf(eventsEndMarker);
  const hasEventsBlock = eventsStartIndex >= 0 && eventsEndIndex > eventsStartIndex;
  const eventsBlockHtml = hasEventsBlock
    ? homeMarkupAfterPlacement.slice(eventsStartIndex, eventsEndIndex)
    : "";
  const homeMarkupBeforeEvents = hasEventsBlock
    ? homeMarkupAfterPlacement.slice(0, eventsStartIndex)
    : homeMarkupAfterPlacement;
  const homeMarkupAfterEvents = hasEventsBlock
    ? `${eventsEndMarker}${homeMarkupAfterPlacement.slice(eventsEndIndex + eventsEndMarker.length)}`
    : "";

  const restaurantsRestStartIndex = homeMarkupAfterEvents.indexOf(restaurantsRestStartMarker);
  const restaurantsRestEndIndex = homeMarkupAfterEvents.indexOf(restaurantsRestEndMarker);
  const hasRestaurantsRestBlock =
    restaurantsRestStartIndex >= 0 && restaurantsRestEndIndex > restaurantsRestStartIndex;
  const restaurantsRestBlockHtml = hasRestaurantsRestBlock
    ? homeMarkupAfterEvents.slice(restaurantsRestStartIndex, restaurantsRestEndIndex)
    : "";
  const homeMarkupBeforeRestaurantsRest = hasRestaurantsRestBlock
    ? homeMarkupAfterEvents.slice(0, restaurantsRestStartIndex)
    : homeMarkupAfterEvents;
  const homeMarkupAfterRestaurantsRest = hasRestaurantsRestBlock
    ? `${restaurantsRestEndMarker}${homeMarkupAfterEvents.slice(
        restaurantsRestEndIndex + restaurantsRestEndMarker.length,
      )}`
    : "";

  const serviceStartIndex = homeMarkupAfterRestaurantsRest.indexOf(serviceStartMarker);
  const serviceEndIndex = homeMarkupAfterRestaurantsRest.indexOf(serviceEndMarker);
  const hasServiceBlock = serviceStartIndex >= 0 && serviceEndIndex > serviceStartIndex;
  const serviceBlockHtml = hasServiceBlock
    ? homeMarkupAfterRestaurantsRest.slice(serviceStartIndex, serviceEndIndex)
    : "";
  const homeMarkupBeforeService = hasServiceBlock
    ? homeMarkupAfterRestaurantsRest.slice(0, serviceStartIndex)
    : homeMarkupAfterRestaurantsRest;
  const homeMarkupAfterService = hasServiceBlock
    ? homeMarkupAfterRestaurantsRest.slice(serviceEndIndex)
    : "";

  const temporarySlides = [...temporaryBlockHtml.matchAll(
    /(?:<a[^>]*href="([^"]+)"[^>]*>)?\s*<div class="slick-item">[\s\S]*?<img src="([^"]+)"[^>]*>[\s\S]*?<\/div>\s*(?:<\/a>)?/g,
  )].map((match) => ({
    image: toLocalAssetProxyUrl(toAbsoluteUrl(match[2], `${UKRAINA_ASSET_ORIGIN}/`)),
    link: match[1] ? toAbsoluteUrl(match[1], `${UKRAINA_SITE_ORIGIN}/`) : undefined,
  }));

  const advantageTitle =
    advantageBlockHtml.match(/<h2>([\s\S]*?)<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
    "Преимущества проживания";
  const advantageItems = [...advantageBlockHtml.matchAll(
    /<div class="card">[\s\S]*?<div class="card-header"><img src="([^"]+)"[^>]*>[\s\S]*?<h4>([\s\S]*?)<\/h4>[\s\S]*?<div class="card-footer">([\s\S]*?)<\/div>\s*<\/div>/g,
  )].map((match) => ({
    image: toLocalAssetProxyUrl(toAbsoluteUrl(match[1], `${UKRAINA_ASSET_ORIGIN}/`)),
    title: cleanText(match[2]),
    descriptionHtml: cleanAdvantageHtml(match[3]),
  })).filter((item) => item.image && item.title);

  const extractRestItems = (html) =>
    [...html.matchAll(
      /thumbnail-slider__bg thumbnail-slider__bg_for"[\s\S]*?url\('([^']+)'\)[\s\S]*?<h3>\s*([\s\S]*?)\s*<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<a href="([^"]+)"[\s\S]*?class="btn-place">[\s\S]*?([^<]+?)\s*<\/a>/g,
    )]
      .map((match) => ({
        title: cleanText(match[2]),
        description: cleanText(match[3]),
        image: toLocalAssetProxyUrl(
          toAbsoluteUrl(match[1], `${UKRAINA_ASSET_ORIGIN}/`),
        ),
        link: toAbsoluteUrl(match[4], `${UKRAINA_SITE_ORIGIN}/`),
        buttonText: cleanText(match[5]) || "подробнее",
      }))
      .filter((item) => item.image && item.title && item.link);

  const restTitle =
    restBlockHtml.match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
    "Спецпредложения";
  const restOffers = extractRestItems(restBlockHtml);

  const restaurantsRestTitle =
    restaurantsRestBlockHtml
      .match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() || "";
  const restaurantsRestOffers = extractRestItems(restaurantsRestBlockHtml);

  const placementTitle =
    placementBlockHtml
      .match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim() || "Номера и апартаменты";
  const placementItems = [...placementBlockHtml.matchAll(
    /card-around[\s\S]*?url\('([^']+)'\)[\s\S]*?<h4>\s*([\s\S]*?)\s*<\/h4>[\s\S]*?<div class="card-body">([\s\S]*?)<\/div>[\s\S]*?<a href="([^"]+)"[\s\S]*?class="btn btn-place">[\s\S]*?([^<]+?)\s*<\/a>/g,
  )]
    .map((match) => ({
      title: cleanText(match[2]),
      detailsHtml: cleanPlacementHtml(match[3]),
      image: toLocalAssetProxyUrl(toAbsoluteUrl(match[1], `${UKRAINA_ASSET_ORIGIN}/`)),
      link: toAbsoluteUrl(match[4], `${UKRAINA_SITE_ORIGIN}/`),
      buttonText: cleanText(match[5]) || "подробнее",
    }))
    .filter((item) => item.image && item.title && item.link);

  const extractEventItems = (html) =>
    [...html.matchAll(
      /<a href="([^"]+)" class="slider-btn__link">[\s\S]*?url\('([^']+)'\)[\s\S]*?<h3>\s*([\s\S]*?)\s*<\/h3>[\s\S]*?<div class="slider-btn__text[^"]*">([\s\S]*?)<\/div>[\s\S]*?<div class="slider-btn__btn">[\s\S]*?([^<]+?)\s*<\/div>[\s\S]*?<\/a>/g,
    )]
      .map((match) => ({
        title: cleanText(match[3]),
        detailsHtml: cleanEventsHtml(match[4]),
        image: toLocalAssetProxyUrl(
          toAbsoluteUrl(match[2], `${UKRAINA_ASSET_ORIGIN}/`),
        ),
        link: toAbsoluteUrl(match[1], `${UKRAINA_SITE_ORIGIN}/`),
        buttonText: cleanText(match[5]) || "подробнее",
      }))
      .filter((item) => item.image && item.title && item.link);

  const eventsTitle =
    eventsBlockHtml.match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
    "Переговорные комнаты и банкетные залы";
  const eventsItems = extractEventItems(eventsBlockHtml);
  const serviceTitle =
    serviceBlockHtml.match(/<h2>\s*([\s\S]*?)\s*<\/h2>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ||
    "Услуги отеля";
  const serviceItems = extractEventItems(serviceBlockHtml);

  const headerCssOverrides = `
@font-face{font-family:GothaProReg;src:url("/fonts/ukraina/GothaProReg.woff") format("woff");font-style:normal;font-weight:400;font-display:swap;}
@font-face{font-family:GothaProMed;src:url("/fonts/ukraina/GothaProMed.woff") format("woff");font-style:normal;font-weight:500;font-display:swap;}
@font-face{font-family:GothaProBol;src:url("/fonts/ukraina/GothaProBol.woff") format("woff");font-style:normal;font-weight:700;font-display:swap;}
@font-face{font-family:GothaProBla;src:url("/fonts/ukraina/GothaProBla.woff") format("woff");font-style:normal;font-weight:900;font-display:swap;}
#header,#header .menu a,#header .header__block,#header .language-select,#header #lang-curr,#header #lang-curr .selected-lang,#header #lang-curr .lang_li,#header #lang-list .lang_li,#header #lang-list a{font-family:GothaProReg,Arial,Helvetica,sans-serif;font-style:normal;font-weight:400;}
#header h1{font-family:GothaProBol,Arial,Helvetica,sans-serif;}
#lang-curr .icon-down-open-big{display:inline-block;width:0;height:0;margin-left:6px;vertical-align:middle;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid #fff;font-size:0;line-height:0;}
#lang-curr .icon-down-open-big:before{content:none !important;}
/* fallback for shadow fragments without legacy slick JS */
.slick-slide,.slick-slide img{display:block;}
`;

  const homeCss = `${absolutizeCssUrls(
    stripEmbeddedGothaFontFaces(disableLocalGothaSources(homeCssRaw)),
  )}\n${headerCssOverrides}`;

  return {
    homeCss,
    homeMarkupBeforeBooking,
    homeMarkupAfterBookingBeforeTemporary,
    homeMarkupBeforeAdvantage,
    homeMarkupBeforeRest,
    homeMarkupBeforePlacement,
    homeMarkupBeforeEvents,
    homeMarkupBeforeRestaurantsRest,
    homeMarkupBeforeService,
    homeMarkupAfterService,
    temporarySlides,
    advantageTitle,
    advantageItems,
    restTitle,
    restOffers,
    placementTitle,
    placementItems,
    eventsTitle,
    eventsItems,
    restaurantsRestTitle,
    restaurantsRestOffers,
    serviceTitle,
    serviceItems,
  };
};

const main = async () => {
  const [htmlRaw, cssRaw] = await Promise.all([
    readFile(htmlPath, "utf8"),
    readFile(cssPath, "utf8"),
  ]);

  const data = extractData(htmlRaw, cssRaw);
  const content = `${JSON.stringify(data)}\n`;
  await writeFile(outPath, content, "utf8");
  console.log(`Generated: ${outPath}`);
};

await main();
