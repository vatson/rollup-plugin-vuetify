<template>
  <div>{{message}}</div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

type a = {
  b: String;
};

export default Vue.extend({
  data() {
    return {
      style: { color: 'red' },
    };
  },
});
</script>
