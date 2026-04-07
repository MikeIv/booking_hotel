import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemSpacingView from "./DesignSystemSpacingView.vue";

const meta = {
  title: "Дизайн система/Grid & Spacing",
  component: DesignSystemSpacingView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemSpacingView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemSpacingView },
    template: "<DesignSystemSpacingView />",
  }),
};
