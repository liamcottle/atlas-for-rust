<template>
  <Transition name="fade">
    <div v-if="isShowing" class="fixed z-modal inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div @click="$emit('close')" class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>


        <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-sm sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">

          <!-- server image -->
          <div class="bg-gray-200 w-full" style="min-height:180px;">
            <img :src="notification.img || 'images/default_server_banner.jpg'" onerror="if(this.src != 'images/default_server_banner.jpg') this.src = 'images/default_server_banner.jpg';">
          </div>

          <div class="p-6">

            <div class="text-center">
              <h3 class="text-lg leading-6 text-gray-900" id="modal-headline">
                {{ notification.name || 'No Server Name' }}
              </h3>
            </div>

            <div v-if="notification.desc" class="text-left flex w-full mt-2 mx-auto text-sm text-gray-500" v-html="notification.desc.replaceAll('\\n', '<br/>')"></div>

            <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button @click="pair" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:col-start-2 sm:text-sm">
                Pair
              </button>
              <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                Cancel
              </button>
            </div>

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
  name: 'PairServerModal',
  props: {
    isShowing: Boolean,
    notification: Object,
  },
  methods: {
    pair: function() {

      // emit data in event
      this.$emit('pair', {
        id: this.notification.id,
        ip: this.notification.ip,
        name: this.notification.name || "No Server Name",
        port: this.notification.port,
        playerId: this.notification.playerId,
        playerToken: this.notification.playerToken,
      });

      // close modal
      this.$emit('close');

    },
  },
}
</script>
