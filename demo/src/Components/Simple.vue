<template>
  <v-flex xs12 v-scroll>
    {{ message }}
  </v-flex>
</template>

<script>
export default {
  name: 'SimpleComponent',
  props: {
    message: { type: String, default: 'Very Simple Components' },
  },
};
</script>

<style>
body {
  font-size: 1.000001rem;
}
</style>