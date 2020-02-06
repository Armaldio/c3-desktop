<template>
  <div
    id="toolbox"
    :class="{'opened': opened}"
  >
    <v-btn @click="openDevTool">Open devtool</v-btn>
    <v-btn @click="closeDevTool">Close devtool</v-btn>

    <v-btn
      fab
      class="toggle-drawer-button"
      @click="opened = !opened"
    >
      <v-icon>{{ `mdi mdi-menu-${opened ? 'left' : 'right'}-outline` }}</v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { ipcRenderer } from 'electron';

export default Vue.extend({
  name: 'HelloWorld',
  data() {
    return {
      opened: true,
    };
  },
  props: {
    msg: String,
  },
  methods: {
    async sendMessage(channel: string, ...args: any) {
      return new Promise(((resolve, reject) => {
        ipcRenderer.on(channel, (event, arg) => {
          resolve(arg);
        });
        ipcRenderer.send(channel, ...args);
      }));
    },

    async openDevTool() {
      const result = await this.sendMessage('open-dev-tools');
      console.log('result', result);
    },
    async closeDevTool() {
      const result = await this.sendMessage('close-dev-tools');
      console.log('result', result);
    },
  },
});
</script>

<style
  scoped
  lang="scss"
>
  #toolbox {
    position: fixed;
    top: 0;
    left: -400px;
    width: 400px;
    height: 100%;
    z-index: 1;
    background-color: white;
    transition: left .5s;
  }

  .opened {
    left: 0 !important;
  }

  .toggle-drawer-button {
    position: absolute;
    top: 50%;
    transform: translate(0, -50%);
    left: 380px;
    z-index: 1;
  }
</style>
