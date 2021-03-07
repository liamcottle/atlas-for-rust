<template>
  <Transition name="fade">
    <div v-if="vendingMachine" class="bg-white rounded shadow text-white" style="background:#000000DD;">

      <!-- name -->
      <div class="flex p-3">
        <img class="my-auto mr-2" src="images/map/vending_machine.png" width="30" height="30"/>
        <div class="my-auto text-sm">{{ vendingMachine.name }}</div>
      </div>

      <!-- sell orders -->
      <div class="px-4 overflow-y-scroll" style="height:400px;">
        <table class="table-auto my-2">
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
