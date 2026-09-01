import {
  BOOKING_DEEP_LINK_PENDING_KEY,
  getRouteQueryWithLocationFallback,
  hasBookingDeepLinkParams,
  prepareBookingDeepLinkOverlay,
  runBookingDeepLinkSearch,
} from "~/utils/bookingDeepLink";
import { useBookingSearchSubmit } from "~/composables/useBookingSearchSubmit";
import { useBookingStore } from "~/stores/booking";

/**
 * Редирект со старого ukraina-hotel.ru: query → store → автопоиск номеров.
 * Оверлей включается до router.isReady(), иначе после InitialLoadOverlay — белый экран.
 */
export default defineNuxtPlugin({
  name: "booking-deep-link",
  dependsOn: ["pinia-plugin-persistedstate"],
  async setup() {
    const pending = useState<boolean>(
      BOOKING_DEEP_LINK_PENDING_KEY,
      () => false,
    );
    const bookingStore = useBookingStore();
    const route = useRoute();

    prepareBookingDeepLinkOverlay(
      getRouteQueryWithLocationFallback(route.query),
      route.path,
      pending,
      bookingStore,
    );

    const router = useRouter();
    await router.isReady();

    const readyRoute = useRoute();
    const query = getRouteQueryWithLocationFallback(readyRoute.query);

    if (!pending.value && !hasBookingDeepLinkParams(query)) return;

    const { submitBookingSearch } = useBookingSearchSubmit();

    await runBookingDeepLinkSearch({
      query,
      path: readyRoute.path,
      hash: readyRoute.hash || undefined,
      pending,
      store: bookingStore,
      routerReplace: (location) => router.replace(location),
      submitSearch: submitBookingSearch,
    });
  },
});
