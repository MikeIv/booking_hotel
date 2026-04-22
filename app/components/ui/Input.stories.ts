import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import Input from "./Input.vue";

const meta = {
  title: "Simple Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    modelValue: { control: "text" },
    variant: { control: "radio", options: ["default", "booking", "personal"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  args: {
    label: "Специальный код",
    placeholder: "Введите код",
    modelValue: "",
    variant: "default",
    disabled: false,
    invalid: false,
    readonly: false,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value };
    },
    template: `
      <div style="width: 368px;">
        <Input
          v-model="value"
          :label="args.label"
          :placeholder="args.placeholder"
          :variant="args.variant"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :readonly="args.readonly"
        />
      </div>
    `,
  }),
};

export const Default: Story = {
  args: {
    label: "Специальный код",
    modelValue: "",
    placeholder: "Введите код",
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value };
    },
    template:
      '<div style="width:368px;"><Input v-model="value" :label="args.label" :placeholder="args.placeholder" /></div>',
  }),
};

export const Filled: Story = {
  args: {
    label: "Специальный код",
    modelValue: "WELCOME",
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value };
    },
    template:
      '<div style="width:368px;"><Input v-model="value" :label="args.label" /></div>',
  }),
};

export const Disabled: Story = {
  args: {
    label: "Специальный код",
    modelValue: "PROMO",
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    label: "Специальный код",
    modelValue: "INVALID",
    invalid: true,
  },
};

export const BookingSpecialCase: Story = {
  args: {
    label: "Специальный код",
    modelValue: "RUSSIA",
    placeholder: "",
    variant: "booking",
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value };
    },
    template:
      '<div style="width:368px;"><Input v-model="value" :label="args.label" :placeholder="args.placeholder" :variant="args.variant" /></div>',
  }),
};

export const Form: Story = {
  render: () => ({
    components: { Input },
    template: `
      <div style="width: 482px; display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Default</span>
          <Input model-value="" placeholder="Фамилия" variant="personal" />
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Warning</span>
          <Input model-value="" placeholder="Фамилия (warning)" variant="personal" :invalid="true" />
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <span style="font-size:14px; color:#6B6B6B;">Disabled</span>
          <Input model-value="Иванов" placeholder="Фамилия (disabled)" variant="personal" :disabled="true" />
        </div>
      </div>
    `,
  }),
};
