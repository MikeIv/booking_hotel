<script setup lang="ts">
  onMounted(() => {
    document.body.classList.add("home-copy-body");
  });

  onUnmounted(() => {
    document.body.classList.remove("home-copy-body");
  });
</script>

<template>
  <div :class="$style.layout">
    <slot />
    <LayoutFooter />
  </div>
</template>

<style module lang="scss">
  .layout {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: clip;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
  }
</style>

<style lang="scss">
  body.home-copy-body {
    margin: 0;
    overflow-x: clip;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
  }
</style>
