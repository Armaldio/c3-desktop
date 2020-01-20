<template>
  <div class="home">
    <Toolbox></Toolbox>
    <webview
      id="webview"
      src="https://editor.construct.net"
      nodeintegration
      nodeintegrationinsubframes
      enableremotemodule
      plugins
      disablewebsecurity
      allowpopups
      webpreferences="sandbox=false"
      :preload="preloadPath"
    >
    </webview>
  </div>
</template>

<script>
import fs from 'fs';
import Toolbox from '@/components/Toolbox.vue';

// console.log('__dirname', __DIRNAME__);

export default {
  name: 'home',
  data() {
    return {
    };
  },
  computed: {
    preloadPath() {
      // eslint-disable-next-line
      return `file://${require('path').resolve(__public, './preload.js')}`;
    },
  },
  components: {
    Toolbox,
  },
  mounted() {
    const webview = document.querySelector('#webview');
    webview.addEventListener('ipc-message', (event) => {
      console[event.channel].apply(null, event.args);
    });
  },
};
</script>

<style>
  #webview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: inline-flex !important;
  }
</style>
