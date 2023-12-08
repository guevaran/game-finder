<script setup lang="ts">

// TODO: Add filters
// TODO: Get several games in one call to avoid loading and too many API requests (But should be requested again if filter change)

const { data: games, pending, error, refresh } = useLazyAsyncData('game', async () => {
  const count: { count: number } = await $igdb('/games/count', {
    method: 'POST',
    body: "where total_rating_count>5 & parent_game=null & cover!=null & name!=null & total_rating>60;"
  })

  const games: { name: string, cover: { image_id: string } }[] = await $igdb('/games', {
    method: 'POST',
    body: "fields name,cover.image_id; where total_rating_count>5 & parent_game=null & cover!=null & name!=null & total_rating>60; limit 10; offset " + (Math.floor(Math.random() * (count.count - 9))) as string + ";"
  })
  console.log(games)

  return games
}, {
  server: false,
})

// State index of the array of games
var gameIndex = ref(0)

// Current game
const game = computed(() => {
  var res
  if (games.value) {
    res = games.value[gameIndex.value]
  }
  return res
})

const windowWidth = ref(process.client ? window.innerWidth : 0)

function isLgScreen() {
  return windowWidth.value > 1024
}

const showSideBar = ref(false)

// Go to next game by increment gameIndex (and refresh data if needed)
function nextGame() {
  if (games.value) {
    if (gameIndex.value >= games.value.length - 1) {
      refresh()
      gameIndex.value = 0
    } else {
      gameIndex.value++
    }
  }
}

function logtest() {
  console.log("logtest games", games.value)
  console.log("logtest pending", pending.value)
  console.log("logtest error", error.value)
  console.log("logtest gameIndex", gameIndex.value)
  console.log("logtest game", game.value)
}

function keyUpHandler(e: KeyboardEvent) {
  if (e.key == " " || e.code == "Space") {
    console.log("spacebar pressed")
    nextGame()
  }
}

function resizeHandler() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  console.log("app mounted")
  // generate()
  window.addEventListener("keyup", keyUpHandler)
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener("keyup", keyUpHandler)
  window.addEventListener('resize', resizeHandler)
})

const switchSideBar = () => {
  showSideBar.value = !showSideBar.value
  // if (showSideBar.value) {
  // ($refs.sideBar as HTMLElement).focus()
  // sideBar.value!.focus()
  // console.log(sideBar.value)
  // document.getElementById("monChampTexte").focus();
  // }
}
// const switchSideBar = function (this: { $refs: { sideBar: HTMLElement } }) {
//   showSideBar.value = !showSideBar.value;
//   if (showSideBar.value) {
//     this.$refs.sideBar.focus();
//   }
// }.bind(this);

</script>

<template>
  <div class="bg-background min-h-screen w-screen text-text overflow-x-hidden"> <!--overflow-x-hidden-->


    <SideBarContainer>

      <div class="grow">
        <!--HEADER-->
        <div class="w-full h-12 flex justify-between">
          <div class="p-4">logo</div>
          <button type="button" class="p-4" @click="switchSideBar()">
            <Icon class="text-text" size="2em" name="fluent:filter-16-filled" />
          </button>
        </div>

        <div class="flex flex-col justify-center gap-4 items-center py-10 px-4">
          <div class="h-[70vh] rounded-lg relative group">
            <NuxtImg v-if="!pending && game"
              :src="'https://images.igdb.com/igdb/image/upload/t_720p/' + game!.cover.image_id + '.png'" placeholder
              class="rounded-lg h-full w-full object-contain" /> <!-- sizes="500px md:600px lg:1000px"-->
            <!--LOADER-->
            <div v-if="pending" class="h-full w-full p-12 flex items-center">
              <Loader />
            </div>
            <!--ERROR BOX-->
            <div v-if="!pending && error" class="h-full w-full p-12 text-accent border-2 border-accent flex items-center">
              <span>An error as occured, try again or contact the admin if it persists</span>
            </div>

            <!--IMAGE HOVER BOX-->
            <button type="button" v-if="!pending && game"
              class="absolute w-full h-full bg-background bg-opacity-70 top-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
              <span class="text-2xl">{{ game!.name }}</span>
              <span>Click to get more info!</span>
            </button>
          </div>
          <div>
            <button type="button" class="text-primary font-bold" @click="nextGame()">Click here</button>
            <span> or press <strong>spacebar</strong> to find a game to play!</span>
          </div>
        </div>
      </div>

      <SideBar :show="showSideBar" @focusout="switchSideBar()">
        <div class="text-xl py-2">Filters</div>
        <span>test</span>
        <span>test</span>
        <span>test</span>
        <span>test</span>
      </SideBar>
    </SideBarContainer>

    <DevOnly>
      <button type="button" class="fixed right-4 bottom-4 p-2 bg-primary text-black font-bold"
        @click="logtest">LOG</button>
    </DevOnly>
  </div>
</template>

<style></style>