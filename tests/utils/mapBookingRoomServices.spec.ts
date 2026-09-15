import { describe, it, expect } from "vitest";
import {
  parseBookingRoomService,
  pruneSelectedServicesByAvailableCodes,
  selectedServicesByRoomFromBookingRooms,
} from "~/utils/mapBookingRoomServices";

describe("mapBookingRoomServices", () => {
  it("parseBookingRoomService: строка даёт packageCode и hash-id", () => {
    const parsed = parseBookingRoomService("BREAKFAST", 1);
    expect(parsed?.packageCode).toBe("BREAKFAST");
    expect(parsed?.title).toBe("BREAKFAST");
    expect(parsed?.id).toBeGreaterThan(0);
  });

  it("parseBookingRoomService: id = hash(package_code), а не id API", () => {
    const fromApiId = parseBookingRoomService(
      {
        id: 999,
        package_code: "TRANSFER",
        title: "Трансфер",
        price: 1000,
      },
      1,
    );
    const fromCodeOnly = parseBookingRoomService(
      {
        package_code: "TRANSFER",
        title: "Трансфер",
        price: 1000,
      },
      2,
    );
    expect(fromApiId?.id).toBe(fromCodeOnly?.id);
    expect(fromApiId?.id).not.toBe(999);
  });

  it("pruneSelectedServicesByAvailableCodes: пустой availableCodes не трогает выбор", () => {
    const selected = {
      "0": [
        {
          id: 1,
          title: "Трансфер",
          price: 1000,
          packageCode: "TRANSFER",
        },
      ],
    };
    expect(pruneSelectedServicesByAvailableCodes(selected, new Set())).toEqual(
      selected,
    );
  });

  it("pruneSelectedServicesByAvailableCodes: оставляет только доступные коды", () => {
    const selected = {
      "0": [
        {
          id: 1,
          title: "Трансфер",
          price: 1000,
          packageCode: "TRANSFER",
        },
        {
          id: 2,
          title: "Завтрак",
          price: 800,
          packageCode: "BREAKFAST",
        },
      ],
    };
    const pruned = pruneSelectedServicesByAvailableCodes(
      selected,
      new Set(["TRANSFER"]),
    );
    expect(pruned["0"]?.map((s) => s.packageCode)).toEqual(["TRANSFER"]);
  });

  it("selectedServicesByRoomFromBookingRooms: строковые ключи и packageCode", () => {
    const byRoom = selectedServicesByRoomFromBookingRooms([
      {
        packages: [{ package_code: "TRANSFER", title: "Трансфер", price: 1 }],
      },
    ]);
    expect(Object.keys(byRoom)).toEqual(["0"]);
    expect(byRoom["0"]?.[0]?.packageCode).toBe("TRANSFER");
  });
});
