<template>
    <Teleport to="body">
        <Transition name="modal-wrapper">
            <div v-show="modalActive" class="">
                <Transition name="modal-content">
                    <div v-if="modalActive" class="">
                        <div class="modal-header">
                            <p class="">{{ header }}</p>
                        </div>
                        <hr class="" />
                        <div class="modal-body">
                            <slot></slot>
                        </div>
                        <hr class="" />

                        <div class="pb-8 px-8">
                            <Button class="text-white bg-bg-primary-light mt-4 py-2 px-6 rounded-lg"
                                @click="$emit('close-modal')" :label="closeText" />
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