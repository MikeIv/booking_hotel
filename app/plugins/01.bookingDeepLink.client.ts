import {
  applyBookingDeepLinkFromQuery,
  BOOKING_DEEP_LINK_PENDING_SEARCH_KEY,
  cleanBookingDeepLinkQuery,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
  shouldAutoSearchAfterDeepLink,
} from "~/utils/bookingDeepLink";
import { useBookingStore } from "~/stores/booking";

/**
 * Редирект с ukraina-hotel.ru: query → поля формы бронирования.
 * На страницах поиска (/rooms, /multi-rooms) дополнительно поднимаем флаг автопоиска
 * и включаем прелоадер: страница читает флаг в onMounted и сразу вызывает search().
 * На остальных путях автопоиска нет — пользователь жмёт «Поиск» сам.
 */
export default defineNuxtPlugin({
  name: "booking-deep-link",
  dependsOn: ["pinia-plugin-persistedstate"],
  async setup() {
    const bookingStore = useBookingStore();
    const router = useRouter();
    await router.isReady();

    const route = useRoute();
    const query = getRouteQueryWithLocationFallback(route.query);
    if (!hasBookingDeepLinkParams(query)) return;

    const path = route.path;

    const applied = await applyBookingDeepLinkFromQuery({
      query,
      path,
      hash: route.hash || undefined,
      store: bookingStore,
      routerReplace: (location) => router.replace(location),
    });

    // Nuxt после плагинов сам делает router.replace(initialURL) с исходным window.location
    // (nuxt/dist/app/plugins/router.js: хук app:created → replace(initialURL)) и возвращает
    // ?check_in=… в адресную строку. Поэтому чистим query повторно — уже после монтирования,
    // иначе F5 снова поднимает автопоиск по старым параметрам. Регистрируем независимо от
    // результата применения: битую ссылку в адресной строке тоже держать не нужно.
    useNuxtApp().hook("app:mounted", () => {
      void cleanBookingDeepLinkQuery(router, route);
    });

    if (!shouldAutoSearchAfterDeepLink(applied, path)) return;

    const pendingSearch = useState<boolean>(
      BOOKING_DEEP_LINK_PENDING_SEARCH_KEY,
      () => false,
    );
    pendingSearch.value = true;

    // Прелоадер должен быть виден сразу после перехода: страница ещё не смонтирована,
    // а пустой список до ответа сервера показывать нельзя.
    bookingStore.setLoading(true, "Загружаем данные о номерах...");
    bookingStore.setServerRequest(true);
  },
});
