import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import Tabs from "./Tabs.vue";

type TabsItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

type TabsStoryArgs = {
  ariaLabel: string;
  mode: "tariff" | "personal";
  items: TabsItem[];
  modelValue: string;
};

const tariffItems: TabsItem[] = [
  { label: "Все тарифы", value: "all" },
  { label: "Базовый", value: "basic" },
  { label: "Предоплатный", value: "prepaid" },
];

const personalItems: TabsItem[] = [
  { label: "Для себя", value: "self" },
  { label: "Для другого", value: "other" },
];

const meta = {
  title: "Simple Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["tariff", "personal"],
    },
    ariaLabel: {
      control: "text",
    },
    modelValue: {
      control: "text",
    },
  },
  args: {
    ariaLabel: "Табы",
    mode: "tariff",
    items: tariffItems,
    modelValue: "all",
  },
  render: (args: TabsStoryArgs) => ({
    components: { Tabs },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 940px; max-width: 100%;">
        <Tabs
          v-model="value"
          :items="args.items"
          :aria-label="args.ariaLabel"
          :mode="args.mode"
        />
      </div>
    `,
  }),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TariffTabs: Story = {
  args: {
    ariaLabel: "Фильтры тарифов",
    mode: "tariff",
    items: tariffItems,
    modelValue: "all",
  },
};

export const PersonalTabs: Story = {
  args: {
    ariaLabel: "Кто оформляет бронирование",
    mode: "personal",
    items: personalItems,
    modelValue: "self",
  },
  render: (args: TabsStoryArgs) => ({
    components: { Tabs },
    setup() {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 940px; max-width: 100%;">
        <Tabs
          v-model="value"
          :items="args.items"
          :aria-label="args.ariaLabel"
          :mode="args.mode"
        />
      </div>
    `,
  }),
};

export const DisabledState: Story = {
  args: {
    ariaLabel: "Фильтры тарифов",
    mode: "tariff",
    items: [
      { label: "Все тарифы", value: "all" },
      { label: "Базовый", value: "basic" },
      { label: "Недоступно", value: "disabled", disabled: true },
    ],
    modelValue: "basic",
  },
};
