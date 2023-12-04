<template>
    <!-- <div class="video-container" :style="isLandscape ? 'video-container-ls' : ''"> -->
    <router-link :to="callbackURL">
        <video autoplay loop :style="isLandscape ? getVideoStyle() : getVideoStyle()">
            <source :src="currentVideoPath" type="video/mp4">
        </video>
    </router-link>
    <!-- </div> -->
</template>

<script>
import config from '../../config.json';
import { useRoute } from "vue-router";
export default {
    setup() {
        const isLandscape = config.global.landscapeMode
        const route = useRoute();
        const currentVideoPath = config.projects.slides[parseInt(route.params.video)].video;
        const callbackURL = '/slideshow#' + route.params.video;
        console.log("Loading " + currentVideoPath + "...");

        const getVideoStyle = () => {
            if (isLandscape) {
                return `transform: rotate(270deg); transform-origin: top right; width: 100vh; height: 100vw; margin-left: -100vh; object-fit: contain;`
            } else {
                return 'width: 100vw; height: 100vh; object-fit: contain;'
            }
        }

        return {
            callbackURL,
            currentVideoPath,
            isLandscape,
            getVideoStyle
        }
    }
}
</script>