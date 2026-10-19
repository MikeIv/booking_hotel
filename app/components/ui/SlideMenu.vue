<script setup lang="ts">
  import { gsap } from "gsap";

  const props = withDefaults(
    defineProps<{
      isOpen: boolean;
      label?: string;
    }>(),
    { label: "Меню" },
  );

  const emit = defineEmits<{
    close: [];
  }>();

  const closeBtnRef = ref<HTMLButtonElement | null>(null);
  let previouslyFocused: HTMLElement | null = null;

  const close = () => {
    emit("close");
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };

  const lockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "";
  };

  const fadeIn = (el: Element, done: () => void) => {
    gsap.fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power1.out", onComplete: done },
    );
  };

  const fadeOut = (el: Element, done: () => void) => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.25,
      ease: "power1.in",
      onComplete: done,
    });
  };

  const slideIn = (el: Element, done: () => void) => {
    gsap.fromTo(
      el,
      { xPercent: -100 },
      { xPercent: 0, duration: 0.55, ease: "power3.out", onComplete: done },
    );
  };

  const slideOut = (el: Element, done: () => void) => {
    gsap.to(el, {
      xPercent: -100,
      duration: 0.45,
      ease: "power2.in",
      onComplete: done,
    });
  };

  watch(
    () => props.isOpen,
    async (open) => {
      if (typeof document === "undefined") return;

      if (open) {
        previouslyFocused =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        document.addEventListener("keydown", onKeydown);
        lockScroll();
        await nextTick();
        closeBtnRef.value?.focus();
        return;
      }

      document.removeEventListener("keydown", onKeydown);
      unlockScroll();
      previouslyFocused?.focus();
      previouslyFocused = null;
    },
    { immediate: true },
  );

  onUnmounted(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", onKeydown);
    }
    unlockScroll();
  });
</script>

<template>
  <div :class="$style.root">
    <Transition :css="false" @enter="fadeIn" @leave="fadeOut">
      <div
        v-if="isOpen"
        :class="$style.overlay"
        data-testid="slide-menu-overlay"
        @click="close"
      />
    </Transition>

    <Transition :css="false" @enter="slideIn" @leave="slideOut">
      <div
        v-if="isOpen"
        :class="$style.panel"
        role="dialog"
        aria-modal="true"
        :aria-label="label"
        data-testid="slide-menu-panel"
      >
        <button
          ref="closeBtnRef"
          type="button"
          :class="$style.closeBtn"
          aria-label="Закрыть меню"
          data-testid="slide-menu-close"
          @click="close"
        >
          <UIcon name="i-close" :class="$style.closeIcon" />
        </button>
        <div :class="$style.content">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;
  @use "~/assets/styles/variables/resolutions" as size;

  .root {
    position: fixed;
    inset: 0;
    z-index: z.z("modal", "nav-menu");
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    pointer-events: auto;
  }

  /* Левая шторка: размеры и фон — как nav.hamburger старого сайта */
  .panel {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    width: min(100%, rem(375));
    padding: rem(90) var(--ds-space-300) var(--ds-space-600);
    background-color: var(--ds-primary-500);
    color: var(--a-white);
    overflow-x: hidden;
    overflow-y: auto;
    pointer-events: auto;
    will-change: transform;

    @media (min-width: #{size.$tabletMin}) {
      padding-top: rem(70);
    }
  }

  .closeBtn {
    position: absolute;
    top: rem(16);
    right: rem(16);
    z-index: z.z("default");
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(44);
    height: rem(44);
    padding: 0;
    background: transparent;
    border: none;
    color: var(--a-white);
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: rem(1) solid var(--a-white);
      outline-offset: rem(2);
    }
  }

  .closeIcon {
    width: rem(24);
    height: rem(24);
  }

  .content {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
