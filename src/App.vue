<template>
  <div id="app">

    <!-- Steam is Connected -->
    <template v-if="isSteamConnected">
      <div class="h-screen flex flex-col">

        <!-- Main -->
        <div class="flex-grow flex h-full">

          <!-- Left Side -->
          <div class="flex-none h-full flex flex-col">

            <!-- Steam Account Button -->
            <div class="flex-none flex py-4 bg-black">
              <img @click="isShowingLogoutModal = true" :src="'https://companion-rust.facepunch.com/api/avatar/' + this.steamId" alt="" class="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-300 shadow cursor-pointer border-2 border-gray-500 hover:border-gray-400"/>
            </div>

            <!-- Server Side Panel -->
            <ServerSidePanel class="flex-grow" :servers="servers" :selectedServer="selectedServer" @server-selected="onServerSelected"/>

          </div>

          <!-- Right Side -->
          <div class="flex-grow h-full overflow-y-scroll">

            <!-- User has selected a Server -->
            <RustPlus v-if="selectedServer" :server="selectedServer" @remove-server="confirmRemoveServer($event)"/>

            <!-- User hasn't selected a Server -->
            <NoServerSelected v-else @add-server-manually="isShowingAddServerModal = true"/>

          </div>

        </div>

        <!-- Bottom Bar -->
        <div class="flex-none bg-gray-700 px-4 py-2 text-white">

          <!-- fcm status -->
          <div class="text-xs">FCM Status: {{ fcmStatus }}</div>
          <div class="text-xs">Expo Status: {{ expoStatus }}</div>
          <div class="text-xs">Companion Push Status: {{ companionPushStatus }}</div>

        </div>

      </div>
    </template>

    <!-- Steam not Connected -->
    <ConnectSteamAccount v-else @steam-connected="onSteamConnected($event)"/>

    <!-- Modals -->
    <AddServerModal @add="onAddServer($event)" @close="isShowingAddServerModal = false" :isShowing="isShowingAddServerModal" :steamId="steamId"/>
    <LogoutModal @close="isShowingLogoutModal = false" @logout="logout" :isShowing="isShowingLogoutModal"/>
    <RemoveServerModal @close="isShowingRemoveServerModal = false" @remove="removeServer" :isShowing="isShowingRemoveServerModal"/>

  </div>
</template>

<script>
import AddServerModal from "@/components/modals/AddServerModal";
import LogoutModal from "@/components/modals/LogoutModal";
import RemoveServerModal from "@/components/modals/RemoveServerModal";
import ConnectSteamAccount from './components/ConnectSteamAccount.vue'
import ServerSidePanel from './components/ServerSidePanel.vue'
import RustPlus from './components/RustPlus.vue'
import NoServerSelected from './components/NoServerSelected.vue'

export default {
  name: 'App',
  components: {
    RemoveServerModal,
    LogoutModal,
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

      fcmStatus: "Not Ready",
      expoStatus: "Not Ready",
      companionPushStatus: "Not Ready",

      isShowingAddServerModal: false,
      isShowingLogoutModal: false,
      isShowingRemoveServerModal: false,

      serverToRemoveId: null,

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

    // connect to fcm
    var fcmNotificationReceiver = new window.FCMNotificationReceiver(window.ipcRenderer);

    fcmNotificationReceiver.on('register.success', (data) => {

      // update fcm status
      this.fcmStatus = "Registered";

      // save fcm credentials to store
      window.ElectronStore.set('fcm_credentials', data.credentials);

      // start listening for notifications
      fcmNotificationReceiver.startListeningForNotifications(data.credentials, []);

    });

    fcmNotificationReceiver.on('register.error', (data) => {
      this.fcmStatus = "Error: " + data.error;
    });

    fcmNotificationReceiver.on('notifications.listen.started', (data) => {

      // update fcm status
      this.fcmStatus = "Listening";

      const { v4: uuidv4 } = require('uuid');

      // get and update expo device id
      var deviceId = window.ElectronStore.get('expo_device_id', uuidv4());
      window.ElectronStore.set('expo_device_id', deviceId);

      // get or generate expo data
      var experienceId = '@facepunch/RustCompanion';
      var appId = 'com.facepunch.rust.companion';
      var fcmToken = window.ElectronStore.get('fcm_credentials').fcm.token;

      var expoPushTokenReceiver = new window.ExpoPushTokenReceiver(window.ipcRenderer);

      expoPushTokenReceiver.on('register.success', (data) => {

        // update expo status
        this.expoStatus = "Registered";

        var rustCompanionReceiver = new window.RustCompanionReceiver(window.ipcRenderer);

        rustCompanionReceiver.on('register.success', (data) => {
          this.companionPushStatus = "Registered";
        });

        rustCompanionReceiver.on('register.error', (data) => {
          this.companionPushStatus = "Error: " + data.error;
        });

        // register with rust companion api
        this.companionPushStatus = "Registering...";
        rustCompanionReceiver.register(window.ElectronStore.get('steam_token'), data.expoPushToken);

      });

      expoPushTokenReceiver.on('register.error', (data) => {
        this.expoStatus = "Error: " + data.error;
      });

      // register expo token
      this.expoStatus = "Registering...";
      expoPushTokenReceiver.register(deviceId, experienceId, appId, fcmToken);

    });

    fcmNotificationReceiver.on('notifications.listen.stopped', (data) => {
      this.fcmStatus = "Stopped Listening";
    });

    fcmNotificationReceiver.on('notifications.received', (data) => {

      // save persistent id to store if not already in store
      var persistentIds = window.ElectronStore.get('fcm_persistent_ids') || [];
      if(persistentIds.indexOf(data.persistentId) === -1){
        persistentIds.push(data.persistentId);
      }
      window.ElectronStore.set('fcm_persistent_ids', persistentIds);

      // handle notification
      if(data.notification){
        this.onNotificationReceived(data.notification);
      }

    });

    fcmNotificationReceiver.on('notifications.error', (data) => {
      this.fcmStatus = "Notification Error";
    });

    // check for existing fcm credentials
    var credentials = window.ElectronStore.get('fcm_credentials');
    if(credentials){

      // get persistent ids
      var persistentIds = window.ElectronStore.get('fcm_persistent_ids') || [];

      // clear saved persistent ids
      window.ElectronStore.delete('fcm_persistent_ids');

      // start listening for notifications with existing credentials
      fcmNotificationReceiver.startListeningForNotifications(credentials, persistentIds);

    } else {

      // register for a new set of fcm credentials
      this.fcmStatus = "Registering...";
      fcmNotificationReceiver.register('976529667804');

    }

  },
  methods: {

    onNotificationReceived(notification) {

      // make sure notification has data
      if(!notification.data){
        console.log("notification has no data!");
        console.log(notification);
        return;
      }

      // make sure notification has body
      if(!notification.data.body){
        console.log("notification has no body!");
        console.log(notification);
        return;
      }

      // parse notification
      var notificationBody = JSON.parse(notification.data.body);

      // make sure body has type
      if(!notificationBody.type){
        console.log("notification body has no type!");
        console.log(notificationBody);
        return;
      }

      // handle server pairing
      if(notificationBody.type === 'server'){
        this.onAddServer({
          id: notificationBody.id,
          name: notificationBody.name,
          ip: notificationBody.ip,
          port: notificationBody.port,
          playerId: notificationBody.playerId,
          playerToken: notificationBody.playerToken,
        })
      }

    },

    confirmRemoveServer(event) {
      this.serverToRemoveId = event.id;
      this.isShowingRemoveServerModal = true;
    },

    removeServer() {

      // remove saved server by id
      var servers = window.ElectronStore.get('servers').filter((server) => {
        return server.id !== this.serverToRemoveId;
      });

      // update in memory servers
      this.servers = servers;

      // update saved servers
      window.ElectronStore.set('servers', servers);

      // clear server to remove id
      this.serverToRemoveId = null;

      // close modal
      this.isShowingRemoveServerModal = false;

      // remove selected server
      this.selectedServer = null;

    },

    logout() {

      // close logout modal
      this.isShowingLogoutModal = false;

      // forget servers
      window.ElectronStore.delete('servers');

      // forget steam account
      window.ElectronStore.delete('steam_id');
      window.ElectronStore.delete('steam_token');

      // clear in memory state, which will force user to connect steam
      this.servers = [];
      this.steamId = null;
      this.steamToken = null;
      this.selectedServer = null;

    },

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
        id: event.id || uuidv4(),
        name: event.name || "New Server",
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
