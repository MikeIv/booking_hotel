<script setup lang="ts">
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
          <a href="tel:+74952215555">+7 (495) 221-55-55</a>
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
  .footer {
    background: #525252;
    color: #fff;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    padding-top: 70px;
    padding-bottom: 70px;
  }

  .container {
    max-width: 1220px;
    margin: 0 auto;
    padding: 0 var(--ds-space-300);
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 30px;
  }

  .colTitle {
    margin: 0 0 20px;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.2;
    text-transform: uppercase;

    a {
      color: #fff;
      text-decoration: none;
    }
  }

  .colList {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 6px;

    a {
      color: #fff;
      text-decoration: none;
      font-family: GothaProReg, Arial, Helvetica, sans-serif;
      font-size: 16px;
      font-weight: 300;
      line-height: 1.5;
    }

    a:hover {
      color: #9f927f;
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
    gap: 10px;
    font-size: 16px;
    line-height: 1.5;

    a {
      color: #9f927f;
      text-decoration: none;
    }
  }

  .icon {
    width: 20px;
    height: 20px;
    color: #9f927f;
    flex: 0 0 20px;
  }

  .copyright {
    color: #fff;
    font-size: 12px;
    line-height: 1.4;
    text-align: right;
  }

  @media (max-width: 1220px) {
    .container {
      padding: 0 var(--ds-space-400);
    }
  }

  @media (max-width: 1060px) {
    .colList a {
      font-size: 14px;
    }
  }

  @media (max-width: 1024px) {
    .bottomItem {
      a {
        font-size: 14px;
      }
    }
  }

  @media (max-width: 992px) {
    .footer {
      padding-top: 56px;
      padding-bottom: 56px;
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

  @media (max-width: 667px) {
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
      margin: 35px 0;
    }
  }

  @media (max-width: 420px) {
    .footer {
      padding-top: 48px;
      padding-bottom: 48px;
    }

    .copyright {
      font-size: 10px;
    }
  }
</style>
