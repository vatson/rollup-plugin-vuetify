<template>
  <v-flex xs12 v-scroll>
    <v-alert
      :value="true"
      type="success"
    >
      Autoloaded component
    </v-alert>
    <alert
      :value="true"
      type="error"
    >
      Local aliased component
    </alert>
  </v-flex>
</template>

<script>
import { VAlert as Alert } from 'vuetify/lib';

export default {
  name: 'SimpleComponent',
  components: {
    Alert,
  },
  props: {
    icon: { type: String, default: 'close' },
  },
};
</script>
