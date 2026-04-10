import type { Meta, StoryObj } from "@nuxtjs/storybook";

import Button from "./Button.vue";

type ButtonStoryArgs = {
  variant?: "primary" | "dark" | "ghost" | "danger";
  size?: "m" | "l" | "xl";
  radius?: "default" | "round";
  round?: boolean;
  disabled?: boolean;
  unstyled?: boolean;
  type?: "button" | "submit" | "reset";
  label?: string;
};

const meta = {
  title: "Simple Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "dark", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["m", "l", "xl"],
    },
    radius: {
      control: "select",
      options: ["default", "round"],
    },
    round: { control: "boolean" },
    disabled: { control: "boolean" },
    unstyled: { control: "boolean" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    label: {
      control: "text",
      description: "Button text content",
    },
  },
  args: {
    variant: "primary",
    size: "m",
    radius: "default",
    round: false,
    disabled: false,
    unstyled: false,
    type: "button",
    label: "Button",
  },
  render: (args: ButtonStoryArgs) => ({
    components: { Button },
    setup() {
      const { label = "Button", ...rest } = args;
      return { rest, label };
    },
    template: '<Button v-bind="rest">{{ label }}</Button>',
  }),
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => ({
    components: { Button },
    setup() {
      const variants: Array<ButtonStoryArgs["variant"]> = [
        "primary",
        "dark",
        "ghost",
        "danger",
      ];
      const sizes: Array<ButtonStoryArgs["size"]> = ["m", "l", "xl"];

      return { variants, sizes };
    },
    template: `
      <div style="display:flex; flex-direction:column; gap:24px; min-width:1000px;">
        <div v-for="variant in variants" :key="variant" style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="margin:0; text-transform:capitalize;">{{ variant }}</h3>
          <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
            <Button
              v-for="size in sizes"
              :key="\`\${variant}-default-\${size}\`"
              :variant="variant"
              :size="size"
            >
              {{ size === 'xl' ? 'Search' : 'Continue' }}
            </Button>

            <Button :variant="variant" size="l" radius="round">Rounded</Button>
            <Button :variant="variant" size="l" disabled>Disabled</Button>
            <Button :variant="variant" size="l" type="submit">Submit</Button>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Primary: Story = {
  args: { variant: "primary", size: "m", label: "Continue" },
};

export const Dark: Story = {
  args: { variant: "dark", size: "m", label: "Continue" },
};

export const Ghost: Story = {
  args: { variant: "ghost", size: "m", label: "Continue" },
};

export const Danger: Story = {
  args: { variant: "danger", size: "m", label: "Continue" },
};

export const Rounded: Story = {
  args: { variant: "primary", radius: "round", label: "Rounded" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true, label: "Disabled" },
};

export const Large: Story = {
  args: { variant: "primary", size: "l", label: "Continue" },
};

export const ExtraLarge: Story = {
  args: { variant: "primary", size: "xl", label: "Search" },
};

export const Playground: Story = {
  args: {
    variant: "primary",
    size: "m",
    radius: "default",
    round: false,
    disabled: false,
    unstyled: false,
    type: "button",
    label: "Edit in Controls",
  },
};
