<script lang="ts" setup>
const props = defineProps<{
	show: boolean;
	windowWidth: number;
}>();
const emit = defineEmits(['close']);

const sideBar: Ref<HTMLElement | null> = ref(null);

watch(
	() => props.show,
	(newValue, oldValue) => {
		if (newValue == true) {
			nextTick(() => {
				if (sideBar.value) {
					// Auto focus sideBar when shown
					sideBar.value.focus();
				}
			});
		}
	}
);

function handleFocusout(event: FocusEvent) {
	// // Only close when focus moves outside the sidebar container
	// const container = sideBar.value;
	// if (!container) return;
	// // The newly focused element after focusout
	// const nextTarget = (event.relatedTarget as Node | null) ?? (document.activeElement as Node | null);
	// const staysInside = nextTarget ? container.contains(nextTarget) : false;
	// if (!staysInside && props.windowWidth < 1024) {
	// 	emit('close');
	// }
}

onMounted(() => {
	console.log('sideBar.value', sideBar.value);
});
</script>

<template>
	<Transition name="tshrink">
		<div
			class="fixed right-0 top-0 h-screen w-2/3 lg:sticky lg:self-start lg:basis-1/4 bg-background p-4 shadow-lg shadow-background-800 z-10 border border-text border-opacity-50 outline-hidden"
			v-show="show"
			tabindex="1"
			ref="sideBar"
			@focusout="handleFocusout"
		>
			<div class="flex flex-col items-stretch overflow-y-auto overflow-x-clip h-full">
				<slot></slot>
			</div>
			<button v-if="true" type="button" class="p-4 absolute -top-px -left-[64px] z-20 border-l border-t border-b border-text border-opacity-50 bg-background" @click="$emit('close')">
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
		flex-grow: 0.00001;
		transform: translateX(300px);
		opacity: 0;
	}
}
</style>
