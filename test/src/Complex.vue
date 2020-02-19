<template>
  <v-container>
    <v-flex xs12 v-scroll>
      <v-icon>{{icon}}</v-icon>
    </v-flex>
  </v-container>
</template>

<script>
import { VContainer, VFlex as Flex } from 'vuetify/lib';

export default {
  name: 'SimpleComponent',
  components: {
    VContainer,
    Flex,
  },
  props: {
    icon: { type: String, default: 'close' },
  },
};
</script>
