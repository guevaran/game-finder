<script lang="ts" setup>
const props = defineProps<{
    show: boolean
}>()
// const props = defineProps({
//     show: { type: Boolean, required: true, default: false },
// })

const sideBar: Ref<HTMLElement | null> = ref(null)

watch(() => props.show, (newValue, oldValue) => {
    console.log('Change show :', oldValue, '->', newValue)
    if (newValue == true) {
        console.log('sideBar.value before focus', sideBar.value)

        nextTick(() => {
            sideBar.value.focus()
        })

    }
})

onMounted(() => {
    console.log("sideBar.value", sideBar.value)
})
</script>

<template>
    <Transition name="tshrink">
        <div class="fixed right-0 h-screen w-2/3 lg:relative lg:basis-1/4 bg-background p-4 overflow-y-scroll shadow-lg shadow-background-800 z-10 border border-text focus:border-red-500"
            v-show="show" tabindex="1" ref="sideBar">
            <div class="flex flex-col items-stretch">
                <slot></slot>
            </div>
        </div>
    </Transition>
</template>

<style>
.tshrink-enter-active {
    animation: ashrink 0.3s reverse;
}

.tshrink-leave-active {
    animation: ashrink 0.3s;
}

@keyframes ashrink {
    to {
        flex-grow: .00001;
        transform: translateX(300px);
        opacity: 0;
    }
}
</style>