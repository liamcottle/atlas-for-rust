<template>
  <div class="bg-gray-800 p-4 w-full h-full text-center overflow-scroll">

    <!-- server list -->
    <div v-for="server in servers" class="py-2">
      <div @click="onServerSelected(server)" class="inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-500 shadow border-4 cursor-pointer" :class="[isServerSelected(server) ? 'border-green-500' : 'border-transparent']">
        <span class="text-xl font-medium leading-none text-white">
          {{ server.name.charAt(0).toUpperCase() }}
        </span>
      </div>
    </div>

    <!-- add server button -->
    <div class="py-2">
      <div @click="onAddServer" class="inline-flex items-center justify-center h-14 w-14 rounded-md bg-gray-300 shadow cursor-pointer">
        <span class="text-xl font-medium leading-none text-gray-800">+</span>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  name: 'ServerSidePanel',
  props: {
    servers: Array,
    selectedServer: Object,
  },
  methods: {
    isServerSelected(server) {
      return this.selectedServer && this.selectedServer.id === server.id;
    },
    onAddServer() {
      this.$emit('server-selected', {
        server: null,
      });
    },
    onServerSelected(server) {
      this.$emit('server-selected', {
        server: server,
      });
    },
  },
}
</script>
