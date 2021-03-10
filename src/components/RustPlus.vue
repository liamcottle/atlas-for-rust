<template>
  <div class="w-full h-full flex flex-col relative">

    <!-- top bar -->
    <div class="flex-none flex bg-gray-700 p-2">

      <div class="flex-1 mx-2 text-white">
        <div class="text-md font-bold">{{server.name}}</div>
        <div class="text-sm">
          <span>{{server.ip}}:{{server.port}}</span>
          <span v-if="info"> • Players: {{info.players}} / {{info.maxPlayers}}</span>
          <span v-if="info"> • Last Wiped: <timeago :datetime="info.wipeTime * 1000" :auto-update="60"></timeago></span>
        </div>
      </div>

      <div class="flex-none flex">

        <!-- vending machine search button -->
        <button v-if="status !== 'none' || status !== 'error'" @click="showVendingMachineSearch" type="button" class="mr-2 my-auto inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
          <svg class="flex-none my-auto mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <span>Search Vending Machines</span>
        </button>

        <!-- refresh button -->
        <button v-if="status === 'connected'" @click="reload" type="button" class="mr-2 my-auto inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>

        <!-- connect button -->
        <button v-if="status !== 'connected'" @click="connect" type="button" class="my-auto inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none">
          Connect
        </button>

        <!-- disconnect button -->
        <button v-if="status === 'connected'" @click="disconnect" type="button" class="my-auto inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
          Disconnect
        </button>

        <!-- remove server button -->
        <button @click="removeServer" type="button" class="mx-2 my-auto inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>

      </div>

    </div>

    <!-- server status -->
    <div v-if="status === 'none' || status === 'error'" class="flex-1">
      <ServerNotConnected v-if="status === 'none'"/>
      <ServerError v-if="status === 'error'" :error="error"/>
    </div>

    <!-- map -->
    <l-map
        v-if="status !== 'none' || status !== 'error'"
        ref="map"
       :crs="mapCRS"
       :zoom="mapZoom"
       :min-zoom="mapMinZoom"
       :max-zoom="mapMaxZoom"
       :options="mapOptions"
       @click="onMapClick"
       @update:zoom="mapZoomUpdated"
       class="flex-1"
       v-bind:style="{ backgroundColor: rustMapImageColour }">

      <!-- layer controls -->
      <l-control-layers position="topright" :sortLayers="true"></l-control-layers>

      <!-- map image -->
      <l-image-overlay v-if="rustMapImageUrl" :zIndexOffset="600" :url="rustMapImageUrl" :bounds="rustMapImageBounds"></l-image-overlay>

      <!-- monument names -->
      <l-layer-group v-if="rustMonuments" layerType="overlay" name="Monuments Names">
        <l-marker v-for="(monument, index) in rustMonuments" :zIndexOffset="700" :lat-lng="getLatLngBoundsFromWorldXY(monument.x, monument.y)" :key="'monument:' + index">
          <l-icon class-name="rust-map-monument-text" :iconAnchor="[(5 + (2 * mapZoom)), 7]">
            <span :style="{fontSize: (5 + (2 * mapZoom)) + 'px'}">{{monument.name}}</span>
          </l-icon>
        </l-marker>
      </l-layer-group>

      <!-- team members -->
      <l-layer-group v-if="rustTeamMembers" layerType="overlay" name="Team Members">
        <l-marker v-if="rustTeamMembers" v-for="(teamMember, index) in rustTeamMembers" :zIndexOffset="800" :lat-lng="getLatLngBoundsFromWorldXY(teamMember.x, teamMember.y)" :key="'team_member:' + index">
          <l-tooltip>
            <span>{{ teamMember.name }}</span>
            <span v-if="!teamMember.isOnline"> (Offline)</span>
            <span v-if="teamMember.isOnline && teamMember.isAlive"> (Online)</span>
            <span v-if="teamMember.isOnline && !teamMember.isAlive"> (Dead)</span>
          </l-tooltip>
          <l-icon>
            <img :src="teamMember.avatarUrl" width="30" height="30" class="border-2" style="border-radius:50%;background-color:#000000;" :class="{
            'border-rust-team-member-offline': !teamMember.isOnline,
            'border-rust-team-member-online': teamMember.isOnline && teamMember.isAlive,
            'border-rust-team-member-dead': teamMember.isOnline && !teamMember.isAlive,
          }">
          </l-icon>
        </l-marker>
      </l-layer-group>

      <!-- map markers: Player=1 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Player Markers">
        <l-marker v-if="mapMarker.type === 1" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip content="Player Marker"/>
        </l-marker>
      </l-layer-group>

      <!-- map markers: Explosion=2 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Explosions">
        <l-marker v-if="mapMarker.type === 2" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip content="Explosion"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/explosion_marker.png"></l-icon>
        </l-marker>
      </l-layer-group>

      <!-- map markers: VendingMachine=3 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Vending Machines">
        <l-marker v-if="mapMarker.type === 3" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip :content="mapMarker.name"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/shop_green.png"></l-icon>
        </l-marker>
      </l-layer-group>

      <!-- map markers: CH47=4 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Chinook">
        <l-marker v-if="mapMarker.type === 4" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip content="CH47"/>
          <l-icon>
            <div style="position:relative" :style="{ transform: 'rotate('+ (-mapMarker.rotation) +'deg)'}">
              <img src="images/map/chinook_map_body.png" width="30" height="30"/>
              <img src="images/map/chinook_map_blades.png" width="20" height="20" class="chinook-blade-spin-anticlockwise" style="position: absolute;top:-5px;left:5px;"/> <!-- anti clockwise rotation -->
              <img src="images/map/chinook_map_blades.png" width="20" height="20" class="chinook-blade-spin-clockwise" style="position: absolute;top:15px;left:5px;"/> <!-- clockwise rotation -->
            </div>
          </l-icon>
        </l-marker>
      </l-layer-group>

      <!-- map markers: CargoShip=5 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Cargo Ship">
        <l-marker v-if="mapMarker.type === 5" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip content="Cargo Ship"/>
          <l-icon>
            <img src="images/map/cargo_ship_body.png" width="30" height="30" :style="{ transform: 'rotate('+ (-mapMarker.rotation) +'deg)'}"/>
          </l-icon>
        </l-marker>
      </l-layer-group>

      <!-- map markers: Crate=6 -->
      <l-layer-group v-if="rustMapMarkers" layerType="overlay" name="Locked Crates">
        <l-marker v-if="mapMarker.type === 6" @click="onMapMarkerClick(mapMarker)" v-for="(mapMarker, index) in rustMapMarkers" :zIndexOffset="900" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">
          <l-tooltip content="Locked Crate"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/crate.png"></l-icon>
        </l-marker>
      </l-layer-group>

      <!-- todo: GenericRadius=7 -->

    </l-map>

    <!-- team members and team chat overlay -->
    <div v-if="status !== 'none' || status !== 'error'" class="flex ml-4 absolute left-0 bottom-0 text-white" style="z-index:500;">

      <!-- team chat -->
      <div class="bg-white rounded-t text-white z-vending-machine-contents mr-4 bg-black-semi-transparent" style="width:400px;">

        <!-- team chat header -->
        <div @click="isShowingTeamChat = !isShowingTeamChat" class="flex p-3 rounded-t bg-gray-600 cursor-pointer">

          <div class="flex mr-2 my-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>

          <div class="flex-grow my-auto text-sm">Team Chat</div>

          <div class="flex-none my-auto ml-2">
            <div class="mx-auto inline-flex items-center p-1 text-gray-300 focus:outline-none">

              <!-- chevron-down -->
              <svg v-if="isShowingTeamChat" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>

              <!-- chevron-up -->
              <svg v-if="!isShowingTeamChat" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
              </svg>

            </div>
          </div>

        </div>

        <!-- team chat messages -->
        <div v-if="isShowingTeamChat" class="px-3 overflow-y-scroll" style="height:400px;">

          <!-- team chat messages -->
          <div v-if="rustTeamChatMessages.length > 0" class="my-2 mx-auto">
            <div v-for="teamChatMessage in rustTeamChatMessages" class="px-2 mb-1 flex rounded-md shadow-sm text-gray-800">
              <div v-if="teamChatMessage.steamId" class="flex-none mr-1">
                <img class="rounded" :src="'https://companion-rust.facepunch.com/api/avatar/' + teamChatMessage.steamId" width="25" height="25"/>
              </div>
              <div class="flex-grow">
                <span v-if="teamChatMessage.name" class="mr-1" :style="{color: teamChatMessage.color}">{{ teamChatMessage.name }}:</span>
                <span class="text-white">{{ teamChatMessage.message }}</span>
              </div>
            </div>
          </div>

          <!-- empty state -->
          <div v-else class="flex h-full">
            <div class="mx-auto my-auto">
              <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <div>No Messages</div>
            </div>
          </div>

        </div>

        <!-- send message -->
        <div v-if="isShowingTeamChat" class="flex-grow py-2">
          <div class="relative rounded-md shadow-sm text-gray-800 px-2">
            <input @keyup.enter="onSendTeamMessage" v-model="teamChatMessageText" type="text" class="focus:outline-none block w-full pr-8 sm:text-sm border-gray-300 rounded-md resize-none" placeholder="Send a message to Team Chat"/>
            <div @click="onSendTeamMessage" class="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-500">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </div>
          </div>
        </div>

      </div>

      <!-- team members -->
      <div v-if="status !== 'none' || status !== 'error'" class="flex-grow">
        <div class="absolute bottom-0 pb-2">
          <div v-if="rustTeamMembers.length > 0" v-for="teamMember in rustTeamMembers" class="flex text-lg mt-4 cursor-pointer" :class="{
          'text-rust-team-member-offline': !teamMember.isOnline,
          'text-rust-team-member-online': teamMember.isOnline && teamMember.isAlive,
          'text-rust-team-member-dead': teamMember.isOnline && !teamMember.isAlive,
        }" @click="$refs.map.mapObject.flyTo(getLatLngBoundsFromWorldXY(teamMember.x, teamMember.y), 3);">

            <!-- offline -->
            <svg v-if="!teamMember.isOnline" class="my-auto w-3 h-3 mr-1" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>

            <!-- online: alive -->
            <svg v-if="teamMember.isOnline && teamMember.isAlive" class="my-auto w-3 h-3 mr-1" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>

            <!-- online: dead -->
            <svg v-if="teamMember.isOnline && !teamMember.isAlive" class="my-auto w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>

            <!-- player name -->
            <span style="text-shadow:1px 1px #000000;">{{ teamMember.name }}</span>

          </div>
        </div>
      </div>

    </div>

    <!-- item search overlay -->
    <div v-if="status !== 'none' || status !== 'error'" class="px-4 absolute bottom-0 right-0" style="z-index:500;">
      <VendingMachineSearch @close="isShowingVendingMachineSearch = false" @item-click="onItemClick" @show-vending-machine="$refs.map.mapObject.flyTo(getLatLngBoundsFromWorldXY($event.x, $event.y), 4);" :isShowing="isShowingVendingMachineSearch" :vending-machines="rustVendingMachines"/>
    </div>

    <!-- vending machine overlay -->
    <div v-if="status !== 'none' || status !== 'error'" class="px-4 absolute bottom-0 right-0" style="z-index:500;">
      <VendingMachineContents @close="selectedVendingMachine = null" @item-click="onItemClick" :vending-machine="selectedVendingMachine"/>
    </div>

    <!-- modals -->
    <ItemModal @close="isShowingItemModal = false" :isShowing="isShowingItemModal" :itemId="selectedItemId"/>

  </div>
</template>

<script>
import { LMap, LLayerGroup, LMarker, LIcon, LImageOverlay, LControlLayers, LTooltip } from "vue2-leaflet";
import ServerNotConnected from "@/components/ServerNotConnected";
import ServerError from "@/components/ServerError";
import VendingMachineContents from "@/components/VendingMachineContents";
import VendingMachineSearch from "@/components/VendingMachineSearch";
import ItemModal from "@/components/modals/ItemModal";

export default {
  name: 'RustPlus',
  components: {
    LMap,
    LLayerGroup,
    LMarker,
    LIcon,
    LTooltip,
    LImageOverlay,
    LControlLayers,
    ServerNotConnected,
    ServerError,
    VendingMachineContents,
    VendingMachineSearch,
    ItemModal,
  },
  props: {
    server: Object,
  },
  data: function() {
    return {

      status: "none",
      error: null,

      autoRefreshTimer: null,

      /* map config */
      mapZoom: 1,
      mapMinZoom: 1,
      mapMaxZoom: 6,
      mapCRS: L.CRS.Simple,
      mapOptions: {
        attributionControl: false,
      },

      /* protobuf */
      protospec: null,

      /* websocket */
      seq: 0,
      seqCallbacks: [],
      websocket: null,

      /* cached data */
      info: null,
      teamInfo: null,
      teamChat: null,
      map: null,
      mapMarkers: null,

      /* language strings */
      lang: require('../lang/en.json'),

      /* map icons */
      mapIcons: {
        crate: L.icon({
          iconUrl: 'images/map/crate_marker.png',
          iconSize: [35, 35],
        }),
      },

      /* processed rust data */
      rustMapImageUrl: null,
      rustMapImageBounds: null,
      rustMapImageColour: null,
      rustMonuments: [],
      rustMapMarkers: [],
      rustTeamMembers: [],
      rustTeamChatMessages: [],

      isShowingItemModal: false,
      isShowingVendingMachineSearch: false,

      isShowingTeamChat: false,
      teamChatMessageText: null,

      /* selected map markers */
      selectedVendingMachine: null,
      selectedItemId: null,

    }
  },
  mounted: async function () {

    // load protobuf definitions
    this.protospec = await window.Protobuf.load('rustplus.proto');

    // lookup proto types
    this.AppRequest = this.protospec.lookupType("rustplus.AppRequest");
    this.AppMessage = this.protospec.lookupType("rustplus.AppMessage");

    // connect
    this.connect();

  },
  beforeDestroy: function() {
    this.disconnect();
  },
  methods: {

    scrollTeamChatToBottom: function() {
      var container = this.$el.querySelector("#team-chat-messages");
      if(container){
        this.$nextTick(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    },

    onSendTeamMessage: function() {

      if(this.status !== 'connected'){

        // add error message to team chat messages and scroll to bottom
        this.rustTeamChatMessages.push({
          color: "#FF0000",
          message: "Server is not Connected.",
          name: "Error",
        });

        this.scrollTeamChatToBottom();

        return;

      }

      // get message to send
      var messageToSend = this.teamChatMessageText;

      // make sure message is provided
      if(messageToSend){

        // send team chat
        this.sendRequest({
          sendTeamMessage: {
            message: messageToSend,
          },
        }, (message) => {

          if(message.response.success){

            // message was sent, and handled
            console.log(message);
            return true;

          } else if(message.response.error && message.response.error.error === 'message_not_sent'){

            // message was not sent, so put it back in ui
            this.teamChatMessageText = messageToSend;

            // add error message to team chat messages and scroll to bottom
            this.rustTeamChatMessages.push({
              color: "#FF0000",
              message: "Failed to send message. Are you in a Team?",
              name: "Error",
            });
            this.scrollTeamChatToBottom();

            // message was not sent, and handled
            console.log(message);
            return true;

          }

          // scroll to bottom of chat
          this.scrollTeamChatToBottom();

        });

        // clear message from ui
        this.teamChatMessageText = null;

      }

    },

    showVendingMachineSearch: function() {
      this.selectedVendingMachine = null;
      this.isShowingVendingMachineSearch = true;
    },

    onMapClick: function() {
      this.selectedVendingMachine = null;
      this.isShowingVendingMachineSearch = false;
    },

    onItemClick: function(id) {
      this.selectedItemId = id;
      this.isShowingItemModal = true;
    },

    onMapMarkerClick: function(mapMarker) {

      // vending machine clicked
      if(mapMarker.type === 3){
        this.selectedVendingMachine = mapMarker;
        this.isShowingVendingMachineSearch = false;
      }

    },

    removeServer: function() {
      this.$emit('remove-server', {
        id: this.server.id,
      });
    },

    onConnecting: function() {
      this.status = "connecting";
    },
    onConnected: function() {

      // we are now connected
      this.status = "connected";

      // initial load
      this.reload();

      // load team chats once on connected and scroll to bottom
      this.getTeamChat(() => {
        this.scrollTeamChatToBottom();
      });

      // setup auto refresh
      this.autoRefreshTimer = setInterval(this.reload, 15000);

    },
    onDisconnected: function() {

      // don't update status to disconnected if in error state
      if(this.status === 'error'){
        return;
      }

      this.status = "disconnected";

    },
    onError: function(error) {
      this.status = "error";
      this.error = error;
    },

    onMessageReceived: function(message) {

      if(message.response){

        // handle info response
        if(message.response.info){
          this.info = message.response.info;
          console.log(this.info);
          return true;
        }

        // handle team info response
        else if(message.response.teamInfo){
          this.teamInfo = message.response.teamInfo;
          console.log(this.teamInfo);
          return true;
        }

        // handle team chat response
        else if(message.response.teamChat){
          this.teamChat = message.response.teamChat;
          console.log(this.teamChat);
          return true;
        }

        // handle map response
        else if(message.response.map){
          this.map = message.response.map;
          console.log(this.map);
          return true;
        }

        // handle map markers response
        else if(message.response.mapMarkers){
          this.mapMarkers = message.response.mapMarkers;
          console.log(this.mapMarkers);
          return true;
        }

        // other messages
        else {
          console.log(message);
        }

      } else if(message.broadcast) {

        if(message.broadcast.teamMessage){

          console.log(message);

          // add new team chat message and scroll to bottom
          this.rustTeamChatMessages.push(message.broadcast.teamMessage.message);
          this.scrollTeamChatToBottom();

        } else if(message.broadcast.teamChanged){

          console.log(message);

          // clear team messages
          this.rustTeamChatMessages = [];

          // update team info
          this.teamInfo = message.broadcast.teamChanged.teamInfo;

          // load team chats and scroll to bottom
          this.getTeamChat((response) => {
            this.scrollTeamChatToBottom();
          });

        } else {
          console.log(message);
        }

      } else {
        console.log(message);
      }

    },

    onMessageSent: function(message) {
      // don't care
    },

    connect: function() {

      this.onConnecting();

      // connect to websocket
      try {
        this.websocket = new WebSocket(`ws://${this.server.ip}:${this.server.port}`);
      } catch (error){
        this.onError(error);
        return;
      }

      this.websocket.binaryType = 'arraybuffer';

      // setup websocket event handlers
      this.websocket.onopen = this.onConnected;
      this.websocket.onclose = this.onDisconnected;
      this.websocket.onerror = (error) => {
        this.onError("Websocket Error");
      };

      // handle received messages
      this.websocket.onmessage = (event) => {

        // decode received message
        var message = this.AppMessage.decode(new Uint8Array(event.data));

        // check if received message is a response and if we have a callback registered for it
        if(message.response && message.response.seq && this.seqCallbacks[message.response.seq]){

          // get the callback for the response sequence
          var callback = this.seqCallbacks[message.response.seq];

          // call the callback with the response message
          var result = callback(message);

          // remove the callback
          delete this.seqCallbacks[message.response.seq];

          // if callback returns true, don't fire default message handler
          if(result){
            return;
          }

        }

        // fire callback for received messages that aren't handled by callback
        this.onMessageReceived(message);

      }

    },

    disconnect: function() {

      if(this.autoRefreshTimer){
        clearInterval(this.autoRefreshTimer);
      }

      if(this.websocket){
        this.websocket.close();
        this.websocket = null;
      }

      this.onDisconnected();

    },

    sendRequest: function(data, callback) {

      // increment sequence number
      let currentSeq = ++this.seq;

      // save callback if provided
      if(callback){
        this.seqCallbacks[currentSeq] = callback;
      }

      // create base payload
      let payload = {
        seq: currentSeq,
        playerId: Long.fromString(this.server.playerId), // Long.fromString is required to support uint64
        playerToken: Long.fromString(this.server.playerToken),
      };

      // merge in request data
      payload = {...payload, ...data};

      // create app request protobuf
      let message = this.AppRequest.fromObject(payload);

      // send app request to rust server
      this.websocket.send(this.AppRequest.encode(message).finish());

      // fire message sent handler when request has been sent, this is useful for logging
      this.onMessageSent(message);

    },

    reload: function() {

      // make sure connected
      if(this.status !== 'connected'){
        return;
      }

      this.getInfo((message) => {

        /**
         * If we get not_found error when fetching info, our playerToken must be invalid.
         * So we will disconnect from server, show an error to the user, and prevent any more
         * requests from being sent to the server.
         */
        if(message.response && message.response.error){
          var appError = message.response.error;
          if(appError.error === 'not_found'){

            // disconnect from server
            this.disconnect();

            // show error message to user
            this.onError("Your player token seems to be invalid. Try pairing with this server again.");

            /**
             * Tell 'onMessageReceived' that we handled this callback so nothing else handles it.
             * also, by returning here, we prevent the getMap request from happening below.
             */
            return true;

          }
        }

        // info must be loaded before map
        this.getMap(() => {

          // map must be loaded before markers and team info
          this.getMapMarkers();
          this.getTeamInfo();

        });

      });

    },

    getInfo: function(callback) {
      this.sendRequest({
        getInfo: {

        },
      }, callback);
    },
    getMap: function(callback) {
      this.sendRequest({
        getMap: {

        },
      }, callback);
    },
    getMapMarkers: function(callback) {
      this.sendRequest({
        getMapMarkers: {

        },
      }, callback);
    },
    getTeamInfo: function(callback) {
      this.sendRequest({
        getTeamInfo: {

        },
      }, callback);
    },
    getTeamChat: function(callback) {
      this.sendRequest({
        getTeamChat: {

        },
      }, callback);
    },

    /**
     * Create a blob uri to the received map image
     */
    createMapUrl: function() {
      if(this.map && this.map.jpgImage){
        var blob = new Blob([this.map.jpgImage], {
          type: "image/jpeg",
        });
        var url = window.URL || window.webkitURL;
        return url.createObjectURL(blob);
      }
      return null;
    },

    /**
     * Convert x coordinate in world to x coordinate in map image pixels
     */
    worldToMapX: function(x) {
      return x * ((this.map.width - 2 * this.map.oceanMargin) / this.info.mapSize) + this.map.oceanMargin;
    },

    /**
     * Convert y coordinate in world to y coordinate in map image pixels
     */
    worldToMapY: function(y) {
      var n = this.map.height - 2 * this.map.oceanMargin;
      return this.map.height - (y * (n / this.info.mapSize) + this.map.oceanMargin)
    },

    /**
     * Convert width and height in pixel coordinates to a latlng bounds for the map
     */
    getLatLngBoundsForMapImage: function(width, height) {

      // get leaflet map object
      var mapObject = this.$refs.map.mapObject;

      // convert x,y to lat,lng
      var southWest = mapObject.unproject([0, height], mapObject.getMaxZoom() - 3);
      var northEast = mapObject.unproject([width, 0], mapObject.getMaxZoom() - 3);

      // return as latlng bounds
      return new L.LatLngBounds(southWest, northEast);

    },

    /**
     * Convert x,y in world coordinates to a latlng bounds for the map
     */
    getLatLngBoundsFromWorldXY: function(worldX, worldY) {

      // get leaflet map object
      var mapObject = this.$refs.map.mapObject;

      // convert world coordinates to x,y on map image
      var mapX = this.worldToMapX(worldX);
      var mapY = this.worldToMapY(worldY);

      // convert x,y to lat,lng for map
      return mapObject.unproject([mapX, mapY], mapObject.getMaxZoom() - 3);

    },

    mapZoomUpdated(zoom) {
      this.mapZoom = zoom;
    },

  },
  computed: {
    rustVendingMachines: function() {
      return this.rustMapMarkers ? this.rustMapMarkers.filter((mapMarker) => {
        return mapMarker.type === 3; // VendingMachine=3
      }) : [];
    },
  },
  watch: {
    server: function() {

      // disconnect from current server when new server is selected
      this.disconnect();

      // clear cached data
      this.info = null;
      this.teamInfo = null;
      this.map = null;
      this.mapMarkers = null;

      // clear processed rust data
      this.rustMapImageUrl = null;
      this.rustMapImageBounds = null;
      this.rustMapImageColour = null;
      this.rustMonuments = [];
      this.rustMapMarkers = [];
      this.rustTeamMembers = [];
      this.rustTeamChatMessages = [];

      // clear selected markers
      this.selectedVendingMachine = null;

      // set status to none, so old server map is not shown
      this.status = 'none';

      // connect if server was updated
      if(this.server){
        this.connect();
      }

    },
    info: function() {

      // make sure data exists
      if(!this.info){
        return;
      }

      // update server name in memory
      this.server.name = this.info.name;

      // get saved servers
      var servers = window.ElectronStore.get('servers').map((server) => {

        // update name for this server
        if(server.id === this.server.id){
          server.name = this.server.name;
        }

        return server;

      });

      // update saved servers
      window.ElectronStore.set('servers', servers);

    },
    map: function() {

      // make sure data exists
      if(!this.map){
        return;
      }

      // determine if we should center the map
      var shouldCenterMap = this.rustMapImageBounds == null;

      // update map data
      this.rustMapImageColour = this.map.background;
      this.rustMapImageBounds = this.getLatLngBoundsForMapImage(this.map.width, this.map.height);
      this.rustMapImageUrl = this.createMapUrl();

      // center the map
      if(shouldCenterMap){
        var mapObject = this.$refs.map.mapObject;
        mapObject.fitBounds(this.rustMapImageBounds);
      }

      // update monuments
      this.rustMonuments = this.map.monuments.map((monument) => {

        // get monument name from lang
        var name = this.lang["monument." + monument.token] || monument.token;

        return {
          name: name,
          x: monument.x,
          y: monument.y,
        };

      });

    },
    mapMarkers: function() {

      // make sure data exists
      if(!this.mapMarkers){
        return;
      }

      // update map markers
      this.rustMapMarkers = this.mapMarkers.markers;

    },
    teamInfo: function() {

      // make sure data exists
      if(!this.teamInfo){
        return;
      }

      // update team members
      this.rustTeamMembers = this.teamInfo.members.map((teamMember) => {

        return {
          name: teamMember.name,
          avatarUrl: 'https://companion-rust.facepunch.com/api/avatar/' + teamMember.steamId,
          isOnline: teamMember.isOnline,
          isAlive: teamMember.isAlive,
          x: teamMember.x,
          y: teamMember.y,
        };

      });

    },
    teamChat: function() {

      // make sure data exists
      if(!this.teamChat){
        return;
      }

      // update team chat messages
      this.rustTeamChatMessages = this.teamChat.messages;

    },
  },
}
</script>
