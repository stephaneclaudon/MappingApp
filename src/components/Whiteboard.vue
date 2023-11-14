

<template>
    <div class="whiteboard">
      <!-- <h1 style="color: white">{{ message }}</h1> -->
      <div class="tools">
        <div class="size-boxes-container">
          <button v-for="(size, index) in sizes" :key="index" @click="changeSize(size)" class="box" :style="getPenSize(size)"></button>
        </div>
        <div class="size-boxes-container">
          <button v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="box" :style="getPenColor(color)"></button>
        </div>
        <button @click="clearCanvas" class="clear">Clear</button>
      </div>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
<script>
  import "../assets/scss/pages/_whiteboard.scss"
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
      };
    },
    mounted() {
      this.canvas = this.$refs.canvas
      this.ctx = this.canvas.getContext("2d")

      // Set default stroke color
      this.ctx.strokeStyle = this.colors[0]

      // Resize canvas
      this.canvas.height = window.innerHeight * 0.9
      this.canvas.width = window.innerWidth * 0.8

      this.setDeviceType()
      // console.log(this.deviceType)
      this.setupEventListeners()
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
        this.ctx.strokeStyle = color
      },
      getPenColor(color) {
        return {backgroundColor: color}
      },
      changeSize(size) {
        this.ctx.lineWidth = size
      },
      getPenSize(size) {
        return {width: size + 'px!important', height: size + 'px!important'}
      },
      clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
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

        // this.ctx.lineWidth = 10;
        this.ctx.lineCap = "round"

        this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      },
      mobileDraw(e) {
        if (!this.painting) return

        this.ctx.lineWidth = 10;
        this.ctx.lineCap = "round"

        this.ctx.lineTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
        this.ctx.stroke()

        this.ctx.beginPath()
        this.ctx.moveTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      },
    },
  };
</script>