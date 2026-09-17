<script setup lang="ts">
  import { storeToRefs } from "pinia";

  const bookingStore = useBookingStore();
  const { loading, isServerRequest, loadingMessage } =
    storeToRefs(bookingStore);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="loading && isServerRequest"
      :class="$style.globalOverlay"
      role="status"
      aria-live="polite"
      :aria-label="loadingMessage"
    >
      <div :class="$style.spinnerContainer">
        <div :class="$style.spinner" aria-hidden="true">
          <span :class="$style.ring" />
          <span :class="[$style.ring, $style.ringInner]" />
        </div>
        <p :class="$style.loadingText">{{ loadingMessage }}</p>
      </div>
    </div>
  </Teleport>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .globalOverlay {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: z.z("modal", "content");
  }

  .spinnerContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: rem(16);
    padding: rem(18);
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

  .loadingText {
    margin: 0;
    text-align: center;
    font-family: var(--a-font-body);
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
