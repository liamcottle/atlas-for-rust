<template>
  <div id="app" class="bg-red-200">

    <!-- Steam is Connected -->
    <template v-if="isSteamConnected">

      <div class="flex h-screen">

        <!-- Left Side -->
        <div class="flex-none h-full">
          <ServerSidePanel :selectedServer="selectedServer" @server-selected="onServerSelected"/>
        </div>

        <!-- Right Side -->
        <div class="flex-grow h-full">

          <!-- User has selected a Server -->
          <RustPlus v-if="selectedServer" :server="selectedServer"/>

          <!-- User hasn't selected a Server -->
          <NoServerSelected v-else/>

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
import NoServerSelected from './components/NoServerSelected.vue'

export default {
  name: 'App',
  components: {
    ConnectSteamAccount,
    ServerSidePanel,
    RustPlus,
    NoServerSelected,
  },
  data: function() {
    return {

      steamId: null,
      steamToken: null,

      selectedServer: null,

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

    onServerSelected(event) {

      // server that the user selected
      var server = event.server;

      // clear selected server if no server was selected
      if(server == null){
        this.selectedServer = null;
        return;
      }

      // if user selected same server, clear selected server
      if(this.selectedServer && this.selectedServer.id === server.id){
        this.selectedServer = null;
        return;
      }

      // update selected server
      this.selectedServer = event.server;

    }

  },
}
</script>
