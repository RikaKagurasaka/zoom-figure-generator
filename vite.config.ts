import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import path from "path";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [UnoCSS(), vue(), vueJsx()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
