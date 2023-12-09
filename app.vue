<script setup lang="ts">

// TODO: Add filters
// TODO: Get several games in one call to avoid loading and too many API requests (But should be requested again if filter change)

const { data: games, pending, error, refresh } = useLazyAsyncData('game', async () => {

  var platformFilter = ''
  if (filter.platforms.length > 0) {
    platformFilter = '& platforms=(' + filter.platforms.map((p) => p.id).join(',') + ')'
  }

  const count: { count: number } = await $igdb('/games/count', {
    method: 'POST',
    body: `where total_rating_count>5 & parent_game=null & cover!=null & name!=null 
    & total_rating>${filter.rate}
    ${platformFilter};`.replaceAll('\n', '')
  })

  const random0toCount = Math.floor(Math.random() * (count.count - 9))

  const games: { name: string, cover: { image_id: string } }[] = await $igdb('/games', {
    method: 'POST',
    body: `fields name,cover.image_id; where total_rating_count>5 & parent_game=null & cover!=null & name!=null 
    & total_rating>${filter.rate}
    ${platformFilter};
    limit 10; offset ${random0toCount};`.replaceAll('\n', '')
  })
  console.log(games)

  return games
}, {
  server: false,
})

const { data: platforms, error: errPlatforms } = useIgdbData('/platforms', {
  method: 'POST',
  body: "fields name,alternative_name,abbreviation; limit 500; sort name asc;"
})

// State index of the array of games
var gameIndex = ref(0)
const windowWidth = ref(0)
const showSideBar = ref(false)

// Filters
interface Filter {
  rate: number,
  platforms: { name: string, id: number, alternative_name: string, abbreviation: string }[]
}
const filter: Filter = reactive({
  rate: 60,
  platforms: [],
})

const filterJustChanged = ref(false)
watch(filter, (newValue, oldValue) => {
  console.log("filter just changed")
  filterJustChanged.value = true
})

// Current game
const game = computed(() => {
  var res
  if (games.value) {
    res = games.value[gameIndex.value]
  }
  return res
})



function isLgScreen() {
  console.log("isLgScreen", windowWidth.value > 1024)
  return windowWidth.value > 1024
}



// Go to next game by increment gameIndex (and refresh data if needed)
function nextGame() {
  if (games.value) {
    if ((gameIndex.value >= games.value.length - 1) || filterJustChanged.value) {
      refresh()
      gameIndex.value = 0
      filterJustChanged.value = false
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
  console.log("logtest platforms", platforms.value)
  console.log("logtest errPlatforms", errPlatforms.value)
  console.log("logtest filter", filter)
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
  windowWidth.value = window.innerWidth
  showSideBar.value = isLgScreen()
  window.addEventListener("keyup", keyUpHandler)
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener("keyup", keyUpHandler)
  window.addEventListener('resize', resizeHandler)
})

</script>

<template>
  <div class="flex flex-col bg-background min-h-screen w-screen text-text overflow-x-clip">


    <SideBarContainer>

      <div class="grow">
        <!--HEADER-->
        <div class="w-full h-12 flex justify-between sticky top-0">
          <div class="p-4">logo</div>
          <button v-if="!showSideBar" type="button" class="p-4 mr-2" @click="showSideBar = true">
            <Icon class="text-text" size="2em" name="fluent:filter-16-filled" />
          </button>
          <button v-else type="button" class="p-4 mr-2" @click="showSideBar = false">
            <Icon class="text-text" size="2em" name="akar-icons:cross" />
          </button>
        </div>

        <div class="flex flex-col gap-4 lg:flex-row lg:gap-10 justify-center items-center py-10 px-4">
          <div class="h-[75vh] xl:h-[65vh] 2xl:h-[75vh] relative group">
            <!--GAME IMAGE-->
            <NuxtImg v-if="!pending && game"
              :src="'https://images.igdb.com/igdb/image/upload/t_720p/' + game!.cover.image_id + '.png'" placeholder
              class="h-full w-full object-contain" /> <!-- sizes="500px md:600px lg:1000px"-->
            <!--NO GAME FOUND-->
            <div v-if="!pending && !error && !game"
              class="h-full w-full p-12 text-text border-2 border-dashed border-text flex items-center">
              <span>No game corresponding to this filter</span>
            </div>
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
              class="absolute w-full h-full bg-background bg-opacity-70 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
              <span class="text-2xl">{{ game!.name }}</span>
              <span>Click to get more info!</span>
            </button>
          </div>
          <div class="flex flex-col">
            <button type="button" class="font-bold px-4 py-2 bg-primary text-background-950" @click="nextGame()">Next
              Game</button>
            <UDivider label="OR" class="my-2" />
            <span>Press <span class="font-bold underline underline-offset-4 decoration-primary">SPACEBAR</span> to find a
              game to
              play!</span>
          </div>
        </div>
      </div>

      <SideBar :show="showSideBar" @close="showSideBar = false" :windowWidth="windowWidth">
        <!--@focusout="sideBarFocusout()" -->
        <div class="text-xl p-4">Filters</div>
        <div class="p-4">
          <div class="flex justify-between"><span>Minimum rating:</span><span>{{ filter.rate + ' / 100' }}</span>
          </div>
          <URange v-model="filter.rate" name="range" :min="0" :max="100" />
        </div>
        <div class="p-4">
          <span>Platforms:</span>
          <USelectMenu v-model="filter.platforms" :options="platforms" multiple searchable
            :search-attributes="['name', 'alternative_name', 'abbreviation']"
            searchable-placeholder="Search a platform..." placeholder="Select platforms">
            <template #option="{ option: platform }">
              {{ platform.name }}
            </template>
          </USelectMenu>
        </div>
        <div class="p-4">test</div>
        <div class="p-4">test</div>
      </SideBar>
    </SideBarContainer>

    <DevOnly>
      <button type="button" class="fixed right-4 bottom-4 p-2 bg-primary text-black font-bold z-50"
        @click="logtest">LOG</button>
    </DevOnly>
  </div>
</template>

<style>
#__nuxt {
  overflow-x: clip;
}
</style>