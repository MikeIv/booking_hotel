<script setup lang="ts">
  const { contentStyle } = useFixedHeaderOffset();
</script>

<template>
  <div :class="$style.layout">
    <LayoutHeader />
    <div :class="$style.wrapper" :style="contentStyle">
      <CoreBreadcrumbs />
      <slot />
    </div>
    <LayoutFooter />
    <CoreSessionTimeoutHandler />
  </div>
</template>

<style module lang="scss">
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    flex: 1 0 auto;
    width: 100%;
    background-color: var(--a-whiteBg);
    position: relative;
    transition: margin-top 0.2s ease;

    // margin-inline: auto у страницы отменяет stretch колоночного flex —
    // без явной ширины контейнер схлопывается в shrink-to-fit.
    > * {
      width: 100%;
    }
  }
</style>
