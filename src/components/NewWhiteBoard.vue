<template>
    <div class="whiteboard" :class="{ landscape: isLandscape, vertical: !isLandscape }" id="whiteboard">
        <div class="canvas-wrapper">
            <canvas class="canvas" ref="canvas" id="canvas"></canvas>
        </div>
        <div class="sidebar" id="sidebar">
            <div class="col">
                <div class="box circle pointer" @click="clearCanvas">
                    <i class="pi pi-trash icon-big"></i>
                </div>
                <div class="box circle pointer" @click="toogleEraser" :class="{ selected : isEraserSelected }">
                    <i class="pi pi-eraser icon-big"></i>
                </div>
                <div class="box rounded">
                    <div v-for="(size, index) in brushSizes" 
                        :key="index" 
                        @click="changeSize(size)" 
                        class="ellipse-container"
                        :class="{selected : size === currentSize}"
                    >
                        <div class="ellipse" :style="getPenStyle(size)"></div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="box rounded color-container">
                    <div v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="box"
                :style="getPenColor(color)"></div>
                </div>
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
            toolElement : null,
            whiteboard : null,
            deviceType: null,
            isEraserSelected: false,
            isLandscape : config.global.landscapeMode,
            brushSizes: config.canvas.brushSizesArray,
            currentSize: config.canvas.brushSizesArray[1],
            colors: config.canvas.colors,
            brushColor: config.canvas.colors[0],
        }
    },
    async mounted(){        
        this.aspectRatio = this.isLandscape ? 1.78 : 0.5625;
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext("2d");

        this.ctx.lineCap = "round"
        this.toolElement = document.getElementById('sidebar');
        this.whiteboard = document.getElementById('whiteboard');
        
        this.initCanvas();
        this.initListeners();
        this.setDeviceType();
        this.changeColor(this.colors[0])
        this.changeSize(this.currentSize)
        this.ctx.lineCap = "round"
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
            let toolWidth = null
            if(!this.isLandscape){
                toolWidth = this.toolElement.offsetHeight
            } else {
                toolWidth = this.toolElement.offsetWidth;
            }
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
                console.log('efface')
            }
            if (!this.painting) return

            console.log('passe')

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
        toogleEraser() {
          this.isEraserSelected = !this.isEraserSelected;

          if(!this.isEraserSelected){
            this.ctx.globalCompositeOperation = 'source-over';
          }
        },
        disableEraser() {
            this.isEraserSelected = false;
        },
        changeColor(color) {
            if (this.isEraserSelected) {
                this.ctx.globalCompositeOperation = 'source-over';
                this.disableEraser()
            }
            this.brushColor = color
            this.ctx.strokeStyle = color
            console.log(this.brushColor, this.ctx.strokeStyle)
        },
        getPenColor(color) {
            return {backgroundColor: color}
        },
        changeSize(size) {
          this.ctx.lineWidth = size
          this.currentSize = size
        },
        getPenStyle(size) {
            return {width: size + 'px!important', height: size + 'px!important', backgroundColor : this.brushColor}
        },  
    }
}


</script>

<style>


</style>