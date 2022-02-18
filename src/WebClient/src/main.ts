import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import global_v from './global.js'

Vue.config.productionTip = false

Vue.prototype.GLOBAL = global_v

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
