<script lang="ts" setup>
const props = defineProps<{
    show: boolean,
    windowWidth: number,
}>()
// const props = defineProps({
//     show: { type: Boolean, required: true, default: false },
// })
const emit = defineEmits(['close'])

const sideBar: Ref<HTMLElement | null> = ref(null)

watch(() => props.show, (newValue, oldValue) => {
    console.log('Change show :', oldValue, '->', newValue)
    if (newValue == true) {
        console.log('sideBar.value before focus', sideBar.value)

        nextTick(() => {
            if (sideBar.value) {
                sideBar.value.focus()
            }
        })

    }
})

function handleFocusout(event: any) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
        if (props.windowWidth < 1024) {
            // console.log("emit close sidebar")
            emit('close')
        }
    }
}

onMounted(() => {
    console.log("sideBar.value", sideBar.value)
})
</script>


<template>
    <Transition name="tshrink">
        <div class="fixed right-0 top-0 h-screen w-2/3 lg:sticky lg:self-start lg:basis-1/4 bg-background p-4 shadow-lg shadow-background-800 z-10 border border-text border-opacity-50 outline-none"
            v-show="show" tabindex="1" ref="sideBar" @blur="handleFocusout">
            <!--TODO: Fix blur issue mobile when clicking input inside sidebar-->
            <div class="flex flex-col items-stretch overflow-y-auto overflow-x-clip h-full">
                <slot></slot>
            </div>
            <button v-if="true" type="button"
                class="p-4 absolute -top-[1px] -left-[64px] z-20 border-l border-t border-b border-text border-opacity-50 bg-background"
                @click="$emit('close')">
                <Icon class="text-text" size="2em" name="akar-icons:cross" />
            </button>
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