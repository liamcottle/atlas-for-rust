<template>
  <div class="h-full bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
    <div class="relative py-3 sm:max-w-xl sm:mx-auto">

      <div class="absolute inset-0 bg-gradient-to-r from-info-400 to-info-300 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

      <div class="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
        <div class="max-w-md mx-auto">

          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-info-100 mb-2">
            <svg class="h-6 w-6 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <div class="flex">
            <span class="h-7 sm:h-8 mx-auto text-xl">Server Not Connected</span>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>
<script>
export default {
  name: 'ServerNotConnected',
}
</script>
