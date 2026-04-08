<template>
  <div :class="$style.layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
  onMounted(() => {
    document.body.classList.add("home-copy-body");
  });

  onUnmounted(() => {
    document.body.classList.remove("home-copy-body");
  });
</script>

<style module lang="scss">
  .layout {
    width: 100%;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
  }
</style>

<style lang="scss">
  body.home-copy-body {
    margin: 0;
    font-family: GothaProReg, Arial, Helvetica, sans-serif;
  }
</style>
