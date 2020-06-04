import Vuetify from 'vuetify/lib'
import Vue from "vue";
import App from "./App.vue"

Vue.use(Vuetify);

new Vue({
  el: "#app",
  vuetify: new Vuetify(),
  render: h => h(App),
});
