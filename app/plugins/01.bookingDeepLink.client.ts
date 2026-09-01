import {
  hasBookingDeepLinkParams,
  omitBookingDeepLinkQuery,
  parseBookingDeepLink,
} from "~/utils/bookingDeepLink";

/**
 * Предзаполнение формы бронирования из query (редирект со старого ukraina-hotel.ru).
 * Поиск номеров не запускается — только setDate / setGuests / setPromoCode.
 */
export default defineNuxtPlugin(() => {
  const route = useRoute();
  const router = useRouter();

  if (!hasBookingDeepLinkParams(route.query)) return;

  const payload = parseBookingDeepLink(route.query);
  if (payload) {
    const bookingStore = useBookingStore();
    bookingStore.setDate(payload.date);
    bookingStore.setGuests(payload.guests);
    if (payload.promoCode) {
      bookingStore.setPromoCode(payload.promoCode);
    }
  }

  void router.replace({
    path: route.path,
    hash: route.hash || undefined,
    query: omitBookingDeepLinkQuery(route.query),
  });
});
