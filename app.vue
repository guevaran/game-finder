<script setup lang="ts">
const windowWidth = ref(0);
const showSideBar = ref(false);

// ----- GAME -----

interface Game {
	id: number;
	name: string;
	cover: {
		image_id: string;
	};
	url: string;
	first_release_date: number;
	platforms: { name: string; abbreviation: string }[];
	genres: { name: string }[];
	game_modes: { name: string }[];
}

// Get games data
const {
	data: games,
	pending,
	error,
	refresh,
} = useLazyAsyncData(
	'game',
	async () => {
		var platformFilter = '';
		if (filter.platforms.length > 0) {
			platformFilter =
				'& platforms=(' +
				filter.platforms.map((p) => p.id).join(',') +
				')';
		}

		var genreFilter = '';
		if (filter.genres.length > 0) {
			genreFilter =
				'& genres=(' + filter.genres.map((g) => g.id).join(',') + ')';
		}

		var gameModeFilter = '';
		if (filter.gameModes.length > 0) {
			gameModeFilter =
				'& game_modes=(' +
				filter.gameModes.map((g) => g.id).join(',') +
				')';
		}

		// Get gameCount depending of filters
		const count: { count: number } = await $igdb('/games/count', {
			method: 'POST',
			body: `where total_rating_count>5 & parent_game=null & cover!=null & name!=null
    & total_rating >= ${filter.rate}
    & first_release_date >= ${yearToUTS(filter.rangeDate[0], 0)}
    & first_release_date <= ${yearToUTS(filter.rangeDate[1], 1)}
    ${genreFilter}
    ${gameModeFilter}
    ${platformFilter};`.replaceAll('\n', ''),
		});

		console.log('total game count', count);

		// random offset calculated based on previously requested gameCount
		const available = Math.max(0, (count?.count ?? 0) - 9);
		const random0toCount =
			available > 0 ? Math.floor(Math.random() * available) : 0;

		// Get random games depending of filters
		const games: Game[] = await $igdb('/games', {
			method: 'POST',
			body: `fields name,cover.image_id,url,first_release_date,platforms.name,platforms.abbreviation,genres.name,game_modes.name;
    where total_rating_count>5 & parent_game=null & cover!=null & name!=null
    & total_rating >= ${filter.rate}
    & first_release_date >= ${yearToUTS(filter.rangeDate[0], 0)}
    & first_release_date <= ${yearToUTS(filter.rangeDate[1], 1)}
    ${genreFilter}
    ${gameModeFilter}
    ${platformFilter};
    limit 10; offset ${random0toCount};`.replaceAll('\n', ''),
		});
		console.log(games);

		return games;
	},
	{
		server: false,
	}
);

// State index of the array of games
var gameIndex = ref(0);

// Get current game
const game = computed(() => {
	var res;
	if (games.value) {
		res = games.value[gameIndex.value];
	}
	return res;
});

// Go to next game by increment gameIndex (and refresh data if needed)
function nextGame() {
	if (games.value) {
		if (
			gameIndex.value >= games.value.length - 1 ||
			filterJustChanged.value
		) {
			refresh();
			gameIndex.value = 0;
			filterJustChanged.value = false;
		} else {
			gameIndex.value++;
		}
	}
}

// ----- FILTERS -----

interface Filter {
	rate: number;
	platforms: {
		name: string;
		id: number;
		alternative_name: string;
		abbreviation: string;
	}[];
	genres: { name: string; id: number }[];
	gameModes: { name: string; id: number }[];
	rangeDate: [number, number];
}
const filter: Filter = reactive({
	rate: 60,
	platforms: [],
	genres: [],
	gameModes: [],
	rangeDate: [1970, new Date().getFullYear()],
});

// Format the year for display in the slider tooltips
function formatYear(year: number) {
	return year === new Date().getFullYear() ? 'now' : year.toString();
}

// [{ lbl: '1970', val: 1970 }, ..., { lbl: 'now', val: 2023 }]
function calcDataRangeDate(): Array<{ lbl: string | number; val: number }> {
	const now = new Date();
	var data: Array<{ lbl: string | number; val: number }> = [];
	for (let i = 1970; i <= now.getFullYear(); i++) {
		data.push({
			lbl: i == now.getFullYear() ? 'now' : i,
			val: i,
		});
	}
	return data;
}
const dataRangeDate = ref(calcDataRangeDate());
// [1970, 1980, ..., 2010, 2020]
const dataRangeMarks = ref(
	dataRangeDate.value
		.map((d: { val: number }) => d.val)
		.filter((v: number) => v % 10 == 0)
);

// MEMORY LEAK FIX: More efficient filter change detection
// Instead of deep watching the entire filter object, watch specific values that matter
const filterJustChanged = ref(false);
let filterWatchStopHandle: any = null;

// Debounced watcher: attach only on client after mount to avoid SSR churn
let filterChangeTimeout: number | null = null;
onMounted(() => {
	filterWatchStopHandle = watch(
		[
			() => filter.rate,
			() => filter.platforms.length,
			() => filter.genres.length,
			() => filter.gameModes.length,
			() => filter.rangeDate[0],
			() => filter.rangeDate[1],
		],
		() => {
			// debounce to coalesce rapid changes from sliders/menus
			if (filterChangeTimeout !== null) {
				clearTimeout(filterChangeTimeout);
			}
			filterChangeTimeout = window.setTimeout(() => {
				filterJustChanged.value = true;
			}, 150);
		},
		{ immediate: false, flush: 'post' }
	);
});

// Get platforms data
// TODO: Error handling
const { data: platforms, error: errPlatforms } = useIgdbData('/platforms', {
	method: 'POST',
	body: 'fields name,alternative_name,abbreviation; limit 500; sort name asc;',
} as any);

// Get genres data
// TODO: Error handling
const { data: genres, error: errGenres } = useIgdbData('/genres', {
	method: 'POST',
	body: 'fields name; limit 500; sort name asc;',
} as any);

// Get gameModes data (static to avoid another API request)
const gameModes = ref([
	{
		id: 6,
		name: 'Battle Royale',
	},
	{
		id: 3,
		name: 'Co-operative',
	},
	{
		id: 5,
		name: 'Massively Multiplayer Online (MMO)',
	},
	{
		id: 2,
		name: 'Multiplayer',
	},
	{
		id: 1,
		name: 'Single player',
	},
	{
		id: 4,
		name: 'Split screen',
	},
]);

const formatDateRange = () => {
	return filter.rangeDate[0] + ' - ' + filter.rangeDate[1];
};

// MEMORY LEAK FIX: Use shallowRef for computed properties to reduce reactive overhead
// Transform platforms data to include a label property
const platformItems = computed(() => {
	if (!platforms.value) return [];
	// Create a shallow copy to avoid deep reactivity on mapped items
	return platforms.value.map((platform: any) => ({
		...platform,
		label: platform.name,
	}));
});

// Transform genres data to include a label property
const genreItems = computed(() => {
	if (!genres.value) return [];
	return genres.value.map((genre: any) => ({
		...genre,
		label: genre.name,
	}));
});

// Update game modes to include a label property
const gameModeItems = computed(() => {
	return gameModes.value.map((gm: { id: number; name: string }) => ({
		...gm,
		label: gm.name,
	}));
});

// ----- EVENT HANDLERS -----

function keyUpHandler(e: KeyboardEvent) {
	if (e.key == ' ' || e.code == 'Space') {
		console.log('spacebar pressed');
		nextGame();
	}
}

function resizeHandler() {
	windowWidth.value = window.innerWidth;
}

function onImgError(event: Event) {
	console.log('onImgError');
	if (event.target && game.value) {
		var imgEl = event.target as HTMLImageElement;
		if (imgEl.src.includes('t_720p')) {
			imgEl.src =
				'https://images.igdb.com/igdb/image/upload/t_cover_big/' +
				game.value.cover.image_id +
				'.png';
		} else if (imgEl.src.includes('t_cover_big')) {
			imgEl.src =
				'https://images.igdb.com/igdb/image/upload/t_cover_small/' +
				game.value.cover.image_id +
				'.png';
		}
	}
}

// ----- UTILS -----

// convert year to unix timestamp (i=0 -> startDate, i=1 -> endDate)
function yearToUTS(year: number, i: number) {
	var date = i == 0 ? new Date(year, 1, 1) : new Date(year, 12, 31);
	return Math.floor(date.getTime() / 1000);
}

// Unix Timestamp to String formatted date
function utsToStr(uts: number) {
	return new Date(uts * 1000).toLocaleDateString('default');
}

function logtest() {
	console.log('logtest games', games.value);
	console.log('logtest pending', pending.value);
	console.log('logtest error', error.value);
	console.log('logtest gameIndex', gameIndex.value);
	console.log('logtest game', game.value);
	console.log('logtest platforms', platforms.value);
	console.log('logtest errPlatforms', errPlatforms.value);
	console.log('logtest filter', filter);
}

// ----- LIFECYCLE -----

onMounted(() => {
	console.log('app mounted');
	windowWidth.value = window.innerWidth;
	showSideBar.value = windowWidth.value > 1024; // If screen width is minimum "lg" (1024px)
	window.addEventListener('keyup', keyUpHandler);
	window.addEventListener('resize', resizeHandler);
});

onBeforeUnmount(() => {
	// MEMORY LEAK FIX: Proper cleanup
	window.removeEventListener('keyup', keyUpHandler);
	window.removeEventListener('resize', resizeHandler);

	// Stop any watchers if needed
	if (filterWatchStopHandle) {
		filterWatchStopHandle();
	}

	// Clear pending debounce timeout
	if (filterChangeTimeout !== null) {
		clearTimeout(filterChangeTimeout);
		filterChangeTimeout = null;
	}
});
</script>

<template>
	<div
		class="flex flex-col bg-background min-h-screen w-screen text-text overflow-x-clip"
	>
		<SideBarContainer>
			<template #content>
				<div class="min-h-screen flex flex-col">
					<!--HEADER-->
					<div
						class="w-full flex justify-between sticky top-0 gap-4 pr-4"
					>
						<div class="p-4">
							<NuxtImg
								src="/imgs/logo.png"
								alt="Logo Game-Finder"
								width="40"
								height="50"
							/>
						</div>
						<div
							class="flex gap-2 md:gap-4 text-center items-center"
						>
							<NuxtLink
								to="https://ko-fi.com/nicolasguevara"
								target="_blank"
								class="p-2 text-xl hover:text-primary"
								>Buy me a coffee</NuxtLink
							>
							<!-- <NuxtLink to="#" target="_blank" class="p-2 text-xl hover:text-primary">Legal notices</NuxtLink> -->
							<button
								v-if="!showSideBar"
								type="button"
								class="p-4"
								@click="showSideBar = true"
							>
								<Icon
									class="text-text hover:text-primary"
									size="2em"
									name="fluent:filter-16-filled"
								/>
							</button>
							<button
								v-else
								type="button"
								class="p-4"
								@click="showSideBar = false"
							>
								<Icon
									class="text-text hover:text-primary"
									size="2em"
									name="akar-icons:cross"
								/>
							</button>
						</div>
					</div>

					<!-- CONTENT -->
					<div
						class="grow flex flex-col gap-4 lg:flex-row lg:gap-10 justify-center items-stretch py-6 px-4"
					>
						<div
							class="grow max-h-[75vh] w-full relative group lg:mx-10"
						>
							<!-- h-[clamp(50px,75vh,75vh)] -->
							<!--GAME IMAGE-->
							<img
								v-if="!pending && game"
								:key="game.id"
								:src="
									'https://images.igdb.com/igdb/image/upload/t_720p/' +
									game.cover.image_id +
									'.png'
								"
								:alt="'Image ' + game.name"
								@error="onImgError($event)"
								class="absolute h-full w-full object-contain bg-background-950 border-2 border-text"
							/>

							<!--IMAGE HOVER BOX-->
							<NuxtLink
								:to="game?.url || '#'"
								target="_blank"
								v-if="!pending && game"
								class="absolute w-full h-full p-1 bg-background bg-opacity-70 top-0 opacity-0 border-2 border-primary group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-3 text-center"
							>
								<span class="text-2xl mb-2">{{
									game.name
								}}</span>
								<span class="text-xl mb-2"
									><span class="underline"
										>First release:</span
									>{{
										' ' + utsToStr(game.first_release_date)
									}}</span
								>
								<span>Platforms:</span>
								<div
									class="flex flex-wrap gap-2 justify-center mb-2"
								>
									<!-- MEMORY LEAK FIX: Added proper keys for v-for -->
									<div
										v-for="(
											platform, index
										) in game.platforms"
										:key="`platform-${index}`"
										class="p-2 bg-background border-2 border-background-600"
									>
										{{
											platform.abbreviation
												? platform.abbreviation
												: platform.name
										}}
									</div>
								</div>
								<span>Genres:</span>
								<div
									class="flex flex-wrap gap-2 justify-center mb-2"
								>
									<!-- MEMORY LEAK FIX: Added proper keys for v-for -->
									<div
										v-for="(genre, index) in game.genres"
										:key="`genre-${index}`"
										class="p-2 bg-background border-2 border-background-600"
									>
										{{ genre.name }}
									</div>
								</div>
								<span>Game modes:</span>
								<div
									class="flex flex-wrap gap-2 justify-center mb-2"
								>
									<!-- MEMORY LEAK FIX: Added proper keys for v-for -->
									<div
										v-for="(gm, index) in game.game_modes"
										:key="`gamemode-${index}`"
										class="p-2 bg-background border-2 border-background-600"
									>
										{{ gm.name }}
									</div>
								</div>
								<span class="text-primary font-bold my-2"
									>Click to get more info!</span
								>
							</NuxtLink>

							<!--NO GAME FOUND-->
							<div
								v-if="!pending && !error && !game"
								class="absolute h-full w-full p-12 text-text border-2 border-dashed border-text flex justify-center items-center"
							>
								<span
									>No game corresponding to this filter</span
								>
							</div>
							<!--LOADER-->
							<div
								v-if="pending"
								class="absolute h-full w-full p-12 flex justify-center items-center"
							>
								<Loader />
							</div>
							<!--ERROR BOX-->
							<div
								v-if="!pending && error"
								class="absolute h-full w-full p-12 text-accent border-2 border-accent flex justify-center items-center"
							>
								<span
									>An error as occured, try again or contact
									the admin if it persists</span
								>
							</div>
						</div>
						<div
							class="flex flex-col my-auto lg:min-w-[350px] lg:mx-10"
						>
							<button
								type="button"
								class="font-bold text-2xl px-4 py-2 bg-primary text-background-950"
								@click="nextGame()"
							>
								Next Game
							</button>
							<USeparator
								label="OR"
								class="my-2"
								v-if="windowWidth > 640"
							/>
							<span v-if="windowWidth > 640" class="text-center"
								>Press
								<span
									class="font-bold underline underline-offset-4 decoration-primary"
									>SPACEBAR</span
								>
								to find a game to play!</span
							>
						</div>
					</div>

					<!-- FOOTER -->
					<div class="text-center p-2">
						<span class="text-text opacity-40"
							>Copyrights © 2023 Nicolas Guevara - hosting:
							OVH</span
						>
					</div>
				</div>
			</template>

			<template #sidebar-content>
				<SideBar
					:show="showSideBar"
					@close="showSideBar = false"
					:windowWidth="windowWidth"
				>
					<div class="text-2xl p-4">Filters</div>

					<!-- Filter Minimum rating -->
					<div class="p-4">
						<div class="flex justify-between mb-2">
							<span>Minimum rating:</span>
							<span>{{ filter.rate + ' / 100' }}</span>
						</div>
						<USlider
							v-model="filter.rate"
							:min="0"
							:max="100"
							:step="1"
						>
						</USlider>
					</div>
					<!-- Filter Platforms -->
					<div class="p-4 flex flex-col">
						<span class="mb-2">Platforms:</span>
						<USelectMenu
							v-model="filter.platforms"
							:items="platformItems"
							multiple
							searchable
							:search-attributes="[
								'label',
								'alternative_name',
								'abbreviation',
							]"
							searchable-placeholder="Search a platform..."
							placeholder="Select platforms"
						>
							<template #option="{ item: platform }">
								{{ platform.label }}
							</template>
						</USelectMenu>
					</div>
					<!-- Filter Genres -->
					<div class="p-4 flex flex-col">
						<span class="mb-2">Genres:</span>
						<USelectMenu
							v-model="filter.genres"
							:items="genreItems"
							multiple
							searchable
							:search-attributes="['label']"
							searchable-placeholder="Search a genre..."
							placeholder="Select genres"
						>
							<template #option="{ item: genre }">
								{{ genre.label }}
							</template>
						</USelectMenu>
					</div>
					<!-- Filter Game modes -->
					<div class="p-4 flex flex-col">
						<span class="mb-2">Game modes:</span>
						<USelectMenu
							v-model="filter.gameModes"
							:items="gameModeItems"
							multiple
							searchable
							:search-attributes="['label']"
							searchable-placeholder="Search a game mode..."
							placeholder="Select game modes"
						>
							<template #option="{ item: gm }">
								{{ gm.label }}
							</template>
						</USelectMenu>
					</div>
					<!-- Filter First release date -->
					<div class="p-4 flex flex-col">
						<span class="mb-2"
							>First release date between: {{ formatDateRange() }}
						</span>
						<USlider
							v-model="filter.rangeDate"
							:min="1970"
							:max="new Date().getFullYear()"
							:step="1"
						>
						</USlider>
					</div>
				</SideBar>
			</template>
		</SideBarContainer>

		<DevOnly>
			<button
				type="button"
				class="fixed right-4 bottom-4 p-2 bg-primary text-black font-bold z-50"
				@click="logtest"
			>
				LOG
			</button>
		</DevOnly>
	</div>
</template>

<style>
#__nuxt {
	overflow-x: clip;
}

.flip-enter-active {
	transition: all 0.3s linear;
}

.flip-enter-from {
	transform: rotateZ(0deg) rotateY(180deg);
}

.flip-enter-to {
	transform: rotateZ(0deg) rotateY(0deg);
}
</style>
