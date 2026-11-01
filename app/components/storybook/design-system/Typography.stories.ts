import type { Meta, StoryObj } from "@nuxtjs/storybook";

import DesignSystemTypographyView from "./DesignSystemTypographyView.vue";

const meta = {
  title: "Design System/Typography",
  component: DesignSystemTypographyView,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DesignSystemTypographyView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => ({
    components: { DesignSystemTypographyView },
    template: "<DesignSystemTypographyView />",
  }),
};
