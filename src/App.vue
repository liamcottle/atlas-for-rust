<template>
  <div id="app">

    <!-- Steam is Connected -->
    <template v-if="isRustPlusConnected">
      <div class="h-screen flex flex-col">

        <!-- Main -->
        <div class="flex-grow flex h-full">

          <!-- Left Side -->
          <div class="flex-none h-full flex flex-col">

            <!-- Logo -->
            <div class="flex-none flex py-4 bg-gray-800">
              <a target="_blank" href="https://github.com/liamcottle/atlas-for-rust" class="mx-auto inline-flex items-center justify-center">
                <img src="icon.png" alt="" class=" h-14 w-14 rounded-md bg-gray-300 shadow"/>
              </a>
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
              <div class="flex mb-4">
                <button @click="isShowingLogoutModal = true" type="button" class="mx-auto inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-300 hover:bg-gray-200 focus:outline-none">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>

              <!-- Steam Account Button -->
              <div class="flex-none flex bg-gray-800">
                <img @click="isShowingLogoutModal = true" :src="'https://companion-rust.facepunch.com/api/avatar/' + this.steamId" alt="" class="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-300 shadow cursor-pointer border-2 border-gray-500 hover:border-gray-400"/>
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
            <div class="flex-none flex bg-gray-700 px-4 py-2 text-white z-bottom-bar">

              <div class="flex-grow">

                <!-- fcm status -->
                <div class="flex text-xs">
                  <svg class="my-auto w-3 h-3 mr-1" viewBox="0 0 24 24" :class="{
                  'text-yellow-500': this.fcmStatus === 'not_ready',
                  'text-green-500': this.fcmStatus === 'ready',
                  'text-red-500': this.fcmStatus === 'error',
                }">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <span @click="isShowingFcmInfoModal = true" class="my-auto cursor-pointer hover:text-gray-300">FCM Status: {{ fcmStatusMessage }}</span>
                </div>

                <!-- expo status -->
                <div class="flex text-xs">
                  <svg class="my-auto w-3 h-3 mr-1" viewBox="0 0 24 24" :class="{
                  'text-yellow-500': this.expoStatus === 'not_ready',
                  'text-green-500': this.expoStatus === 'ready',
                  'text-red-500': this.expoStatus === 'error',
                }">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <span @click="isShowingExpoInfoModal = true" class="my-auto cursor-pointer hover:text-gray-300">Expo Status: {{ expoStatusMessage }}</span>
                </div>

                <!-- companion push status -->
                <div class="flex text-xs">
                  <svg class="my-auto w-3 h-3 mr-1" viewBox="0 0 24 24" :class="{
                  'text-yellow-500': this.companionPushStatus === 'not_ready',
                  'text-green-500': this.companionPushStatus === 'ready',
                  'text-red-500': this.companionPushStatus === 'error',
                }">
                    <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                  <span @click="isShowingCompanionPushInfoModal = true" class="my-auto cursor-pointer hover:text-gray-300">Rust+ Status: {{ companionPushStatusMessage }}</span>
                </div>

              </div>

              <div class="flex flex-col text-white text-xs my-auto text-right">
                <div>Atlas v{{ appversion }}</div>
                <div class="flex mx-auto">
                  <div>Developed with</div>
                  <div class="mx-1 text-red-500">
                    <svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>by <a class="hover:text-gray-300" target="_blank" href="https://liamcottle.com">Liam Cottle</a></div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </template>

    <!-- Steam not Connected -->
    <ConnectRustPlus v-else @rustplus-connected="onRustPlusConnected($event)"/>

    <!-- Modals -->
    <AboutModal @close="isShowingAboutModal = false" :isShowing="isShowingAboutModal"/>
    <AddServerModal @add="onAddServer($event)" @close="isShowingAddServerModal = false" :isShowing="isShowingAddServerModal" :steamId="steamId"/>
    <PairServerModal @pair="onAddServer($event)" @close="isShowingPairServerModal = false" :isShowing="isShowingPairServerModal" :notification="lastReceivedPairNotification"/>
    <LogoutModal @close="isShowingLogoutModal = false" @logout="logout" :isShowing="isShowingLogoutModal"/>
    <RemoveServerModal @close="isShowingRemoveServerModal = false" @remove="removeServer" :isShowing="isShowingRemoveServerModal"/>
    <InfoModal @close="isShowingFcmInfoModal = false" :isShowing="isShowingFcmInfoModal" title="Firebase Cloud Messaging" message="We need to register with Firebase Cloud Messaging to be able to receive pairing notifications from the Rust+ Companion API."/>
    <InfoModal @close="isShowingExpoInfoModal = false" :isShowing="isShowingExpoInfoModal" title="Expo Push Token" message="We need to register our Firebase Cloud Messaging token with Expo, so we can send an Expo Push Token to the Rust+ Companion API."/>
    <InfoModal @close="isShowingCompanionPushInfoModal = false" :isShowing="isShowingCompanionPushInfoModal" title="Rust+ Companion API" message="We need to register with the Rust+ Companion API to be able to receive pairing notifications from the in game menus in Rust."/>

  </div>
</template>

<script>
import AboutModal from "@/components/modals/AboutModal";
import InfoModal from "@/components/modals/InfoModal";
import AddServerModal from "@/components/modals/AddServerModal";
import PairServerModal from "@/components/modals/PairServerModal";
import LogoutModal from "@/components/modals/LogoutModal";
import RemoveServerModal from "@/components/modals/RemoveServerModal";
import ConnectRustPlus from './components/ConnectRustPlus.vue'
import ServerSidePanel from './components/ServerSidePanel.vue'
import RustPlus from './components/RustPlus.vue'
import NoServerSelected from './components/NoServerSelected.vue'

const Status = {
  NOT_READY: "not_ready",
  READY: "ready",
  ERROR: "error",
}

export default {
  name: 'App',
  components: {
    InfoModal,
    AboutModal,
    RemoveServerModal,
    LogoutModal,
    AddServerModal,
    PairServerModal,
    ConnectRustPlus,
    ServerSidePanel,
    RustPlus,
    NoServerSelected,
  },
  data: function() {
    return {

      appversion: window.appversion,

      steamId: null,
      rustplusToken: null,

      servers: [],
      selectedServer: null,

      fcmStatus: Status.NOT_READY,
      expoStatus: Status.NOT_READY,
      companionPushStatus: Status.NOT_READY,

      fcmStatusMessage: "Not Ready",
      expoStatusMessage: "Not Ready",
      companionPushStatusMessage: "Not Ready",

      fcmNotificationReceiver: null,
      expoPushTokenReceiver: null,
      rustCompanionReceiver: null,

      isShowingAboutModal: false,
      isShowingAddServerModal: false,
      isShowingPairServerModal: false,
      isShowingLogoutModal: false,
      isShowingRemoveServerModal: false,

      isShowingFcmInfoModal: false,
      isShowingExpoInfoModal: false,
      isShowingCompanionPushInfoModal: false,

      serverToRemoveId: null,
      lastReceivedPairNotification: null,

    };
  },
  computed: {
    isRustPlusConnected: function () {
      return this.steamId && this.rustplusToken;
    },
  },
  mounted() {

    // load rust+ info from store
    this.steamId = window.ElectronStore.get('steam_id');
    this.rustplusToken = window.ElectronStore.get('rustplus_token');

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
      this.fcmStatus = Status.NOT_READY;
      this.fcmStatusMessage = "Registered";

      // save fcm credentials to store
      window.ElectronStore.set('fcm_credentials', data.credentials);

      // start listening for notifications
      this.fcmNotificationReceiver.startListeningForNotifications(data.credentials, []);

    },

    onFCMRegisterError(data) {
      this.fcmStatus = Status.ERROR;
      this.fcmStatusMessage = data.error;
    },

    onFCMNotificationsListenStarted(data) {

      // update fcm status
      this.fcmStatus = Status.READY;
      this.fcmStatusMessage = "Listening";

      // get or generate expo device id
      const { v4: uuidv4 } = require('uuid');
      var deviceId = window.ElectronStore.get('expo_device_id', uuidv4());
      window.ElectronStore.set('expo_device_id', deviceId);

      // configure expo data
      var experienceId = '@facepunch/RustCompanion';
      var appId = 'com.facepunch.rust.companion';
      var fcmToken = window.ElectronStore.get('fcm_credentials').fcm.token;

      // register expo token
      this.expoStatus = Status.NOT_READY;
      this.expoStatusMessage = "Registering...";
      this.expoPushTokenReceiver.register(deviceId, experienceId, appId, fcmToken);

    },

    onFCMNotificationsListenStopped(data) {
      this.fcmStatus = Status.NOT_READY;
      this.fcmStatusMessage = "Stopped Listening";
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
        this.lastReceivedPairNotification = notificationBody;
        this.isShowingPairServerModal = true;
      }

    },

    onFCMNotificationsError(data) {
      this.fcmStatus = Status.ERROR;
      this.fcmStatusMessage = "Notification Error";
    },

    onExpoRegisterSuccess(data) {

      // update expo status
      this.expoStatus = Status.READY;
      this.expoStatusMessage = "Registered";

      // register with rust companion api if logged into steam
      if(this.isRustPlusConnected){

        this.companionPushStatus = Status.NOT_READY;
        this.companionPushMessage = "Registering...";

        /**
         * The Rust Companion API will update the expo token if an existing registration exists for a deviceId.
         * Rust+ uses the device name as the deviceId, so if a user has two devices with same name, it won't work.
         * So, we will use a unique deviceId per installation so notifications will work across multiple installs.
         */
        var expoDeviceId = window.ElectronStore.get('expo_device_id', 'default');
        var deviceId = '@liamcottle/atlas-for-rust:' + expoDeviceId;
        var rustplusToken = window.ElectronStore.get('rustplus_token');

        this.rustCompanionReceiver.register(deviceId, rustplusToken, data.expoPushToken);

      } else {
        this.companionPushStatus = Status.NOT_READY;
        this.companionPushMessage = "Steam Account not Connected";
      }

    },

    onExpoRegisterError(data) {
      this.expoStatus = Status.ERROR;
      this.expoStatusMessage = data.error;
    },

    onRustCompanionRegisterSuccess(data) {
      this.companionPushStatus = Status.READY;
      this.companionPushStatusMessage = "Registered";
    },

    onRustCompanionRegisterError(data) {
      this.companionPushStatus = Status.ERROR;
      this.companionPushStatusMessage = data.error;
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
      window.ElectronStore.delete('rustplus_token');

      // clear in memory state, which will force user to connect steam
      this.servers = [];
      this.steamId = null;
      this.rustplusToken = null;
      this.selectedServer = null;

      // stop listening for notifications
      this.fcmNotificationReceiver.stopListeningForNotifications();

    },

    onRustPlusConnected(event) {

      // save rust+ info to store
      window.ElectronStore.set('steam_id', event.steamId);
      window.ElectronStore.set('rustplus_token', event.token);

      // update steam id and token in memory
      this.steamId = event.steamId;
      this.rustplusToken = event.token;

      // setup notifications
      this.setupNotifications();

    },

    onAddServer(event) {

      // generate id for server
      const { v4: uuidv4 } = require('uuid');

      // get or generate server id
      var id = event.id || uuidv4();

      // get server data from event
      var server = {
        id: id,
        name: event.name || "New Server",
        ip: event.ip,
        port: event.port,
        playerId: event.playerId,
        playerToken: event.playerToken,
      };

      // remove server if it already exists
      var servers = this.servers.filter((server) => {
        return server.id !== id;
      });

      // add server
      servers.push(server);

      // update servers
      this.servers = servers;

      // set server as selected
      this.selectedServer = server;

      // update servers in store
      window.ElectronStore.set('servers', servers);

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
