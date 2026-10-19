/**
 * Константы с информацией об отеле
 */
export interface HotelInfo {
  name: string;
  address: string;
  /** Телефон гостиницы */
  phone: string;
  /** Телефон отдела бронирования */
  bookingPhone: string;
  email: string;
  imageUrl?: string;
  checkInTime: string;
  checkOutTime: string;
}

export const HOTEL_INFO: HotelInfo = {
  name: 'Многофункциональный гостиничный комплекс "Россия"',
  address: "109012,Россия, г. Москва, ул. Варварка, д.14, стр. 1, 2",
  phone: "+7 (495) 274-99-99",
  bookingPhone: "+7 (495) 221-55-80",
  email: "mail@mail.ru",
  imageUrl: "/images/room/room-01.jpg",
  checkInTime: "15:00",
  checkOutTime: "12:00",
} as const;

/** `tel:`-ссылка из отображаемого номера: `+7 (495) 221-55-80` → `tel:+74952215580`. */
export const toTelHref = (phone: string): string =>
  `tel:+${phone.replace(/\D/g, "")}`;
