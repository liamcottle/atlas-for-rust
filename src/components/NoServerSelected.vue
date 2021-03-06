<template>
  <div class="h-full bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">

      <div class="absolute inset-0 bg-gradient-to-r from-info-400 to-info-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">

          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-info-100 mb-2">
            <svg class="h-6 w-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
            </svg>
          </div>

          <div class="flex">
            <span class="h-7 sm:h-8 mx-auto text-xl">Add a Rust Server</span>
          </div>

          <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
            <p>To add a server, open Rust and select "Pair" from the in game menu.</p>
            <p>Alternatively, select an already paired server from the side menu.</p>
          </div>

          <button @click="addServerManually" type="button" class="mt-4 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm">
            Add Server Manually
          </button>

        </div>
      </div>

    </div>
  </div>
</template>
<script>
export default {
  name: 'NoServerSelected',
  methods: {
    addServerManually: function() {
      this.$emit('add-server-manually');
    },
  },
}
</script>
