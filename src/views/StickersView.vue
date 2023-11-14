<template>
  <div>
    <!-- Your SVG layer container -->
    <svg id="svg-layer" width="800" height="600"></svg>
  </div>
</template>

<script>
import localforage from "localforage";
import gsap from "gsap";
import { Draggable } from 'gsap/Draggable';
gsap.registerPlugin(Draggable)

export default {
  data() {
    return {
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
    this.initializeMap();
    this.buildStickers();
  },
  methods: {
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
      sticker.setAttributeNS(null, "x", 64 * i + 16 + 8 * i);
      sticker.setAttributeNS(null, "y", "0");
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
        bounds: document.querySelector("#svg-layer"),
        edgeResistance: 1,
        onDragStart: () => {
          if (!element.getAttributeNS(null, "id")) {
            element.setAttributeNS(null, "id", `sticker-${this.stickerCounter}`);
            element.setAttributeNS(null, "draggable", "true");
            this.stickerCounter++;
          }
          if (!element.classList.contains("dragged")) {
            this.cloneHandleSVG(
                document.querySelector("#svg-layer"),
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
              y: element.getBoundingClientRect().y
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
      sticker.setAttributeNS(null, "transform", `matrix(1, 0, 0, 1, ${x}, ${y})`);
      sticker.setAttributeNS(null, "visibility", "visible");
      sticker.classList.add("sticker");
      this.createDraggable(sticker);
      wrapper.appendChild(sticker);
    },
    buildStickers() {
      const parent = document.querySelector("#svg-layer");
      for (let i = 0; i < this.icons.length; i++) {
        this.buildHandleSVG(parent, this.icons[i], i);
      }
    }
  }
};
</script>

<style scoped>
svg {
  display: block;
  border: 1px solid red;
  position: absolute;
  transform-origin: 0 0;
  transform: scale(0.65);
}

body {
  background-color: rebeccapurple
}
</style>
