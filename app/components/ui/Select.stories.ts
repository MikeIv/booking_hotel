import type { Meta, StoryObj } from "@nuxtjs/storybook";

import Select from "./Select.vue";

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
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    open: { control: "boolean" },
  },
  args: {
    label: "Гости",
    valueText: "1 номер, 1 взр., 0 дет.",
    iconName: "i-chevron-down",
    disabled: false,
    invalid: false,
    open: false,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderWithBox = (args: Story["args"]) => ({
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
        :disabled="args.disabled"
        :invalid="args.invalid"
        :open="args.open"
      />
    </div>
  `,
});

export const Default: Story = {
  render: renderWithBox,
};

export const HoverFocus: Story = {
  args: {
    label: "Гости",
    valueText: "2 взрослых, 0 детей",
  },
  render: renderWithBox,
};

export const Disabled: Story = {
  args: {
    label: "Гости",
    valueText: "1 номер, 1 взр., 0 дет.",
    disabled: true,
  },
  render: renderWithBox,
};

export const Error: Story = {
  args: {
    label: "Гости",
    valueText: "1 номер, 1 взр., 0 дет.",
    invalid: true,
  },
  render: renderWithBox,
};

export const Playground: Story = {
  render: renderWithBox,
};
