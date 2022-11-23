import Vue from "vue"
import App from "./App.vue"
import Vuetify from "vuetify"
import router from "../router"
import "@mdi/font/css/materialdesignicons.css" // Ensure you are using css-loader

Vue.use(Vuetify)

// eslint-disable-next-line
new Vue({
  router,
  el: "#app",
  vuetify: new Vuetify({
    icons: {
      iconfont: "mdi", // default - only for display purposes
    }
  }),
  render: (h) => h(App),
})
