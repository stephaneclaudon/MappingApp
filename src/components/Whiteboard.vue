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

      <svg class="stickers" style=""></svg>
      <canvas class="canvas" ref="canvas"></canvas>
    </div>

    <div class="container mt-1">
      <div class="digit-demo-container">
        <h3>Hand Written Digit Recognition</h3>
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

    <a href="yourImage.png" download="[imageName].png" id="download" style="pointer-events: none; display: none">Click here to download image</a>
    <canvas></canvas>
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
      colors: config.canvasColors,
      sizes: config.canvasBrushSizes,
      deviceType: null,
      stickerCounter: 0,
      icons: config.canvasStickers,
      clickX: [],
      clickY: [],
      clickD: [],
      maxPredictions: 0,
      imageName:"unset",
    };
  },
  async mounted() {
    this.canvas = this.$refs.canvas
    this.ctx = this.canvas.getContext("2d")

    // Set default stroke color

    // Resize canvas
    this.canvas.height = window.innerHeight * 0.9
    this.canvas.width = window.innerWidth * 0.8
    this.setDeviceType()
    this.setupEventListeners()


    this.initializeMap();
    this.buildStickers();
    this.changeColor(this.colors[0])
    this.changeSize(this.sizes[0])
    this.ctx.lineCap = "round"
    let stickersContainer = document.getElementsByClassName('stickers')[0]

    stickersContainer.classList.add(this.isStickersOn)
    this.loadModel();
    await this.initTeachableMachine();
  },
  methods: {
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
    async downloadCanvas() {
      var a = document.getElementById('download');
      var b = a.href;
      var date = new Date();
      var current_date = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      var current_time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      var date_time = current_date + " " + current_time;
      this.imageName = date_time.trim()
      a.href = document.getElementsByTagName('canvas')[0].toDataURL();

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
      await this.loopTeachableMachine()
    },
    async loopTeachableMachine() {
      await this.predictTeachableMachine();
      window.requestAnimationFrame(this.loopTeachableMachine);
    },
    // Loop function for Teachable Machine webcam
    // Predict function for Teachable Machine webcam
    async predictTeachableMachine() {
      // Get image data from the canvas
      const imageData = this.$refs.canvas.toDataURL();
      console.log('Image Data:', imageData);

      // Perform prediction using the Teachable Machine model
      const prediction = await this.teachableMachineModel.predict(this.$refs.canvas);

      // Display predictions in the UI
      for (let i = 0; i < this.maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        document.getElementById("teachableMachineLabel" + i).innerHTML = classPrediction;
      }
    },
    addUserGesture(x, y, dragging) {
      this.clickX.push(x);
      this.clickY.push(y);
      this.clickD.push(dragging);
    },
    async loadModel() {

      // load the model and metadata
      // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
      // or files from your local hard drive
      // Note: the pose library adds "tmImage" object to your window (window.tmImage)
      // model = await tmImage.load(modelURL, metadataURL);
      // maxPredictions = model.getTotalClasses();
    },

    // preprocess the canvas
    preprocessCanvas(image) {
      // resize the input image to target size of (1, 28, 28)
      let tensor = tf.browser.fromPixels(image)
          .resizeNearestNeighbor([28, 28])
          .mean(2)
          .expandDims(2)
          .expandDims()
          .toFloat();
      console.log(tensor.shape);
      return tensor.div(255.0);
    },

    // predict function
    async predictDigit() {
      // get image data from canvas
      var imageData = this.$refs.canvas.toDataURL();

      // preprocess canvas
      console.log(this.$refs.canvas)
      console.log(imageData)
      let tensor = this.preprocessCanvas(this.$refs.canvas);

      // make predictions on the preprocessed image tensor
      let predictions = await this.model.predict(tensor).data();

      // get the model's prediction results
      let results = Array.from(predictions);

      // // display the predictions in chart
      // this.displayChart(results);
      // this.displayLabel(results);
      const prediction = await model.predict(imageData);
      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);

      }
      console.log(results);
      let newResult
      let newResultIndex
      for (let i = 0; i < results.length; i++) {
        if (results[i - 1]) {
          if (newResult < results[i]) {
            newResult = results[i]
            newResultIndex = i
          }
        } else {
          newResult = results[i]
          newResultIndex = i

        }
      }
      console.log(newResult)
      console.log(newResultIndex)
      document.getElementsByClassName('prediction-text')[0].innerHTML = "my prediction is " + newResultIndex;

    },
    updateToolsState(isStickersOn) {
      let stickersContainer = document.getElementsByClassName('stickers')[0]
      stickersContainer.classList.remove(this.isStickersOn)
      this.isStickersOn = !isStickersOn
      stickersContainer.classList.add(this.isStickersOn)
      console.log(this.isStickersOn)
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
      this.downloadCanvas()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      let dragged = document.getElementsByClassName('dragged')
      for (let i = dragged.length; i > 0; i = dragged.length) {
        dragged[0].remove()

      }
      },
    startPainting(e) {
      this.painting = true
      if (this.deviceType === 'desktop') {
        this.addUserGesture(e.clientX - this.$refs.canvas.offsetLeft, e.clientY - this.$refs.canvas.offsetTop);

        this.draw(e);
      } else if (this.deviceType === 'mobile') {
        let touch = e.touches[0];
        this.addUserGesture(touch.clientX - this.$refs.canvas.offsetLeft, touch.clientY - this.$refs.canvas.offsetTop);

        this.mobileDraw(e)
      }
      e.preventDefault()
      e.stopPropagation()
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

      this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.addUserGesture(e.clientX - this.$refs.canvas.offsetLeft, e.clientY - this.$refs.canvas.offsetTop, true);
    },
    mobileDraw(e) {
      if (!this.painting) return
      // console.log("canvas offset left", this.canvas.offsetLeft)
      // console.log("clientX", e.touches[0].clientX)
      // console.log(e)

      // console.log(this.ctx)
      // console.log(this.canvas)

      this.ctx.lineTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.touches[0].clientX - this.canvas.offsetLeft, e.touches[0].clientY - this.canvas.offsetTop)
      this.addUserGesture(e.touches[0].clientX - this.$refs.canvas.offsetLeft, e.touches[0].clientY - this.$refs.canvas.offsetTop, true);
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
        },
        onMove: () => {
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
// import "../assets/js/digit-recognition.js"

</script>