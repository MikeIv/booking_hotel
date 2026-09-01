<script setup lang="ts">
  import {
    BOOKING_DEEP_LINK_LOADING_MESSAGE,
    BOOKING_DEEP_LINK_PENDING_KEY,
    getRouteQueryWithLocationFallback,
    shouldHoldDeepLinkSearchOverlay,
  } from "~/utils/bookingDeepLink";

  const ready = useState<boolean>("app-initial-load-ready", () => false);
  const deepLinkPending = useState<boolean>(
    BOOKING_DEEP_LINK_PENDING_KEY,
    () => false,
  );
  const route = useRoute();

  if (
    shouldHoldDeepLinkSearchOverlay(
      getRouteQueryWithLocationFallback(route.query),
      route.path,
    )
  ) {
    deepLinkPending.value = true;
  }

  const visible = computed(() => !ready.value || deepLinkPending.value);
  const label = computed(() =>
    deepLinkPending.value ? BOOKING_DEEP_LINK_LOADING_MESSAGE : "Загрузка",
  );

  onMounted(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Минимальное время показа, чтобы спиннер не мелькал на быстром соединении
          const minDisplayMs = 400;
          setTimeout(() => {
            ready.value = true;
          }, minDisplayMs);
        });
      });
    });
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="initial-loader-fade" mode="out-in">
      <div
        v-show="visible"
        :class="$style.overlay"
        role="status"
        aria-live="polite"
        :aria-label="label"
      >
        <div :class="$style.content">
          <div :class="$style.spinner" aria-hidden="true">
            <span :class="$style.ring" />
            <span :class="[$style.ring, $style.ringInner]" />
          </div>
          <p :class="$style.label">{{ label }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .overlay {
    position: fixed;
    inset: 0;
    z-index: z.z("modal", "overlay");
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--a-whiteBg);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(20);
  }

  .spinner {
    position: relative;
    width: rem(56);
    height: rem(56);
  }

  .ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border-style: solid;
    border-color: transparent;
    animation: spin 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }

  .ring {
    border-width: rem(3);
    border-top-color: var(--primary);
    border-right-color: var(--ui-color-primary-300);
  }

  .ringInner {
    inset: rem(8);
    border-width: rem(2);
    border-top-color: var(--a-btnAccentBg);
    border-right-color: var(--ui-color-accent-a30);
    animation-duration: 0.9s;
    animation-direction: reverse;
  }

  .label {
    margin: 0;
    font-family: var(--a-font-body);
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    letter-spacing: 0.02em;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  :global(.initial-loader-fade-leave-active) {
    transition: opacity 0.25s ease-out;
  }

  :global(.initial-loader-fade-leave-to) {
    opacity: 0;
  }
</style>
