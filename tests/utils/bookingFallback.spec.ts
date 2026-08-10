import { describe, it, expect } from "vitest";
import { buildBookingContactFallback } from "~/utils/bookingFallback";
import type { BookingResponse } from "~/types/booking";
import type { User } from "~/stores/auth";

describe("buildBookingContactFallback", () => {
  it("строит форму из order и главного гостя", () => {
    const booking = {
      order: { name: "Иван", surname: "Иванов", nationality: "RU" },
      rooms: [
        {
          guests: [
            {
              is_main: true,
              name: "Иван",
              surname: "Иванов",
              middle_name: "Иванович",
              phone: "+79001234567",
              email: "ivan@example.com",
            },
          ],
        },
      ],
    } as unknown as BookingResponse;

    const form = buildBookingContactFallback(booking, null);

    expect(form).toMatchObject({
      name: "Иван",
      surname: "Иванов",
      middle_name: "Иванович",
      phone: "+79001234567",
      email: "ivan@example.com",
      country: "RU",
    });
  });

  it("использует auth user при отсутствии данных бронирования", () => {
    const user = {
      name: "Пётр",
      surname: "Петров",
      middle_name: "Петрович",
      phone: "+79009876543",
      email: "petr@example.com",
      country: "RU",
    } as User;

    const form = buildBookingContactFallback(null, user);

    expect(form.name).toBe("Пётр");
    expect(form.surname).toBe("Петров");
    expect(form.email).toBe("petr@example.com");
  });

  it("выбирает первого гостя если главный не найден", () => {
    const booking = {
      order: { nationality: "" },
      rooms: [
        {
          guests: [
            {
              is_main: false,
              name: "Первый",
              email: "first@example.com",
              phone: "+79000000001",
            },
          ],
        },
      ],
    } as unknown as BookingResponse;

    const form = buildBookingContactFallback(booking, null);

    expect(form.name).toBe("Первый");
    expect(form.email).toBe("first@example.com");
  });
});
