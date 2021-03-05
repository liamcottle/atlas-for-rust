<template>
  <Transition name="fade">
    <div v-if="isShowing" class="fixed z-modal inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div @click="close" class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div>
            <div class="mt-3 text-center sm:mt-5">

              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-headline">
                Add Server
              </h3>

              <!-- server ip -->
              <div class="text-left mb-4">
                <label for="server-ip" class="block text-sm font-medium text-gray-700">Server IP</label>
                <div class="mt-1">
                  <input v-model="ip" type="text" id="server-ip" class="shadow-sm focus:outline-none block w-full sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <!-- server port -->
              <div class="text-left mb-4">
                <label for="server-port" class="block text-sm font-medium text-gray-700">Server Port (app.port)</label>
                <div class="mt-1">
                  <input v-model="port" type="text" id="server-port" class="shadow-sm focus:outline-none block w-full sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <!-- player id -->
              <div class="text-left mb-4">
                <label for="player-id" class="block text-sm font-medium text-gray-700">Player ID</label>
                <div class="mt-1">
                  <input v-model="playerId" type="text" id="player-id" class="shadow-sm focus:outline-none block w-full sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

              <!-- player token -->
              <div class="text-left mb-4">
                <label for="player-token" class="block text-sm font-medium text-gray-700">Player Token</label>
                <div class="mt-1">
                  <input v-model="playerToken" type="text" id="player-token" class="shadow-sm focus:outline-none block w-full sm:text-sm border-gray-300 rounded-md">
                </div>
              </div>

            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button @click="add" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:col-start-2 sm:text-sm">
              Add
            </button>
            <button @click="close" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<script>
export default {
  name: 'AddServerModal',
  props: {
    isShowing: Boolean,
    steamId: String,
  },
  data() {
    return {
      ip: null,
      port: null,
      playerId: null,
      playerToken: null,
    }
  },
  watch: {
    steamId: function() {
      this.playerId = this.steamId;
    },
  },
  methods: {
    add: function() {

      // make sure all data provided
      if(!this.ip || !this.port || !this.playerId || !this.playerToken){
        return;
      }

      // emit data in event
      this.$emit('add', {
        ip: this.ip,
        port: this.port,
        playerId: this.playerId,
        playerToken: this.playerToken,
      });

      // close modal
      this.close();

    },
    close: function() {

      // clear modal inputs
      this.ip = null;
      this.port = null;
      this.playerId = this.steamId;
      this.playerToken = null;

      // emit close event
      this.$emit('close');

    },
  },
}
</script>
