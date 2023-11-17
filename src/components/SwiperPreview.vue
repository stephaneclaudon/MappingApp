<template>
  <div class="slideshow-container" :style="isLandscape ? { backgroundImage: `url(${slides[currentIndex].landscapeBgImg})` } : { backgroundImage: `url(${slides[currentIndex].bgImg})` }">
    <!-- <img :src="slides[currentIndex].bgImg" class="background-image"> -->
    <swiper-container
      :effect="'coverflow'"
      :direction="isLandscape ? 'vertical' : 'horizontal'"
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
      <swiper-slide 
        v-for="(slide, index) in slides"
        :key="index"
        style="padding: 2.5rem"
        :class="isLandscape ? 'swiper-slide-ls' : ''"
      >
          <a @click="goToVideo(route+slide.video, index)">
            <img :src="isLandscape ? slide.landscapeBgImg : slide.bgImg"  class="slideshow-img" :style="{ boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}`}"/>
          </a>
      </swiper-slide>   
    </swiper-container>

    <div id="platform" :class="isLandscape ? 'platform-ls' : 'platform'" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}"></div>

    <div id="slider-shadow" :class="isLandscape ? 'slider-shadow-ls' : 'slider-shadow'" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div id="slider-shadow-v2" :class="isLandscape ? 'slider-shadow-v2-ls' : 'slider-shadow-v2'" :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"></div>

    <div id="platform-text" :class="isLandscape ? 'platform-text-ls' : 'platform-text'">
      <h1 style="font-size: 4.5rem; color: black;">{{ slides[currentIndex].title }}</h1>
      <p style="font-size: 1.5rem;">{{ slides[currentIndex].author }}</p>
    </div>

    <div id="transition-img" :class="isLandscape ? 'transition-img-ls' : 'transition-img'" style="opacity: 0; z-index: 0;">
      <img 
        :src="isLandscape ? slides[currentIndex].landscapeBgImg : slides[currentIndex].bgImg"
        :id="`transition-img-${currentIndex}`"
        style="z-index: 0"
        :style="isLandscape ? {width: '420px', boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}` } : { height: '420px', boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}` }"
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

      const isLandscape = config.global.landscapeMode

      const currentIndex = ref(0)

      const onSlideChange = () => {
        const swiperEl = document.getElementsByClassName('mySwiper');
        const oldIndex = currentIndex.value

        if(!swiperEl[0].swiper) return
        currentIndex.value = swiperEl[0].swiper.realIndex

        if(oldIndex !== currentIndex.value){
          console.log(swiperEl[0].swiper.realIndex)
        }
      }

      const pushRouter = (path) => {
        router.push(path)
      }

      const runTransition = (index) => {
        const swiperEl = document.getElementById(`transition-img-${index}`)
        const transitionImg = document.getElementById('transition-img')
        const platform = document.getElementById('platform')
        const shadow1 = document.getElementById('slider-shadow')
        const shadow2 = document.getElementById('slider-shadow-v2')
        const text = document.getElementById('platform-text')
        const swiperContainer = document.getElementsByClassName('mySwiper');
        
        // make the swipper disapear
        swiperContainer[0].style.opacity = 0

        // make the transition image appear 
        transitionImg.style.zIndex = 1
        transitionImg.style.opacity = 1

        // applying bezier curve to smooth transition
        swiperEl.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        platform.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        shadow1.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 
        shadow2.style.transitionTimingFunction = 'cubic-bezier(1, -0.3, .8, 0.67)' 

        // transition for platform & shadows
        if (isLandscape) {
          platform.style.transform = 'translateX(25rem)'
          shadow1.style.transform = 'translateX(25rem) rotate(288deg)'
          shadow2.style.transform = 'translateX(25rem) rotate(295deg)'
        } else {
          platform.style.transform = 'translateY(25rem)'
          shadow1.style.transform = 'translateY(25rem)'
          shadow2.style.transform = 'translateY(25rem)'
        }

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

        setTimeout(() => {
          pushRouter(path)
        }, 1700);
      }

      return {
        onSlideChange,
        goToVideo,
        modules: [EffectCoverflow, Pagination],
        currentIndex,
        isLandscape
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

.swiper-slide-ls {
  background-position: center;
  background-size: fill;
  display: flex;
  width: auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* border: 4px solid blue; */
}

.swiper-slide-ls a {
  width: 420px;
  height: auto;
  display: flex;
  justify-content: center;
  align-self: center;
  /* border: 4px solid purple; */
}
.swiper-slide-ls img {
  display: block;
  width: 100%;
  margin-top: calc(50% - 210px);
  border-radius: 1rem;
  /* border: 4px solid red; */
}
</style>