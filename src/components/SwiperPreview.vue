<template>
    <swiper-container
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="'auto'"
      :loop="true"
      :coverflowEffect="{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }"
      :modules="modules"
      @swiperslidechange="onSlideChange"
      class="mySwiper"
    >
      <swiper-slide>
        <router-link to="/vid/0">
          <img src="/thumbnails/0.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/1">
          <img src="/thumbnails/1.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/2">
          <img src="/thumbnails/2.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/3">
          <img src="/thumbnails/3.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/4">
          <img src="/thumbnails/4.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/5">
          <img src="/thumbnails/5.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide >
        <router-link to="/vid/6">
          <img src="/thumbnails/6.jpg" />
        </router-link>
      </swiper-slide>
      <swiper-slide>
        <router-link to="/vid/7">
          <img src="/thumbnails/7.jpg" />
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

  export default {
    components: {
      SwiperSlide,
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
}

.swiper-slide img {
  display: block;
  width: 100%;
}

</style>
