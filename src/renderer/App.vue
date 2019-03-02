<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: 'notepad'
  }
</script>

<style>
  /* CSS */
  * {
    margin: 0;
    padding: 0;
    border: 0;
  }
  html, body, #app {
    height: 100%;
  }
</style>
