<template>
  <div id="app">

    <!-- Steam is Connected -->
    <template v-if="isSteamConnected">

      <div class="flex h-screen">

        <!-- Left Side -->
        <div class="flex-none h-full flex flex-col">

          <!-- Steam Account Button -->
          <div class="flex-none flex py-4 bg-black">
            <img :src="'https://companion-rust.facepunch.com/api/avatar/' + this.steamId" alt="" class="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-300 shadow cursor-pointer border-2 border-gray-500 hover:border-gray-400"/>
          </div>

          <!-- Server Side Panel -->
          <ServerSidePanel class="flex-grow" :servers="servers" :selectedServer="selectedServer" @server-selected="onServerSelected"/>

        </div>

        <!-- Right Side -->
        <div class="flex-grow h-full overflow-y-scroll">

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

    // load steam info from store
    this.steamId = window.ElectronStore.get('steam_id');
    this.steamToken = window.ElectronStore.get('steam_token');

    // load servers from store
    this.servers = window.ElectronStore.get('servers') || [];

  },
  methods: {

    onSteamConnected(event) {

      // save steam info to store
      window.ElectronStore.set('steam_id', event.steamId);
      window.ElectronStore.set('steam_token', event.steamToken);

      // update steam id and token in memory
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

      // add server
      this.servers.push(server);

      // set server as selected
      this.selectedServer = server;

      // update servers in store
      window.ElectronStore.set('servers', this.servers);

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
