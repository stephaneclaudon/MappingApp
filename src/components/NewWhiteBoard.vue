<template>
    <div class="whiteboard" :class="{ landscape: isLandscape, vertical: !isLandscape }" id="whiteboard">
        <div class="canvas-wrapper">
            <canvas class="canvas" ref="canvas" id="canvas"></canvas>
        </div>
        <div class="sidebar" id="sidebar">
            <div class="col">
                <div class="box circle" @click="clearCanvas">
                    <i class="pi pi-trash icon-big"></i>
                </div>
            </div>
            <div class="col">

            </div>
        </div>
    </div>
</template>

<script>

import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';
import "../assets/scss/pages/_new-whiteboard.scss"
import config from '../../config.json';

gsap.registerPlugin(Draggable)
export default {
    data(){
        return {
            canvas: null,
            ctx: null,
            painting: false,
            aspectRatio: 1.78, 
            toolWidth : null,
            whiteboard : null,
            deviceType: null,
            isEraserSelected: false,
            isLandscape : config.global.landscapeMode
        }
    },
    async mounted(){        
        this.aspectRatio = this.isLandscape ? 1.78 : 0.5625;
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.toolWidth = document.getElementById('sidebar');
        this.whiteboard = document.getElementById('whiteboard');
        
        this.initCanvas();
        this.initListeners();
        this.setDeviceType();
    },
    beforeUnmount() {
        this.removeListeners();
    },
    methods : {
        initCanvas(){
            this.resizeCanvas();
        },
        initListeners() {
            window.addEventListener('resize', this.resizeCanvas);
            this.canvas.addEventListener("mousedown", this.startPainting);
            this.canvas.addEventListener("mouseup", this.finishedPainting);
            this.canvas.addEventListener("mousemove", this.draw);
            this.canvas.addEventListener("touchstart", this.startPainting);
            this.canvas.addEventListener("touchend", this.finishedPainting);
            this.canvas.addEventListener("touchmove", this.mobileDraw);
        },
        removeListeners() {
            window.removeEventListener('resize', this.resizeCanvas);
            this.canvas.removeEventListener("mousedown", this.startPainting)
            this.canvas.removeEventListener("mouseup", this.finishedPainting)
            this.canvas.removeEventListener("mousemove", this.draw)
            this.canvas.removeEventListener("touchstart", this.startPainting)
            this.canvas.removeEventListener("touchend", this.finishedPainting)
            this.canvas.removeEventListener("touchmove", this.mobileDraw)
        },
        setDeviceType() {
            const platform = navigator.userAgentData.platform.toLowerCase()
            if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/.test(platform)) {
                this.deviceType = 'mobile'
            } else if (/mac|win|linux/i.test(platform)) {
                this.deviceType = 'desktop'
            } else if (/tablet|ipad/i.test(platform)) {
                this.deviceType = 'tablet'
            } else {
                this.deviceType = 'unknown'
            }
        },
        resizeCanvas(){
            const toolWidth = this.toolWidth.offsetWidth;
            let whiteboardStyle = window.getComputedStyle(this.whiteboard);
            const whiteboardWidth = this.whiteboard.offsetWidth - parseFloat(whiteboardStyle.paddingLeft) - parseFloat(whiteboardStyle.paddingRight);

            const parentElement = this.canvas.parentNode;

            let newWidth = whiteboardWidth - toolWidth;
            let newHeight = newWidth / this.aspectRatio;
            
            if (newHeight > parentElement.clientHeight) {
                newHeight = parentElement.clientHeight;
                newWidth = newHeight * this.aspectRatio;
            }
            
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;
        },
        startPainting(e) {
            this.painting = true
            if (this.deviceType === 'desktop') {
                this.draw(e);
                // if (e.touches) {
                //     if (e.touches.length === 2) {
                //         this.pinchStartDistance = Math.hypot(
                //             e.touches[0].clientX - e.touches[1].clientX,
                //             e.touches[0].clientY - e.touches[1].clientY
                //         );
                //         this.pinchStartAngle = Math.atan2(
                //                 e.touches[1].clientY - e.touches[0].clientY,
                //                 e.touches[1].clientX - e.touches[0].clientX
                //             ) *
                //             (180 / Math.PI);
                //     }
                //     this.mobileDraw(e.touches)
                // } else {
                //     this.mobileDraw(e)
                // }
                this.mobileDraw(e)
                console.log("dessine")

            } else if (this.deviceType === 'mobile') {
                this.mobileDraw(e)
            }
            e.preventDefault()
            e.stopPropagation()
        },
        draw(e) {
            if (this.isEraserSelected) {
                this.erase(e);
            }
            if (!this.painting) return

            this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
            this.ctx.stroke()

            this.ctx.beginPath()
            this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

        },
        mobileDraw(e) {
            // if (!document.querySelector(".dragged")) {

                if (this.isEraserSelected) {
                    this.erase(e);
                }
                if (!this.painting) return

                this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
                this.ctx.stroke()

                this.ctx.beginPath()
                this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
                
            // } else {
            //     this.stickersResizer(e)
            //     this.stickersRotate(e)
            // }
        },
        erase(e) {
            if (!this.painting) return;

            // Use 'destination-out' to erase
            this.ctx.globalCompositeOperation = 'destination-out';

            this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
            this.ctx.stroke()

            this.ctx.beginPath()
            this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

        },
        finishedPainting() {
            this.painting = false
            this.ctx.beginPath()
        },
        clearCanvas() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        },
    }
}


</script>

<style>


</style>