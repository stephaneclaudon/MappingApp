<template>
    <div class="videoContainer">
        <router-link to="/slideshow">
            <video autoplay loop>
                <source :src="'/video' + $route.fullPath.split('/')[2] + '.mp4'" type="video/mp4">
            </video>
        </router-link>
    </div>
</template>

<style>

.videoContainer{
    display: flex;
    align-items: center;
}

.returnButton{
    margin-right: 3rem;
}

.pi-angle-left{
    font-size: 4em;
    
}

video{
    height: 90svh;
    object-fit: contain;
}
</style>