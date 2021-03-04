<template>
  <div class="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">

      <div class="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">

          <div class="flex">
            <span class="h-7 sm:h-8 mx-auto text-xl">Welcome</span>
          </div>

          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <p>To get started, connect your Steam Account with Rust+ and then pair with a server.</p>
            </div>
          </div>

          <button @click="connectWithSteam" type="button" class="w-full inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none">
            <span class="mx-auto">Connect with Steam</span>
          </button>

        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ConnectWithSteam',
  mounted: async function () {

    // handle steam login callback
    window.ipcRenderer.on('connect-with-steam.success', (event, data) => {
      this.onSteamConnected(data.steamId, data.token);
    });

  },
  methods: {
    connectWithSteam: function() {
      window.ipcRenderer.send('connect-with-steam');
    },
    onSteamConnected(id, token) {
      this.$emit('steam-connected', {
        steamId: id,
        steamToken: token,
      })
    },
  },
}
</script>
