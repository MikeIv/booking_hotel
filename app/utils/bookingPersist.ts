import type { RoomTariff } from "~/types/room";
import type { SelectedEntry } from "~/types/booking";

/**
 * Урезает тариф для persist (localStorage):
 * description / cancellation_popover сильно раздувают payload.
 */
export function slimTariffForPersist(
  tariff: RoomTariff | null | undefined,
): RoomTariff | null {
  if (!tariff) return null;
  const {
    description: _description,
    cancellation_popover: _cancellationPopover,
    ...rest
  } = tariff;
  return rest;
}

/** Оставляет только multi-записи с roomIdx < roomCount; при roomCount ≤ 1 — пусто. */
export function pruneSelectedMultiRooms(
  selected: Record<string, SelectedEntry>,
  roomCount: number,
): Record<string, SelectedEntry> {
  if (roomCount <= 1) return {};
  const next: Record<string, SelectedEntry> = {};
  for (const [key, entry] of Object.entries(selected)) {
    if (entry.roomIdx < roomCount) next[key] = entry;
  }
  return next;
}

/** Услуги по ключу roomIdx; при single (≤1) оставляет только "0". */
export function pruneSelectedServicesByRoom<T>(
  services: Record<string, T[]>,
  roomCount: number,
): Record<string, T[]> {
  if (roomCount <= 1) {
    const zero = services["0"];
    return zero?.length ? { "0": [...zero] } : {};
  }
  const next: Record<string, T[]> = {};
  for (const [key, list] of Object.entries(services)) {
    const idx = Number(key);
    if (Number.isInteger(idx) && idx >= 0 && idx < roomCount) {
      next[key] = list;
    }
  }
  return next;
}
