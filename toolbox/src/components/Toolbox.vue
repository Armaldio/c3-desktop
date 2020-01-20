<template>
  <div id="toolbox">
    <button @click="increment">Hello</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'HelloWorld',
  props: {
    msg: String,
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  #toolbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 100%;
    z-index: 1;
    border: 1px solid red;
  }
</style>
