/**
 * Навигация и соцсети родительского сайта отеля (ukraina-hotel.ru).
 *
 * Источник — рабочая разметка старого сайта:
 * `resources/views/layouts/template.blade.php` (nav.hamburger) и
 * `resources/views/menus/main_menu_mobile.blade.php`; адреса сверены
 * со скрапленной главной (`app/assets/data/ukraina-home.generated.json`).
 * Телефоны гостиницы и отдела бронирования — в `~/utils/hotel`.
 */

export interface MenuLink {
  url: string;
  text: string;
}

export interface SocialMenuItem {
  url: string;
  iconName: string;
}

export type LocaleCode = "ru" | "en";
export type CurrencyCode = "RUB" | "USD" | "EUR";

/** Полный список левой шторки — 12 разделов, как на старом сайте. */
export const DRAWER_MENU_LINKS: readonly MenuLink[] = [
  { url: "https://www.ukraina-hotel.ru/accommodation", text: "Размещение" },
  { url: "https://www.ukraina-hotel.ru/events", text: "Мероприятия" },
  { url: "https://collection.wedding/", text: "Свадьбы" },
  { url: "https://collection.catering/", text: "Кейтеринг" },
  { url: "https://www.ukraina-hotel.ru/rest", text: "Рестораны" },
  { url: "https://www.ukraina-hotel.ru/boutiques", text: "Галерея бутиков" },
  { url: "https://www.ukraina-hotel.ru/services", text: "Услуги отеля" },
  {
    url: "https://www.ukraina-hotel.ru/virtual-tours",
    text: "Виртуальные туры",
  },
  { url: "https://www.ukraina-hotel.ru/about", text: "О гостинице" },
  { url: "https://www.ukraina-hotel.ru/rules", text: "Юридическая информация" },
  { url: "https://www.ukraina-hotel.ru/contacts", text: "Контакты" },
  { url: "http://parkingmoscow.ru/", text: "Подземная парковка" },
];

/** Горизонтальная навигация шапки (≥$headerNavMin) — 7 разделов из списка шторки. */
const HEADER_NAV_URLS = new Set<string>([
  "https://www.ukraina-hotel.ru/accommodation",
  "https://www.ukraina-hotel.ru/events",
  "https://collection.wedding/",
  "https://collection.catering/",
  "https://www.ukraina-hotel.ru/rest",
  "https://www.ukraina-hotel.ru/services",
  "https://www.ukraina-hotel.ru/virtual-tours",
]);

export const HEADER_NAV_LINKS: readonly MenuLink[] = DRAWER_MENU_LINKS.filter(
  (link) => HEADER_NAV_URLS.has(link.url),
);

export const HOTEL_SITE_URL = "https://www.ukraina-hotel.ru/";

/** Соцсети из подвала старой шторки. Иконки — локальные (`app/assets/icons`). */
export const HOTEL_SOCIAL_LINKS: SocialMenuItem[] = [
  {
    url: "https://www.youtube.com/c/RadissonCollectionHotelMoscow/",
    iconName: "i-youtube",
  },
  {
    url: "https://vk.com/radisson_collection_moscow",
    iconName: "i-vk",
  },
  {
    url: "https://www.tripadvisor.ru/Hotel_Review-g298484-d299906-Reviews-Radisson_Collection_Hotel_Moscow-Moscow_Central_Russia.html",
    iconName: "i-tripadvisor",
  },
];
