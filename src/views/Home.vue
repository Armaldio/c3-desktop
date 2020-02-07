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
import Toolbox from '@/components/Toolbox.vue';
import contextMenu from 'electron-context-menu';

export default {
  name: 'home',
  data() {
    return {};
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
    webview.addEventListener('dom-ready', () => {
      contextMenu({
        window: webview,
      });

      // TODO https://github.com/Armaldio/c3-desktop/issues/18
      //       console.log('adding');
      //       webview.executeJavaScript(`
      // var link = document.createElement('link');
      // link.href = 'https://fonts.googleapis.com/css?family=Source+Code+Pro&display=swap';
      // link.rel = 'stylesheet';
      // document.head.appendChild(link);
      //       `);
      //       webview.insertCSS(`
      // @import url('https://fonts.googleapis.com/css?family=Source+Code+Pro&display=swap');
      //
      // .CodeMirror {
      //   // font-family: 'Source Code Pro', monospace !important;
      //   font-size: 24px !important;
      // }
      //     `);
    });

    webview.addEventListener('ipc-message', (event) => {
      console.log('event', event.channel);

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
