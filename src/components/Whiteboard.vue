<template>
  <div class="whiteboard">
    <!-- <h1 style="color: white">{{ message }}</h1> -->

    <div class="tools">
      <p>{{ toolsLabel }}</p>

      <input v-model="isStickersOn" checked type="checkbox" id="switch" @click="updateToolsState(isStickersOn)"/>
      <label for="switch"></label>

      <div class="size-boxes-container">
        <button v-for="(size, index) in sizes" :key="index" @click="changeSize(size)" class="box"
                :style="getPenSize(size)"></button>
      </div>
      <div class="size-boxes-container">
        <button v-for="(color, index) in colors" :key="index" @click="changeColor(color)" class="box"
                :style="getPenColor(color)"></button>
      </div>
      <img src="../assets/bin.svg" alt="clear" class="clear" @click="clearCanvas"/>
    </div>

    <div class="canvas-wrapper">
      <div class="stickers-container">
        <svg class="stickers" style=""></svg>
      </div>
      <canvas class="canvas" ref="canvas"></canvas>
    </div>

    <a href="yourImage.png" download="[imageName].png" id="download" style="pointer-events: none; display: none">Click
      here to download image</a>
    <canvas></canvas>
    <div class="container mt-1">
      <div class="digit-demo-container">
        <div class="flex-two">
          <div class="canvas_box_wrapper">
            <div class="col-12">
              <button class="predict-button" @click="predictDigit">Predict</button>
            </div>
          </div>
          <div id="label-container" class="teachable-machine-labels">
            <button class="predict-button" @click="predictTeachableMachine">Predict</button>
            <div v-for="(prediction, index) in maxPredictions" :key="index" class="teachable-machine-label"
                 :id="'teachableMachineLabel' + index" style="color: white">{{ prediction }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import "../assets/scss/pages/_whiteboard.scss"
import localforage from "localforage";
import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';
import config from '../../config.json';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

gsap.registerPlugin(Draggable)
export default {
  data() {
    return {
      message: "Drawing App",
      painting: false,
      isStickersOn: false,
      toolsLabel: "Stickers",
      canvas: null,
      ctx: null,
      colors: config.canvas.colors,
      sizes: config.canvas.brushSizes,
      deviceType: null,
      stickerCounter: 0,
      icons: config.canvas.stickers,
      maxPredictions: 0,
      imageName: "unset",
      drawingTimer: null,

      currentCtx: null,
      prevCtx: null,
      diffCtx: null,
    };
  },
  async mounted() {


    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext("2d")

    this.currentCtx = this.canvas.getContext('2d');
    // Set default stroke color

    // Resize canvas
    const
        whiteboard = document.getElementsByClassName('whiteboard')[0]

    console.log(whiteboard)

    this.canvas.height = whiteboard.clientHeight
    this.canvas.width = whiteboard.clientHeight * (1080 / 1920)


    this.setDeviceType()
    this.setupEventListeners()


    this.initializeMap();
    this.buildStickers();
    this.changeColor(this.colors[0])
    this.changeSize(this.sizes[0])
    this.ctx.lineCap = "round"
    let stickersContainer = document.getElementsByClassName('stickers')[0]

    window.addEventListener('resize', () => {
      const whiteboard = document.getElementsByClassName('whiteboard')[0]
      console.log("salut")
      this.canvas.height = whiteboard.clientHeight * 0.9
      this.canvas.width = whiteboard.clientHeight * 0.9 * (1080 / 1920)
    })

    stickersContainer.classList.add(this.isStickersOn)
    await this.initTeachableMachine();
    this.prevCanvas = document.createElement('canvas');
    this.prevCanvas.width = this.canvas.width;
    this.prevCanvas.height = this.canvas.height;

    this.prevCtx = this.prevCanvas.getContext('2d');
    this.createDiffCanvas();
    // Mettez à jour la version précédente du dessin initialement

    this.updatePrevCanvas();
  },
  methods: {

    // Mettez à jour la version précédente du dessin
    updatePrevCanvas() {
      const prevCtx = this.prevCanvas.getContext('2d');
      prevCtx.drawImage(this.canvas, 0, 0);
    },
    createDiffCanvas() {
      this.diffCanvas = document.createElement('canvas');
      this.diffCanvas.width = this.canvas.width;
      this.diffCanvas.height = this.canvas.height;
      this.diffCtx = this.diffCanvas.getContext('2d');
    },
    // Comparez le canvas actuel avec la version précédente
    compareCanvases() {
      //todo : faire une recognition sur 1s et sur 2s pour être sûr
      // Effacez le canvas des différences
      this.diffCtx.clearRect(0, 0, this.diffCanvas.width, this.diffCanvas.height);

      const currentImageData = this.currentCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const prevImageData = this.prevCtx.getImageData(0, 0, this.prevCanvas.width, this.prevCanvas.height);

      // Parcourez tous les pixels
      for (let i = 0; i < currentImageData.data.length; i += 4) {
        if (
            currentImageData.data[i] !== prevImageData.data[i] ||
            currentImageData.data[i + 1] !== prevImageData.data[i + 1] ||
            currentImageData.data[i + 2] !== prevImageData.data[i + 2] ||
            currentImageData.data[i + 3] !== prevImageData.data[i + 3]
        ) {
          // Si les pixels sont différents, dessinez-les sur le canvas des différences
          this.diffCtx.fillStyle = `rgba(${currentImageData.data[i]}, ${currentImageData.data[i + 1]}, ${currentImageData.data[i + 2]}, ${currentImageData.data[i + 3] / 255})`;
          this.diffCtx.fillRect((i / 4) % this.canvas.width, Math.floor(i / 4 / this.canvas.width), 1, 1);
        }
      }

      // Utilisez le canvas des différences comme nécessaire
      // Par exemple, vous pouvez afficher le canvas des différences dans une image
      console.log(this.diffCanvas.toDataURL());
    },

    downloadImage(imageName) {
      const link = document.getElementById('download');
      link.download = imageName;
      link.click();
    },
    getFormattedTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `${hours}_${minutes}_${seconds}`;
    },
    async downloadCanvas(canvas) {
      var a = document.getElementById('download');
      var b = a.href;
      var date = new Date();
      var current_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      var current_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      var date_time = current_date + " " + current_time;
      this.imageName = date_time.trim()
      a.href = canvas.toDataURL();

      const prediction = await this.teachableMachineModel.predict(this.$refs.canvas);
      const maxPrediction = prediction.reduce((max, current) => (current.probability > max.probability ? current : max));

      // Obtenir le label de la prédiction avec la probabilité la plus élevée
      const predictedLabel = maxPrediction.className;
      const formattedTime = this.getFormattedTime();
      const imageName = `${formattedTime}_prediction_${predictedLabel}.png`;
      this.downloadImage(imageName);
      a.href = b;
    },
    async initTeachableMachine() {
      const URL = "src/assets/teachableModel/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      // load the model and metadata
      this.teachableMachineModel = await tmImage.load(modelURL, metadataURL);
      this.maxPredictions = this.teachableMachineModel.getTotalClasses();
      // await this.loopTeachableMachine()
    },
    // async loopTeachableMachine() {
    //   await this.predictTeachableMachine();
    //   window.requestAnimationFrame(this.loopTeachableMachine);
    // },
    // Loop function for Teachable Machine webcam
    // Predict function for Teachable Machine webcam
    async predictTeachableMachine() {
      // Get image data from the canvas
      const imageData = this.$refs.canvas.toDataURL();
      if (!this.diffCanvas) {
        this.createDiffCanvas();
      }
      // Enregistrez le résultat de la comparaison dans le troisième canvas
      this.compareCanvases();
      // Perform prediction using the Teachable Machine model
      const prediction = await this.teachableMachineModel.predict(this.diffCanvas);


      // Mettez à jour la version précédente du dessin
      this.updatePrevCanvas();
      // Display predictions in the UI
      for (let i = 0; i < this.maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability.toFixed(2) * 100).toFixed(0) + "%";
        document.getElementById("teachableMachineLabel" + i).innerHTML = classPrediction;
      }
    },
    updateToolsState(isStickersOn) {
      let stickersContainer = document.getElementsByClassName('stickers')[0]
      stickersContainer.classList.remove(this.isStickersOn)
      this.isStickersOn = !isStickersOn
      stickersContainer.classList.add(this.isStickersOn)
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
    setupEventListeners() {
      // For desktop mouse
      if (this.deviceType === 'desktop') {
        this.canvas.addEventListener("mousedown", this.startPainting)
        this.canvas.addEventListener("mouseup", this.finishedPainting)
        this.canvas.addEventListener("mousemove", this.draw)
        this.canvas.addEventListener("touchstart", this.startPainting)
        this.canvas.addEventListener("touchend", this.finishedPainting)
        this.canvas.addEventListener("touchmove", this.mobileDraw)
      } else if (this.deviceType === 'mobile') {
        // For mobile touch
        // this.canvas.addEventListener("touchstart", this.startPainting)
        this.canvas.addEventListener("touchend", this.finishedPainting)
        // this.canvas.addEventListener("touchmove", this.mobileDraw)
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
      this.downloadCanvas(this.canvas);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.prevCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.diffCtx.clearRect(0, 0, this.diffCanvas.width, this.diffCanvas.height)
      let dragged = document.getElementsByClassName('dragged')
      for (let i = dragged.length; i > 0; i = dragged.length) {
        dragged[0].remove()
      }
      this.predictTeachableMachine();
    },
    startPainting(e) {
      this.painting = true
      if (this.deviceType === 'desktop') {
        this.draw(e);
      } else if (this.deviceType === 'mobile') {
        this.mobileDraw(e)
      }
      e.preventDefault()
      e.stopPropagation()
    },
    finishedPainting() {
      this.painting = false
      this.ctx.beginPath()
      this.resetDrawingTimer()

    },
    draw(e) {
      if (!this.painting) return

      this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

      this.resetDrawingTimer();
    },
    resetDrawingTimer() {
      // Effacez le minuteur existant s'il y en a un
      if (this.drawingTimer) {
        clearTimeout(this.drawingTimer);
      }

      // Configurez un nouveau minuteur pour déclencher la reconnaissance après 1 seconde
      this.drawingTimer = setTimeout(() => {
        this.predictTeachableMachine();
        this.downloadCanvas(this.diffCanvas)

      }, 1000);
    },
    mobileDraw(e) {
      if (!this.painting) return
      this.ctx.lineTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      this.resetDrawingTimer();


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
      sticker.setAttributeNS(null, "height", "48");
      sticker.setAttributeNS(null, "width", "48");
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
        onPress: () => {
          gsap.to(element, {
            scale: 1.25,
          })
        },
        onRelease: () => {
          gsap.to(element, {
            scale: 1,
          })
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
      sticker.setAttributeNS(null, "transform", `matrix(1, 0, 0, 1, ${x}, ${y}), scale(1.05)`);
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