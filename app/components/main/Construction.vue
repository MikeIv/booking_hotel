<script setup lang="ts">
  defineProps({
    anchorId: {
      type: String,
      default: "",
    },
  });

  // const items = [
  //   "/images/constraction/slider/1.jpg",
  //   "/images/constraction/slider/2.jpg",
  //   "/images/constraction/slider/3.jpg",
  //   "/images/constraction/slider/4.jpg",
  // ];

  const items = ref([
    {
      image: "/images/constraction/slider/1.jpg",
      caption: "июнь / 2021",
    },
    {
      image: "/images/constraction/slider/2.jpg",
      caption: "март / 2021",
    },
    {
      image: "/images/constraction/slider/3.jpg",
      caption: "август / 2020",
    },
    {
      image: "/images/constraction/slider/4.jpg",
      caption: "июль / 2020",
    },
  ]);

  // const { useImages } = useImageLoader();
  // const desktopImages = useImages("images/entertaiment/bg-slider");
  // const mobileImages = useImages("images/entertaiment/bg-slider");
</script>

<template>
  <LayoutContentBlock
    :id="anchorId"
    title="Этапы строительства"
    :has-two-columns="false"
    :content-class="$style.content"
    :column-left="$style.introLeft"
    :column-right="$style.introRight"
    :title-class="$style.title"
  >
    <template #left-column>
      <div>
        <p :class="$style.text">галлерея</p>
      </div>
      <div :class="$style.imageBlock">
        <div :class="$style.carouselInner">
          <UCarousel
            v-slot="{ item }"
            loop
            wheel-gestures
            :items="items"
            :ui="{
              item: $style.carouselItem,
              container: $style.carouselContainer,
            }"
          >
            <div :class="$style.slide">
              <img
                :src="item.image"
                :alt="item.caption"
                :class="$style.slideImage"
              >
              <div :class="$style.slideCaption">
                {{ item.caption }}
              </div>
            </div>
          </UCarousel>
        </div>

        <!--        <template>-->
        <!--          <UCarousel-->
        <!--            v-slot="{ item }"-->
        <!--            :items="items"-->
        <!--            :ui="{ item: 'basis-1/3' }"-->
        <!--          >-->
        <!--            <img :src="item" width="234" height="234" />-->
        <!--          </UCarousel>-->
        <!--        </template>-->
      </div>
    </template>
    <template #right-column />
  </LayoutContentBlock>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .content {
    flex-direction: column-reverse;

    @media (min-width: #{size.$tabletMax}) {
      flex-direction: row;
    }
  }

  .title {
    position: relative;
    display: flex;
    margin-bottom: clamp(2px, 1vw, 32px);
    padding: rem(16) clamp(16px, 3vw, 8px);
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 3vw, 20px);
    font-weight: 600;
    color: var(--primary);
    text-transform: uppercase;
    letter-spacing: rem(4);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: rem(180);
      height: rem(4);
      background: var(--primary);
    }
  }

  .image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: clamp(100%, 3vw, 50%);
    height: auto;
    object-fit: contain;
  }

  .introLeft {
    padding: 0 rem(24) rem(16) rem(24);
  }

  .imageBlock {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: rem(400);
    margin: 0 auto;
  }

  .carouselInner {
    width: 100%;
    max-width: rem(1200);
    margin: 0 auto;
  }

  .carouselContainer {
    display: flex;
    gap: rem(8);
  }

  .carouselItem {
    flex: 0 0 50%;
    padding-bottom: rem(24);

    @media (min-width: #{size.$tablet}) {
      flex-basis: 33.333%;
    }

    @media (min-width: #{size.$desktopMin}) {
      flex-basis: 25%;
    }
  }

  .slide {
    position: relative;
    height: rem(400);
  }

  .slideImage {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--a-borderR--x8);
    object-fit: cover;
  }

  .slideCaption {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: rem(8);
    color: var(--a-text-dark);
    text-align: center;
    background: rgb(255 255 255 / 50%);
  }

  .text {
    font-family: "Futura PT", sans-serif;
    font-size: clamp(18px, 4vw, 35px);
    color: var(--secondary);
  }

  .carousel {
    display: flex;
    align-items: flex-start;
    flex-direction: row;
    margin-inline-start: -1rem;
  }
</style>
