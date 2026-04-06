import type { Meta, StoryObj } from "@nuxtjs/storybook";

import Button from "./Button.vue";

type ButtonStoryArgs = {
  variant?: "primary" | "dark" | "ghost" | "danger";
  round?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  label?: string;
};

const meta = {
  title: "Компоненты/Кнопка",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "dark", "ghost", "danger"],
    },
    round: { control: "boolean" },
    disabled: { control: "boolean" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    label: {
      control: "text",
      description: "Текст внутри кнопки (витрина)",
    },
  },
  args: {
    variant: "primary",
    round: false,
    disabled: false,
    type: "button",
    label: "Кнопка",
  },
  render: (args: ButtonStoryArgs) => ({
    components: { Button },
    setup() {
      const { label = "Кнопка", ...rest } = args;
      return { rest, label };
    },
    template: '<Button v-bind="rest">{{ label }}</Button>',
  }),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Основная: Story = {
  args: { variant: "primary", label: "Продолжить" },
};

export const Тёмная: Story = {
  args: { variant: "dark", label: "Тёмная" },
};

export const Контур: Story = {
  args: { variant: "ghost", label: "Контур" },
};

export const Акцент: Story = {
  args: { variant: "danger", label: "Отмена" },
};

export const Скруглённая: Story = {
  args: { variant: "primary", round: true, label: "Скругление dialog" },
};

export const Отключена: Story = {
  args: { variant: "primary", disabled: true, label: "Недоступна" },
};

export const Песочница: Story = {
  args: {
    variant: "primary",
    round: false,
    disabled: false,
    type: "button",
    label: "Измените в Controls",
  },
};
