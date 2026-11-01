import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { ref } from "vue";

import Textarea from "./Textarea.vue";

const meta = {
  title: "Simple Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placeholder: { control: "text" },
    modelValue: { control: "text" },
    variant: { control: "radio", options: ["default", "personal"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    readonly: { control: "boolean" },
    rows: { control: "number" },
  },
  args: {
    placeholder: "Комментарий",
    modelValue: "",
    variant: "personal",
    disabled: false,
    invalid: false,
    readonly: false,
    rows: 3,
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref(args.modelValue || "");
      return { args, value };
    },
    template: `
      <div style="width: 1023px; max-width: 100%;">
        <Textarea
          v-model="value"
          :placeholder="args.placeholder"
          :variant="args.variant"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :readonly="args.readonly"
          :rows="args.rows"
        />
      </div>
    `,
  }),
};

export const PersonalComment: Story = {
  args: {
    placeholder: "Комментарий",
    variant: "personal",
    rows: 3,
  },
};
