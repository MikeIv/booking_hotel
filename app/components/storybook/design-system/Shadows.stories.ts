import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemShadowsView from "./DesignSystemShadowsView.vue";

const meta = {
  title: "Дизайн система/Shadows",
  component: DesignSystemShadowsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemShadowsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Обзор: Story = {
  render: () => ({
    components: { DesignSystemShadowsView },
    template: "<DesignSystemShadowsView />",
  }),
};
