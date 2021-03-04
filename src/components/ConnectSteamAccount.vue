<template>
  <div>
    <a @click="connectWithSteam" href="#">Connect with Steam</a>
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
