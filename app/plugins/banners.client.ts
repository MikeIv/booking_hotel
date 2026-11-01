export default defineNuxtPlugin(() => {
  const { fetchBanners } = useBanners();

  // Запускаем загрузку баннеров без ожидания, чтобы не блокировать отрисовку страницы
  // (graceful degradation при медленной сети)
  void fetchBanners().catch((error: unknown) => {
    if (import.meta.dev) {
      console.warn("Не удалось загрузить баннеры при инициализации:", error);
    }
  });
});
