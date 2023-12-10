// @ts-ignore
import VueSlider from 'vue-slider-component/dist-css/vue-slider-component.umd.min.js'
import 'vue-slider-component/dist-css/vue-slider-component.css'
import 'vue-slider-component/theme/default.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueSlider)
})