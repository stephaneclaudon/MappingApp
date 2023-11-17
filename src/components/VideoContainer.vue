<template>
    <!-- <div class="video-container" :style="isLandscape ? 'video-container-ls' : ''"> -->
        <router-link to="/slideshow">
            <video autoplay loop :style="isLandscape ? getVideoStyle() : getVideoStyle()">
                <source :src="'/' + $route.fullPath.split('/')[2] + '.mp4'" type="video/mp4">
            </video>
        </router-link>
    <!-- </div> -->
</template>

<script>
import config from '../../config.json';
export default {
    setup() {
        const isLandscape = config.global.landscapeMode

        const getVideoStyle = () => {
            if (isLandscape) {
                return `transform: rotate(270deg); transform-origin: top right; width: 100vh; height: 100vw; margin-left: -100vh; object-fit: contain;`
            } else {
                return 'width: 100vw; height: 100vh; object-fit: contain;'
            }
        }

        return {
            isLandscape,
            getVideoStyle
        }
    }
}
</script>