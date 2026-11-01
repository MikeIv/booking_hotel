import { describe, it, expect } from "vitest";
import {
  findUniqueRemovedRoomIdx,
  pruneSelectedMultiRooms,
  pruneSelectedServicesByRoom,
  remapSelectedMultiRoomsAfterRemoval,
  shrinkMultiSelections,
  slimTariffForPersist,
} from "~/utils/bookingPersist";
import type { SelectedEntry } from "~/types/booking";

describe("bookingPersist", () => {
  const entries: Record<string, SelectedEntry> = {
    "0-0": {
      roomIdx: 0,
      roomCardIdx: 0,
      roomTitle: "A",
      room_type_code: "A",
      ratePlanCode: "BAR",
      price: 1000,
      title: "BAR",
    },
    "1-1": {
      roomIdx: 1,
      roomCardIdx: 1,
      roomTitle: "B",
      room_type_code: "B",
      ratePlanCode: "BAR",
      price: 2000,
      title: "BAR",
    },
  };

  describe("slimTariffForPersist", () => {
    it("убирает description и cancellation_popover", () => {
      const slim = slimTariffForPersist({
        rate_plan_code: "BAR",
        title: "Flexible",
        price: 1000,
        packages: [],
        description: "<p>huge html</p>",
        cancellation_popover: { title: "x", description: "y" },
      });

      expect(slim).toEqual({
        rate_plan_code: "BAR",
        title: "Flexible",
        price: 1000,
        packages: [],
      });
      expect(slim).not.toHaveProperty("description");
      expect(slim).not.toHaveProperty("cancellation_popover");
    });

    it("null → null", () => {
      expect(slimTariffForPersist(null)).toBeNull();
    });
  });

  describe("pruneSelectedMultiRooms", () => {
    it("при roomCount ≤ 1 очищает всё", () => {
      expect(pruneSelectedMultiRooms(entries, 1)).toEqual({});
    });

    it("оставляет только roomIdx < roomCount", () => {
      expect(Object.keys(pruneSelectedMultiRooms(entries, 2))).toEqual([
        "0-0",
        "1-1",
      ]);
      const trimmed = pruneSelectedMultiRooms(
        {
          ...entries,
          "2-2": { ...entries["1-1"]!, roomIdx: 2, roomCardIdx: 2 },
        },
        2,
      );
      expect(Object.keys(trimmed)).toEqual(["0-0", "1-1"]);
    });
  });

  describe("pruneSelectedServicesByRoom", () => {
    it("single: оставляет только ключ 0", () => {
      expect(
        pruneSelectedServicesByRoom(
          {
            "0": [{ id: 1 }],
            "1": [{ id: 2 }],
          },
          1,
        ),
      ).toEqual({ "0": [{ id: 1 }] });
    });

    it("multi: режет ключи >= roomCount", () => {
      expect(
        pruneSelectedServicesByRoom(
          {
            "0": [{ id: 1 }],
            "1": [{ id: 2 }],
            "2": [{ id: 3 }],
          },
          2,
        ),
      ).toEqual({
        "0": [{ id: 1 }],
        "1": [{ id: 2 }],
      });
    });
  });

  describe("shrink helpers", () => {
    it("findUniqueRemovedRoomIdx находит середину", () => {
      const prev = [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 2, children: 0, childrenAges: [] },
        { adults: 1, children: 1, childrenAges: [3] },
      ];
      const next = [
        { adults: 1, children: 0, childrenAges: [] },
        { adults: 1, children: 1, childrenAges: [3] },
      ];
      expect(findUniqueRemovedRoomIdx(prev, next)).toBe(1);
    });

    it("findUniqueRemovedRoomIdx: одинаковые слоты → null", () => {
      const slot = { adults: 1, children: 0, childrenAges: [] };
      expect(
        findUniqueRemovedRoomIdx([slot, slot, slot], [slot, slot]),
      ).toBeNull();
    });

    it("remapSelectedMultiRoomsAfterRemoval сдвигает roomIdx", () => {
      const remapped = remapSelectedMultiRoomsAfterRemoval(
        {
          "0-0": { ...entries["0-0"]! },
          "1-1": { ...entries["1-1"]! },
        },
        0,
      );
      expect(remapped["0-0"]).toBeUndefined();
      expect(remapped["1-0"]?.roomIdx).toBe(0);
      expect(remapped["1-0"]?.roomTitle).toBe("B");
    });

    it("shrinkMultiSelections: bulk trailing → prune", () => {
      const slot = { adults: 1, children: 0, childrenAges: [] };
      const result = shrinkMultiSelections(
        entries,
        { "0": [{ id: 1 }], "1": [{ id: 2 }] },
        [slot, slot, slot, slot],
        [slot, slot],
      );
      expect(Object.keys(result.selectedMultiRooms)).toEqual(["0-0", "1-1"]);
      expect(result.selectedServicesByRoom).toEqual({
        "0": [{ id: 1 }],
        "1": [{ id: 2 }],
      });
    });

    it("shrinkMultiSelections: неоднозначный 3→2 → wipe", () => {
      const slot = { adults: 1, children: 0, childrenAges: [] };
      const result = shrinkMultiSelections(
        entries,
        { "0": [{ id: 1 }] },
        [slot, slot, slot],
        [slot, slot],
      );
      expect(result.selectedMultiRooms).toEqual({});
      expect(result.selectedServicesByRoom).toEqual({});
    });

    it("shrinkMultiSelections: hint trailingShrink → prune 3→2", () => {
      const slot = { adults: 1, children: 0, childrenAges: [] };
      const result = shrinkMultiSelections(
        entries,
        { "0": [{ id: 1 }], "1": [{ id: 2 }] },
        [slot, slot, slot],
        [slot, slot],
        { trailingShrink: true },
      );
      expect(Object.keys(result.selectedMultiRooms)).toEqual(["0-0", "1-1"]);
    });

    it("shrinkMultiSelections: hint removedRoomIdx → remap", () => {
      const slot = { adults: 1, children: 0, childrenAges: [] };
      const result = shrinkMultiSelections(
        entries,
        {},
        [slot, slot, slot],
        [slot, slot],
        { removedRoomIdx: 0 },
      );
      expect(result.selectedMultiRooms["0-0"]).toBeUndefined();
      expect(result.selectedMultiRooms["1-0"]?.roomIdx).toBe(0);
    });
  });
});
