<template>
  <div id="app" class="bg-red-200">

    <!-- Steam is Connected -->
    <template v-if="isSteamConnected">

      <div class="flex h-screen">

        <!-- Left Side -->
        <div class="flex-none h-full">
          <ServerSidePanel/>
        </div>

        <!-- Right Side -->
        <div class="flex-grow h-full bg-blue-500">
          <RustPlus/>
        </div>

      </div>

    </template>

    <!-- Steam not Connected -->
    <ConnectSteamAccount v-else @steam-connected="onSteamConnected($event)"/>

  </div>
</template>

<script>
import ConnectSteamAccount from './components/ConnectSteamAccount.vue'
import ServerSidePanel from './components/ServerSidePanel.vue'
import RustPlus from './components/RustPlus.vue'

export default {
  name: 'App',
  components: {
    ConnectSteamAccount,
    ServerSidePanel,
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
      return true;
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
