import type { Meta, StoryObj } from "@nuxtjs/storybook";

import Button from "./Button.vue";

type ButtonStoryArgs = {
  variant?: "primary" | "dark" | "ghost" | "danger" | "icon" | "text";
  size?: "m" | "l" | "xl" | "icon40";
  radius?: "default" | "round";
  round?: boolean;
  disabled?: boolean;
  unstyled?: boolean;
  type?: "button" | "submit" | "reset";
  label?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  iconSize?: number | string;
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
      options: ["primary", "dark", "ghost", "danger", "icon", "text"],
    },
    size: {
      control: "select",
      options: ["m", "l", "xl", "icon40"],
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
    icon: {
      control: "text",
      description: "Nuxt Icon name (e.g. i-arrow-back)",
    },
    iconPosition: {
      control: "radio",
      options: ["left", "right"],
    },
    iconSize: {
      control: "text",
      description: "Icon size in px (number) or CSS string",
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
    icon: "",
    iconPosition: "left",
    iconSize: "",
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

        <div style="display:flex; flex-direction:column; gap:12px;">
          <h3 style="margin:0;">icon</h3>
          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <Button variant="icon" size="icon40" aria-label="Подробнее о номере">
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
            <Button
              variant="icon"
              size="icon40"
              aria-label="Подробнее о номере"
              style="background-color:var(--a-primaryBg); border-color:var(--a-primaryBg); color:var(--a-white);"
            >
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
            <Button variant="icon" size="icon40" disabled aria-label="Подробнее о номере">
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
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

export const RoundButtonDefault: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => ({
    components: { Button },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; min-width:320px;">
        <h3 style="margin:0;">Round Button Default</h3>
        <div style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap;">
          <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
            <span style="font-size:12px; color:var(--a-text-light);">Default</span>
            <Button variant="icon" size="icon40" aria-label="Подробнее о номере">
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
            <span style="font-size:12px; color:var(--a-text-light);">Hover</span>
            <Button
              variant="icon"
              size="icon40"
              aria-label="Подробнее о номере"
              style="background-color:var(--a-primaryBg); border-color:var(--a-primaryBg); color:var(--a-white);"
            >
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; align-items:center;">
            <span style="font-size:12px; color:var(--a-text-light);">Disabled</span>
            <Button variant="icon" size="icon40" disabled aria-label="Подробнее о номере">
              <span
                aria-hidden="true"
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  width:14px;
                  height:14px;
                "
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 8"
                  style="display:block; width:14px; height:8px; color:currentColor;"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </Button>
          </div>
        </div>

      </div>
    `,
  }),
};

export const Text: Story = {
  parameters: {
    layout: "centered",
  },
  render: () => ({
    components: { Button },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; min-width:640px;">
        <h3 style="margin:0;">Text</h3>
        <div style="display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            <span style="font-size:12px; color:var(--a-text-light);">Default (left)</span>
            <Button variant="text" icon="i-arrow-back" icon-position="left" :icon-size="28">
              Назад к выбору номеров
            </Button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <span style="font-size:12px; color:var(--a-text-light);">Right icon</span>
            <Button variant="text" icon="i-arrow-back" icon-position="right" :icon-size="28">
              Назад к выбору номеров
            </Button>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <span style="font-size:12px; color:var(--a-text-light);">Disabled</span>
            <Button variant="text" icon="i-arrow-back" icon-position="left" :icon-size="28" disabled>
              Назад к выбору номеров
            </Button>
          </div>
        </div>
      </div>
    `,
  }),
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
