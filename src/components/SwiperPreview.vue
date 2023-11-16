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
          <a @click="goToVideo(route+slide.video, index)">
            <img :src="slide.image"  class="slideshow-img" :style="{ boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}`}"/>
          </a>
      </swiper-slide>   
    </swiper-container>

    <div class="platform" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
      <div class="elipsis" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
      </div>
    </div>

    <div class="slider-shadow" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div class="slider-shadow-v2" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div class="text" style="position: absolute; bottom: 7rem; text-align: center;">
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
  
  import "../assets/scss/pages/_slideshow.scss"

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
        const swiperContainer = document.querySelector('.transition-img')
        const platform = document.querySelector('.platform')
        const shadow1 = document.querySelector('.slider-shadow')
        const shadow2 = document.querySelector('.slider-shadow-v2')
        const text = document.querySelector('.text')

        swiperContainer.style.zIndex = 1
        swiperContainer.style.opacity = 1

        platform.style.transform = 'translateY(25rem)'
        shadow1.style.transform = 'translateY(25rem)'
        shadow2.style.transform = 'translateY(25rem)'
        
        text.style.opacity = '0'

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