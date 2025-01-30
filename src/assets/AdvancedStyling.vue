<template>
  <Teleport to="body" v-if="show">
    <div class="mask" @click.self="close">
      <div class="content flex flex-col gap-4">
        <div class="flex flex-1 gap-4">
          <div class="flex-1 flex flex-col gap-4">
            <div class="form-control">
              <label for="">填充颜色</label>
              <input readonly :disabled="true" v-model="conf.fill" />
            </div>
            <div class="form-control">
              <label for="">描边颜色</label>
              <input type="color" v-model="conf.stroke" />
            </div>
            <div class="form-control">
              <label for="">描边宽度</label>
              <input type="number" v-model.number="conf.strokeWidth" />
            </div>
            <div class="form-control">
              <label for="">虚线样式</label>
              <input type="text" v-model="conf.strokeDasharray" />
            </div>
            <div class="form-control">
              <label for="">边缘样式</label>
              <select v-model="conf.strokeLinecap">
                <option value="round">圆角</option>
                <option value="square">方形</option>
                <option value="butt">直线</option>
              </select>
            </div>
            <div class="form-control">
              <label for="">连接样式</label>
              <select v-model="conf.strokeLinejoin">
                <option value="round">圆角</option>
                <option value="square">方形</option>
                <option value="miter">尖角</option>
              </select>
            </div>
          </div>
          <textarea
            v-model="jsonContent"
            class="h-full font-mono flex-1 border border-gray-300 rounded-md p-2"
            spellcheck="false"
          ></textarea>
        </div>
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
const { show, conf } = useVModels(props, emit);

function close() {
  show.value = false;
}

const jsonContent = ref("");
watch(
  [conf, show],
  () => {
    jsonContent.value = JSON.stringify(conf.value, null, 2);
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
