<template>
  <Teleport to="body" v-if="show">
    <div class="mask" @click.self="close">
      <div class="content">
        <div class="w-1/2 overflow-y-auto">
          <div class="title text-2xl font-bold mb-8">图例配置</div>
          <div class="form flex flex-col gap-6">
            <div v-for="(item, index) in conf.colors" :key="index">
              <div class="form-control grid-cols-[auto_1fr] mb-2">
                <label class="label">颜色</label>
                <div class="flex items-center gap-1">
                  <span
                    v-for="(_, iindex) in item"
                    :key="iindex"
                    class="w-6 h-6"
                  >
                    <input
                      type="color"
                      class="w-full h-full"
                      v-model="conf.colors[index][iindex]"
                      @click.right="conf.colors[index].splice(iindex, 1)"
                    />
                  </span>
                  <button
                    class="text-green border border-solid border-green rounded-md flex items-center justify-center w6 h-6"
                    @click="conf.colors[index].push('#000')"
                  >
                    +
                  </button>
                </div>
              </div>
              <div class="form-control grid-cols-[auto_1fr] mb-2">
                <label class="label">标签</label>
                <input
                  type="text"
                  class="input wfull"
                  v-model="conf.labels[index].text"
                />
              </div>

              <div class="form-control grid-cols-[auto_1fr]">
                <label class="label">字体</label>
                <div class="flex items-center gap-1">
                  <select
                    class="input wfull"
                    v-model="conf.labels[index].family"
                  >
                    <option
                      v-for="family in familyOptions"
                      :key="family"
                      :value="family"
                    >
                      {{ family.split("-")[1] }}
                    </option>
                  </select>
                  <select
                    class="input wfull"
                    v-model="conf.labels[index].variant"
                  >
                    <option
                      v-for="variant in variantOptions"
                      :key="variant"
                      :value="variant"
                    >
                      {{ variant.split("-")[1] }}
                    </option>
                  </select>
                  <button
                    class="text-red border border-solid border-red rounded-md px-1 py-0.5 w-30"
                    @click="conf.colors.splice(index, 1)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
            <button
              class="text-green border border-solid border-green rounded-md px-1 py-0.5"
              @click="
                conf.colors.push([]);
                conf.labels.push({
                  text: '',
                  family: 'font-sans',
                  variant: 'font-normal',
                });
              "
            >
              添加
            </button>
            <button
              class="text-blue border border-solid border-blue rounded-md px-1 py-0.5"
              @click="save"
            >
              保存
            </button>
          </div>
        </div>
        <div class="w-1/2 bg-gray-100 flex justify-center items-center">
          <LegendRenderer :conf="conf" ref="legendRenderer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useVModels } from "@vueuse/core";
import type { LegendConfig } from "./lib.tsx";
import LegendRenderer from "./LegendRenderer.vue";
import * as htmlToImage from "html-to-image";

const familyOptions = ["font-sans", "font-serif", "font-mono"];
const variantOptions = ["font-normal", "font-italic", "font-bold"];

const props = defineProps<{
  show: boolean;
  conf: LegendConfig;
}>();
const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "update:conf", value: LegendConfig): void;
  (e: "update:legendTexture", value: string): void;
}>();
const { show } = useVModels(props, emit);

function close() {
  emit("update:show", false);
}

async function save() {
  const node = document.getElementById("legend-renderer");
  const dataUrl = await htmlToImage.toSvg(node!);
  const image = new Image();
  image.onload = () => {
    emit("update:legendTexture", dataUrl);
    const originalWidth = props.conf.width;
    const newShouldWidth = image.width;
    const scale = originalWidth / newShouldWidth;
    const newHeight = image.height * scale;
    props.conf.height = newHeight;
    close();
  };
  image.src = dataUrl;
}
</script>

<style scoped>
.mask {
  @apply fixed inset-0 bg-black/50 p-32;
}

.content {
  @apply bg-white rounded-md p-8 flex gap-4 h-full;
}

button {
  @apply border border-solid px-1 py-0.5 rounded;
}

select {
  @apply border border-solid border-gray-300 rounded-md px-1 py-0.5;
}
</style>
