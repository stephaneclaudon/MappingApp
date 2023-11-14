<template>
  <div class="whiteboard">
    <!-- <h1 style="color: white">{{ message }}</h1> -->
    <div class="tools">
      <div class="size-boxes-container">
        <button v-for="(size, index) in sizes" :key="index" @click="changeSize(size)" class="box"
                :style="getPenSize(size)"></button>
      </div>
      <div class="size-boxes-container">
        <button v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="box"
                :style="getPenColor(color)"></button>
      </div>
      <button @click="clearCanvas" class="clear">Clear</button>
    </div>

    <div class="canvas-wrapper">
      
      <svg class="stickers" style=""></svg>
      <canvas class="canvas" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import "../assets/scss/pages/_whiteboard.scss"
import localforage from "localforage";
import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';

gsap.registerPlugin(Draggable)
export default {
  data() {
    return {
      message: "Drawing App",
      painting: false,
      canvas: null,
      ctx: null,
      colors: ["#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
      sizes: [12, 16, 20, 24, 28],
      deviceType: null,
      stickerCounter: 0,
      icons: [
        "https://img.icons8.com/dusk/64/000000/department.png",
        "https://img.icons8.com/dusk/64/000000/organization.png",
        "https://img.icons8.com/dusk/64/000000/small-business.png",
        "https://img.icons8.com/dusk/64/000000/company.png"
      ]
    };
  },
  mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext("2d")

    // Set default stroke color

    // Resize canvas
    this.canvas.height = window.innerHeight * 0.9
    this.canvas.width = window.innerWidth * 0.8

    this.setDeviceType()
    // console.log(this.deviceType)
    this.setupEventListeners()


    this.initializeMap();
    this.buildStickers();

    this.changeColor(this.colors[0])
    this.changeSize(this.sizes[0])
    this.ctx.lineCap = "round"
  },
  methods: {
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
    setupEventListeners() {
      // For desktop mouse
      if (this.deviceType === 'desktop') {
        this.canvas.addEventListener("mousedown", this.startPainting)
        this.canvas.addEventListener("mouseup", this.finishedPainting)
        this.canvas.addEventListener("mousemove", this.draw)
      } else if (this.deviceType === 'mobile') {
        // For mobile touch
        this.canvas.addEventListener("touchstart", this.startPainting)
        this.canvas.addEventListener("touchend", this.finishedPainting)
        this.canvas.addEventListener("touchmove", this.mobileDraw)
      }
    },
    changeColor(color) {
      console.log(color)
      this.ctx.strokeStyle = color
    },
    getPenColor(color) {
      return {backgroundColor: color}
    },
    changeSize(size) {
      console.log(size)
      this.ctx.lineWidth = size
    },
    getPenSize(size) {
      return {width: size + 'px!important', height: size + 'px!important'}
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      let dragged = document.getElementsByClassName('dragged')
      for (let i = dragged.length; i > 0 ; i = dragged.length) {
        dragged[0].remove()

      }
    },
    startPainting(e) {
      this.painting = true
      if (this.deviceType === 'desktop') {
        this.draw(e);
      } else if (this.deviceType === 'mobile') {
        this.mobileDraw(e)
      }
    },
    finishedPainting() {
      this.painting = false
      this.ctx.beginPath()
    },
    draw(e) {
      if (!this.painting) return

      // console.log("canvas offset left", this.canvas.offsetTop)
      // console.log("clientX", e.clientX)
      // console.log(this.ctx)
      // console.log(e)

      this.ctx.lineTo(e.layerX - this.canvas.offsetLeft, e.layerY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.layerX - this.canvas.offsetLeft, e.layerY - this.canvas.offsetTop)
    },
    mobileDraw(e) {
      if (!this.painting) return
      // console.log("canvas offset left", this.canvas.offsetLeft)
      // console.log("clientX", e.touches[0].clientX)
      // console.log(e)

      this.ctx.lineTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
    },
    initializeMap() {
      this.map = localforage.createInstance({
        name: "map"
      });
      this.map.iterate((value, key) => {
        this.buildStickers(key, value.src, value.x, value.y);
      });
    },
    buildHandleSVG(parent, path, i) {
      const sticker = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
      );
      sticker.setAttributeNS(null, "height", "64");
      sticker.setAttributeNS(null, "width", "64");
      sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
      sticker.setAttributeNS(null, "x", "0");
      sticker.setAttributeNS(null, "y", 64 * i);
      sticker.setAttributeNS(null, "visibility", "visible");
      sticker.classList.add("sticker");
      sticker.dataset.type = `sticker-${i}`;
      parent.appendChild(sticker);
      this.cloneHandleSVG(parent, `sticker-${i}`);
    },
    cloneHandleSVG(parent, type) {
      const source = document.querySelector(`[data-type="${type}"]`);
      const clone = source.cloneNode(true);
      parent.appendChild(clone);
      this.createDraggable(clone);
    },
    createDraggable(element) {
      Draggable.create(element, {
        type: "x,y",
        bounds: document.querySelector(".canvas-wrapper"),
        edgeResistance: 1,
        onDragStart: () => {
          if (!element.getAttributeNS(null, "id")) {
            element.setAttributeNS(null, "id", `sticker-${this.stickerCounter}`);
            element.setAttributeNS(null, "draggable", "false");
            this.stickerCounter++;
          }
          if (!element.classList.contains("dragged")) {
            this.cloneHandleSVG(
                document.querySelector(".stickers"),
                element.dataset.type
            );
            element.classList.add("dragged");
          }
        },
        onDragEnd: () => {
          // Ensure this.map is initialized before calling setItem
          if (this.map) {
            this.map.setItem(element.getAttributeNS(null, "id"), {
              src: element.getAttributeNS("http://www.w3.org/1999/xlink", "href"),
              x: element.getBoundingClientRect().x,
              y: element.getBoundingClientRect().y,
            });
          }
        },
        onMove : () => {
          console.log(this.target)
        }
      });
    },
    build(wrapper, id, src, x, y) {
      const sticker = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
      );
      sticker.setAttributeNS(null, "id", id);
      sticker.setAttributeNS(null, "height", "32");
      sticker.setAttributeNS(null, "width", "32");
      sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", src);
      sticker.setAttributeNS(null, "transform", `matrix(1, 0, 0, 1, ${x}, ${y})`);
      sticker.setAttributeNS(null, "visibility", "visible");
      sticker.classList.add("sticker");
      this.createDraggable(sticker);
      wrapper.appendChild(sticker);
    },
    buildStickers() {
      const parent = document.querySelector(".stickers");
      for (let i = 0; i < this.icons.length; i++) {
        this.buildHandleSVG(parent, this.icons[i], i);
      }
    }
  },


};
</script>