<template>
  <div id="app">
    <RustPlus v-if="isSteamConnected"/>
    <ConnectSteamAccount v-else @steam-connected="onSteamConnected($event)"/>
  </div>
</template>

<script>
import ConnectSteamAccount from './components/ConnectSteamAccount.vue'
import RustPlus from './components/RustPlus.vue'

export default {
  name: 'App',
  components: {
    ConnectSteamAccount,
    RustPlus,
  },
  data: function() {
    return {
      steamId: null,
      steamToken: null,
    };
  },
  computed: {
    isSteamConnected: function () {
      return this.steamId && this.steamToken;
    },
  },
  methods: {
    onSteamConnected(event) {
      console.log("onSteamConnected");
      console.log(event);
      this.steamId = event.steamId;
      this.steamToken = event.steamToken;
    },
  },
}
</script>
