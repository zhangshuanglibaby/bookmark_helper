// 从 Vite 引入定义配置的工具。
import { defineConfig } from "vite";
// 引入 React 的 Vite 插件，让 Vite 能处理 React 组件。
import react from "@vitejs/plugin-react";

// 引入 CRXJS 插件，让 Vite 能打包 Chrome 扩展。
import { crx } from "@crxjs/vite-plugin";

// 引入Chrome 扩展配置。
import manifest from "./manifest.config.ts";


// 导出 Vite 的完整配置。
export default defineConfig({
  // 配置项目需要使用的插件。
  plugins: [
    // 启用 React 支持。
    react(),

    // 启用 Chrome 扩展支持，并传入扩展信息配置。
    crx({ manifest }),
  ]
})
