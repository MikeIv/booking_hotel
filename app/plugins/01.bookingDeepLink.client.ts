import {
  applyBookingDeepLinkPayload,
  hasBookingDeepLinkParams,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
} from "~/utils/bookingDeepLink";

/**
 * Редирект со старого ukraina-hotel.ru: query → store → автопоиск номеров.
 */
export default defineNuxtPlugin(async () => {
  const route = useRoute();
  const router = useRouter();

  if (!hasBookingDeepLinkParams(route.query)) return;

  const payload = parseBookingDeepLink(route.query);
  const shouldAutoSearch = Boolean(payload && route.path === "/");

  if (payload) {
    applyBookingDeepLinkPayload(useBookingStore(), payload);
  }

  await router.replace({
    path: route.path,
    hash: route.hash || undefined,
    query: omitBookingDeepLinkQuery(route.query),
  });

  if (!shouldAutoSearch) return;

  const { submitBookingSearch } = useBookingSearchSubmit();
  await submitBookingSearch();
});
