<script setup lang="ts">
  import UKRAINA_HOME_DATA from "~/assets/data/ukraina-home.generated.json";

  definePageMeta({
    layout: "home-copy",
  });

  useSeoMeta({
    title: "Главная",
    description:
      "Grand — бронирование номеров и услуг. Официальное приложение бронирования.",
  });

  useHead({
    link: [
      { rel: "preconnect", href: "https://www.ukraina-hotel.ru" },
      { rel: "dns-prefetch", href: "https://www.ukraina-hotel.ru" },
    ],
  });
</script>

<template>
  <div :class="$style.main">
    <MainUkrainaHomeHero
      :html="UKRAINA_HOME_DATA.homeMarkupBeforeBooking"
      :css-text="UKRAINA_HOME_DATA.homeCss"
    />
    <div :class="$style.bookingOffset">
      <Booking mode="home" />
    </div>
    <MainUkrainaHtmlFragment
      :html="UKRAINA_HOME_DATA.homeMarkupAfterBookingBeforeTemporary"
      :css-text="UKRAINA_HOME_DATA.homeCss"
    />
    <MainTemporarySlider :items="UKRAINA_HOME_DATA.temporarySlides" />
    <MainUkrainaHtmlFragment
      :html="UKRAINA_HOME_DATA.homeMarkupBeforeAdvantage"
      :css-text="UKRAINA_HOME_DATA.homeCss"
    />
    <MainAdvantageSection
      :title="UKRAINA_HOME_DATA.advantageTitle"
      :items="UKRAINA_HOME_DATA.advantageItems"
    />
    <MainLazyBlock min-height="460px">
      <MainUkrainaHtmlFragment
        :html="UKRAINA_HOME_DATA.homeMarkupBeforeRest"
        :css-text="UKRAINA_HOME_DATA.homeCss"
      />
      <MainRestSection
        :title="UKRAINA_HOME_DATA.restTitle"
        :items="UKRAINA_HOME_DATA.restOffers"
      />
    </MainLazyBlock>
    <MainLazyBlock min-height="540px">
      <MainUkrainaHtmlFragment
        :html="UKRAINA_HOME_DATA.homeMarkupBeforePlacement"
        :css-text="UKRAINA_HOME_DATA.homeCss"
      />
      <MainPlacementSection
        :title="UKRAINA_HOME_DATA.placementTitle"
        :items="UKRAINA_HOME_DATA.placementItems"
      />
    </MainLazyBlock>
    <MainLazyBlock min-height="500px">
      <MainUkrainaHtmlFragment
        :html="UKRAINA_HOME_DATA.homeMarkupBeforeEvents"
        :css-text="UKRAINA_HOME_DATA.homeCss"
      />
      <MainEventsSection
        :title="UKRAINA_HOME_DATA.eventsTitle"
        :items="UKRAINA_HOME_DATA.eventsItems"
      />
    </MainLazyBlock>
    <MainLazyBlock min-height="460px">
      <MainUkrainaHtmlFragment
        :html="UKRAINA_HOME_DATA.homeMarkupBeforeRestaurantsRest"
        :css-text="UKRAINA_HOME_DATA.homeCss"
      />
      <MainRestSection
        :title="UKRAINA_HOME_DATA.restaurantsRestTitle"
        :items="UKRAINA_HOME_DATA.restaurantsRestOffers"
      />
    </MainLazyBlock>
    <MainLazyBlock min-height="500px">
      <MainUkrainaHtmlFragment
        :html="UKRAINA_HOME_DATA.homeMarkupBeforeService"
        :css-text="UKRAINA_HOME_DATA.homeCss"
      />
      <MainEventsSection
        :title="UKRAINA_HOME_DATA.serviceTitle"
        :items="UKRAINA_HOME_DATA.serviceItems"
      />
    </MainLazyBlock>
  </div>
</template>

<style module lang="scss">
  .main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: clip;
  }

  .bookingOffset {
    margin-top: 58px;
  }
</style>
