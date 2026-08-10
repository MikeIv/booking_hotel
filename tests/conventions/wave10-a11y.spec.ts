import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import OptionSelect from "~/components/ui/OptionSelect.vue";

const LABEL_TARGETS = [
  "app/components/booking/LoginPopup.vue",
  "app/components/booking/RegisterPopup.vue",
  "app/components/booking/MyBookingPopup.vue",
  "app/components/booking/confirmation/ChangeContactsPopup.vue",
  "app/components/booking/GuestFormFields.vue",
] as const;

function read(relativePath: string) {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Wave 10: field labels", () => {
  it.each(LABEL_TARGETS)("%s содержит метки полей", (relativePath) => {
    const source = read(relativePath);
    const hasLabelTag = /<label\b/.test(source);
    const hasAriaLabelBinding =
      /:aria-label=/.test(source) || /aria-label=/.test(source);
    expect(hasLabelTag || hasAriaLabelBinding).toBe(true);
  });
});

describe("Wave 10: OptionSelect roles", () => {
  it("меню использует listbox/option", async () => {
    const wrapper = mount(OptionSelect, {
      props: {
        modelValue: "ru",
        placeholder: "Страна",
        options: [
          { label: "Россия", value: "ru" },
          { label: "Украина", value: "ua" },
        ],
      },
      global: {
        stubs: {
          UiSelect: {
            template:
              '<button type="button" data-testid="trigger" @click="$emit(\'click\', $event)"><slot /></button>',
            emits: ["click"],
          },
        },
      },
    });

    await wrapper.find('[data-testid="trigger"]').trigger("click");
    const listbox = wrapper.find('[role="listbox"]');
    expect(listbox.exists()).toBe(true);
    const options = wrapper.findAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].attributes("aria-selected")).toBe("true");
  });
});

describe("Wave 10: meaningful image alt", () => {
  it("TemporarySlider без пустого alt", () => {
    const source = read("app/components/main/TemporarySlider.vue");
    expect(source).not.toMatch(/alt=""/);
    expect(source).toMatch(/:alt=/);
  });

  it("AdvantageSection без пустого alt", () => {
    const source = read("app/components/main/AdvantageSection.vue");
    expect(source).not.toMatch(/alt=""/);
    expect(source).toMatch(/:alt=/);
  });
});
