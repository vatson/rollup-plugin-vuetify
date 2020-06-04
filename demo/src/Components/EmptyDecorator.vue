<template>
   <v-alert
      :value="true"
      type="success"
    >
      {{ message }}
      <v-btn>OK!</v-btn>
   </v-alert>
</template>

<script lang="ts">
import vue from 'vue';
import { Prop, Component } from 'vue-property-decorator';

@Component
export default class extends vue {
  @Prop({ type: String, default: "This is a decorated component without any vuetify import" })
  public message!: string;
}
</script>