<template>
  <div class="bg-black p-4 w-full h-full text-center overflow-scroll">
    <div v-for="server in servers" class="py-2">
      <div class="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gray-500 shadow">
        <span class="text-xl font-medium leading-none text-white">{{ server.iconText }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ServerSidePanel',
  data() {
    return {
      servers: [],
    }
  },
  mounted: async function () {

    // todo load servers
    this.servers = [];

    for(var i=0; i<30; i++){

      this.servers.push({
        iconText: "S" + i,
        name: "Server " + i,
      });

    }

  },
  methods: {

  },
}
</script>
