// 从 CRXJS 插件中引入 Manifest V3 的类型。
// 它能帮助我们检查配置项是否写对。

import type { ManifestV3Export } from "@crxjs/vite-plugin";

// 定义 Chrome 扩展的基本信息。
const manifest: ManifestV3Export = {
   // 表示使用 Chrome 扩展的 Manifest V3 规范。
   manifest_version: 3,
    // 扩展在 Chrome 扩展管理页显示的名称。
    name: "收藏夹整理助手",
    // 扩展当前版本号。以后每次发布更新时可以增加它。
    version: "0.1.0",
    // 扩展在 Chrome 扩展管理页显示的简介。
    description: "一款帮助用户重新查看和清理长期未使用收藏的网站的 Chrome 浏览器扩展",
    // 浏览器工具栏中扩展图标的基础配置。
    action: {
        // 鼠标悬停在扩展图标上时显示的文字。
        default_title: "打开收藏夹整理助手",
    },
};

// 将这份配置导出，供 Vite 打包 Chrome 扩展时使用。
export default manifest;