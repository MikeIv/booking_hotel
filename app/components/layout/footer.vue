<script setup lang="ts">
  import { HOTEL_INFO, toTelHref } from "~/utils/hotel";

  interface FooterLink {
    label: string;
    href: string;
  }

  interface FooterColumn {
    title: string;
    href: string;
    links: FooterLink[];
  }

  const footerColumns: FooterColumn[] = [
    {
      title: "Услуги отеля",
      href: "https://www.ukraina-hotel.ru/services",
      links: [
        { label: "Фитнес и Спа", href: "https://www.ukraina-hotel.ru/services/radisson-collection-fitness-spa" },
        { label: "Подземная парковка", href: "http://parkingmoscow.ru/" },
        { label: "Конференц-центр", href: "https://www.ukraina-hotel.ru/services/konferenc-centr" },
        { label: "Галерея бутиков", href: "https://www.ukraina-hotel.ru/boutiques" },
      ],
    },
    {
      title: "Мероприятия",
      href: "https://www.ukraina-hotel.ru/events",
      links: [
        { label: "Radisson Collection Lounge", href: "https://www.ukraina-hotel.ru/events/radisson-collection-lounge" },
        { label: "Онлайн-студия", href: "https://www.ukraina-hotel.ru/events/online-entertainment-event-studio" },
        { label: "Банкетный зал", href: "https://www.ukraina-hotel.ru/events/banquet-hall" },
        { label: "Конференц-зал", href: "https://www.ukraina-hotel.ru/events/conference-hall" },
      ],
    },
    {
      title: "Рестораны",
      href: "https://www.ukraina-hotel.ru/rest",
      links: [
        { label: "Лобби-бар", href: "https://www.ukraina-hotel.ru/rest/lobby-bar" },
        { label: "Веранда", href: "https://www.ukraina-hotel.ru/rest/veranda" },
        { label: "Клубный ресторан", href: "https://www.ukraina-hotel.ru/rest/club-restaurant" },
        { label: "Флотилия «Рэдиссон Ройал»", href: "https://www.ukraina-hotel.ru/rest/flotilla-radisson-royal" },
      ],
    },
    {
      title: "О гостинице",
      href: "https://www.ukraina-hotel.ru/about",
      links: [
        { label: "Спецпредложения", href: "https://www.ukraina-hotel.ru/special-offers" },
        { label: "Юридическая информация", href: "https://www.ukraina-hotel.ru/rules" },
        { label: "Контакты", href: "https://www.ukraina-hotel.ru/contacts" },
        { label: "Новости", href: "https://www.ukraina-hotel.ru/news" },
      ],
    },
  ];
</script>

<template>
  <footer :class="$style.footer">
    <div :class="$style.container">
      <section :class="$style.top">
        <div
          v-for="column in footerColumns"
          :key="column.title"
          :class="$style.col"
        >
          <h5 :class="$style.colTitle">
            <a :href="column.href" target="_blank" rel="noopener noreferrer">
              {{ column.title }}
            </a>
          </h5>
          <ul :class="$style.colList">
            <li v-for="link in column.links" :key="link.href">
              <a :href="link.href" target="_blank" rel="noopener noreferrer">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section :class="$style.bottom">
        <div :class="$style.bottomItem">
          <Icon name="mdi:phone" :class="$style.icon" aria-hidden="true" />
          <a :href="toTelHref(HOTEL_INFO.phone)">{{ HOTEL_INFO.phone }}</a>
        </div>
        <div :class="$style.bottomItem">
          <Icon name="mdi:map-marker" :class="$style.icon" aria-hidden="true" />
          <a href="//yandex.ru/maps/-/CCUi76wo8A" target="_blank" rel="noopener noreferrer">
            Москва, Кутузовский проспект, 2/1, стр. 1
          </a>
        </div>
        <div :class="$style.copyright">
          Copyright © 1957-2026 Radisson Collection Hotel, Moscow
        </div>
      </section>
    </div>
  </footer>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .footer {
    background: var(--secondary);
    color: var(--a-text-white);
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    padding-top: rem(70);
    padding-bottom: rem(70);
  }

  .container {
    max-width: rem(1220);
    margin: 0 auto;
    padding: 0 var(--ds-space-300);
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: rem(30);
  }

  .colTitle {
    margin: 0 0 rem(20);
    font-weight: 400;
    font-size: rem(14);
    line-height: 1.2;
    text-transform: uppercase;

    a {
      color: var(--a-text-white);
      text-decoration: none;
    }
  }

  .colList {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: rem(6);

    a {
      color: var(--a-text-white);
      text-decoration: none;
      font-size: rem(16);
      font-weight: 300;
      line-height: 1.5;
    }

    a:hover {
      color: var(--primary);
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-300);
  }

  .bottomItem {
    display: flex;
    align-items: center;
    gap: rem(10);
    font-size: rem(16);
    line-height: 1.5;

    a {
      color: var(--primary);
      text-decoration: none;
    }
  }

  .icon {
    width: rem(20);
    height: rem(20);
    color: var(--primary);
    flex: 0 0 rem(20);
  }

  .copyright {
    color: var(--a-text-white);
    font-size: rem(12);
    line-height: 1.4;
    text-align: right;
  }

  @media (max-width: #{rem(1220)}) {
    .container {
      padding: 0 var(--ds-space-400);
    }
  }

  @media (max-width: #{rem(1060)}) {
    .colList a {
      font-size: rem(14);
    }
  }

  @media (max-width: #{size.$desktopMin}) {
    .bottomItem {
      a {
        font-size: rem(14);
      }
    }
  }

  @media (max-width: #{size.$tabletMax}) {
    .footer {
      padding-top: var(--ds-space-700);
      padding-bottom: var(--ds-space-700);
    }

    .top {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ds-space-400) var(--ds-space-500);
    }

    .bottom {
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .copyright {
      flex-basis: 100%;
      text-align: center;
    }
  }

  @media (max-width: #{rem(667)}) {
    .container {
      padding: 0 var(--ds-space-200);
    }

    .top {
      grid-template-columns: 1fr;
      gap: var(--ds-space-300);
    }

    .bottom {
      align-items: center;
      flex-direction: column;
    }

    .bottomItem:nth-child(2) {
      margin: rem(35) 0;
    }
  }

  @media (max-width: #{rem(420)}) {
    .footer {
      padding-top: var(--ds-space-600);
      padding-bottom: var(--ds-space-600);
    }

    .copyright {
      font-size: rem(10);
    }
  }
</style>
