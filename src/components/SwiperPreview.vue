<template>
  <div class="slideshow-container" :style="{ backgroundImage: `url(${slides[currentIndex].bgImg})` }">
    <!-- <img :src="slides[currentIndex].bgImg" class="background-image"> -->

    <swiper-container
        :effect="'coverflow'"
        :direction="'vertical'"
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
        @swiperslidermove="onProgress"
        class="mySwiper swiper"
    >
      <swiper-slide v-for="(slide, index) in slides" :key="index" style="padding: 2.5rem">
        <a @click="goToVideo(route+slide.video, index)">
          <img :src="slide.bgImg" class="slideshow-img"
               :style="{ boxShadow: `${slides[currentIndex].mainColor+' 0px 0px 20px 2px'}`}"/>
        </a>
      </swiper-slide>
    </swiper-container>

    <div class="platform" :style="{ backgroundColor: `${slides[currentIndex].mainColor}`}">
      <div v-for="(slide, index) in slides" :key="index" class="slider-shadow"
           :style="{ backgroundColor: `color-mix(in srgb, ${slides[currentIndex].mainColor} 40% , rgba(0, 0, 0, 0.2))` }"
           :class="'slide-shadow-' + index + ' index-' + index" style="padding: 2.5rem">

      </div>

    </div>


    <div class="plateform-text">
      <h1 style="font-size: 4.5rem; color: black;">{{ slides[currentIndex].title }}</h1>
      <p style="font-size: 1.5rem;">{{ slides[currentIndex].author }}</p>
    </div>

    <div class="transition-img" style="opacity: 0; z-index: 0;">
      <img
          :src="slides[currentIndex].bgImg"
          :id="`transition-img-${currentIndex}`"
          style="width: 420px; z-index: 0"
      />
    </div>
  </div>
</template>

<script>
// Import Swiper Vue.js components
import {SwiperSlide} from 'swiper/vue';
import {ref} from 'vue'
import gsap from "gsap";
import "../assets/scss/pages/_slideshow.scss"

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

import {useRouter} from 'vue-router';

// import required modules
import {EffectCoverflow, Pagination} from 'swiper/modules';

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

    const onProgress = (e) => {
      const swiperEl = document.getElementsByClassName('mySwiper');
      const oldIndex = currentIndex.value;
      if (!swiperEl[0]) return;
      if (!swiperEl[0].swiper) return;
      currentIndex.value = swiperEl[0].swiper.realIndex;

      if (oldIndex !== currentIndex.value) {
        console.log(swiperEl[0].swiper.realIndex);
      }

      // Translate each shadow along with the corresponding slide
      for (let i = 0; i < document.getElementsByClassName("swiper-slide").length; i++) {

        if (document.getElementsByClassName("swiper-slide")[i].classList.contains("swiper-slide-next")) {
          console.log(document.querySelector(`.slide-shadow-${parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex) + 1}`))
          gsap.to(document.querySelector(`.slide-shadow-${(parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex)) % 8}`), {
            // background: "green",
            translateY: "100%",
            right: 12 + "rem",
            bottom: 0 + "rem",
            height: "110px",
            width: "33vh",
            rotate: -65 + "deg",

            // background: green,
            // padding: 2.5rem,
            // translate: none,
            // rotate: none,
            // scale: none,
            // bottom: 0rem,
            // right: 8rem,
            // display: block,
            // transform: translate(0px, 100%) rotate(-65deg),

          });
          gsap.to(document.querySelector(`.slide-shadow-${(parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex) + 1) % 8}`), {

            height: "160px",
            width: "100vh",
            translateY: 42 + "rem",
            rotate: -50 + "deg",
            right: -12 + "rem",


            //   height: 160px,
            //   width: 100vh,
            //   background: red,
            //   padding: 2.5rem,
            //   translate: none,
            //   rotate: none,
            //   scale: none,
            //   display: block,
            //   transform: translate(0px, 42rem) rotate(-52deg),
            // bottom: 0rem,
            // right: -12rem,


          });

          gsap.to(document.querySelector(`.slide-shadow-${((parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex)) + 2) % 8}`), {
            // background: "black",

            translateY: 45 * 2 + "rem",
            display: "block",

          });
          gsap.to(document.querySelector(`.slide-shadow-${((parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex)) + 3) % 8}`), {
            // background: "white",
            translateY: 45 * 3 + "rem",
            display: "none",

          });
          gsap.to(document.querySelector(`.slide-shadow-${(parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex) - 1) % 8}`), {
            // background: "red",

            display: "none",

          });
          gsap.to(document.querySelector(`.slide-shadow-${(parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex) - 2) % 8}`), {
            // background: "red",
            display: "none"

          });

          gsap.to(document.querySelector(`.slide-shadow-${(parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex) - 1) % 8}`), {

            height: "160px",
            width: "100vh",
            translateY: 42 + "rem",
            rotate: -50 + "deg",
            right: -12 + "rem",


            //   height: 160px,
            //   width: 100vh,
            //   background: red,
            //   padding: 2.5rem,
            //   translate: none,
            //   rotate: none,
            //   scale: none,
            //   display: block,
            //   transform: translate(0px, 42rem) rotate(-52deg),
            // bottom: 0rem,
            // right: -12rem,


          });

          gsap.to(document.querySelector(`.slide-shadow-${((parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex)) - 2) % 8}`), {
            // background: "black",

            translateY: 45 * 2 + "rem",
            display: "block",

          });
          gsap.to(document.querySelector(`.slide-shadow-${((parseInt(document.getElementsByClassName("swiper-slide")[i].dataset.swiperSlideIndex)) - 3) % 8}`), {
            // background: "white",
            translateY: 45 * 3 + "rem",
            display: "none",

          });
        }

      }
    };

    const pushRouter = (path) => {
      router.push(path)
    }

    const runTransition = (index) => {
      const swiperEl = document.getElementById(`transition-img-${index}`)
      const transitionImg = document.querySelector('.transition-img')
      const platform = document.querySelector('.platform')
      const shadow1 = document.querySelector('.slider-shadow')
      const text = document.querySelector('.plateform-text')
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

      // transition for platform & shadows
      gsap.to(platform, {
        translateX: "25rem",

      })
      gsap.to(shadow1, {
        translateX: "25rem",
        rotate: '288deg'
      })
      gsap.to(text, {
        opacity: "0",
      })
      // platform.style.transform = 'translateX(25rem)'
      // shadow1.style.transform = 'translateX(25rem) rotate(288deg)'

      // make text disapear
      // text.style.opacity = '0'

      // transition for the transition image
      const windowHeight = window.outerHeight;
      const imageHeight = swiperEl.height;
      const scaleRatio = windowHeight / (imageHeight);
      // swiperEl.style.transform = `scale(${scaleRatio})`

      gsap.to(swiperEl, {
        scale: scaleRatio,
      })
    }

    const goToVideo = (path, index) => {
      console.log("helo")
      runTransition(index)

      setTimeout(() => {
        pushRouter(path)
      }, 1700);
    }

    return {
      goToVideo,
      onProgress,
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* border: 4px solid blue; */
}

.swiper-slide a {
  width: 420px;
  height: auto;
  display: flex;
  justify-content: center;
  align-self: center;
  /* border: 4px solid purple; */
}

.swiper-slide img {
  display: block;
  width: 100%;
  margin-top: calc(50% - 210px);
  border-radius: 1rem;
  /* border: 4px solid red; */
}
</style>