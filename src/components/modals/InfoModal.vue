<template>
  <Transition name="fade">
    <div v-if="isShowing" class="fixed z-modal inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        <div @click="$emit('close')" class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- This element is to trick the browser into centering the modal contents. -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
          <div>
            <div class="mt-3 text-center sm:mt-5">

              <h3 v-if="title" class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">{{ title }}</h3>

              <div v-if="message" class="flex flex-col w-full mt-2">
                <p class="text-sm text-gray-500">
                  {{ message }}
                </p>
              </div>

            </div>
          </div>
          <div class="mt-5 sm:mt-6">
            <button @click="$emit('close')" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
              Close
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
  name: 'InfoModal',
  props: {
    isShowing: Boolean,
    title: String,
    message: String,
  },
}
</script>
