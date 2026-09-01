import {
  applyBookingDeepLinkPayload,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
} from "~/utils/bookingDeepLink";
import { useBookingSearchSubmit } from "~/composables/useBookingSearchSubmit";
import { useBookingStore } from "~/stores/booking";

/**
 * Редирект со старого ukraina-hotel.ru: query → store → автопоиск номеров.
 */
export default defineNuxtPlugin({
  name: "booking-deep-link",
  dependsOn: ["pinia-plugin-persistedstate"],
  async setup() {
    const router = useRouter();
    await router.isReady();

    const route = useRoute();
    const query = getRouteQueryWithLocationFallback(route.query);

    if (!hasBookingDeepLinkParams(query)) return;

    const payload = parseBookingDeepLink(query);
    const shouldAutoSearch = Boolean(payload && route.path === "/");

    await router.replace({
      path: route.path,
      hash: route.hash || undefined,
      query: omitBookingDeepLinkQuery(query),
    });

    if (!payload) return;

    // После replace: persist hydrate и booking.reset middleware уже отработали
    await nextTick();

    const bookingStore = useBookingStore();
    applyBookingDeepLinkPayload(bookingStore, payload);

    if (!shouldAutoSearch) return;

    const { submitBookingSearch } = useBookingSearchSubmit();
    await submitBookingSearch();
  },
});
