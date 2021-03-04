import Vue from 'vue'
import App from './App.vue'

// add globals
window.Long = require('long');
window.Protobuf = require('protobufjs');
window.ExpoPushTokenReceiver = require('./ipc/renderer/ExpoPushTokenReceiver');
window.FCMNotificationReceiver = require('./ipc/renderer/FCMNotificationReceiver');

// configure long support for protobufjs
window.Protobuf.util.Long = window.Long;
window.Protobuf.configure();

// configure vue
Vue.config.productionTip = false

// import leaflet stylesheet
import 'leaflet/dist/leaflet.css';

// fix default map markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// add vue cookie
var VueCookie = require('vue-cookie');
Vue.use(VueCookie);

// render vue app
new Vue({
  render: h => h(App),
}).$mount('#app')
