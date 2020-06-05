<template>
  <v-flex>
    <v-chip>{{message}}</v-chip>
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { VFlex } from 'vuetify/lib';

export default Vue.extend({
  components: {
    VFlex
  },
  data() {
    return {
      message: "Hello! It's extended component",
    };
  },
});
</script>
