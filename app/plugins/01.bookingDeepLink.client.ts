import {
  applyBookingDeepLinkFromQuery,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
} from "~/utils/bookingDeepLink";
import { useBookingStore } from "~/stores/booking";

/**
 * Редирект с ukraina-hotel.ru: query → поля формы бронирования.
 * Автопоиск /rooms не запускаем — пользователь жмёт «Поиск» сам.
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

    await applyBookingDeepLinkFromQuery({
      query,
      path: route.path,
      hash: route.hash || undefined,
      store: bookingStore,
      routerReplace: (location) => router.replace(location),
    });
  },
});
