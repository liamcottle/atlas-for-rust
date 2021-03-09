<template>
  <div class="min-h-screen bg-gray-200 py-6 flex flex-col justify-center sm:py-12">

    <div class="sm:max-w-xl sm:mx-auto mb-4">

      <div class="px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-16">
        <div class="max-w-md mx-auto">

          <div class="flex mb-4">
            <img class="mx-auto" src="icon_rounded.png" width="100" height="100"/>
          </div>

          <div class="flex flex-col">
            <span class="mx-auto text-md">Welcome to</span>
            <span class="mx-auto text-xl font-bold">Atlas for Rust</span>
          </div>

          <div class="divide-y divide-gray-200">
            <div class="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <p>To get started, connect Atlas with the official Rust+ Companion API.</p>
              <p>Once connected, you'll be able to pair with your Rust servers.</p>
            </div>
          </div>

          <button @click="connectWithRustPlus" type="button" class="w-full inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none">
            <span class="flex mx-auto">

              <!-- rust icon -->
              <svg class="w-4 h-4 mr-2" viewBox="0 0 217 222" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                <g transform="matrix(1,0,0,1,-138.462,-289.491)">
                  <rect x="138.462" y="289.491" width="216.018" height="221.018" style="fill:rgb(197,65,43);fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(1,0,0,1,-138.462,-289.491)">
                  <path d="M167.527,425.438L167.305,380.363C167.305,380.363 191.359,388.931 207.794,389.215L208.06,418.102C208.06,418.102 188.717,418.095 168.05,425.78" style="fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(1,0,0,1,-138.462,-289.491)">
                  <path d="M216.273,388.95L229.521,388.684L229.787,418.102L216.802,418.102L216.273,388.95ZM250.984,394.646L242.43,403.773L251.534,413.006L259.963,403.452L250.984,394.646ZM237.999,367.333L266.454,367.2L266.72,380.965L238.395,380.965L237.999,367.333ZM275.057,407.699L254.806,427.817L264.733,437.478L283.791,418.102L275.057,407.699Z" style="fill-rule:nonzero;"/>
                </g>
                <g transform="matrix(1,0,0,1,-138.462,-289.491)">
                  <path d="M229.77,317.647L274.844,317.423C274.844,317.423 265.879,342.669 265.596,359.101L238.164,359.234C238.164,359.234 237.112,338.834 229.428,318.167M326.382,446.781L294.752,478.895C294.752,478.895 283.176,454.736 271.724,442.946L290.975,423.401C290.975,423.401 306.182,437.043 326.253,446.169" style="fill-rule:nonzero;"/>
                </g>
              </svg>

              <span>Connect with Rust+</span>

            </span>
          </button>

        </div>
      </div>
    </div>

    <div class="flex flex-col mx-auto text-sm text-gray-500 mb-4">

      <div class="flex mx-auto">
        <div>Developed with</div>
        <div class="mx-1 text-red-500">
          <svg class="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>
        <div>by <a class="hover:text-gray-600" target="_blank" href="https://liamcottle.com">Liam Cottle</a></div>
      </div>

      <div class="mx-auto text-gray-400">v{{ version }}</div>

    </div>

  </div>
</template>
<script>
export default {
  name: 'ConnectRustPlus',
  data() {
    return {
      version: window.appversion,
    };
  },
  mounted: async function () {

    // handle rust+ login callback
    window.ipcRenderer.on('connect-with-rustplus.success', (event, data) => {
      this.onRustPlusConnected(data.steamId, data.token);
    });

  },
  methods: {
    connectWithRustPlus: function() {
      window.ipcRenderer.send('connect-with-rustplus');
    },
    onRustPlusConnected(id, token) {
      this.$emit('rustplus-connected', {
        steamId: id,
        token: token,
      })
    },
  },
}
</script>
