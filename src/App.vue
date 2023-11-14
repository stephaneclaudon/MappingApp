<script setup>
import { RouterView } from 'vue-router'
import { useRouter } from 'vue-router';
import { register } from 'swiper/element/bundle';
register();

const router = useRouter();

function parseResponse(data) {

  console.log(data)
  if (data === undefined || data === null) {
    return
  }

  const value = data.VALUE[0]

  if (value > 0.5) {
    router.push({ path: '/' })
  } else {
    router.push({ path: '/whiteboard' })
  }
}

async function fetchData() {
  const xhr = new XMLHttpRequest();
  await xhr.open("GET", "https://www.dropbox.com/scl/fi/72m58jt4pq2ffgqpglo43/slideshow-opacity.-json?rlkey=1swojrc1aprqibkkchptrxi6y&dl=1");
  xhr.responseType = "json";

  xhr.onload = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      const data = xhr.response;
      parseResponse(data)
    } else {
      console.error(`Error: ${xhr.status}`);
    }
  };

  xhr.send();
}

function mounted() {
    window.addEventListener('load', () => {
      setInterval(fetchData, 1000)
    })
}

mounted()
</script>

<template>
    <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

</style>