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

              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">Atlas for Rust</h3>
              <h4 class="text-md leading-6 text-gray-500 mb-4">v{{ version }}</h4>

              <div class="flex flex-col w-full mt-2">

                <div class="flex mx-auto text-sm text-gray-500 mb-4">
                  <div>Developed with</div>
                  <div class="mx-1 text-red-500">
                    <svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <div>by Liam Cottle</div>
                </div>

                <p class="text-sm text-gray-500">
                  Twitter: <a class="hover:text-gray-700" target="_blank" href="https://twitter.com/liamcottle">@liamcottle</a>
                </p>
                <p class="text-sm text-gray-500">
                  Discord: <a class="hover:text-gray-700" target="_blank" href="https://discord.com/channels/@me">Liam Cottle#0001</a>
                </p>
                <p class="text-sm text-gray-500">
                  Email: <a class="hover:text-gray-700" target="_blank" href="mailto:liam@liamcottle.com">liam@liamcottle.com</a>
                </p>
                <p class="text-sm text-gray-500 mb-4">
                  Website: <a class="hover:text-gray-700" target="_blank" href="https://liamcottle.com">https://liamcottle.com</a>
                </p>

                <div class="text-sm text-gray-500">
                  <div class="font-bold">Have a feature request?</div>
                  <div>
                    <a class="underline hover:text-gray-700" target="_blank" href="https://github.com/liamcottle/atlas-for-rust">Open an Issue on GitHub</a>
                  </div>
                </div>
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
  name: 'AboutModal',
  props: {
    isShowing: Boolean,
  },
  data() {
    return {
      version: null,
    };
  },
  mounted() {
    this.version = window.appversion;
  },
}
</script>
