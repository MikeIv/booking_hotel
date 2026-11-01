import type { SelectedService } from "~/stores/booking";
import type { BookingByUuidRoom } from "~/types/booking";
import { pickPackageCode } from "~/utils/bookingChangeRequest";
import { pickNumber, pickString } from "~/utils/pick";

const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

/**
 * id должен совпадать с карточкой на /services (hash package_code),
 * иначе гидратация из брони не подсветит выбранную услугу.
 */
export function parseBookingRoomService(
  service: unknown,
  fallbackId: number,
): SelectedService | null {
  const packageCode = pickPackageCode(service);
  if (!packageCode && typeof service === "string") {
    return null;
  }

  if (typeof service === "string") {
    const code = packageCode as string;
    return {
      id: hashStringToNumber(code) || fallbackId,
      title: code,
      price: 0,
      packageCode: code,
    };
  }

  if (!service || typeof service !== "object") return null;

  const record = service as Record<string, unknown>;
  const title =
    pickString(record.title) ?? pickString(record.name) ?? packageCode ?? null;

  if (!title) return null;

  const price =
    pickNumber(record.price) ??
    pickNumber(record.amount) ??
    pickNumber(record.total) ??
    0;

  const id = packageCode
    ? hashStringToNumber(packageCode) || fallbackId
    : (pickNumber(record.id) ?? fallbackId);

  return {
    id,
    title,
    price,
    ...(packageCode ? { packageCode } : {}),
  };
}

/** Доп. услуги номера из booking.show: приоритет у packages, fallback — services */
function getBookingRoomExtraServicesRaw(room: BookingByUuidRoom): unknown[] {
  const packages = room.packages;
  if (Array.isArray(packages) && packages.length > 0) {
    return packages;
  }

  const services = room.services;
  return Array.isArray(services) ? services : [];
}

function parseBookingRoomExtraServices(
  room: BookingByUuidRoom,
  idOffset = 0,
): SelectedService[] {
  return getBookingRoomExtraServicesRaw(room)
    .map((service, serviceIndex) =>
      parseBookingRoomService(service, idOffset + serviceIndex),
    )
    .filter((service): service is SelectedService => service !== null);
}

export function mapBookingRoomServicesToTitles(
  room: BookingByUuidRoom,
): string[] {
  return parseBookingRoomExtraServices(room).map((service) => service.title);
}

export function mapBookingRoomsServicesToByRoom(
  rooms: BookingByUuidRoom[],
): Record<number, SelectedService[]> {
  const result: Record<number, SelectedService[]> = {};

  rooms.forEach((room, roomIndex) => {
    const parsed = parseBookingRoomExtraServices(room, roomIndex * 100);

    if (parsed.length > 0) {
      result[roomIndex] = parsed;
    }
  });

  return result;
}

/** Ключи — строковые индексы комнат (как в booking store) */
export function selectedServicesByRoomFromBookingRooms(
  rooms: unknown,
): Record<string, SelectedService[]> {
  if (!Array.isArray(rooms) || rooms.length === 0) return {};

  return Object.fromEntries(
    Object.entries(
      mapBookingRoomsServicesToByRoom(rooms as BookingByUuidRoom[]),
    ).map(([key, value]) => [String(key), value]),
  );
}

/**
 * Оставляет только услуги, чей packageCode есть среди доступных.
 * При пустом availableCodes возвращает исходный выбор без изменений
 * (нечего сверять — иначе все услуги обнулились бы).
 */
export function pruneSelectedServicesByAvailableCodes(
  selectedByRoom: Record<string, SelectedService[]>,
  availableCodes: ReadonlySet<string>,
): Record<string, SelectedService[]> {
  if (availableCodes.size === 0) {
    return { ...selectedByRoom };
  }

  const next: Record<string, SelectedService[]> = {};

  for (const [roomKey, services] of Object.entries(selectedByRoom)) {
    const kept = services.filter((service) => {
      const code = service.packageCode?.trim();
      return Boolean(code && availableCodes.has(code));
    });

    if (kept.length > 0) {
      next[roomKey] = kept;
    }
  }

  return next;
}
