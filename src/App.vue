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
            <div class="flex-none flex py-4 bg-gray-800">
              <img @click="isShowingLogoutModal = true" :src="'https://companion-rust.facepunch.com/api/avatar/' + this.steamId" alt="" class="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-300 shadow cursor-pointer border-2 border-gray-500 hover:border-gray-400"/>
            </div>

            <!-- Divider -->
            <div class="border border-gray-700"></div>

            <!-- Server Side Panel -->
            <ServerSidePanel class="flex-grow" :servers="servers" :selectedServer="selectedServer" @server-selected="onServerSelected"/>

            <!-- Bottom Buttons -->
            <div class="flex-none bg-gray-800 py-4">

              <!-- About Button -->
              <div class="flex mb-4">
                <button @click="isShowingAboutModal = true" type="button" class="mx-auto inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-300 hover:bg-gray-200 focus:outline-none">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
              </div>

              <!-- Logout Button -->
              <div class="flex">
                <button @click="isShowingLogoutModal = true" type="button" class="mx-auto inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-300 hover:bg-gray-200 focus:outline-none">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>

            </div>

          </div>

          <!-- Right Side -->
          <div class="flex flex-col flex-grow h-full overflow-y-scroll">

            <!-- User has selected a Server -->
            <RustPlus v-if="selectedServer" :server="selectedServer" @remove-server="confirmRemoveServer($event)"/>

            <!-- User hasn't selected a Server -->
            <NoServerSelected v-else @add-server-manually="isShowingAddServerModal = true"/>

            <!-- Bottom Bar -->
            <div class="flex-none bg-gray-700 px-4 py-2 text-white">

              <!-- fcm status -->
              <div class="text-xs">FCM Status: {{ fcmStatus }}</div>
              <div class="text-xs">Expo Status: {{ expoStatus }}</div>
              <div class="text-xs">Companion Push Status: {{ companionPushStatus }}</div>

            </div>

          </div>

        </div>

      </div>
    </template>

    <!-- Steam not Connected -->
    <ConnectSteamAccount v-else @steam-connected="onSteamConnected($event)"/>

    <!-- Modals -->
    <AboutModal @close="isShowingAboutModal = false" :isShowing="isShowingAboutModal"/>
    <AddServerModal @add="onAddServer($event)" @close="isShowingAddServerModal = false" :isShowing="isShowingAddServerModal" :steamId="steamId"/>
    <LogoutModal @close="isShowingLogoutModal = false" @logout="logout" :isShowing="isShowingLogoutModal"/>
    <RemoveServerModal @close="isShowingRemoveServerModal = false" @remove="removeServer" :isShowing="isShowingRemoveServerModal"/>

  </div>
</template>

<script>
import AboutModal from "@/components/modals/AboutModal";
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
    AboutModal,
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
      fcmNotificationReceiver: null,
      expoPushTokenReceiver: null,
      rustCompanionReceiver: null,

      isShowingAboutModal: false,
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

    // setup fcm, expo and rust companion receivers
    this.fcmNotificationReceiver = new window.FCMNotificationReceiver(window.ipcRenderer);
    this.expoPushTokenReceiver = new window.ExpoPushTokenReceiver(window.ipcRenderer);
    this.rustCompanionReceiver = new window.RustCompanionReceiver(window.ipcRenderer);

    // setup fcm listeners
    this.fcmNotificationReceiver.on('register.success', this.onFCMRegisterSuccess);
    this.fcmNotificationReceiver.on('register.error', this.onFCMRegisterError);
    this.fcmNotificationReceiver.on('notifications.listen.started', this.onFCMNotificationsListenStarted);
    this.fcmNotificationReceiver.on('notifications.listen.stopped', this.onFCMNotificationsListenStopped);
    this.fcmNotificationReceiver.on('notifications.received', this.onFCMNotificationsReceived);
    this.fcmNotificationReceiver.on('notifications.error', this.onFCMNotificationsError);

    // setup expo listeners
    this.expoPushTokenReceiver.on('register.success', this.onExpoRegisterSuccess);
    this.expoPushTokenReceiver.on('register.error', this.onExpoRegisterError);

    // setup rust companion listeners
    this.rustCompanionReceiver.on('register.success', this.onRustCompanionRegisterSuccess);
    this.rustCompanionReceiver.on('register.error', this.onRustCompanionRegisterError);

    // setup notifications
    this.setupNotifications();

  },
  methods: {

    onFCMRegisterSuccess(data) {

      // update fcm status
      this.fcmStatus = "Registered";

      // save fcm credentials to store
      window.ElectronStore.set('fcm_credentials', data.credentials);

      // start listening for notifications
      this.fcmNotificationReceiver.startListeningForNotifications(data.credentials, []);

    },

    onFCMRegisterError(data) {
      this.fcmStatus = "Error: " + data.error;
    },

    onFCMNotificationsListenStarted(data) {

      // update fcm status
      this.fcmStatus = "Listening";

      // get or generate expo device id
      const { v4: uuidv4 } = require('uuid');
      var deviceId = window.ElectronStore.get('expo_device_id', uuidv4());
      window.ElectronStore.set('expo_device_id', deviceId);

      // configure expo data
      var experienceId = '@facepunch/RustCompanion';
      var appId = 'com.facepunch.rust.companion';
      var fcmToken = window.ElectronStore.get('fcm_credentials').fcm.token;

      // register expo token
      this.expoStatus = "Registering...";
      this.expoPushTokenReceiver.register(deviceId, experienceId, appId, fcmToken);

    },

    onFCMNotificationsListenStopped(data) {
      this.fcmStatus = "Stopped Listening";
    },

    onFCMNotificationsReceived(data) {

      // save persistent id to store if not already in store
      var persistentIds = window.ElectronStore.get('fcm_persistent_ids') || [];
      if(persistentIds.indexOf(data.persistentId) === -1){
        persistentIds.push(data.persistentId);
      }
      window.ElectronStore.set('fcm_persistent_ids', persistentIds);

      // make sure notification exists
      var notification = data.notification;
      if(!notification){
        console.log("notification is null!");
        return;
      }

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

    onFCMNotificationsError(data) {
      this.fcmStatus = "Notification Error";
    },

    onExpoRegisterSuccess(data) {

      // update expo status
      this.expoStatus = "Registered";

      // register with rust companion api if logged into steam
      if(this.isSteamConnected){

        this.companionPushStatus = "Registering...";

        /**
         * The Rust Companion API will update the expo token if an existing registration exists for a deviceId.
         * Rust+ uses the device name as the deviceId, so if a user has two devices with same name, it won't work.
         * So, we will use a unique deviceId per installation so notifications will work across multiple installs.
         */
        var expoDeviceId = window.ElectronStore.get('expo_device_id', 'default');
        var deviceId = '@liamcottle/atlas-for-rust:' + expoDeviceId;
        var steamToken = window.ElectronStore.get('steam_token');

        this.rustCompanionReceiver.register(deviceId, steamToken, data.expoPushToken);

      } else {
        this.companionPushStatus = "Steam Account not Connected";
      }

    },

    onExpoRegisterError(data) {
      this.expoStatus = "Error: " + data.error;
    },

    onRustCompanionRegisterSuccess(data) {
      this.companionPushStatus = "Registered";
    },

    onRustCompanionRegisterError(data) {
      this.companionPushStatus = "Error: " + data.error;
    },

    setupNotifications() {

      // stop listening for notifications if already listening
      this.fcmNotificationReceiver.stopListeningForNotifications();

      // check for existing fcm credentials
      var credentials = window.ElectronStore.get('fcm_credentials');
      if(credentials){

        // get persistent ids
        var persistentIds = window.ElectronStore.get('fcm_persistent_ids') || [];

        // clear saved persistent ids
        window.ElectronStore.delete('fcm_persistent_ids');

        // start listening for notifications with existing credentials
        this.fcmNotificationReceiver.startListeningForNotifications(credentials, persistentIds);

      } else {

        // register for a new set of fcm credentials
        this.fcmStatus = "Registering...";
        this.fcmNotificationReceiver.register('976529667804');

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

      // stop listening for notifications
      this.fcmNotificationReceiver.stopListeningForNotifications();

    },

    onSteamConnected(event) {

      // save steam info to store
      window.ElectronStore.set('steam_id', event.steamId);
      window.ElectronStore.set('steam_token', event.steamToken);

      // update steam id and token in memory
      this.steamId = event.steamId;
      this.steamToken = event.steamToken;

      // setup notifications
      this.setupNotifications();

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
