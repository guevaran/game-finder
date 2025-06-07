// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	// devtools: { enabled: true },
	app: {
		head: {
			title: 'Game Finder',
			meta: [
				{
					name: 'og:title',
					content: 'Game Finder',
				},
				{
					name: 'description',
					content:
						'What to play? With Game Finder, discover your next video game to play!',
				},
				{
					name: 'og:description',
					content:
						'What to play? With Game Finder, discover your next video game to play!',
				},
			],
			htmlAttrs: {
				lang: 'en',
			},
		},
	},
	css: ['~/assets/css/main.css'],
	postcss: {
		plugins: {
			'@tailwindcss/postcss': {},
			autoprefixer: {},
		},
	},
	// tailwindcss: {
	// 	exposeConfig: true,
	// },

	modules: [
		'@nuxt/ui',
		'nuxt-icon',
		'@nuxtjs/google-fonts',
		'@nuxt/image',
		'nuxt-api-party',
		'nuxt-scheduler',
		// '@nuxtjs/tailwindcss',
	],

	googleFonts: {
		download: true,
		families: {
			'Pixelify+Sans': true,
		},
	},
	apiParty: {
		endpoints: {
			igdb: {
				url: process.env.IGDB_API_BASE_URL!,
				// Global headers sent with each request
				headers: {
					'Client-ID': process.env.IGDB_CLIENT_ID!,
				},
			},
		},
	},
});
