// 引入读取全部网页收藏的函数。
import {
  // 读取 Chrome 中全部网页收藏。
  readAllBookmarks,

  // 从全部收藏中筛选并排序出需要整理的收藏。
  getArchaeologyBookmarks
} from "./bookmarks";

// 引入侧边栏与后台之间共用的消息类型说明。
import type { ExtensionMessage } from "../shared/messages";

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

  })
    .catch((error) => {
      // 如果读取或筛选失败，输出错误信息，方便排查。
      console.error("读取或筛选收藏夹失败：", error);
    });
})


// 监听页面或其他扩展部分发送给后台的消息。
chrome.runtime.onMessage.addListener(
  (
    // message 是侧边栏发送过来的消息。
    message: ExtensionMessage,

    // sender 包含消息发送者的信息；当前这一步暂时不需要使用。
    _sender,

    // sendResponse 用来把处理结果回传给侧边栏。
    sendResponse,
  ) => {
    // 判断侧边栏是否在请求“待整理收藏清单”。
    if (message.type === "LOAD_ARCHAEOLOGY_LIST") {
      // 读取全部收藏，再筛选出超过 180 天的收藏。
      readAllBookmarks()
        .then((allBookmarks) => {

          // 按默认的 180 天规则筛选和排序。
          const archaeologyBookmarks = getArchaeologyBookmarks(allBookmarks);

          // 将清单数据回传给侧边栏。
          sendResponse({
            // 表示本次请求成功。
            success: true,

            // 返回需要整理的收藏数组。
            bookmarks: archaeologyBookmarks,
          });
        })
        .catch((error) => {
          // 读取失败时，也将失败信息回传给侧边栏。
          sendResponse({
            // 表示本次请求失败。
            success: false,

            // 将错误转换成便于显示的文字。
            error: error instanceof Error ? error.message : "读取收藏夹失败",
          });
        })
      // 告诉 Chrome：sendResponse 会在异步读取完成后才执行。
      // 如果不写 return true，Chrome 可能会提前关闭消息通道。
      return true;
    }

    // 判断侧边栏是否请求打开某条收藏。
    if (message.type === "OPEN_BOOKMARK") {
      // 在新的浏览器标签页中打开消息携带的网址。
      chrome.tabs
        .create({
          // 指定新标签页需要打开的网址。
          url: message.url,
        })
        .then(() => {
          // 将打开成功的结果回传给侧边栏。
          sendResponse({
            success: true,
          });
        })
        .catch((error) => {
          // 打开失败时，将错误信息回传给侧边栏。
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "打开网页失败",
          });
        });
      // 告诉 Chrome：sendResponse 会在异步操作完成后执行。
      return true;
    }

    // 判断侧边栏是否请求删除一条收藏。
    if (message.type === "DELETE_BOOKMARK") {
      // 根据 Chrome 收藏 ID 删除对应书签。
      chrome.bookmarks.remove(message.bookmarkId)
        // 删除成功后通知侧边栏。
        .then(() => {
          // 返回成功结果。
          sendResponse({ success: true });
        })
        // 删除失败时通知侧边栏，不假装删除成功。
        .catch((error) => {
          // 返回失败结果和可阅读的原因。
          sendResponse({
            // 表示删除失败。
            success: false,
            // 将错误转换为文字。
            error: error instanceof Error ? error.message : "删除收藏失败",
          });
        });
      // 保持消息通道开启，等待 Chrome 完成删除后再回复。
      return true;
    }

    // 当前没有处理其他消息，所以不返回任何内容。
    return undefined;
  }

)
