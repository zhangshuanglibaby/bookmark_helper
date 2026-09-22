// 引入读取全部网页收藏的函数。
import { readAllBookmarks } from "./bookmarks";

// 在扩展安装或更新后，读取一次收藏夹。
// 现在先把数量输出到后台控制台，用来验证读取功能是否正常。
// chrome.runtime.onInstalled.addListener 是 Chrome 扩展开发中用来监听‌扩展安装、更新或浏览器更新‌等事件的核心 API，常用于执行一次性初始化任务
chrome.runtime.onInstalled.addListener(() => {
  // 调用异步函数读取 Chrome 中的网页收藏。
  readAllBookmarks().then((bookmarks) => {
    // 输出读取到的收藏数量。
    console.log(`已读取 ${bookmarks.length} 条网页收藏。`);

    // 输出第一条收藏，方便之后检查数据结构。
    console.log("第一条收藏记录：", bookmarks[0]);
  })
  .catch((error) => {
    // 如果读取失败，输出错误信息，方便排查。
    console.error("读取收藏夹失败：", error);
  });
})