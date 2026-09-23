<script setup lang="ts">
  import { gsap } from "gsap";

  interface SlideMenuLink {
    url: string;
    text: string;
  }

  const props = withDefaults(
    defineProps<{
      isOpen: boolean;
      links?: readonly SlideMenuLink[];
      topOffset?: number;
      backgroundColor?: string;
    }>(),
    {
      links: () => [],
      topOffset: 95,
      backgroundColor: "--a-mainBg",
    },
  );

  const menuStyles = computed(() => ({
    "--top-offset": `${props.topOffset}px`,
    "--bg-color": `var(${props.backgroundColor})`,
  }));

  const emit = defineEmits(["close"]);

  const closeMenu = () => {
    emit("close");
  };

  const enterAnimation = (el: Element, done: () => void) => {
    gsap.fromTo(
      el,
      { y: "-100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: done,
      },
    );
  };

  const leaveAnimation = (el: Element, done: () => void) => {
    gsap.fromTo(
      el,
      { y: "0%", opacity: 1 },
      {
        y: "-100%",
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: done,
      },
    );
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  };

  const lockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "hidden";
  };

  const unlockScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "";
  };

  watch(
    () => props.isOpen,
    (open) => {
      if (typeof document === "undefined") return;
      if (open) {
        document.addEventListener("keydown", onKeydown);
        lockScroll();
      } else {
        document.removeEventListener("keydown", onKeydown);
        unlockScroll();
      }
    },
  );

  onUnmounted(() => {
    if (typeof document !== "undefined") {
      document.removeEventListener("keydown", onKeydown);
    }
    unlockScroll();
  });

  const socialLinks = [
    {
      url: "https://t.me/ithumor",
      iconName: "i-telegram",
    },
    {
      url: "https://vk.com/feed",
      iconName: "i-vk",
    },
  ];
</script>

<template>
  <Transition
    name="slide"
    :css="false"
    @enter="enterAnimation"
    @leave="leaveAnimation"
  >
    <div
      v-if="isOpen"
      :class="$style.menuOverlay"
      :style="menuStyles"
      role="dialog"
      aria-modal="true"
      aria-label="Меню"
    >
      <button
        type="button"
        :class="$style.closeBtn"
        aria-label="Закрыть меню"
        @click="closeMenu"
      >
        <UIcon name="i-close" :class="$style.closeIcon" />
      </button>
      <div :class="$style.menuContent">
        <HeaderNavLinks :links="links" @link-click="handleLinkClick" />
        <slot name="utilities" />
        <CoreSocialLinks :links="socialLinks" direction="horizontal" />
      </div>
    </div>
  </Transition>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .menuOverlay {
    position: fixed;
    top: var(--top-offset);
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color, var(--a-whiteBg));
    z-index: z.z("modal", "nav-menu");
    overflow-x: hidden;
    overflow-y: auto;
    transform: translateY(-100%);
    will-change: transform;
  }

  .closeBtn {
    position: absolute;
    top: rem(16);
    right: rem(16);
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(44);
    height: rem(44);
    padding: 0;
    background: transparent;
    border: none;
    color: var(--secondary);
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }
  }

  .closeIcon {
    width: rem(24);
    height: rem(24);
  }

  .menuContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: rem(24);
    box-sizing: border-box;
    min-height: 100%;
    padding: rem(56) rem(32) rem(32);
  }
</style>
