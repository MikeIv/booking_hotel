import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemColorsView from "./DesignSystemColorsView.vue";

const meta = {
  title: "Design System/Colors",
  component: DesignSystemColorsView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemColorsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => ({
    components: { DesignSystemColorsView },
    template: "<DesignSystemColorsView />",
  }),
};
