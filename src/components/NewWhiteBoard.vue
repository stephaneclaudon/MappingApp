<template>
  <div class="whiteboard" :class="{ landscape: isLandscape, vertical: !isLandscape }" id="whiteboard">
    <div class="canvas-wrapper">
      <canvas class="canvas" ref="canvas" id="canvas"></canvas>
    </div>


    <div class="sidebar" id="sidebar">
      <div class="stickers-wrapper"  :class="{active : stickersState }">
        <div class="stickers-container-container">
          <div class="stickers-container" :style="'width: calc('+ icons.length+' * 64px);'">
            <svg class="stickers" style=""></svg>
          </div>

        </div>
        <p @click="toggleStickers">autocollant</p>
      </div>
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
               :class="{selected : size === currentSize}">
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

    <svg class="stickers-whiteboard" style=""></svg>
  </div>
</template>

<script>

import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';
import "../assets/scss/pages/_new-whiteboard.scss"
import config from '../../config.json';

gsap.registerPlugin(Draggable)
export default {
  data() {
    return {
      canvas: null,
      ctx: null,
      painting: false,
      aspectRatio: 1.78,
      toolElement: null,
      whiteboard: null,
      deviceType: null,
      isEraserSelected: false,
      isLandscape: config.global.landscapeMode,
      icons: config.canvas.stickers,
      brushSizes: config.canvas.brushSizesArray,
      currentSize: config.canvas.brushSizesArray[1],
      colors: config.canvas.colors,
      brushColor: config.canvas.colors[0],
      stickersState: false,
    }
  },
  async mounted() {
    this.aspectRatio = this.isLandscape ? 1.78 : 0.5625;
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");

    this.ctx.lineCap = "round"
    this.toolElement = document.getElementById('sidebar');
    this.whiteboard = document.getElementById('whiteboard');

    this.initCanvas();
    this.initListeners();
    this.setDeviceType();
    this.buildStickers();
    this.changeColor(this.colors[0])
    this.changeSize(this.currentSize)
    this.ctx.lineCap = "round";
    // this.toggleStickers()

  },
  beforeUnmount() {
    this.removeListeners();
  },
  methods: {
    toggleStickers() {
      this.stickersState = !this.stickersState
      return this.stickersState
    },
    initCanvas() {
      this.resizeCanvas();
    },
    initListeners() {
      window.addEventListener('resize', this.resizeCanvas);
      this.canvas.addEventListener("mousedown", this.startPainting);
      this.canvas.addEventListener("mouseup", this.finishedPainting);
      this.canvas.addEventListener("mousemove", this.draw);
      this.canvas.addEventListener("touchstart", this.startPainting);
      this.canvas.addEventListener("touchend", this.finishedPainting);
      this.canvas.addEventListener("touchmove", (e) => {
        this.mobileDraw(e.touches[0])
      });
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
    resizeCanvas() {
      let toolWidth = null
      if (!this.isLandscape) {
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
      if (this.isStickers) {

        console.log("eventListener", e)
        const rectTarget = e.target.getBoundingClientRect();
        const parent = document.getElementsByClassName('stickers-whiteboard')[0]
        const sticker = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
        );
        sticker.setAttributeNS(null, "height", "48");
        sticker.setAttributeNS(null, "width", "48");
        sticker.setAttributeNS(null, "style", "z-index:200;");
        sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.stickerHref);
        sticker.setAttributeNS(null, "x", (e.x - (this.rectTarget.width) / 2));
        sticker.setAttributeNS(null, "y", (e.y - (this.rectTarget.height) / 2));
        sticker.setAttributeNS(null, "visibility", "visible");
        sticker.classList.add("sticker");
        // sticker.dataset.type = mySticker.dataset.type;

        parent.appendChild(sticker);

        // parent.removeChild(mySticker)
        // sticker.setAttributeNS(null, "height", "48");
        // sticker.setAttributeNS(null, "width", "48");
        // sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href",e.target.href.baseVal);
        // sticker.setAttributeNS(null, "x", e.x);
        // sticker.setAttributeNS(null, "y", e.y);
        // stickerRect.y  = e.y
        // stickerRect.x  = e.x
        // sticker.dataset.type = e.target.dataset.type;

        console.log("sticker ", sticker)
        parent.getElementsByClassName(e.target.classList[0])
        this.isStickers = false

      } else {
        this.painting = true

        this.draw(e);
        if (e.touches) {
          this.mobileDraw(e.touches[0])
        }
        e.preventDefault()
        e.stopPropagation()
      }
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


    // ------- STICKERS

    stickersResizer(e) {
      if (e.touches.length === 2) {

        const pinchEndDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        const pinchScale = pinchEndDistance / this.pinchStartDistance;

        // Update the scale of the dragged sticker
        const dragged = document.getElementsByClassName("dragged")[0];
        if (dragged) {
          const currentScale = parseFloat(dragged.style.transform.replace("scale(", "").replace(")", ""));
          const newScale = currentScale * pinchScale;

          // Enforce minimum and maximum dimensions
          const clampedScale = Math.min(Math.max(newScale, 0.5), 5);

          gsap.to(dragged, {
            width: dragged.width.baseVal.value * pinchScale,
            height: dragged.height.baseVal.value * pinchScale,
          });
        }

        // Update the start distance for the next pinch event
        // this.pinchStartDistance = pinchEndDistance;
      }
    },


    stickersRotate(e) {
      if (e.touches.length === 2) {
        var curAngle =
            Math.atan2(
                e.touches[1].clientY - e.touches[0].clientY,
                e.touches[1].clientX - e.touches[0].clientX
            ) *
            (180 / Math.PI);

        // Update the rotation angle
        this.rotationAngle = curAngle - this.pinchStartAngle;
        this.rotationAngle = this.rotationAngle % 360;

        // Update the scale and rotation of the dragged sticker
        const dragged = document.getElementsByClassName('dragged')[0];
        if (dragged) {
          gsap.to(dragged, {
            rotation: this.rotationAngle,
            transformOrigin: '50% 50%',
          });
        }
      }
    },
    initializeMap() {
      this.map = localforage.createInstance({
        name: "map"
      });
      this.map.iterate((value, key) => {
        // this.buildStickers(key, value.src, value.x, value.y);
      });
    },
    buildHandleSVG(parent, path, i) {
      const sticker = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
      );
      sticker.setAttributeNS(null, "height", "48");
      sticker.setAttributeNS(null, "width", "48");
      sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
      sticker.setAttributeNS(null, "x", 64 * i);
      sticker.setAttributeNS(null, "y", "0");
      sticker.setAttributeNS(null, "visibility", "visible");
      sticker.classList.add("sticker");
      sticker.dataset.type = `sticker-${i}`;
      parent.appendChild(sticker);
      this.cloneHandleSVG(parent, `sticker-${i}`);

    },
    cloneHandleSVG(parent, type) {
      const source = document.querySelector(`.stickers`).querySelector(`[data-type="${type}"]`);
      const clone = source.cloneNode(true);
      // const newParent = document.querySelector(`.stickers-whiteboard`);
      parent.appendChild(clone);
      this.createDraggable(clone);

    },
    createDraggable(element) {

      const newParent = document.querySelector(`.stickers-whiteboard`);
      let canvasWrapper = document.querySelector(".canvas")
      let whiteboard = document.querySelector(".whiteboard")

      const rect = canvasWrapper.getBoundingClientRect();
      element.addEventListener("mousedown", (event) => {
        console.log("eventListener", event)
        this.rectTarget = event.target.getBoundingClientRect();
        this.stickerHref = event.target.href.baseVal
        this.isStickers = true
      })
      // Draggable.create(element, {
      //     bounds: whiteboard,
      //     // {minY:yBoundMin,maxY:0}
      //     edgeResistance: 1,
      //     onDragStart: () => {
      //         if (!element.getAttributeNS(null, "id")) {
      //         // element.setAttributeNS(null, "id", `sticker-${this.stickerCounter}`);
      //         // element.setAttributeNS(null, "draggable", "false");
      //         this.stickerCounter++;
      //         }
      //         // if (!element.classList.contains("dragged")) {
      //         this.cloneHandleSVG(
      //             document.querySelector(".stickers-whiteboard"),
      //             element.dataset.type
      //         );
      //         // element.classList.add("dragged");
      //         // }
      //         this.canvas.addEventListener("gesturechange", this.handleGestureChange);

      //     },
      //     onMove: () => {
      //         if (this.map) {
      //         this.map.setItem(element.getAttributeNS(null, "id"), {
      //             src: element.getAttributeNS("http://www.w3.org/1999/xlink", "href"),
      //             x: element.getBoundingClientRect().x,
      //             y: element.getBoundingClientRect().y,
      //         });
      //         }
      //     },
      //     onPress: () => {
      //     },
      //     onRelease: () => {
      //     },
      //     onDragEnd: (event) => {
      //         // Ensure this.map is initialized before calling setItem
      //         if (this.map) {
      //             this.updateListeners(element);
      //             this.map.setItem(element.getAttributeNS(null, "id"), {
      //                 src: element.getAttributeNS("http://www.w3.org/1999/xlink", "href"),
      //                 x: element.getBoundingClientRect().x,
      //                 y: element.getBoundingClientRect().y,
      //             });
      //             // if (element.classList.contains("dragged")) {
      //             //     element.classList.remove("dragged");
      //             //     element.classList.add("alreadyDragged");
      //             // }
      //         }
      //         this.canvas.removeEventListener("gesturechange", this.handleGestureChange);


      //         // console.log("canvawrapper : ",canvasWrapper)
      //         // console.log("rect : ",rect)
      //         console.log("event target : ",event)

      //         const rectTarget = event.target.getBoundingClientRect();
      //         // console.log("rectTarget: ", rectTarget)

      //         // console.log("############### rect.x", rect.x)
      //         // console.log("############### rect.y", rect.y)
      //         // console.log("############### rect.hiehgt", rect.height)
      //         // console.log("############### rect.width", rect.width)

      //         // console.log("############### rectTarget.x", rectTarget.x)
      //         // console.log("############### rectTarget.y", rectTarget.y)
      //         // console.log("############### rectTarget.hiehgt", rectTarget.height)
      //         // console.log("############### rectTarget.width", rectTarget.width)

      //         const sticker = document.createElementNS(
      //             "http://www.w3.org/2000/svg",
      //             "image"
      //         );
      //         sticker.setAttributeNS(null, "height", "48");
      //         sticker.setAttributeNS(null, "width", "48");
      //         sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href",event.target.href.baseVal);
      //         sticker.setAttributeNS(null, "x", rectTarget.x);
      //         sticker.setAttributeNS(null, "y", rectTarget.y);
      //         sticker.setAttributeNS(null, "visibility", "visible");
      //         sticker.classList.add("sticker");
      //         sticker.dataset.type = event.target.dataset.type;
      //         const parent = document.getElementsByClassName('stickers-whiteboard')
      //         parent[0].appendChild(sticker)

      //         this.createDraggable(sticker);


      //         const oldParent = document.getElementsByClassName('stickers')
      //         oldParent[0].removeChild(sticker)
      //         if(!((rectTarget.y + rectTarget.height <rect.y + rect.height && rectTarget.y > rect.y) && (rectTarget.x + rectTarget.width < rect.x + rect.width && rectTarget.x > rect.x))) {
      //             event.target.style.scale = 0
      //         }
      //     }
      // });
    },
    buildStickers() {
      const parent = document.querySelector(".stickers");
      for (let i = 0; i < this.icons.length; i++) {
        this.buildHandleSVG(parent, this.icons[i], i);
      }
    },

    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    toogleEraser() {
      this.isEraserSelected = !this.isEraserSelected;

      if (!this.isEraserSelected) {
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
      return {width: size + 'px!important', height: size + 'px!important', backgroundColor: this.brushColor}
    },
  }
}


</script>

<style>


</style>