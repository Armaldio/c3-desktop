<template>
  <v-dialog
    persistent
    :value="show"
    max-width="70%"
  >
    <v-card>
      <v-card-title class="headline">
        <div class="text-center modal-title">Construct Toolbox</div>
        <v-btn
          absolute
          right
          icon
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-tabs
          v-model="tabs"
          fixed-tabs
        >
          <v-tabs-slider></v-tabs-slider>
          <v-tab
          >
            <v-icon left>mdi-gesture-tap</v-icon>
            Actions
          </v-tab>

          <v-tab
          >
            <v-icon left>mdi-settings</v-icon>
            Settings
          </v-tab>

          <v-tab
            disabled
          >
            <v-icon left>mdi-toy-brick-search</v-icon>
            Plugins
          </v-tab>
        </v-tabs>

        <v-tabs-items v-model="tabs">
          <v-tab-item>
            <v-card flat>
              <v-card-text>
                <v-list>
                  <v-list-item @click="openDevTool">
                    Open devtool
                  </v-list-item>
                  <v-list-item @click="closeDevTool">
                    Close devtool
                  </v-list-item>
                  <v-list-item @click="ReloadWebview">
                    Reload Construct
                  </v-list-item>
                </v-list>

                <!-- <v-btn @click="closeDevTool">Close devtool</v-btn>-->

                <!-- <v-btn @click="closeDevToolWebview">Open construct devtool</v-btn>-->
                <!-- <v-btn @click="closeDevToolWebview">Close construct devtool</v-btn>-->

                <!-- <v-btn @click="ReloadWebview">Reload Construct</v-btn>-->
              </v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item></v-tab-item>
          <v-tab-item></v-tab-item>
        </v-tabs-items>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { ipcRenderer, WebviewTag } from 'electron';

// import WebviewTag = Electron.WebviewTag;

  declare interface ToolboxData {
    opened: boolean;
    webview: WebviewTag | null,
    tabs: null | number
  }

export default Vue.extend({
  name: 'Toolbox',
  data(): ToolboxData {
    return {
      opened: true,
      webview: null,
      tabs: null,
    };
  },
  props: {
    show: Boolean,
  },
  methods: {
    close() {
      this.$emit('close');
    },
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
    async openDevToolWebview() {
      if (this.webview) {
        this.webview.openDevTools();
      }
    },
    async closeDevToolWebview() {
      if (this.webview) {
        this.webview.openDevTools();
      }
    },
    async ReloadWebview() {
      if (this.webview) {
        this.webview.reload();
      }
    },
  },
  mounted(): void {
    this.webview = document.querySelector('#webview') as WebviewTag;
    if (this.webview) {
      ipcRenderer.on('reload', (event, arg) => {
        if (this.webview) {
          this.webview.reload();
        }
      });
    }
  },
});
</script>

<style
  scoped
  lang="scss"
>
  /*
  #toolbox {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100%;
    z-index: 1;
    background-color: #ccc;
    transition: all .25s;
  }

  .opened {
    left: 0 !important;
    border-top-right-radius: 32px;
  }

  .toggle-drawer-button {
    position: absolute;
    top: 95%;
    transform: translate(0, -50%);
    right: 380px;
    z-index: 1;
  } */

  .modal-title {
    width: 100%;
  }
</style>
