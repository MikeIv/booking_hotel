import type { Ref } from "vue";
import type { Room } from "~/types/room";
import type { SearchFilters } from "~/types/booking";

const VIEW_OPTIONS = [
  { id: 0, title: "Вид из окна" },
  { id: 1, title: "Парк" },
  { id: 2, title: "Город" },
  { id: 3, title: "Море" },
  { id: 4, title: "Внутренний двор" },
] as const;

function addAllOption<T extends { id: number; title: string }>(
  serverFilters: T[] | undefined,
  defaultOptions: readonly T[],
  allOptionTitle: string,
): T[] {
  if (!serverFilters || serverFilters.length === 0) {
    return [...defaultOptions];
  }

  const hasAllOption = serverFilters[0]?.id === 0;
  if (hasAllOption) {
    return serverFilters;
  }

  return [{ id: 0, title: allOptionTitle } as T, ...serverFilters];
}

function usesServerViewFilters(filters: SearchFilters | undefined): boolean {
  return Boolean(filters?.views?.length);
}

function getMatchingViewVariants(room: Room, viewId: number): Room[] | null {
  const variants = room.room_type_codes;
  if (!variants || variants.length === 0) {
    return room.view?.id === viewId ? [room] : null;
  }

  const matchingVariants = variants.filter(
    (variant) => variant.view?.id === viewId,
  );
  return matchingVariants.length > 0 ? matchingVariants : null;
}

function hasSelectedView(room: Room, viewId: number): boolean {
  return getMatchingViewVariants(room, viewId) !== null;
}

function normalizeVariantMinPrice(variants: Room[]): number | null {
  const prices = variants
    .map((variant) => variant.min_price)
    .filter((price): price is number => price !== null && price !== undefined);

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

/** Оставляет только варианты с нужным view (API: view только у beds/SearchResource). */
function narrowRoomByView(room: Room, viewId: number): Room | null {
  const matchingVariants = getMatchingViewVariants(room, viewId);
  if (!matchingVariants) {
    return null;
  }

  const variants = room.room_type_codes;
  if (
    !variants ||
    variants.length === 0 ||
    matchingVariants.length === variants.length
  ) {
    return room;
  }

  const primaryVariant = matchingVariants[0];
  return {
    ...room,
    room_type_code: primaryVariant?.room_type_code ?? room.room_type_code,
    view: primaryVariant?.view ?? null,
    bed: primaryVariant?.bed ?? null,
    balcony: primaryVariant?.balcony ?? null,
    min_price: normalizeVariantMinPrice(matchingVariants) ?? room.min_price,
    room_type_codes: matchingVariants,
  };
}

function applyViewFilter(
  room: Room,
  activeView: number,
  serverViewFilters: boolean,
): Room | null {
  if (!activeView) {
    return room;
  }

  if (serverViewFilters) {
    return narrowRoomByView(room, activeView);
  }

  return hasSelectedView(room, activeView) ? room : null;
}

export interface FilteredRoomCard {
  room: Room;
  cardIdx: number;
}

export function useRoomFilters(filters: Ref<SearchFilters | undefined>) {
  const selectedView = ref<number>(0);

  const viewOptions = computed(() =>
    addAllOption(filters.value?.views, VIEW_OPTIONS, "Вид из окна"),
  );

  const filterRoomList = (rooms: Room[] | null | undefined): Room[] => {
    if (!rooms?.length) return [];

    const activeView = selectedView.value;
    if (!activeView) {
      return rooms;
    }

    const serverViewFilters = usesServerViewFilters(filters.value);
    const result: Room[] = [];
    for (const room of rooms) {
      const filteredRoom = applyViewFilter(room, activeView, serverViewFilters);
      if (filteredRoom) {
        result.push(filteredRoom);
      }
    }
    return result;
  };

  const filterRoomListWithIndex = (
    rooms: Room[] | null | undefined,
  ): FilteredRoomCard[] => {
    if (!rooms?.length) return [];

    const activeView = selectedView.value;
    if (!activeView) {
      return rooms.map((room, cardIdx) => ({ room, cardIdx }));
    }

    const serverViewFilters = usesServerViewFilters(filters.value);
    const result: FilteredRoomCard[] = [];
    for (let cardIdx = 0; cardIdx < rooms.length; cardIdx++) {
      const filteredRoom = applyViewFilter(
        rooms[cardIdx],
        activeView,
        serverViewFilters,
      );
      if (filteredRoom) {
        result.push({ room: filteredRoom, cardIdx });
      }
    }
    return result;
  };

  watch(
    filters,
    () => {
      if (selectedView.value === 0) {
        return;
      }

      const viewExists = viewOptions.value.some(
        (option) => option.id === selectedView.value,
      );
      if (!viewExists) {
        selectedView.value = 0;
      }
    },
    { immediate: false },
  );

  return {
    selectedView,
    viewOptions,
    filterRoomList,
    filterRoomListWithIndex,
  };
}
