import { describe, it, expect } from "vitest";
import {
  pruneSelectedMultiRooms,
  pruneSelectedServicesByRoom,
  slimTariffForPersist,
} from "~/utils/bookingPersist";
import type { SelectedEntry } from "~/types/booking";

describe("bookingPersist", () => {
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
});
