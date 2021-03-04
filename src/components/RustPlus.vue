<template>
  <div class="h-full flex flex-col">

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
        v-else
        ref="map"
       :crs="mapCRS"
       :zoom="mapZoom"
       :min-zoom="mapMinZoom"
       :max-zoom="mapMaxZoom"
       class="flex-1"
       v-bind:style="{ backgroundColor: rustMapImageColour }">

      <!-- map image -->
      <l-image-overlay v-if="rustMapImageUrl" :url="rustMapImageUrl" :bounds="rustMapImageBounds"></l-image-overlay>

      <!-- monument names -->
      <l-marker v-if="rustMonuments" v-for="(monument, index) in rustMonuments" :lat-lng="getLatLngBoundsFromWorldXY(monument.x, monument.y)" :key="'monument:' + index">
        <l-popup :content="monument.name"/>
        <l-icon class-name="rust-map-monument-text">{{monument.name}}</l-icon>
      </l-marker>

      <!-- team members -->
      <l-marker v-if="rustTeamMembers" v-for="(teamMember, index) in rustTeamMembers" :lat-lng="getLatLngBoundsFromWorldXY(teamMember.x, teamMember.y)" :key="'team_member:' + index">
        <l-tooltip>
          {{ teamMember.name }} ({{ teamMember.isOnline ? 'Online' : 'Offline' }})
        </l-tooltip>
        <l-icon>
          <img :src="teamMember.avatarUrl" width="30" height="30" style="border-radius:50%;border:2px solid;background-color:#000000;"
               :style="{'border-color': teamMember.isOnline ? '#00FF00' : '#CCCCCC'}"/>
        </l-icon>
      </l-marker>

      <!-- map markers -->
      <l-marker v-if="rustMapMarkers" v-for="(mapMarker, index) in rustMapMarkers" :lat-lng="getLatLngBoundsFromWorldXY(mapMarker.x, mapMarker.y)" :key="'map_marker:' + index">

        <!-- Player=1 -->
        <template v-if="mapMarker.type === 1">
          <l-tooltip content="Player Marker"/>
        </template>

        <!-- Explosion=2 -->
        <template v-if="mapMarker.type === 2">
          <l-tooltip content="Explosion"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/explosion_marker.png"></l-icon>
        </template>

        <!-- VendingMachine=3 -->
        <template v-if="mapMarker.type === 3">
          <l-tooltip :content="mapMarker.name"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/shop_green.png"></l-icon>
        </template>

        <!-- CH47=4 -->
        <template v-if="mapMarker.type === 4">
          <l-tooltip content="CH47"/>
          <l-icon>
            <div style="position:relative" :style="{ transform: 'rotate('+ (-mapMarker.rotation) +'deg)'}">
              <img src="images/map/chinook_map_body.png" width="30" height="30"/>
              <img src="images/map/chinook_map_blades.png" width="20" height="20" class="chinook-blade-spin-anticlockwise" style="position: absolute;top:-5px;left:5px;"/> <!-- anti clockwise rotation -->
              <img src="images/map/chinook_map_blades.png" width="20" height="20" class="chinook-blade-spin-clockwise" style="position: absolute;top:15px;left:5px;"/> <!-- clockwise rotation -->
            </div>
          </l-icon>
        </template>

        <!-- CargoShip=5 -->
        <template v-if="mapMarker.type === 5">
          <l-tooltip content="Cargo Ship"/>
          <l-icon>
            <img src="images/map/cargo_ship_body.png" width="30" height="30" :style="{ transform: 'rotate('+ (-mapMarker.rotation) +'deg)'}"/>
          </l-icon>
        </template>

        <!-- Crate=6 -->
        <template v-if="mapMarker.type === 6">
          <l-tooltip content="Locked Crate"/>
          <l-icon :icon-size="[30, 30]" icon-url="images/map/crate.png"></l-icon>
        </template>

        <!-- GenericRadius=7 todo: unsure -->
        <template v-if="mapMarker.type === 7">
          <l-popup content="GenericRadius"/>
        </template>

      </l-marker>

    </l-map>
  </div>
</template>

<script>
import { LMap, LMarker, LIcon, LPopup, LImageOverlay, LTooltip } from "vue2-leaflet";
import ServerNotConnected from "@/components/ServerNotConnected";
import ServerError from "@/components/ServerError";

export default {
  name: 'RustPlus',
  components: {
    LMap,
    LMarker,
    LIcon,
    LPopup,
    LTooltip,
    LImageOverlay,
    ServerNotConnected,
    ServerError,
  },
  props: {
    server: Object,
  },
  data: function() {

    return {

      status: "none",
      error: null,

      /* map config */
      mapZoom: 3,
      mapMinZoom: 1,
      mapMaxZoom: 5,
      mapCRS: L.CRS.Simple,

      /* protobuf */
      protospec: null,

      /* websocket */
      seq: 0,
      seqCallbacks: [],
      websocket: null,

      /* cached data */
      info: null,
      teamInfo: null,
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

    }
  },
  mounted: async function () {

    // load protobuf definitions
    this.protospec = await window.Protobuf.load('rustplus.proto');

    // lookup proto types
    this.AppRequest = this.protospec.lookupType("rustplus.AppRequest");
    this.AppMessage = this.protospec.lookupType("rustplus.AppMessage");

  },
  methods: {

    removeServer: function() {
      this.$emit('remove-server', {
        id: this.server.id,
      });
    },

    onConnecting: function() {
      this.status = "connecting";
    },
    onConnected: function() {
      this.status = "connected";
      this.reload();
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

        // handle map response
        else if(message.response.map){
          this.map = message.response.map;
          console.log(this.map);
          //this.onMap();
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
      if(this.websocket){
        this.websocket.close();
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

      this.getInfo(); // info is required for map to work as it returns map size
      this.getMap(); // map must be loaded before team info, since
      this.getMapMarkers();
      this.getTeamInfo();

    },

    getInfo: function() {
      this.sendRequest({
        getInfo: {

        },
      });
    },
    getMap: function() {
      this.sendRequest({
        getMap: {

        },
      });
    },
    getMapMarkers: function() {
      this.sendRequest({
        getMapMarkers: {

        },
      });
    },
    getTeamInfo: function() {
      this.sendRequest({
        getTeamInfo: {

        },
      });
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
      var southWest = mapObject.unproject([0, height], mapObject.getMaxZoom());
      var northEast = mapObject.unproject([width, 0], mapObject.getMaxZoom());

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
      return mapObject.unproject([mapX, mapY], mapObject.getMaxZoom());

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

      // set status to none, so old server map is not shown
      this.status = 'none';

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
          x: teamMember.x,
          y: teamMember.y,
        };

      });

    },
  },
}
</script>
