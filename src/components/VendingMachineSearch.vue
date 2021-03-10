<template>
  <Transition name="slide-up">
    <div v-if="isShowing" class="bg-white rounded-t text-white z-vending-machine-contents bg-black-semi-transparent" style="width:300px;">

      <!-- header -->
      <div class="flex flex-col p-3 bg-gray-600 rounded-t">

        <div class="flex mb-2">
          <svg class="flex-none my-auto mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>

          <div class="flex-grow my-auto text-sm">Search Vending Machines</div>

          <div class="flex-none my-auto ml-2">
            <button @click="$emit('close')" type="button" class="mx-auto inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-gray-700 bg-gray-300 hover:bg-gray-200 focus:outline-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- search -->
        <div class="flex-grow">
          <div class="relative rounded-md shadow-sm text-gray-800">
            <input v-model="searchText" type="text" class="rounded focus:outline-none block w-full pr-8 sm:text-sm border-gray-300 resize-none" placeholder="Type an item name to search"/>
          </div>
        </div>

      </div>

      <!-- results -->
      <div class="p-4 overflow-y-scroll" style="height:400px;">

        <div v-for="vendingMachine in vendingMachinesWithSearchedItems" class="mb-4">

          <div @click="showVendingMachine(vendingMachine)" class="flex bg-gray-700 rounded-t p-2 cursor-pointer">
            <img class="flex-none my-auto h-6 w-6 mr-2" src="images/map/shop_green.png"/>
            <div class="flex-grow my-auto text-sm">{{vendingMachine.name}}</div>
            <div class="flex-none my-auto ml-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

          <div class="bg-gray-800 rounded-b py-2">
            <table v-if="vendingMachine.sellOrders.length > 0" class="table-auto mx-auto">
              <thead>
              <tr>
                <th>Stock</th>
                <th>Item</th>
                <th>Cost</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="searchedItemIds.includes(sellOrder.itemId)" v-for="sellOrder in vendingMachine.sellOrders">

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
                  <div @click="$emit('item-click', sellOrder.itemId)" class="flex rounded p-2 relative cursor-pointer" style="background:#CCCCCC66;">
                    <div class="relative">
                      <img v-if="sellOrder.itemIsBlueprint" class="absolute" src="images/blueprint.png" width="50" height="50"/>
                      <img class="relative" :src="getItemImage(sellOrder.itemId) || 'images/unknown_item.png'" width="50" height="50" onerror="this.src = 'images/unknown_item.png';"/>
                    </div>
                    <div class="absolute bottom-0 right-0 text-sm pr-1 pb-1">x{{sellOrder.quantity}}</div>
                  </div>
                </td>

                <!-- currency item -->
                <td class="p-2">
                  <div @click="$emit('item-click', sellOrder.currencyId)" class="flex rounded p-2 relative cursor-pointer" style="background:#CCCCCC66;">
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
  name: 'VendingMachineSearch',
  props: {
    isShowing: Boolean,
    vendingMachines: Array,
  },
  data: function() {
    return {
      items: null,
      searchText: "",
    };
  },
  mounted() {
    this.items = require('@/items.json');
  },
  methods: {
    findItemById(id) {
      return this.items.find(item => item.id === id);
    },
    getItemImage(id) {
      var item = this.findItemById(id);
      return item ? `images/items/${item.shortname}.png` : null;
    },
    showVendingMachine(vendingMachine) {
      this.$emit('show-vending-machine', vendingMachine);
    },
  },
  computed: {

    /**
     * Returns an array of item ids where the item name contains the search text.
     */
    searchedItemIds: function() {
      return this.items ? this.items.filter((item) => {
        return item.name.toLowerCase().indexOf(this.searchText.toLowerCase()) !== -1;
      }).map((item) => {
        return item.id;
      }) : [];
    },

    /**
     * Returns an array of vending machines that contain at least one item in the searchedItemIds array.
     */
    vendingMachinesWithSearchedItems: function() {
      return this.vendingMachines ? this.vendingMachines.filter((vendingMachine) => {

        var itemIdsForSale = vendingMachine.sellOrders.map((sellOrder) => sellOrder.itemId);

        for(var i=0; i < itemIdsForSale.length; i++){
          var itemIdForSale = itemIdsForSale[i];
          if(this.searchedItemIds.includes(itemIdForSale)){
            return true;
          }
        }

        return false;

      }) : [];
    },

  }
}
</script>
