import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import OptionSelect from "./OptionSelect.vue";

const countryOptions = [
  { label: "Россия", value: "Россия" },
  { label: "Казахстан", value: "Казахстан" },
  { label: "Беларусь", value: "Беларусь" },
  { label: "Армения", value: "Армения" },
];

const timeOptions = [
  { label: "00:00", value: "00:00" },
  { label: "04:00", value: "04:00" },
  { label: "08:00", value: "08:00" },
  { label: "12:00", value: "12:00" },
  { label: "16:00", value: "16:00" },
  { label: "20:00", value: "20:00" },
];

const meta = {
  title: "Simple Components/Option Select",
  component: OptionSelect,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    modelValue: { control: "text" },
    placeholder: { control: "text" },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    variant: { control: "radio", options: ["default", "booking", "personal"] },
  },
  args: {
    modelValue: "",
    placeholder: "Выберите значение",
    invalid: false,
    disabled: false,
    variant: "personal",
  },
} satisfies Meta<typeof OptionSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Citizenship: Story = {
  render: (args) => ({
    components: { OptionSelect },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value, countryOptions };
    },
    template: `
      <div style="width: 482px;">
        <OptionSelect
          v-model="value"
          :options="countryOptions"
          placeholder="Гражданство"
          :invalid="args.invalid"
          :disabled="args.disabled"
          :variant="args.variant"
        />
      </div>
    `,
  }),
};

export const TimeRange: Story = {
  render: (args) => ({
    components: { OptionSelect },
    setup() {
      const checkIn = ref("");
      const checkOut = ref("");
      return { args, checkIn, checkOut, timeOptions };
    },
    template: `
      <div style="width: 1023px; max-width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <OptionSelect
          v-model="checkIn"
          :options="timeOptions"
          placeholder="Время заезда"
          :invalid="args.invalid"
          :disabled="args.disabled"
          :variant="args.variant"
        />
        <OptionSelect
          v-model="checkOut"
          :options="timeOptions"
          placeholder="Время выезда"
          :invalid="args.invalid"
          :disabled="args.disabled"
          :variant="args.variant"
        />
      </div>
    `,
  }),
};

export const PersonalSelectStates: Story = {
  render: () => ({
    components: { OptionSelect },
    setup() {
      const defaultValue = ref("");
      const warningValue = ref("");
      const disabledValue = ref("Россия");
      return { defaultValue, warningValue, disabledValue, countryOptions };
    },
    template: `
      <div style="width: 482px; display:flex; flex-direction:column; gap:16px;">
        <OptionSelect v-model="defaultValue" :options="countryOptions" placeholder="Гражданство" variant="personal" />
        <OptionSelect v-model="warningValue" :options="countryOptions" placeholder="Гражданство (warning)" variant="personal" :invalid="true" />
        <OptionSelect v-model="disabledValue" :options="countryOptions" placeholder="Гражданство (disabled)" variant="personal" :disabled="true" />
      </div>
    `,
  }),
};
