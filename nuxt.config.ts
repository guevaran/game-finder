// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },
  app: {
    head: {
      title: "Game Finder",
      meta: [
        {
          name: "og:title",
          content: "Game Finder",
        },
        {
          name: "description",
          content: "What to play? With Game Finder, discover your next video game to play!",
        },
        {
          name: "og:description",
          content: "What to play? With Game Finder, discover your next video game to play!",
        },
      ],
      htmlAttrs: {
        lang: 'en'
      }
    },
  },
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // runtimeConfig: {
  //   public: {
  //     IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID,
  //     IGDB_TOKEN: process.env.IGDB_TOKEN,
  //   },
  // },
  modules: [
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
    'nuxt-api-party',
    '@nuxt/ui',
    'nuxt-scheduler',
  ],
  // plugins: ['~/plugins/vue-slider.client.js'],
  googleFonts: {
    download: true,
    families: {
      'Pixelify+Sans': true,
    }
  },
  apiParty: {
    endpoints: {
      igdb: {
        url: process.env.IGDB_API_BASE_URL!,
        // Global headers sent with each request
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          Authorization: `Bearer ${process.env.IGDB_TOKEN}`,
        },
      },
    },
  },
})
