import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import FilterSelect from "./FilterSelect.vue";
import Select from "./Select.vue";
import { FILTER_VIEW_OPTIONS } from "./selectStoryOptions";

const meta = {
  title: "Simple Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: { control: "text" },
    valueText: { control: "text" },
    iconName: { control: "text" },
    variant: { control: "radio", options: ["default", "booking", "personal"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    open: { control: "boolean" },
  },
  args: {
    label: "",
    valueText: "",
    iconName: "i-chevron-down",
    variant: "default",
    disabled: false,
    invalid: false,
    open: false,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderBookingSelect = (args: Story["args"]) => ({
  components: { Select },
  setup() {
    return { args };
  },
  template: `
    <div style="width: 368px;">
      <Select
        :label="args.label"
        :value-text="args.valueText"
        :icon-name="args.iconName"
        :variant="args.variant"
        :disabled="args.disabled"
        :invalid="args.invalid"
        :open="args.open"
      />
    </div>
  `,
});

/** Один фильтр «вид из окна», как на странице номеров */
export const Default: Story = {
  render: () => ({
    components: { FilterSelect },
    setup() {
      const model = ref(0);
      return {
        model,
        options: FILTER_VIEW_OPTIONS,
      };
    },
    template: `
      <div style="width: 368px;">
        <FilterSelect
          v-model="model"
          :options="options"
          option-label="title"
          option-value="id"
          placeholder="Вид из окна"
        />
      </div>
    `,
  }),
};

/** Триггер «как селект» в модуле брони (даты / гости) — не FilterSelect */
export const BookingSpecialCase: Story = {
  name: "Booking Special Case",
  args: {
    label: "Гости",
    valueText: "2 взрослых, 0 детей",
    iconName: "i-chevron-down-select",
    variant: "booking",
  },
  render: renderBookingSelect,
};

export const Form: Story = {
  name: "Form",
  args: {
    label: "",
    valueText: "",
    iconName: "i-chevron-down-select",
    variant: "personal",
  },
  render: (args) => ({
    components: { Select },
    setup() {
      return { args };
    },
    template: `
      <div style="width: 482px; display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Default</span>
          <Select
            :label="args.label"
            :value-text="args.valueText"
            placeholder="Время заезда"
            :icon-name="args.iconName"
            :variant="args.variant"
            :disabled="false"
            :invalid="false"
            :open="false"
          />
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Warning</span>
          <Select
            :label="args.label"
            :value-text="args.valueText"
            placeholder="Время заезда"
            :icon-name="args.iconName"
            :variant="args.variant"
            :disabled="false"
            :invalid="true"
            :open="false"
          />
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Disabled</span>
          <Select
            :label="args.label"
            value-text="Россия"
            placeholder="Время заезда"
            :icon-name="args.iconName"
            :variant="args.variant"
            :disabled="true"
            :invalid="false"
            :open="false"
          />
        </div>
      </div>
    `,
  }),
};
