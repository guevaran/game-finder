<script lang="ts" setup>
const props = defineProps<{
    show: boolean,
    windowWidth: number,
}>()
const emit = defineEmits(['close'])

const sideBar: Ref<HTMLElement | null> = ref(null)

watch(() => props.show, (newValue, oldValue) => {
    if (newValue == true) {
        nextTick(() => {
            if (sideBar.value) {
                // Auto focus sideBar when shown
                sideBar.value.focus()
            }
        })
    }
})

function handleFocusout(event: any) {
    // To avoid closing sidebar when clicking on an element inside the sidebar
    if (!event.currentTarget.contains(event.relatedTarget)) {
        // Auto close on focusout only on small screens
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
            v-show="show" tabindex="1" ref="sideBar" @focusout="handleFocusout">
            <div class="flex flex-col items-stretch overflow-y-auto overflow-x-clip h-full">
                <slot></slot>
            </div>
            <button v-if="true" type="button"
                class="p-4 absolute -top-[1px] -left-[64px] z-20 border-l border-t border-b border-text border-opacity-50 bg-background"
                @click="$emit('close')">
                <Icon class="text-text hover:text-primary" size="2em" name="akar-icons:cross" />
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