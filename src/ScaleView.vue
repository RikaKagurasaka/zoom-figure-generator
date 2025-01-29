<template>
  <g v-if="conf.enable" class="select-none" ref="scaleViewRef">
    <rect
      :x="conf.x"
      :y="conf.y"
      :width="conf.width"
      :height="conf.height"
      :fill="conf.rect.fill"
    />
    <line
      :x1="conf.x + conf.width / 6"
      :y1="conf.y + conf.height / 3"
      :x2="conf.x + (conf.width * 5) / 6"
      :y2="conf.y + conf.height / 3"
      :stroke="conf.line.stroke"
      :stroke-width="conf.line.strokeWidth"
    />
    <text
      :x="conf.x + conf.width / 2"
      :y="conf.y + (conf.height * 5) / 6"
      text-anchor="middle"
      :fill="conf.text.fill"
      :class="conf.text.fontFamily"
      :font-size="conf.text.fontSize"
    >
      {{ conf.text.text }}
    </text>
  </g>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { ScaleConfig } from "./lib.tsx";
defineExpose({
  el: useTemplateRef("scaleViewRef"),
});
defineProps<{
  conf: ScaleConfig;
}>();
</script>

<style scoped></style>
