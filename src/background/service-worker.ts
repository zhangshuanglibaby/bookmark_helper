// 引入读取全部网页收藏的函数。
import {
  // 读取 Chrome 中全部网页收藏。
  readAllBookmarks,

  // 从全部收藏中筛选并排序出需要整理的收藏。
  getArchaeologyBookmarks
} from "./bookmarks";

// 在扩展安装或更新后，读取一次收藏夹。
// 现在先把数量输出到后台控制台，用来验证读取功能是否正常。
// chrome.runtime.onInstalled.addListener 是 Chrome 扩展开发中用来监听‌扩展安装、更新或浏览器更新‌等事件的核心 API，常用于执行一次性初始化任务
chrome.runtime.onInstalled.addListener(() => {
  // 调用异步函数读取 Chrome 中的网页收藏。
  readAllBookmarks().then((allBookmarks) => {

    // 筛选收藏时间超过 180 天的收藏，并按最近访问时间排序。
    const archaeologyBookmarks = getArchaeologyBookmarks(allBookmarks);

    // 输出浏览器中全部网页收藏的数量。
    console.log(`全部网页收藏：${allBookmarks.length} 条。`);

    // 输出符合“超过 180 天”条件的收藏数量。
    console.log(
      `需要整理的收藏：${archaeologyBookmarks.length} 条。`,
    );

    // 输出排序后的第一条待整理收藏，方便检查排序是否正确。
    console.log(
      "最先显示的待整理收藏：",
      archaeologyBookmarks[0],
    );
  })
    .catch((error) => {
      // 如果读取或筛选失败，输出错误信息，方便排查。
      console.error("读取或筛选收藏夹失败：", error);
    });
})