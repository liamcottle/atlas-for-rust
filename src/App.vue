<template>
  <div id="app" class="bg-red-200">

    <!-- Steam is Connected -->
    <template v-if="isSteamConnected">

      <div class="flex h-screen">

        <!-- Left Side -->
        <div class="flex-none h-full">
          <ServerSidePanel :servers="servers" :selectedServer="selectedServer" @server-selected="onServerSelected"/>
        </div>

        <!-- Right Side -->
        <div class="flex-grow h-full">

          <!-- User has selected a Server -->
          <RustPlus v-if="selectedServer" :server="selectedServer"/>

          <!-- User hasn't selected a Server -->
          <NoServerSelected v-else @add-server-manually="isShowingAddServerModal = true"/>

        </div>

      </div>

    </template>

    <!-- Steam not Connected -->
    <ConnectSteamAccount v-else @steam-connected="onSteamConnected($event)"/>

    <!-- Modals -->
    <AddServerModal @add="onAddServer($event)" @close="isShowingAddServerModal = false" :isShowing="isShowingAddServerModal" :steamId="steamId"/>

  </div>
</template>

<script>
import AddServerModal from "@/components/modals/AddServerModal";
import ConnectSteamAccount from './components/ConnectSteamAccount.vue'
import ServerSidePanel from './components/ServerSidePanel.vue'
import RustPlus from './components/RustPlus.vue'
import NoServerSelected from './components/NoServerSelected.vue'

export default {
  name: 'App',
  components: {
    AddServerModal,
    ConnectSteamAccount,
    ServerSidePanel,
    RustPlus,
    NoServerSelected,
  },
  data: function() {
    return {

      steamId: null,
      steamToken: null,

      servers: [],
      selectedServer: null,

      isShowingAddServerModal: false,

    };
  },
  computed: {
    isSteamConnected: function () {
      return this.steamId && this.steamToken;
    },
  },
  mounted() {

    // todo load servers from database

  },
  methods: {

    onSteamConnected(event) {
      this.steamId = event.steamId;
      this.steamToken = event.steamToken;
    },

    onAddServer(event) {

      // generate id for server
      const { v4: uuidv4 } = require('uuid');

      // get server data from event
      var server = {
        id: uuidv4(),
        name: "New Server", // name will be updated when info fetched
        ip: event.ip,
        port: event.port,
        playerId: event.playerId,
        playerToken: event.playerToken,
      };

      // todo add to servers database

      // add server
      this.servers.push(server);

      // set server as selected
      this.selectedServer = server;

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
