import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemShadowsView from "./DesignSystemShadowsView.vue";

const meta = {
  title: "Design System/Shadows",
  component: DesignSystemShadowsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemShadowsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => ({
    components: { DesignSystemShadowsView },
    template: "<DesignSystemShadowsView />",
  }),
};
