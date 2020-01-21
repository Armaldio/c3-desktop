<template>
  <div
    id="toolbox"
    :class="{'opened': opened}"
  >
    <v-btn>Open devtool</v-btn>

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
