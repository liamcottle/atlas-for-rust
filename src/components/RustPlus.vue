<template>
  <div>

    <div style="background:#cccccc;padding:0.5rem;">
      <input v-model="ip" type="text" placeholder="IP"/>
      <input v-model="port" type="text" placeholder="Port"/>
      <input v-model="playerId" type="text" placeholder="Player ID"/>
      <input v-model="playerToken" type="text" placeholder="Player Token"/>
      <button v-if="status !== 'connected'" @click="connect" type="button">Connect</button>
      <button v-if="status === 'connected'" @click="reload" type="button">Refresh</button>
      <button v-if="status === 'connected'" @click="disconnect" type="button">Disconnect</button>
      <span>Status: {{ status }}</span>
    </div>

    <l-map ref="map"
       :crs="mapCRS"
       :zoom="mapZoom"
       :min-zoom="mapMinZoom"
       :max-zoom="mapMaxZoom"
       style="width:100vw;height:100vh;"
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
          <l-icon :icon-size="[30, 30]" icon-url="/images/map/explosion_marker.png"></l-icon>
        </template>

        <!-- VendingMachine=3 -->
        <template v-if="mapMarker.type === 3">
          <l-popup content="Vending Machine"/>
          <l-icon :icon-size="[30, 30]" icon-url="/images/map/vending_machine.png"></l-icon>
        </template>

        <!-- CH47=4 todo: icon -->
        <template v-if="mapMarker.type === 4">
          <l-tooltip content="CH47"/>
        </template>

        <!-- CargoShip=5 todo: icon -->
        <template v-if="mapMarker.type === 5">
          <l-tooltip content="Cargo Ship"/>
        </template>

        <!-- Crate=6 -->
        <template v-if="mapMarker.type === 6">
          <l-tooltip content="Locked Crate"/>
          <l-icon :icon-size="[30, 30]" icon-url="/images/map/crate_marker.png"></l-icon>
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

export default {
  name: 'RustPlus',
  components: {
    LMap,
    LMarker,
    LIcon,
    LPopup,
    LTooltip,
    LImageOverlay,
  },
  data: function() {

    return {

      status: "none",

      /* map config */
      mapZoom: 1,
      mapMinZoom: 1,
      mapMaxZoom: 5,
      mapCRS: L.CRS.Simple,

      /* protobuf */
      protospec: null,

      /* websocket */
      seq: 0,
      seqCallbacks: [],
      websocket: null,

      /* server and player info */
      ip: null,
      port: null,
      playerId: null,
      playerToken: null,

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
          iconUrl: '/images/map/crate_marker.png',
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

    // load cookies
    this.ip = this.$cookie.get('ip');
    this.port = this.$cookie.get('port');
    this.playerId = this.$cookie.get('playerId');
    this.playerToken = this.$cookie.get('playerToken');

    // load protobuf definitions
    this.protospec = await window.Protobuf.load('rustplus.proto');

    // lookup proto types
    this.AppRequest = this.protospec.lookupType("rustplus.AppRequest");
    this.AppMessage = this.protospec.lookupType("rustplus.AppMessage");

  },
  methods: {

    onConnecting: function() {
      this.status = "connecting";
    },
    onConnected: function() {
      this.status = "connected";
      this.reload();
    },
    onDisconnected: function() {
      this.status = "disconnected";
    },
    onError: function() {
      this.status = "error";
    },

    onMessageReceived: function(message) {

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

    },
    onMessageSent: function(message) {
      // don't care
    },

    connect: function() {

      // ip and port are required to connect
      if(!this.ip || !this.port){
        return;
      }

      this.onConnecting();

      // connect to websocket
      this.websocket = new WebSocket(`ws://${this.ip}:${this.port}`);
      this.websocket.binaryType = 'arraybuffer';

      // setup websocket event handlers
      this.websocket.onopen = this.onConnected;
      this.websocket.onclose = this.onDisconnected;
      this.websocket.onerror = this.onError;
      this.websocket.onerror = this.onError;

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
        playerId: Long.fromString(this.playerId), // Long.fromString is required to support uint64
        playerToken: Long.fromString(this.playerToken),
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
    ip: function() {
      this.$cookie.set("ip", this.ip, 7);
    },
    port: function() {
      this.$cookie.set("port", this.port, 7);
    },
    playerId: function() {
      this.$cookie.set("playerId", this.playerId, 7);
    },
    playerToken: function() {
      this.$cookie.set("playerToken", this.playerToken, 7);
    },
    map: function() {

      // update map data
      this.rustMapImageColour = this.map.background;
      this.rustMapImageBounds = this.getLatLngBoundsForMapImage(this.map.width, this.map.height);
      this.rustMapImageUrl = this.createMapUrl();

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

      // update map markers
      this.rustMapMarkers = this.mapMarkers.markers;

    },
    teamInfo: function() {

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
