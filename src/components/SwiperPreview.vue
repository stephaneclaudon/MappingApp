<template>
    <swiper-container
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="3"
      :loop="true"
      :loopAdditionalSlides="2"
      :coverflowEffect="{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }"
      :modules="modules"
      @swiperslidechange="onSlideChange"
      class="mySwiper swiper"
    >
      <swiper-slide v-for="slide in slides">
        <router-link :to="route+slide.video">
          <img :src="slide.image" />
        </router-link>
      </swiper-slide>
    </swiper-container>
</template>

<script>
  // Import Swiper Vue.js components
  import { SwiperSlide } from 'swiper/vue';

  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/effect-coverflow';
  import 'swiper/css/pagination';

  // import required modules
  import { EffectCoverflow, Pagination } from 'swiper/modules';

  import config from '../../config.json';

  export default {
    components: {
      SwiperSlide,
    },
    data() {
      return {
        route: config.projects.globalRoute,
        slides: config.projects.slides
      }
    },
    setup() {
      let currentIndex = 0
      const onSlideChange = () => {
        const swiperEl = document.getElementsByClassName('mySwiper');
        const oldIndex = currentIndex

        if(!swiperEl[0].swiper) return
        currentIndex = swiperEl[0].swiper.realIndex
        
        if(oldIndex !== currentIndex){
          console.log(swiperEl[0].swiper.realIndex)
        }
      }

      return {
        onSlideChange,
        modules: [EffectCoverflow, Pagination],
      };
    },
  };
</script>

<style>

.swiper {
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}

.swiper-slide {
  background-position: center;
  background-size: cover;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-slide a {
  display: block;
  max-width: 100%;
  width: fit-content;
  height: 100%;
}
.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
}

</style>
