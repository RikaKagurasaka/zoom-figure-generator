<template>
  <Teleport to="body">
    <div class="mask" v-if="show" @click.self="close">
      <div class="content">
        <h1>使用说明</h1>

        <p class="text-sm text-gray-500">
以下内容由 claude-3.5-sonnet 根据代码生成，不保证完全正确。
        </p>
        
        <section>
          <h2>基本操作</h2>
          <ul>
            <li>点击"上传图片"按钮选择要处理的图片</li>
            <li>图片会以原始尺寸显示在左侧画布中</li>
            <li>右侧面板包含所有可调节的参数</li>
          </ul>
        </section>

        <section>
          <h2>框选区域</h2>
          <ul>
            <li>小框: 用于选择要放大的区域
              <ul>
                <li>拖拽: 直接用鼠标拖动小框</li>
                <li>调整大小: 鼠标指向小框后按 W/S 或 +/- 键</li>
                <li>精确定位: 使用右侧面板中的 X/Y/宽/高 数值调节</li>
              </ul>
            </li>
            <li>大框: 放大区域的显示位置
              <ul>
                <li>操作方式与小框相同</li>
                <li>会自动显示小框选中区域的放大图像</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>连接线</h2>
          <ul>
            <li>用虚线连接小框和大框，表示它们的对应关系</li>
            <li>可以在右侧面板中开启/关闭</li>
            <li>点击"高级样式"可以调整:
              <ul>
                <li>线条颜色</li>
                <li>线条粗细</li>
                <li>虚线间距</li>
                <li>线条端点样式</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>比例尺</h2>
          <ul>
            <li>在图中添加比例尺以表示实际尺寸</li>
            <li>可调整:
              <ul>
                <li>位置和大小(拖拽或数值输入)</li>
                <li>背景颜色</li>
                <li>线条样式(颜色/粗细)</li>
                <li>文字(内容/字体/大小/颜色)</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>图例</h2>
          <ul>
            <li>用于添加颜色图例说明</li>
            <li>可以设置:
              <ul>
                <li>位置和大小</li>
                <li>颜色组合</li>
                <li>文字说明</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2>保存图片</h2>
          <ul>
            <li>点击"保存图片"按钮</li>
            <li>将以原始分辨率导出为 PNG 格式</li>
            <li>包含所有添加的元素(框/线/比例尺/图例)</li>
          </ul>
        </section>

        <section>
          <h2>提示</h2>
          <ul>
            <li>所有设置都会自动保存在浏览器中</li>
            <li>下次打开时会自动恢复上次的设置</li>
            <li>如需重置，请清除浏览器数据</li>
          </ul>
        </section>

        <button class="close-btn" @click="close">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useVModels } from "@vueuse/core";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
}>();

const { show } = useVModels(props, emit);

function close() {
  show.value = false;
}
</script>

<style scoped>
.mask {
  @apply fixed inset-0 bg-black/50 p-32 z-50;
}

.content {
  @apply bg-white rounded-md p-8 overflow-y-auto h-full relative;
}

h1 {
  @apply text-2xl font-bold mb-6;
}

h2 {
  @apply text-xl font-bold mt-6 mb-3 text-blue-600;
}

section {
  @apply mb-6;
}

ul {
  @apply list-disc pl-6 space-y-2;
}

ul ul {
  @apply mt-2 list-circle;
}

li {
  @apply text-gray-700;
}

.close-btn {
  @apply absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md 
         hover:bg-blue-600 transition-colors;
}
</style>
