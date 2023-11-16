<template>
  <div class="slideshow-container">
    <img :src="slides[currentIndex].bgImg">

    <!-- <swiper-container
      :effect="'coverflow'"
      :grabCursor="true"
      :centeredSlides="true"
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
    </swiper-container> -->

    <div class="platform" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
    </div>

    <div class="slider-shadow" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div class="slider-shadow-v2" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div class="plateform-text">
      <h1 style="font-size: 4.5rem; color: black;">{{ slides[currentIndex].title }}</h1>
      <p style="font-size: 1.5rem;">{{ slides[currentIndex].author }}</p>
    </div>

    <div class="transition-img" style="opacity: 0; z-index: 0;">
      <img 
        :src="slides[currentIndex].bgImg"
        :id="`transition-img-${currentIndex}`"
        style="width: 420px; z-index: 0"
        :style="{ boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}`}"
        @click="goToVideo(route+slides[0].video, 0)"
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
        // router.push(path)
      }

      const runTransition = (index) => {
        const swiperEl = document.getElementById(`transition-img-${index}`)
        const transitionImg = document.querySelector('.transition-img')
        const platform = document.querySelector('.platform')
        const shadow1 = document.querySelector('.slider-shadow')
        const shadow2 = document.querySelector('.slider-shadow-v2')
        const text = document.querySelector('.plateform-text')
        const swiperContainer = document.getElementsByClassName('mySwiper');
        
        // make the swipper disapear
        // swiperContainer[0].style.opacity = 0

        // make the transition image appear 
        transitionImg.style.zIndex = 1
        transitionImg.style.opacity = 1

        // applying bezier curve to smooth transition
        swiperEl.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        platform.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        shadow1.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        shadow2.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 

        // transition for platform & shadows
        platform.style.transform = 'translateX(25rem)'
        shadow1.style.transform = 'translateX(25rem) rotate(288deg)'
        shadow2.style.transform = 'translateX(25rem) rotate(295deg)'
        
        // make text disapear
        text.style.opacity = '0'

        // transition for the transition image
        const windowHeight = window.outerHeight;
        const imageHeight = swiperEl.height;
        const scaleRatio = windowHeight / (imageHeight);
        swiperEl.style.transform = `scale(${scaleRatio})`
      }

      const goToVideo = (path, index) => {
        console.log("helo")
        runTransition(index)

        // setTimeout(() => {
        //   pushRouter(path)
        // }, 1700);
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

<style scoped>
.swiper-slide {
  background-position: center;
  background-size: fill;
  width: 300px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>