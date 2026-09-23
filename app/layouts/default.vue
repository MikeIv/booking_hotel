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
  </div>
</template>

<style module lang="scss">
  .layout {
    display: grid;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--a-whiteBg);
    position: relative;
    transition: margin-top 0.2s ease;
  }
</style>
