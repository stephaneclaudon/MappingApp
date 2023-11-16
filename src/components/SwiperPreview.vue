<template>
  <div class="slideshow-container" :style="{ backgroundImage: `${'url('+slides[currentIndex].bgImg+')'}`}">
    <swiper-container
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
      :slidesPerView="1"
      :slidesPerView="1"
      :loop="true"
      :loopAdditionalSlides="2"
      :coverflowEffect="{
        rotate: 50,
        stretch: 0,
        depth: -200,
        modifier: 1,
        slideShadows: true,
      }"
      :modules="modules"
      @swiperslidechange="onSlideChange"
      class="mySwiper swiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index" style="padding: 2.5rem">
        <!-- <router-link :to="route+slide.video"> -->
          <a @click="goToVideo(route+slide.video, index)">
            <img :src="slide.image"  class="slideshow-img" :style="{ boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 30px 2px'}`}"/>
          </a>
        <!-- </router-link> -->
      </swiper-slide>   
    </swiper-container>

    <div class="platform" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
      <div class="elipsis" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
      </div>
    </div>

    <div class="slider-shadow" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div class="slider-shadow-v2" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div style="position: absolute; bottom: 7rem; text-align: center;">
      <h1 style="font-size: 4.5rem;">{{ slides[currentIndex].title }}</h1>
      <p style="font-size: 1.5rem;">{{ slides[currentIndex].author }}</p>
    </div>

    <div class="transition-img" style="opacity: 0; z-index: 0;">
      <img 
        :src="slides[currentIndex].image"
        :id="`transition-img-${currentIndex}`"
        style="height: 420px; z-index: 0"
      />
    </div>
  </div>
</template>

<script>
  // Import Swiper Vue.js components
  import { SwiperSlide } from 'swiper/vue';
  import { ref } from 'vue'

  // Import Swiper styles
  import 'swiper/css';
  import 'swiper/css/effect-coverflow';
  import 'swiper/css/pagination';

  import { useRouter } from 'vue-router';

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
      const router = useRouter();

      const currentIndex = ref(0)

      const goToVideo = (path) => {
        const slide = document.getElementsByClassName('img'+currentIndex.value)[0];
        // console.log(swiperEl[0].swiper)
        for (let i=0; i<10; i++) {
          slide.style.height += 10
          // swiperEl[0].style.height += 10 
          // console.log(swiperEl[0].swiper.height)
        }
      }

      const onSlideChange = () => {
        const swiperEl = document.getElementsByClassName('mySwiper');
        const oldIndex = currentIndex.value
        console.log(swiperEl)

        if(!swiperEl[0].swiper) return
        currentIndex.value = swiperEl[0].swiper.realIndex

        if(oldIndex !== currentIndex.value){
          console.log(swiperEl[0].swiper.realIndex)
        }
      }

      const pushRouter = (path) => {
        router.push(path)
      }

      const zoom = (index) => {
        const swiperEl = document.getElementById(`transition-img-${index}`)
        console.log(swiperEl)
        const swiperContainer = document.querySelector('.transition-img')
        swiperContainer.style.zIndex = 1
        swiperContainer.style.opacity = 1

        const windowHeight = window.outerHeight;
        const imageHeight = swiperEl.height;


        const scaleRatio = windowHeight / (imageHeight);

        swiperEl.style.transform = `scale(${scaleRatio})`
      }

      const goToVideo = (path, index) => {
        zoom(index)

        setTimeout(() => {
          pushRouter(path)
        }, 1200);
      }

      return {
        onSlideChange,
        goToVideo,
        modules: [EffectCoverflow, Pagination],
        currentIndex
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
  /* background-image: url("/thumbnails/1.jpg"); */
  background-repeat: no-repeat;
  background-size: cover; 
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-position: center center;
  transition: 0.7s;
}
.swiper {
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
  /* border: 4px solid red; */
}

.swiper-slide {
  background-position: center;
  background-size: fill;
  width: 300px;
  height: 500px;
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
  border-radius: 1rem;
}
.platform {
  width: 170vw;
  height: 370px;
  background-color: rgba(218, 239, 255, 1);
  box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 30px 4px;
  position: absolute;
  bottom: 0;
  border-top-right-radius: 50%;
  border-top-left-radius: 50%;
  transition: 0.7s;
}
.slider-shadow{
  width: 100%;
  height: 80px;
  bottom: 11rem;
  left: 30rem;
  border-radius: 100px;
  transform: rotate(18deg);
  position: absolute;
  /* background-color: rgba(0, 0, 0, 0.2); */
  background-color: color-mix(in srgb, rgb(230, 203, 255) 50%, rgba(0, 0, 0, 0.2));
  transform-origin: bottom center;
  filter: blur(20px);
  transition: 0.7s;
}
.slider-shadow-v2 {
  width: 100%;
  height: 150px; 
  bottom: -4rem;
  left: -12rem;
  border-radius: 100px;
  transform: rotate(15deg);
  position: absolute;
  background-color: color-mix(in srgb, rgb(230, 203, 255) 50%, rgba(0, 0, 0, 0.2));
  transform-origin: bottom center;
  filter: blur(20px);
  transition: 0.7s;
}

.transition-img {
  width: 100vw;
  height: 420px;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}

.transition-img img {
  width: auto;
  border-radius: 1rem;
  transition: 1s;
}
</style>
