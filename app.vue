<script setup lang="ts">
async function generate() {
  const runtimeConfig = useRuntimeConfig()
  console.log("generate")
  const game = await $fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': runtimeConfig.public.IGDB_CLIENT_ID as string,
      'Authorization': 'Bearer ' + runtimeConfig.public.IGDB_TOKEN,
    },
    body: "fields *; where total_rating_count>5 & parent_game=null & cover!=null & name!=null & total_rating>60; limit 1; offset 8970;"
  }).catch((error) => error.data)
  console.log(game)
}
</script>

<template>
  <div class="bg-background min-h-screen flex flex-col overflow-x-hidden text-text justify-center items-center">
    <div class="flex flex-col justify-center max-h-screen gap-4 items-center p-4">
      <div class="object-contain bg-red-500 rounded-lg relative group">
        <NuxtImg src="https://images.igdb.com/igdb/image/upload/t_1080p_2x/co670h.png" placeholder
          class="max-h-[70vh] rounded-lg" />
        <button type="button"
          class="absolute w-full h-full bg-secondary bg-opacity-50 top-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
          <span class="text-2xl">Baldur's Gate 3</span>
          <span>Description</span>
        </button>
      </div>
      <!-- sizes="200px md:400px lg:1000px" -->
      <div>
        <button type="button" class="text-primary font-bold" @click="generate">Click here</button>
        <span> or press spacebar to find a game to play!</span>
      </div>
    </div>
  </div>
</template>

<style></style>