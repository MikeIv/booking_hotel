<template>
  <div class="app">
    <div class="app__layout">
      <NuxtLayout>
        <NuxtLoadingIndicator :color="'#00dc82'" :height="3" />

        <NuxtPage />

        <NuxtRouteAnnouncer />
      </NuxtLayout>
    </div>

    <NotificationToast :notifications="notifications" :on-remove="remove" />
    <LayoutInitialLoadOverlay />
    <BookingLoadingOverlay />
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useNotifications } from "~/composables/useNotifications";

  const { notifications: notificationsRef, remove } = useNotifications();

  // Преобразуем readonly ref в массив для передачи в компонент
  const notifications = computed(() => notificationsRef.value);

  useHead({
    titleTemplate: (title) =>
      title ? `${title} | Grand — бронирование` : "Grand — бронирование",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Grand — бронирование номеров",
      },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
    ],
    bodyAttrs: {
      class: "app-body",
    },
  });
</script>

<style scoped lang="scss">
  /* Явный контейнер для layout безопаснее, чем зависимость от :first-child. */
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    width: 100%;
    min-width: 0;
  }

  .app__layout {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
  }
</style>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>
