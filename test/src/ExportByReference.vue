<template>
  <v-container>
    <v-flex xs12 v-scroll>
      <v-icon>{{icon}}</v-icon>
    </v-flex>
  </v-container>
</template>

<script>
import Vue from 'vue';

const ExportByReference = Vue.extend({
  name: 'ExportByReference',
  props: {
    icon: { type: String, default: 'close' },
  },
});

export default ExportByReference;
</script>
