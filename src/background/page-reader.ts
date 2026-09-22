/**
 * 获取网页正文相关的逻辑
 */

// 引入网页正文提取结果的数据类型。
import type { PageContent } from "../shared/types";

// 从当前已经打开的网页中提取标题、描述、关键词、正文和网址。
// 这个函数后面会由 chrome.scripting 注入到临时打开的网页中执行。
export function extractPageContent(): PageContent {
  // 先读取网页的 meta description。
  // 它通常是网站为搜索引擎和分享卡片准备的页面简介。
  const description =
    document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      ?.trim() ?? "";

  // 再读取网页的 meta keywords。
  // 它通常是网站填写的多个关键词，例如“React, TypeScript, 前端开发”。
  const keywords =
    document
      .querySelector('meta[name="keywords"]')
      ?.getAttribute("content")
      ?.trim() ?? "";

  // 然后寻找网页中的 article 元素。
  // 文章、博客和新闻页面常把主要正文放在这里。
  const article = document.querySelector("article");

  // 如果没有 article，再寻找 main 元素。
  // 许多网页会把主要内容放在 main 中。
  const main = document.querySelector("main");

  // 获取网页 body 中的所有可见文字。
  // 当 article 和 main 都不存在时，使用它作为最后的备用内容。
  const bodyText = document.body?.innerText ?? "";

  // 按 article、main、body 的优先顺序选择正文。
  const rawText = article?.innerText || main?.innerText || bodyText;

  // 读取网页标题。
  const title = document.title;

  // 清理多余空白字符，例如换行、连续空格和制表符。
  // 最多保留 15,000 个字符，避免后续发送给 AI 的内容过长。
  const text = rawText.replace(/\s+/g, " ").trim().slice(0, 15_000);

  // 返回统一的数据格式。
  return {
    // 网页标题。
    title,

    // 网页描述。
    description,

    // 网页关键词。
    keywords,

    // 清理后的正文。
    text,

    // 当前网页的网址。
    url: location.href,
  };
}

// 将 extractPageContent 函数注入指定标签页，并取得网页内容。
/**
 * 
 * @param tabId 需要等待的标签页 ID。
 * @returns 从网页中读取到的标题、描述、关键词、正文和网址。
 */
export async function readPageContentFromTab(
  tabId: number,
): Promise<PageContent> {
  // 向指定标签页的主页面注入 extractPageContent 函数。
  const injectionResults = await chrome.scripting.executeScript({
    // 指定需要注入脚本的目标标签页。
    target: {
      tabId,
    },

    // 指定要在网页中执行的函数。
    func: extractPageContent,
  });

  // 默认只读取主页面，因此结果数组的第一项就是我们需要的结果。
  const pageContent = injectionResults[0]?.result as PageContent | undefined;

  // 没有拿到结果时，主动抛出错误，方便后续统一处理。
  if (!pageContent) {
    throw new Error("未能提取网页内容");
  }

  // 返回从网页中读取到的标题、描述、关键词、正文和网址。
  return pageContent;
}

/**
 * 
 * 网页的加载状态会通过 chrome.tabs.onUpdated 事件变化；当 changeInfo.status 变成 "complete"，就表示该标签页完成加载。
 */
/**
 * 
 * @param tabId 需要等待的标签页 ID。
 * @param timeoutMilliseconds 最长等待时间，单位为毫秒。
 * @returns 
 */
// 等待指定标签页完成加载。
function waitForTabComplete(
  tabId: number,
  timeoutMilliseconds: number = 20_000,
): Promise<void> {
  // 返回一个 Promise，让外部代码能够使用 await 等待加载结果。
  return new Promise((resolve, reject) => {
    // 用来记录这个等待流程是否已经结束。
    let isFinished = false;

    // 清理事件监听器和计时器，避免它们继续占用资源。
    function cleanup() {
      // 停止监听所有标签页的更新事件。
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);

      // 停止超时计时器。
      clearTimeout(timeoutId);
    }

    // 统一结束等待流程。
    // 传入 error 表示失败；没有 error 表示成功。
    function finish(error?: Error) {
      // 避免网页完成和超时同时发生时，重复执行结束逻辑。
      if (isFinished) {
        return;
      }
      // 标记为已结束。
      isFinished = true;

      // 清理不再需要的监听器和计时器。
      cleanup();

      // 有错误时，让 Promise 进入失败状态。
      if (error) {
        reject(error);
        return;
      }

      // 没有错误时，让 Promise 进入成功状态。
      resolve();
    }

    // 监听所有标签页的更新。
    function handleTabUpdated(
      // 本次发生变化的标签页 ID。
      updatedTabId: number,

      // 我们目前只关心标签页的加载状态。
      changeInfo: {
        // 标签页加载时是 loading，加载完成时是 complete。
        status?: string;
      }
    ) {
      // 只关心我们正在等待的那一个标签页。
      if (updatedTabId !== tabId) {
        return;
      }
      // 当标签页状态变成 complete，表示网页已加载完成。
      if (changeInfo.status === "complete") {
        finish();
      }
    }

    // 开始监听标签页更新事件。
    chrome.tabs.onUpdated.addListener(handleTabUpdated);

    // 启动超时计时器。
    const timeoutId = setTimeout(() => {
      // 超过指定时间仍未加载完成，则结束并返回超时错误。
      finish(new Error("网页加载超时"));
    }, timeoutMilliseconds);

    // 额外检查一次当前标签页状态。
    // 避免网页恰好在事件监听开始前就已经加载完成。
    chrome.tabs
      .get(tabId)
      .then((tab) => {
        // 已经是 complete 时，立即结束等待。
        if (tab.status === "complete") {
          finish();
        }
      })
      .catch(() => {
        // 如果标签页已经不存在，结束并返回错误。
        finish(new Error("临时标签页已关闭"));
      });
  });
}