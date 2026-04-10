import type { Meta, StoryObj } from "@nuxtjs/storybook";

import Booking from "~/components/booking/Booking.vue";

const meta = {
  title: "Composed Components/Booking Module",
  component: Booking,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    mode: {
      control: "select",
      options: ["home", "inner"],
    },
  },
  args: {
    mode: "home",
  },
} satisfies Meta<typeof Booking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    mode: "home",
  },
};

export const InnerPages: Story = {
  name: "Inner pages",
  args: {
    mode: "inner",
  },
};
