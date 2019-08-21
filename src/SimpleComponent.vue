<template>
  <v-container>
    <v-flex xs12 v-scroll>
      <v-icon>{{icon}}</v-icon>
    </v-flex>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'SimpleComponent',
  props: {
    icon: { type: String, default: 'close' },
  },
};
</script>
