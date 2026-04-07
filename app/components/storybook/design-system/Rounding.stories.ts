import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemRoundingView from "./DesignSystemRoundingView.vue";

const meta = {
  title: "Дизайн система/Rounding",
  component: DesignSystemRoundingView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemRoundingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemRoundingView },
    template: "<DesignSystemRoundingView />",
  }),
};
