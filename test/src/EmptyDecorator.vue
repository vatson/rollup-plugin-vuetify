<template>
  <div>
    <v-flex v-ripple v-my-custom-directive>
      {{ message }}
      <v-btn />
    </v-flex>
  </div>
</template>

<script lang="ts">
import vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

@Component
export default class extends vue {
  @Prop(Boolean)
  public message: string = 'Hello!';
}
</script>