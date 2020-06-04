<template>
  <v-app>
    <v-container>
      <v-select v-model="current" :items="components"></v-select>
      <component :is="current"></component>
    </v-container>
  </v-app>
</template>

<script>
import * as components from "./Components";

export default {
  components: {
    ...components,
  },
  data: () => ({
    components: Object.keys(components),
    current: Object.keys(components)[0]
  })
}
</script>
