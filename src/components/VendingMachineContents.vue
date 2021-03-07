<template>
  <Transition name="slide-up">
    <div v-if="vendingMachine" class="bg-white rounded-t text-white z-vending-machine-contents" style="background:#000000DD;width:275px;">

      <!-- name -->
      <div class="flex p-3 bg-gray-700 rounded-t">

        <img class="flex-none my-auto mr-2" src="images/map/vending_machine.png" width="30" height="30"/>

        <div class="flex-grow my-auto text-sm">{{ vendingMachine.name }}</div>

        <div class="flex-none my-auto ml-2">
          <button @click="$emit('close')" type="button" class="mx-auto inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-300 hover:bg-gray-200 focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

      </div>

      <!-- sell orders -->
      <div class="px-4 overflow-y-scroll" style="height:400px;">
        <table v-if="vendingMachine.sellOrders.length > 0" class="table-auto my-2 mx-auto">
          <thead>
          <tr>
            <th>Stock</th>
            <th>Item</th>
            <th>Cost</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="sellOrder in vendingMachine.sellOrders">

            <!-- stock -->
            <td class="p-2">
              <div class="rounded p-2 relative" style="background:#CCCCCC66;">
                <div class="flex" style="width:50px;height:50px;">
                  <div class="mx-auto my-auto">{{sellOrder.amountInStock}}</div>
                </div>
              </div>
            </td>

            <!-- item for sale -->
            <td class="p-2">
              <div class="flex rounded p-2 relative" style="background:#CCCCCC66;">
                <div class="relative">
                  <img v-if="sellOrder.itemIsBlueprint" class="absolute" src="images/blueprint.png" width="50" height="50"/>
                  <img class="relative" :src="getItemImage(sellOrder.itemId) || 'images/unknown_item.png'" width="50" height="50" onerror="this.src = 'images/unknown_item.png';"/>
                </div>
                <div class="absolute bottom-0 right-0 text-sm pr-1 pb-1">x{{sellOrder.quantity}}</div>
              </div>
            </td>

            <!-- currency item -->
            <td class="p-2">
              <div class="flex rounded p-2 relative" style="background:#CCCCCC66;">
                <div class="relative">
                  <img v-if="sellOrder.currencyIsBlueprint" class="absolute" src="images/blueprint.png" width="50" height="50"/>
                  <img :src="getItemImage(sellOrder.currencyId) || 'images/unknown_item.png'" width="50" height="50" onerror="this.src = 'images/unknown_item.png';"/>
                </div>
                <div class="absolute bottom-0 right-0 text-sm pr-1 pb-1">x{{sellOrder.costPerItem}}</div>
              </div>
            </td>

          </tr>
          </tbody>
        </table>
        <div v-else class="flex h-full">
          <div class="mx-auto my-auto">
            <svg class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <div>Vending Machine is Empty</div>
          </div>
        </div>
      </div>

    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter,
.slide-up-leave-to {
  transform: translateY(100vh);
  opacity: 0;
}
</style>

<script>
export default {
  name: 'VendingMachineContents',
  props: {
    vendingMachine: Object,
  },
  data() {
    return {
      items: {

      },
    }
  },
  mounted() {
    this.items = require('../items.json');
  },
  methods: {
    findItemById(id) {
      return this.items.find(item => item.id === id);
    },
    getItemImage(id) {
      var item = this.findItemById(id);
      return item ? `images/items/${item.shortname}.png` : null;
    },
  },
}
</script>
