/**
 * Утилиты для форматирования цен
 */

/**
 * Цена за 1 ночь из итога за период проживания (как в ответе API /v1/search).
 */
export const toPricePerNight = (
  stayTotal: number | null | undefined,
  nights: number,
): number => {
  const total = stayTotal ?? 0;
  if (nights <= 0) return total;
  return total / nights;
};

/**
 * Итог за период из цены за 1 ночь (контракт SelectedEntry.price).
 */
export const toStayTotal = (
  pricePerNight: number | null | undefined,
  nights: number,
): number => {
  const perNight = pricePerNight ?? 0;
  if (nights <= 0) return perNight;
  return perNight * nights;
};

const priceNumberFormatter = new Intl.NumberFormat("ru-RU", {
  useGrouping: true,
  maximumFractionDigits: 0,
});

const localeGroupingSeparator = /[\u00A0\u202F]/g;

/**
 * Форматирует число или строку в цену с пробелом между тысячами.
 * Пример: 42000 → "42 000"
 */
export const formatPrice = (
  price: number | string | undefined | null,
): string => {
  if (price === undefined || price === null) return "0";

  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price;

  if (!Number.isFinite(numPrice)) return "0";

  return priceNumberFormatter
    .format(Math.round(numPrice))
    .replace(localeGroupingSeparator, " ");
};
