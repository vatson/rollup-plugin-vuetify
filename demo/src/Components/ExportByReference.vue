<template>
  <v-chip>Chip used by the component exported by ref</v-chip>
</template>

<script>
import Vue from 'vue';

const ExportByReference = Vue.extend({
  name: 'ExportByReference',
});

export default ExportByReference;
</script>
