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
  runtimeConfig: {
    public: {
      IGDB_CLIENT_ID: process.env.IGDB_CLIENT_ID,
      IGDB_TOKEN: process.env.IGDB_TOKEN,
    },
  },
  modules: [
    'nuxt-icon',
    '@nuxtjs/google-fonts',
    '@nuxt/image',
  ],
  googleFonts: {
    download: true,
    families: {
      'Pixelify+Sans': true,
    }
  },
})
