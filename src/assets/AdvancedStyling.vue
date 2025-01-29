<template>
  <Teleport to="body" v-if="show">
    <div class="mask" @click.self="close">
      <div class="content flex flex-col gap-4">
        <textarea
          v-model="jsonContent"
          class="w-full h-full font-mono"
          spellcheck="false"
        ></textarea>
        <button class="btn-apply" :disabled="!jsonValid" @click="apply">
          应用
        </button>
        <button class="btn-close" @click="close">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useVModels } from "@vueuse/core";
import { computed, ref, watch } from "vue";

const props = defineProps<{
  show: boolean;
  conf: Record<string, any>;
}>();
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update:conf", value: Record<string, any>): void;
}>();
const { show } = useVModels(props, emit);

function close() {
  show.value = false;
}

const jsonContent = ref("");
watch(
  props.conf,
  (newVal) => {
    jsonContent.value = JSON.stringify(newVal, null, 2);
  },
  { immediate: true, deep: true }
);

const jsonValid = computed(() => {
  try {
    JSON.parse(jsonContent.value);
    return true;
  } catch (e) {
    return false;
  }
});

function apply() {
  try {
    emit("update:conf", JSON.parse(jsonContent.value));
    close();
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped>
.mask {
  @apply fixed inset-0 bg-black/50 p-32;
}

.content {
  @apply bg-white rounded-md p-8 flex gap-4 h-full;
}

.btn-apply {
  @apply w-full bg-blue-500 text-white rounded-md py-1;

  &:disabled {
    @apply bg-gray-500 opacity-50;
  }
}

.btn-close {
  @apply w-full text-red-500 border border-red-500 rounded-md py-1;
}
</style>
