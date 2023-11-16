<template>
    <div class="whiteboard">
        <div class="canvas-wrapper">
            <canvas></canvas>
            <div class="stickers-bar">
            </div>
        </div>
    </div>
</template>

<script>

import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';
import config from '../../config.json';

gsap.registerPlugin(Draggable)
export default {}


</script>