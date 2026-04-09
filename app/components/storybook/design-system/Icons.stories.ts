import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemIconsView from "./DesignSystemIconsView.vue";

const meta = {
  title: "Design System/Icons",
  component: DesignSystemIconsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemIconsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => ({
    components: { DesignSystemIconsView },
    template: "<DesignSystemIconsView />",
  }),
};
