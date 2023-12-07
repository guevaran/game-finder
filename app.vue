<script setup lang="ts">

// TODO: Add filters
// TODO: Get several games in one call to avoid loading and too many API requests (But should be requested again if filter change)
const { data: game, pending, error, refresh } = useLazyAsyncData('game', async () => {
  const count: { count: number } = await $igdb('/games/count', { // http://localhost:8080/https://api.igdb.com/v4/games/count
    method: 'POST',
    body: "where total_rating_count>5 & parent_game=null & cover!=null & name!=null & total_rating>60;"
  })

  const games: { name: string, cover: { image_id: string } }[] = await $igdb('/games', { // http://localhost:8080/https://api.igdb.com/v4/games
    method: 'POST',
    body: "fields name,cover.image_id; where total_rating_count>5 & parent_game=null & cover!=null & name!=null & total_rating>60; limit 1; offset " + (Math.floor(Math.random() * count.count)) as string + ";"
  })
  console.log(games)

  return games[0]
}, {
  server: false,
})

function logtest() {
  console.log(game.value)
  console.log(pending.value)
  console.log(error.value)
}

function keyUpHandler(e: KeyboardEvent) {
  if (e.key == " " || e.code == "Space") {
    console.log("pressed spacebar")
    refresh()
  }
}

onMounted(() => {
  console.log("app mounted")
  // generate()
  window.addEventListener("keyup", keyUpHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener("keyup", keyUpHandler)
})
</script>

<template>
  <div class="bg-background min-h-screen flex flex-col overflow-x-hidden text-text justify-center items-center">

    <div class="flex flex-col justify-center max-h-screen gap-4 items-center p-4">
      <div class="h-[70vh] rounded-lg relative group">
        <NuxtImg v-if="!pending && game"
          :src="'https://images.igdb.com/igdb/image/upload/t_720p/' + game!.cover.image_id + '.png'" placeholder
          class="rounded-lg h-full w-full object-contain" /> <!-- sizes="500px" md:400px lg:1000px-->
        <div v-if="pending" class="h-full w-full p-12 flex items-center"><span class="loader"></span></div>
        <div v-if="!pending && error" class="h-full w-full p-12 text-accent border-2 border-accent flex items-center">
          <span>An error as occured, try again or contact the admin if it persists</span>
        </div>
        <button type="button" v-if="!pending && game"
          class="absolute w-full h-full bg-secondary bg-opacity-70 top-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
          <span class="text-2xl">{{ game!.name }}</span>
          <!-- <span>Description</span> -->
        </button>
      </div>
      <div>
        <button type="button" class="text-primary font-bold" @click="refresh()">Click here</button>
        <span> or press <strong>spacebar</strong> to find a game to play!</span>
      </div>
    </div>

    <button type="button" class="fixed right-4 bottom-4 p-2 bg-primary text-black font-bold" @click="logtest">LOG</button>
  </div>
</template>

<style>
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid theme('colors.text');
  border-bottom-color: theme('colors.primary');
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>