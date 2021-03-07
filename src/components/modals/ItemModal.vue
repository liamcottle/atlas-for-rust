<template>
  <Transition name="fade">
    <div v-if="isShowing && item" class="fixed z-modal inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div @click="$emit('close')" class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-sm sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div class="p-6">

            <!-- item image -->
            <div class="flex p-4">
              <img class="mx-auto" :src="getItemImage() || 'images/unknown_item.png'" width="100" height="100" onerror="this.src = 'images/unknown_item.png';"/>
            </div>

            <div class="text-center">
              <h3 class="text-lg leading-6 text-gray-900" id="modal-headline">
                {{ item.name || 'Unknown Item' }}
              </h3>
            </div>

            <div v-if="item.description" class="text-left flex w-full mt-2 mx-auto text-sm text-gray-500" v-html="item.description.replaceAll('\\n', '<br/>')"></div>

            <div class="mt-5 sm:mt-6">
              <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
                Close
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
  name: 'ItemModal',
  props: {
    isShowing: Boolean,
    itemId: Number,
  },
  data() {
    return {
      item: null,
      items: require('@/items.json'),
    };
  },
  watch: {
    itemId() {
      this.item = this.items.find(item => item.id === this.itemId);
    },
  },
  methods: {
    getItemImage() {
      return this.item ? `images/items/${this.item.shortname}.png` : null;
    },
  },
}
</script>
