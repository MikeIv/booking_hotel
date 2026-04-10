import type { Meta, StoryObj } from "@nuxtjs/storybook";
import { onUnmounted, watch } from "vue";

import Booking from "~/components/booking/Booking.vue";
import { useBookingStore } from "~/stores/booking";

const meta = {
  title: "Pages/Booking/Search",
  component: Booking,
  parameters: {
    layout: "fullscreen",
  },
  render: (args: { mode: "home" | "inner"; loading?: boolean }) => ({
    components: { Booking },
    setup() {
      const bookingStore = useBookingStore();
      watch(
        () => args.loading,
        (isLoading) => {
          bookingStore.setLoading(Boolean(isLoading));
        },
        { immediate: true },
      );
      onUnmounted(() => {
        bookingStore.setLoading(false);
      });
      return { args };
    },
    template: `
      <main style="padding: 40px 24px; background: var(--a-mainBg); min-height: 100vh;">
        <section style="max-width: 1560px; margin: 0 auto;">
          <Booking :mode="args.mode" />
        </section>
      </main>
    `,
  }),
} satisfies Meta<typeof Booking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomePage: Story = {
  args: {
    mode: "home",
  },
};

export const InnerPage: Story = {
  args: {
    mode: "inner",
  },
};

export const Loading: Story = {
  args: {
    mode: "home",
    loading: true,
  },
};
