import {ipcRenderer} from "electron";
<template>
  <div class="home">
    <Toolbox
      :show="show"
      @close="show = false"
    ></Toolbox>
    <v-speed-dial
      class="speed-dial"
      v-model="speedDialOpened"
      absolute
      bottom
      right
      direction="top"
      open-on-hover
      transition="slide-y-reverse-transition"
    >
      <template #activator>
        <v-btn
          v-model="speedDialOpened"
          fab
          large
          bottom
          right
        >
          <v-icon>mdi-settings</v-icon>
        </v-btn>
      </template>
      <v-btn
        fab
        small
        @click.stop="show = true"
      >
        <v-icon>mdi-settings-outline</v-icon>
      </v-btn>
      <v-btn
        fab
        small
        disabled
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
      <v-btn
        fab
        small
        disabled
      >
        <v-icon>mdi-dev-to</v-icon>
      </v-btn>
    </v-speed-dial>
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
import { ipcRenderer } from 'electron';

export default {
  name: 'home',
  data() {
    return {
      show: false,
      speedDialOpened: false,
    };
  },
  computed: {
    preloadPath() {
      // eslint-disable-next-line
        const path = `file://${require('path').resolve('./preload.js')}`;
      console.log('path', path);
      return path;
    },
  },
  components: {
    Toolbox,
  },
  mounted() {
    console.log('this.preloadPath', this.preloadPath);

    const webview = document.querySelector('#webview');
    if (webview) {
      console.log('iswebview');
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
        // console.log('event', event.channel);

        console[event.channel].apply(null, event.args);
      });
    }
  },
};
</script>

<style scoped>
  .speed-dial {
    right: 36px;
  }

  #webview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: inline-flex !important;
  }
</style>
