

<template>
    <div class="whiteboard">
      <!-- <h1 style="color: white">{{ message }}</h1> -->
      <canvas ref="canvas"></canvas>
      <div class="tools">
        <button v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="color-box" :style="{backgroundColor: color}"></button>
        <button @click="clearCanvas" class="clear">Clear</button>
      </div>
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
        deviceType: null,
      };
    },
    mounted() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");

      // Set default stroke color
      this.ctx.strokeStyle = this.colors[0];

      // Resize canvas
      this.canvas.height = window.innerHeight * 0.9;
      this.canvas.width = window.innerWidth * 0.8;

      this.setDeviceType();
      // console.log(this.deviceType)
      this.setupEventListeners();
    },
    methods: {
      setDeviceType() {
        const platform = navigator.userAgentData.platform.toLowerCase();
        if (/(android|webos|iphone|ipad|ipod|blackberry|windows phone)/.test(platform)) {
          this.deviceType = 'mobile';
        } else if (/mac|win|linux/i.test(platform)) {
          this.deviceType = 'desktop';
        } else if (/tablet|ipad/i.test(platform)) {
          this.deviceType = 'tablet';
        } else {
          this.deviceType = 'unknown';
        }
      },
      setupEventListeners() {
        // For desktop mouse
        if (this.deviceType === 'desktop') {
          this.canvas.addEventListener("mousedown", this.startPainting);
          this.canvas.addEventListener("mouseup", this.finishedPainting);
          this.canvas.addEventListener("mousemove", this.draw);
        } else if (this.deviceType === 'mobile') {
          // For mobile touch
          this.canvas.addEventListener("touchstart", this.startPainting);
          this.canvas.addEventListener("touchend", this.finishedPainting);
          this.canvas.addEventListener("touchmove", this.mobileDraw);
        }
      },
      changeColor(color) {
        this.ctx.strokeStyle = color;
      },
      clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },
      startPainting(e) {
        this.painting = true;
        if (this.deviceType === 'desktop') {
          this.draw(e);
        } else if (this.deviceType === 'mobile') {
          this.mobileDraw(e)
        }
      },
      finishedPainting() {
        this.painting = false;
        this.ctx.beginPath();
      },
      draw(e) {
        if (!this.painting) return;

        this.ctx.lineWidth = 10;
        this.ctx.lineCap = "round";

        this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop);
      },
      mobileDraw(e) {
        if (!this.painting) return;

        this.ctx.lineWidth = 10;
        this.ctx.lineCap = "round";

        this.ctx.lineTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop);
      },
    },
  };
  </script>
  
  <style scoped>
  canvas {
    border: 1px solid #fff;
  }

  .color-box {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin: 0 5px;
    cursor: pointer;
    border-radius: 50%;
  }
  </style>
  