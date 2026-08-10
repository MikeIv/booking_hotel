import type { RoomTariff } from "~/types/room";
import type { SelectedEntry } from "~/types/booking";

export type GuestRoomSlot = {
  adults: number;
  children: number;
  childrenAges: number[];
};

/** Подсказки shrink из GuestsSelector (точнее эвристики по составу). */
export type ShrinkMultiHints = {
  /** deleteRoom: индекс в списке до удаления */
  removedRoomIdx?: number;
  /** updateRooms срезал хвост */
  trailingShrink?: boolean;
};

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

function guestRoomSlotEqual(a: GuestRoomSlot, b: GuestRoomSlot): boolean {
  if (a.adults !== b.adults || a.children !== b.children) return false;
  if (a.childrenAges.length !== b.childrenAges.length) return false;
  return a.childrenAges.every((age, i) => age === b.childrenAges[i]);
}

function isGuestRoomListPrefix(
  prevList: GuestRoomSlot[],
  nextList: GuestRoomSlot[],
): boolean {
  if (nextList.length >= prevList.length) return false;
  return nextList.every((room, i) => {
    const prev = prevList[i];
    return prev !== undefined && guestRoomSlotEqual(prev, room);
  });
}

function equalsWithoutIndex(
  prevList: GuestRoomSlot[],
  nextList: GuestRoomSlot[],
  removedIdx: number,
): boolean {
  let j = 0;
  for (let i = 0; i < prevList.length; i++) {
    if (i === removedIdx) continue;
    const next = nextList[j];
    if (!next || !guestRoomSlotEqual(prevList[i]!, next)) return false;
    j++;
  }
  return j === nextList.length;
}

/**
 * Уникальный индекс удалённого номера (ровно один removed).
 * При неоднозначности (одинаковые слоты) — null.
 */
export function findUniqueRemovedRoomIdx(
  prevList: GuestRoomSlot[],
  nextList: GuestRoomSlot[],
): number | null {
  if (nextList.length !== prevList.length - 1) return null;
  let found: number | null = null;
  for (let i = 0; i < prevList.length; i++) {
    if (!equalsWithoutIndex(prevList, nextList, i)) continue;
    if (found !== null) return null;
    found = i;
  }
  return found;
}

/** После deleteRoom: убрать удалённый roomIdx и сдвинуть большие индексы. */
export function remapSelectedMultiRoomsAfterRemoval(
  selected: Record<string, SelectedEntry>,
  removedRoomIdx: number,
): Record<string, SelectedEntry> {
  const next: Record<string, SelectedEntry> = {};
  for (const entry of Object.values(selected)) {
    if (entry.roomIdx === removedRoomIdx) continue;
    const newIdx =
      entry.roomIdx > removedRoomIdx ? entry.roomIdx - 1 : entry.roomIdx;
    next[`${entry.roomCardIdx}-${newIdx}`] =
      newIdx === entry.roomIdx ? entry : { ...entry, roomIdx: newIdx };
  }
  return next;
}

/** После deleteRoom: сдвинуть ключи услуг по roomIdx. */
export function remapSelectedServicesByRoomAfterRemoval<T>(
  services: Record<string, T[]>,
  removedRoomIdx: number,
): Record<string, T[]> {
  const next: Record<string, T[]> = {};
  for (const [key, list] of Object.entries(services)) {
    const idx = Number(key);
    if (!Number.isInteger(idx) || idx < 0 || idx === removedRoomIdx) continue;
    if (idx < removedRoomIdx) next[key] = list;
    else next[String(idx - 1)] = list;
  }
  return next;
}

function pruneBoth<T>(
  selectedMultiRooms: Record<string, SelectedEntry>,
  selectedServicesByRoom: Record<string, T[]>,
  roomCount: number,
) {
  return {
    selectedMultiRooms: pruneSelectedMultiRooms(selectedMultiRooms, roomCount),
    selectedServicesByRoom: pruneSelectedServicesByRoom(
      selectedServicesByRoom,
      roomCount,
    ),
  };
}

function remapBoth<T>(
  selectedMultiRooms: Record<string, SelectedEntry>,
  selectedServicesByRoom: Record<string, T[]>,
  removedIdx: number,
) {
  return {
    selectedMultiRooms: remapSelectedMultiRoomsAfterRemoval(
      selectedMultiRooms,
      removedIdx,
    ),
    selectedServicesByRoom: remapSelectedServicesByRoomAfterRemoval(
      selectedServicesByRoom,
      removedIdx,
    ),
  };
}

/**
 * Shrink multi→multi:
 * - hint removedRoomIdx → remap;
 * - hint trailingShrink / bulk trailing → prune;
 * - однозначная эвристика по составу → remap;
 * - иначе wipe.
 */
export function shrinkMultiSelections<T>(
  selectedMultiRooms: Record<string, SelectedEntry>,
  selectedServicesByRoom: Record<string, T[]>,
  prevList: GuestRoomSlot[],
  nextList: GuestRoomSlot[],
  hints?: ShrinkMultiHints,
): {
  selectedMultiRooms: Record<string, SelectedEntry>;
  selectedServicesByRoom: Record<string, T[]>;
} {
  const explicitIdx = hints?.removedRoomIdx;
  if (
    explicitIdx !== undefined &&
    Number.isInteger(explicitIdx) &&
    explicitIdx >= 0 &&
    explicitIdx < prevList.length &&
    nextList.length === prevList.length - 1
  ) {
    return remapBoth(selectedMultiRooms, selectedServicesByRoom, explicitIdx);
  }

  if (hints?.trailingShrink && isGuestRoomListPrefix(prevList, nextList)) {
    return pruneBoth(
      selectedMultiRooms,
      selectedServicesByRoom,
      nextList.length,
    );
  }

  const inferredIdx = findUniqueRemovedRoomIdx(prevList, nextList);
  if (inferredIdx !== null) {
    return remapBoth(selectedMultiRooms, selectedServicesByRoom, inferredIdx);
  }

  // Bulk trailing без hint (setGuests извне): режет >1 с хвоста
  if (
    nextList.length < prevList.length - 1 &&
    isGuestRoomListPrefix(prevList, nextList)
  ) {
    return pruneBoth(
      selectedMultiRooms,
      selectedServicesByRoom,
      nextList.length,
    );
  }

  return {
    selectedMultiRooms: {},
    selectedServicesByRoom: {},
  };
}
