<template>
    <div>
      <h1>{{ message }}</h1>
      <canvas ref="canvas"></canvas>
      <div>
        <button v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="color-box" :style="{backgroundColor: color}"></button>
        <button @click="clearCanvas">Clear</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        message: "Drawing App",
        painting: false,
        canvas: null,
        ctx: null,
        colors: ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
      };
    },
    mounted() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext("2d");
  
      // Set default stroke color
      this.ctx.strokeStyle = this.colors[0];
  
      // Resize canvas
      this.canvas.height = window.innerHeight * 0.6;
      this.canvas.width = window.innerWidth * 0.8;
  
      this.setupEventListeners();
    },
    methods: {
      setupEventListeners() {
        this.canvas.addEventListener("mousedown", this.startPainting);
        this.canvas.addEventListener("mouseup", this.finishedPainting);
        this.canvas.addEventListener("mousemove", this.draw);
      },
      changeColor(color) {
        this.ctx.strokeStyle = color;
      },
      clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      },
      startPainting(e) {
        this.painting = true;
        this.draw(e);
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
    },
  };
  </script>
  
  <style scoped>
  canvas {
    border: 1px solid #000;
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
  