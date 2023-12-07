// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
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
  ],
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
          Authorization: `Bearer ${process.env.IGDB_TOKEN}`, // TODO: Handle token expiration after 60 days
        },
      },
    },
  },
})
