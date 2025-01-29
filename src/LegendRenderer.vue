<template>
  <div id="legend-renderer">
    <div class="bg-white p-4 flex flex-col gap-2 border-2 border-solid border-black">
      <div
        v-for="(color, index) in conf.colors"
        :key="index"
        class="rounded-md flex items-center gap-2"
      >
        <div
          class="colors-container flex border-2 border-solid border-black h-4 w-8"
        >
          <div
            v-for="item in color"
            :key="item"
            class="color flex-1"
            :style="{ backgroundColor: item }"
          ></div>
        </div>
        <div class="label" :class="conf.labels[index].family + ' ' + conf.labels[index].variant">
          {{ conf.labels[index].text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LegendConfig } from "./lib.tsx";

defineProps<{
  conf: LegendConfig;
}>();
</script>

<style scoped></style>
