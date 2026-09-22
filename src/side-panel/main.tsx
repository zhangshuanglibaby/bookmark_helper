// 从 React 引入 StrictMode，用于在开发阶段帮助检查潜在问题。
import { StrictMode } from 'react';

// 从 React DOM 引入 createRoot，用于将 React 界面渲染到 HTML 页面中。
import { createRoot } from "react-dom/client";

// 引入同一个 side-panel 文件夹中的侧边栏主界面组件。
import App from "./App";
// 引入侧边栏专用样式。
import "./styles.css";

// 从 sidep-panel/index.html 中找到 id 为 root 的元素。
const rootElement = document.getElementById("root");

// 如果找不到 root 元素，就停止程序并显示错误信息。
if (!rootElement) {
    throw new Error("未找到 React 页面挂载节点");
  }

  // 将侧边栏 App 组件渲染到 root 元素中。
  createRoot(rootElement).render(
    // StrictMode 只在开发阶段帮助检查代码，不会改变正式功能。
    <StrictMode>
      <App />
    </StrictMode>
  );