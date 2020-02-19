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
import { VBtn } from 'vuetify/lib';
import { Prop, Component, Emit } from 'vue-property-decorator';

@Component({
  components: { VBtn },
  directives: { MyCustomDirective() {} },
})
export default class extends vue {
  @Prop(Boolean)
  public message: string = 'Hello!';
}
</script>