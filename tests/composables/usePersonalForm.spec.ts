import { describe, it, expect } from "vitest";
import {
  usePersonalForm,
  type FormErrors,
  type GuestData,
  type PersonalFormData,
} from "~/composables/usePersonalForm";

function guest(overrides: Partial<GuestData> = {}): GuestData {
  return {
    lastName: "Иванов",
    firstName: "Иван",
    middleName: "",
    phone: "+79001234567",
    email: "ivan@example.com",
    citizenship: "Россия",
    ...overrides,
  };
}

function emptyErrors(): FormErrors {
  return {
    mainGuest: {},
    additionalGuests: [],
    roomGuests: {},
    agreement: "",
  };
}

describe("usePersonalForm.validateForm", () => {
  const { createFormData, createRoomGuestData, validateForm } =
    usePersonalForm();

  it("multi additional: phone/email optional как в single", () => {
    const formData: PersonalFormData = {
      ...createFormData(),
      agreement: true,
      roomGuests: {
        0: {
          mainGuest: guest(),
          additionalGuests: [guest({ phone: "", email: "" })],
        },
      },
    };
    const errors = emptyErrors();

    expect(validateForm(formData, errors, true)).toBe(true);
    expect(errors.roomGuests[0]?.additionalGuests[0]).toBeUndefined();
  });

  it("multi additional: невалидный phone при заполнении — ошибка", () => {
    const formData: PersonalFormData = {
      ...createFormData(),
      agreement: true,
      roomGuests: {
        0: {
          ...createRoomGuestData(),
          mainGuest: guest(),
          additionalGuests: [guest({ phone: "123", email: "" })],
        },
      },
    };
    const errors = emptyErrors();

    expect(validateForm(formData, errors, true)).toBe(false);
    expect(errors.roomGuests[0]?.additionalGuests[0]?.phone).toBeTruthy();
  });

  it("single additional: пустые phone/email валидны", () => {
    const formData: PersonalFormData = {
      ...createFormData(),
      agreement: true,
      mainGuest: guest(),
      additionalGuests: [guest({ phone: "", email: "" })],
    };
    const errors = emptyErrors();

    expect(validateForm(formData, errors, false)).toBe(true);
  });
});
