<template>
  <div class="slideshow-container">

    <swiper-container
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="1"
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
      <swiper-slide v-for="(item, index) in items" :key="index" style="padding: 2.5rem">
        <router-link :to="item.path">
          <img :src="item.imgSrc"  class="slideshow-img"/>
        </router-link>
      </swiper-slide>   
    </swiper-container>
    <div class="platform">
      
    </div>
    <div style="position: absolute; bottom: 7rem; text-align: center;">
      <h1 style="font-size: 4.5rem;">COUCOU</h1>
      <p style="font-size: 1.5rem;">helo helo helo helo helo</p>
    </div>
  </div>
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
      const items = [
          {
            path: "/vid/0",
            imgSrc: "/thumbnails/0.jpg"
          },
          {
            path: "/vid/1",
            imgSrc: "/thumbnails/1.jpg"
          },
          {
            path: "/vid/2",
            imgSrc: "/thumbnails/2.jpg"
          },
          {
            path: "/vid/3",
            imgSrc: "/thumbnails/3.jpg"
          },
          {
            path: "/vid/4",
            imgSrc: "/thumbnails/4.jpg"
          },
          {
            path: "/vid/5",
            imgSrc: "/thumbnails/5.jpg"
          },
          {
            path: "/vid/6",
            imgSrc: "/thumbnails/6.jpg"
          },
          {
            path: "/vid/7",
            imgSrc: "/thumbnails/7.jpg"
          },
        ]

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
        items
      };
    },
  };
</script>

<style>
html, body {
  height: 100vh!important;
  width: 100vw!important;
  overflow: hidden!important;
}
.slideshow-container {
  width: 100vw;
  height: 100vh;
  background-image: url("/slideshowBackgrounds/bg12.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.swiper {
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}

.swiper-slide {
  background-position: center;
  background-size: fill;
  width: 300px;
  height: 600px;
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
.slideshow-img {
  border-radius: 2rem;
  box-shadow: rgba(255, 255, 255, 0.7) 0px 10px 50px 4px;
}
.platform {
  width: 200vw;
  height: 500px;
  background-color:rgba(218, 239, 255, 0.9);
  box-shadow: rgba(255, 255, 255, 0.7) 0px 10px 50px 4px;
  position: absolute;
  bottom: -100px;
  border-radius: 50%;
}

</style>
