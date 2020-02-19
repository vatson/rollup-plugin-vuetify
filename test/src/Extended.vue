<template>
  <v-container>{{message}}</v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

export default Vue.extend({
  data() {
    return {
      message: 'Hello!',
    };
  },
});
</script>
