<template>
  <div>
    <v-flex v-ripple v-my-custom-directive>
      <v-avatar
          :tile="tile"
          color="grey lighten-4"
        >
          <img src="https://vuetifyjs.com/apple-touch-icon-180x180.png" alt="avatar">
        </v-avatar>
      
    </v-flex>
  </div>
</template>

<script lang="ts">
import vue from 'vue';
import { VBtn } from 'vuetify/lib';
import { Prop, Component } from 'vue-property-decorator';

@Component({
  components: { VBtn },
  directives: { MyCustomDirective() {} },
})
export default class extends vue {
  @Prop({type: Boolean, default: false })
  public tile!: Boolean;
}
</script>