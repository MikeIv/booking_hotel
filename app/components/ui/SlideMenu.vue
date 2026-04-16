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
    emit("close");
  };

  const socialLinks = [
    {
      url: "https://t.me/ithumor",
      iconName: "i-telegram",
      // text: "Telegram",
    },
    {
      url: "https://vk.com/feed",
      iconName: "i-vk",
      // text: "ВКонтакте",
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
    <div v-if="isOpen" :class="$style.menuOverlay" :style="menuStyles">
      <div :class="$style.menuContent">
        <HeaderNavLinks :links="links" @link-click="handleLinkClick" />
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
    overflow-y: hidden;
    transform: translateY(-100%);
    will-change: transform;
  }

  .menuContent {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: rem(24);
    min-height: calc(100vh - #{rem(70)});
    padding: rem(32);
  }
</style>
