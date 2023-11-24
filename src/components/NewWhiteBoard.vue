<template>
  <div class="whiteboard" :class="{ landscape: isLandscape, vertical: !isLandscape }" id="whiteboard">
    <div class="canvas-wrapper">
      <canvas class="canvas" ref="canvas" id="canvas"></canvas>
    </div>


    <div class="sidebar" id="sidebar">
      <div class="stickers-wrapper" :class="{active : stickersState }">
        <div class="stickers-container-container">
          <div class="stickers-container" :style="styleObject">
            <svg class="stickers" style=""></svg>
          </div>

        </div>
        <div class="sitckers-wording" @click="toggleStickers">
          <p>autocollant</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="23" viewBox="0 0 13 23" fill="none">
            <path
                d="M2.5269 22.306C2.3492 22.4924 2.10247 22.6167 1.82602 22.6167C1.26342 22.6167 0.838989 22.1714 0.838989 21.5811C0.838989 21.3015 0.937642 21.0323 1.12524 20.8562L11.2133 10.6663L11.2133 11.94L1.12524 1.77073C0.937643 1.58431 0.83899 1.30467 0.83899 1.03543C0.83899 0.445202 1.26342 -6.85971e-05 1.82602 -6.85904e-05C2.10247 -6.85871e-05 2.3393 0.113821 2.5269 0.310529L12.6643 10.5213C12.8716 10.7284 12.9999 11.008 12.9999 11.3083C12.9999 11.6086 12.8815 11.8778 12.6643 12.0953L2.5269 22.306Z"
                fill="black"/>
          </svg>
        </div>
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
    <a id="download"></a>

  </div>
</template>

<script>

import gsap from "gsap";
import {Draggable} from 'gsap/Draggable';
import "../assets/scss/pages/_new-whiteboard.scss"
import config from '../../config.json';
import * as tmImage from "@teachablemachine/image";

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
      isFullscreenEnable: config.global.FullscreenEnable,
      icons: config.canvas.stickers,
      brushSizes: config.canvas.brushSizesArray,
      currentSize: config.canvas.brushSizesArray[1],
      colors: config.canvas.colors,
      brushColor: config.canvas.colors[0],
      stickersState: false,
      styleObject: '',
      maxPredictions: 0,
      imageName: "unset",
      drawingTimer: null,
      recognitionCount: 0,
      currentCtx: null,
      prevCtx: null,
      diffCtx: null,
      currentDrawing: []
    }
  },
  async mounted() {

    this.resetDrawingTimer();
    this.aspectRatio = this.isLandscape ? 1.78 : 0.5625;
    this.canvas = this.$refs.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.currentCtx = this.canvas.getContext('2d');

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
    if (!this.isLandscape) {
      this.styleObject = 'width: calc(' + this.icons.length + ' * 64px);'
    } else {
      this.styleObject = 'height: calc(' + this.icons.length + ' * 64px);'

    }
    this.prevCanvas = document.createElement('canvas');
    this.prevCanvas.width = this.canvas.width;
    this.prevCanvas.height = this.canvas.height;
    this.prevCtx = this.prevCanvas.getContext('2d');


    this.prevTwoLastCanvas = document.createElement('canvas');
    this.prevTwoLastCanvas.width = this.canvas.width;
    this.prevTwoLastCanvas.height = this.canvas.height;

    this.prevTwoLastCtx = this.prevTwoLastCanvas.getContext('2d');
    this.createDiffCanvas();
    // Mettez à jour la version précédente du dessin initialement

    this.updatePrevCanvas();

    await this.initTeachableMachine();

    if (this.isFullscreenEnable) {
      document.addEventListener("mousemove", () => {
            this.toggleFullscreen()
          }
      )
      document.addEventListener("touchmove", () => {
            this.toggleFullscreen()
          }
      )
    }
  },
  beforeUnmount() {
    this.removeListeners();
  },
  methods: {
    saveCanvasState() {
      // Enregistrez l'état actuel du canvas
      this.previousCanvasState = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    },

    restorePreviousCanvasState() {
      // Restaurez l'état du canvas à celui enregistré précédemment
      if (this.previousCanvasState) {
        this.ctx.putImageData(this.previousCanvasState, 0, 0);
      }
    },
    updatePrevCanvas() {
      if (this.recognitionCount === 2) {
        const prevTwoLastCtx = this.prevTwoLastCanvas.getContext('2d');
        prevTwoLastCtx.drawImage(this.canvas, 0, 0);
      }
      const prevCtx = this.prevCanvas.getContext('2d');
      prevCtx.drawImage(this.canvas, 0, 0);
    }
    ,
    createDiffCanvas() {
      this.diffCanvas = document.createElement('canvas');
      this.diffCanvas.width = 1239;
      this.diffCanvas.height = 1239;
      this.diffCtx = this.diffCanvas.getContext('2d');
      this.diffTwoLastCanvas = document.createElement('canvas');
      this.diffTwoLastCanvas.width = 1239;
      this.diffTwoLastCanvas.height = 1239;
      this.diffTwoLastCtx = this.diffTwoLastCanvas.getContext('2d');
    }
    ,
    compareCanvases() {
      if (this.recognitionCount === 2) {
        this.diffTwoLastCtx.clearRect(0, 0, this.diffTwoLastCanvas.width, this.diffTwoLastCanvas.height);
        const currentImageData = this.currentCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const prevTwoLastImageData = this.prevTwoLastCtx.getImageData(0, 0, this.prevTwoLastCanvas.width, this.prevTwoLastCanvas.height);
        for (let i = 0; i < currentImageData.data.length; i += 4) {
          if (
              currentImageData.data[i] !== prevTwoLastImageData.data[i] ||
              currentImageData.data[i + 1] !== prevTwoLastImageData.data[i + 1] ||
              currentImageData.data[i + 2] !== prevTwoLastImageData.data[i + 2] ||
              currentImageData.data[i + 3] !== prevTwoLastImageData.data[i + 3]
          ) {
            // Si les pixels sont différents, dessinez-les sur le canvas des différences
            this.diffTwoLastCtx.fillStyle = `rgba(${currentImageData.data[i]}, ${currentImageData.data[i + 1]}, ${currentImageData.data[i + 2]}, ${currentImageData.data[i + 3] / 255})`;
            this.diffTwoLastCtx.fillRect((i / 4) % this.canvas.width, Math.floor(i / 4 / this.canvas.width), 1, 1);
          }
        }
      }
      // Effacez le canvas des différences
      this.diffCtx.clearRect(0, 0, this.diffCanvas.width, this.diffCanvas.height);

      const currentImageData = this.currentCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const prevImageData = this.prevCtx.getImageData(0, 0, this.prevCanvas.width, this.prevCanvas.height);

      // Parcourez tous les pixels
      for (let i = 0; i < this.canvas.height; i++) {
        for (let j = 0; j < this.canvas.width; j++) {
          const index = (i * this.canvas.width + j) * 4;

          // Si les pixels sont différents, dessinez-les sur le canvas des différences
          if (
              currentImageData.data[index] !== prevImageData.data[index] ||
              currentImageData.data[index + 1] !== prevImageData.data[index + 1] ||
              currentImageData.data[index + 2] !== prevImageData.data[index + 2] ||
              currentImageData.data[index + 3] !== prevImageData.data[index + 3]
          ) {
            // Si les pixels sont différents, dessinez-les sur le canvas des différences
            this.diffCtx.fillStyle = `rgba(${currentImageData.data[index]}, ${currentImageData.data[index + 1]}, ${currentImageData.data[index + 2]}, ${currentImageData.data[index + 3] / 255})`;
            this.diffCtx.fillRect(j, i, 1, 1);
          }
        }
      }

      // Utilisez le canvas des différences comme nécessaire
      // Par exemple, vous pouvez afficher le canvas des différences dans une image
    }
    ,

    downloadImage(imageName) {
      const link = document.getElementById('download');
      link.download = imageName;
      link.click();
    }
    ,
    getFormattedTime() {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `${hours}_${minutes}_${seconds}`;
    }
    ,
    async downloadCanvas(canvas) {
      var a = document.getElementById('download');
      var b = a.href;
      var date = new Date();

      a.href = canvas.toDataURL();


      const maxPrediction = this.prediction.reduce((max, current) => (current.probability > max.probability ? current : max));

      // Obtenir le label de la prédiction avec la probabilité la plus élevée
      const predictedLabel = maxPrediction.className;
      console.log(predictedLabel)
      const formattedTime = this.getFormattedTime();
      const imageName = `${formattedTime}_prediction_${predictedLabel}${this.recognitionCount}.png`;

      this.downloadImage(imageName);
      a.href = b;
    }
    ,
    async initTeachableMachine() {
      const URL = "src/assets/teachableModel/";
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      // load the model and metadata
      this.teachableMachineModel = await tmImage.load(modelURL, metadataURL);
      this.maxPredictions = this.teachableMachineModel.getTotalClasses();
      await this.loopTeachableMachine()
    }
    ,
    async loopTeachableMachine() {
      await this.predictTeachableMachine();
    }
    ,
    // Loop function for Teachable Machine webcam
    // Predict function for Teachable Machine webcam
    async predictTeachableMachine(canvas) {
      // Get image data from the canvas
      const imageData = this.$refs.canvas.toDataURL();


      if (!this.diffCanvas) {
        this.createDiffCanvas();

      }


      // Incrémentez le compteur de reconnaissances
      this.recognitionCount++;
      // Enregistrez le résultat de la comparaison dans le troisième canvas
      this.compareCanvases();

      // Effectuez une comparaison toutes les deux reconnaissances
      if (this.recognitionCount >= 2) {
        this.updatePrevCanvas();
        this.prediction = await this.teachableMachineModel.predict(canvas);
        await this.teachableMachineModel.predict(this.diffTwoLastCanvas).then((response) => {
          this.downloadCanvas(this.diffTwoLastCanvas)
          this.recognitionCount = 0;
          this.updatePrevCanvas();


        })
        // const prediction = await this.teachableMachineModel.predict(this.diffTwoLastCanvas);


      }

      // Perform prediction using the Teachable Machine model
      this.prediction = await this.teachableMachineModel.predict(canvas);
      const maxPrediction = this.prediction.reduce((max, current) => (current.probability > max.probability ? current : max));

      // Obtenir le label de la prédiction avec la probabilité la plus élevée
      const predictedLabel = maxPrediction.className;
      await this.teachableMachineModel.predict(canvas).then((response) => {
        this.updatePrevCanvas();
      })
      // const prediction = await this.teachableMachineModel.predict(canvas);


      // Mettez à jour la version précédente du dessin
      this.updatePrevCanvas();
      // Display predictions in the UI



      if (predictedLabel === "love") {
        console.log("Coordonnées du dessin :", this.currentDrawing);
        let drawingBoundingBox = this.calculateBoundingBox(this.currentDrawing);
        this.drawBoundingBox(drawingBoundingBox);
      }
      if (predictedLabel === "dick") {
        this.restorePreviousCanvasState();
      } else {
        this.saveCanvasState();

      }


    },

    resetDrawingTimer() {
      // Effacez le minuteur existant s'il y en a un
      if (this.drawingTimer) {
        clearTimeout(this.drawingTimer);
      }

      // Configurez un nouveau minuteur pour déclencher la reconnaissance après 1 seconde
      this.drawingTimer = setTimeout(() => {
        this.predictTeachableMachine(this.diffCanvas).then(() => {
          this.downloadCanvas(this.diffCanvas)
        })

      }, 1000);
    },
    calculateBoundingBox(points) {
      if (points.length === 0) {
        return null;
      }

      let minX = points[0].x;
      let minY = points[0].y;
      let maxX = points[0].x;
      let maxY = points[0].y;

      for (let i = 1; i < points.length; i++) {
        const {x, y} = points[i];
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
      this.currentDrawing = []

      return {minX, minY, maxX, maxY};

    },
    drawBoundingBox(box) {
      if (!box) {
        return;
      }

      const width = box.maxX - box.minX;
      const height = box.maxY - box.minY;

      const heartList = [];

      for (let i = 0; i < 4; i++) {
        let size = Math.random() * 200 + 50;

        // Dimensions aléatoires pour chaque cœur
        const heartWidth = size * 0.6;
        const heartHeight = size * 0.45;

        // Épaisseur du trait aléatoire entre 1 et 4
        const lineWidth = Math.random() * 3 + 1;

        // Couleur aléatoire
        const color = this.getRandomColor();

        // Position aléatoire à l'extérieur de la bounding box, touchant un côté différent
        let x, y;

        // Réglez toujours la position à gauche de la bounding box d'origine
        x = box.minX - heartWidth;
        y = box.minY + Math.random() * (height - heartHeight);

        const newHeartBox = this.calculateBoundingBox([
          {x: x, y: y},
          {x: x + heartWidth, y: y + heartHeight}
        ]);

        // Vérifier la collision avec les bounding boxes existantes
        let collision = false;
        for (const existingHeartBox of heartList) {
          if (this.checkCollision(newHeartBox, existingHeartBox)) {
            collision = true;
            break;
          }
        }

        // Si collision, recalculer la position du cœur
        if (collision) {
          i--; // Répéter la boucle pour recalculer la position
        } else {
          heartList.push(newHeartBox); // Ajouter la nouvelle bounding box
          this.drawHeart(this.ctx, x, y, heartWidth, heartHeight, lineWidth, color);
        }
      }
    }
    ,
    toggleFullscreen() {
      document.getElementById('app').requestFullscreen()
    }
    ,
    toggleStickers() {
      this.stickersState = !this.stickersState
      return this.stickersState
    }
    ,
    initCanvas() {
      this.resizeCanvas();
    },

    drawHeart(ctx, x, y, width, height, lineWidth, color) {
      ctx.save();
      ctx.beginPath();
      let topCurveHeight = width * 0.3;

// Le point de départ est le coin supérieur gauche
      ctx.moveTo(x, y);

// Courbe supérieure gauche
      ctx.bezierCurveTo(
          x - topCurveHeight, y - width / 2,
          x + height / 2, y - width,
          x + height, y
      );

// Courbe inférieure gauche
      ctx.bezierCurveTo(
          x + height / 2, y + width,
          x - topCurveHeight, y + width / 2,
          x, y
      );

      ctx.closePath();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();
      ctx.closePath();
      this.ctx.beginPath()
    }
    ,
    getRandomColor() {
      // Retourne une couleur aléatoire à partir de la palette
      const randomIndex = Math.floor(Math.random() * config.canvas.colors.length);
      return config.canvas.colors[randomIndex];
    },
    initListeners() {
      window.addEventListener('resize', this.resizeCanvas);
      this.canvas.addEventListener("mousedown", this.startPainting);
      this.canvas.addEventListener("mouseup", this.finishedPainting);
      this.canvas.addEventListener("mouseleave", this.finishedPainting);
      this.canvas.addEventListener("mousemove", this.draw);
      this.canvas.addEventListener("touchstart", this.startPainting);
      this.canvas.addEventListener("touchend", this.finishedPainting);
      this.canvas.addEventListener("touchmove", (e) => {
        this.mobileDraw(e.touches[0])
      });
    }
    ,
    removeListeners() {
      window.removeEventListener('resize', this.resizeCanvas);
      this.canvas.removeEventListener("mousedown", this.startPainting)
      this.canvas.removeEventListener("mouseup", this.finishedPainting)
      this.canvas.removeEventListener("mousemove", this.draw)
      this.canvas.removeEventListener("touchstart", this.startPainting)
      this.canvas.removeEventListener("touchend", this.finishedPainting)
      this.canvas.removeEventListener("touchmove", this.mobileDraw)
    }
    ,
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
    }
    ,
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
    }
    ,
    startPainting(e) {
      if (this.isStickers) {

        const rectTarget = e.target.getBoundingClientRect();
        const parent = document.getElementsByClassName('stickers-whiteboard')[0]
        const sticker = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image"
        );
        let size = Math.floor(Math.random() * (55 - 35 + 1)) + 35;
        let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        let rotate = Math.floor(Math.random() * (90 + 1)) * plusOrMinus;
        sticker.setAttributeNS(null, "height", size);
        sticker.setAttributeNS(null, "width", size);
        sticker.setAttributeNS(null, "style", "z-index:200; rotate:" + rotate + "deg;");
        sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", this.stickerHref);
        if (e.touches) {
          sticker.setAttributeNS(null, "x", (e.touches[0].clientX - (this.rectTarget.width) / 2));
          sticker.setAttributeNS(null, "y", (e.touches[0].clientY - (this.rectTarget.height) / 2));
        } else {
          sticker.setAttributeNS(null, "x", (e.x - (this.rectTarget.width) / 2));
          sticker.setAttributeNS(null, "y", (e.y - (this.rectTarget.height) / 2));
        }
        sticker.setAttributeNS(null, "visibility", "visible");
        sticker.classList.add("sticker");

        parent.appendChild(sticker);

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
    }
    ,
    draw(e) {
      if (this.isEraserSelected) {
        this.erase(e);
      }
      if (!this.painting) return
      this.resetDrawingTimer()


      this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.currentDrawing.push({x: e.clientX - this.canvas.offsetLeft, y: e.clientY - this.canvas.offsetTop});
    }
    ,
    mobileDraw(e) {
      // if (!document.querySelector(".dragged")) {

      if (this.isEraserSelected) {
        this.erase(e);
      }
      if (!this.painting) return
      this.resetDrawingTimer()

      this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

    }
    ,
    erase(e) {
      if (!this.painting) return;

      // Use 'destination-out' to erase
      this.ctx.globalCompositeOperation = 'destination-out';

      this.ctx.lineTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)
      this.ctx.stroke()

      this.ctx.beginPath()
      this.ctx.moveTo(e.clientX - this.canvas.offsetLeft, e.clientY - this.canvas.offsetTop)

    }
    ,
    finishedPainting() {
      this.painting = false
      this.ctx.beginPath()

      if (!this.isEraserSelected) {

        this.resetDrawingTimer()
      }
    }
    ,


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

      }
    }
    ,


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
    }
    ,
    initializeMap() {
      this.map = localforage.createInstance({
        name: "map"
      });
      this.map.iterate((value, key) => {
      });
    }
    ,
    buildHandleSVG(parent, path, i) {
      const sticker = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "image"
      );
      sticker.setAttributeNS(null, "height", "48");
      sticker.setAttributeNS(null, "width", "48");
      sticker.setAttributeNS("http://www.w3.org/1999/xlink", "href", path);
      if (this.isLandscape) {
        sticker.setAttributeNS(null, "x", "0");
        sticker.setAttributeNS(null, "y", 64 * i);
      } else {
        sticker.setAttributeNS(null, "x", 64 * i);
        sticker.setAttributeNS(null, "y", "0");
      }
      sticker.setAttributeNS(null, "visibility", "visible");
      sticker.classList.add("sticker");
      sticker.dataset.type = `sticker-${i}`;
      parent.appendChild(sticker);
      this.cloneHandleSVG(parent, `sticker-${i}`);

    }
    ,
    cloneHandleSVG(parent, type) {
      const source = document.querySelector(`.stickers`).querySelector(`[data-type="${type}"]`);
      const clone = source.cloneNode(true);
      parent.appendChild(clone);
      this.createDraggable(clone);

    }
    ,
    createDraggable(element) {

      const newParent = document.querySelector(`.stickers-whiteboard`);
      let canvasWrapper = document.querySelector(".canvas")
      let whiteboard = document.querySelector(".whiteboard")

      const rect = canvasWrapper.getBoundingClientRect();

      element.addEventListener("mousedown", (event) => {
        this.rectTarget = event.target.getBoundingClientRect();
        this.stickerHref = event.target.href.baseVal
        this.isStickers = true
      })
      element.addEventListener("touchstart", (event) => {
        this.rectTarget = event.touches[0].target.getBoundingClientRect();
        this.stickerHref = event.touches[0].target.href.baseVal
        this.isStickers = true
      })
    }
    ,
    buildStickers() {
      const parent = document.querySelector(".stickers");
      for (let i = 0; i < this.icons.length; i++) {
        this.buildHandleSVG(parent, this.icons[i], i);
      }
    }
    ,

    clearCanvas() {

      this.predictTeachableMachine(this.canvas);
      this.downloadCanvas(this.canvas);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      let stickers = document.getElementsByClassName("stickers-whiteboard")[0].getElementsByClassName("sticker")

      let length = stickers.length
      for (let i = 0; i < length; i++) {
        stickers[0].remove()

      }
    }
    ,
    toogleEraser() {
      this.isEraserSelected = !this.isEraserSelected;

      if (!this.isEraserSelected) {
        this.ctx.globalCompositeOperation = 'source-over';
      }
    }
    ,
    disableEraser() {
      this.isEraserSelected = false;
    }
    ,
    changeColor(color) {
      if (this.isEraserSelected) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.disableEraser()
      }
      this.brushColor = color
      this.ctx.strokeStyle = color

    }
    ,
    getPenColor(color) {
      return {backgroundColor: color}
    }
    ,
    changeSize(size) {
      this.ctx.lineWidth = size
      this.currentSize = size
    }
    ,
    getPenStyle(size) {
      return {width: size + 'px!important', height: size + 'px!important', backgroundColor: this.brushColor}
    }
    ,
  }
}


</script>

<style>


</style>