<template>
    <Teleport to="body">
        <Transition name="modal-wrapper">
            <div v-show="modalActive" class="fixed w-full bg-black bg-opacity-30 h-full top-0 left-0 flex justify-center px-8 z-50 rounded-t-md">
                <Transition name="modal-content">
                    <div v-if="modalActive" class=" bg-white self-start mt-2 max-w-screen-md w-[400px] ">
                        <div class="modal-header text-center py-2">
                            <p class="text-2xl font-bold">{{ header }}</p>
                        </div>
                        <hr class="w-full border-gray p-1 "/>
                        <div class="modal-body px-8 py-2 overflow-y-auto"  style="max-height: calc(100vh - 150px);">
                            <slot></slot>
                        </div>
                        <hr class="w-full border-gray p-1 "/>
                        
                        <div class="pb-4 px-8 float-right">
                            <Button class="text-white bg-bg-primary-light mt-4 py-2 px-6 rounded-lg"
                                @click="$emit('close-modal')" :label="closeText"  severity="danger"/>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>


<script setup lang="ts">
import Button from 'primevue/button';
import { defineProps, defineEmits } from "vue";

defineProps({
    modalActive: {
        type: Boolean,
        default: false,
    },
    header: {
        type: String,
        default: "",
    },
    closeText: {
        type: String,
        default: "Close",
    }
})

defineEmits(['close-modal'])

</script>

<style lang="less" scoped>
.modal-wrapper-enter-active,
.modal-wrapper-leave-active {
    transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02)
}

.modal-wrapper-enter-from,
.modal-wrapper-leave-to {
    opacity: 0;
}

.modal-content-enter-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02) 0.15s;
}

.modal-content-leave-active {
    transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02)
}

.modal-content-enter-from {
    opacity: 0;
    transform: scale(0.8);
}

.modal-content-leave-to {
    transform: scale(0.8);
}
</style>