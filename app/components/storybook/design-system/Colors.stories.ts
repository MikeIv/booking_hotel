import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemColorsView from "./DesignSystemColorsView.vue";

const meta = {
  title: "Дизайн система/Цвета",
  component: DesignSystemColorsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemColorsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemColorsView },
    template: "<DesignSystemColorsView />",
  }),
};
