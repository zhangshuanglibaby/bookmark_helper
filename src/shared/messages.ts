// 引入收藏记录的数据类型。
// 后台成功时，会将 BookmarkRecord 数组返回给侧边栏。
import type { BookmarkRecord } from "./types";


// 定义侧边栏发送给后台 Service Worker 的消息类型。
export type ExtensionMessage =
  // 请求后台返回“需要整理的收藏清单”。
  | {
    type: "LOAD_ARCHAEOLOGY_LIST";
  }
  // 请求后台在新的浏览器标签页打开指定网址。
  | {
    // 这条消息的用途标签。
    type: "OPEN_BOOKMARK";

    // 需要打开的网页网址。
    url: string;
  }
  // 请求后台删除一条收藏。
  | {
    // 告诉后台这是一条删除请求。
    type: "DELETE_BOOKMARK";
    // 指定要删除的 Chrome 收藏 ID。
    bookmarkId: string;
  };;

// 定义后台返回“待整理收藏清单”时可能出现的两种结果。
export type ArchaeologyListResponse =
  // 第一种：读取成功，包含收藏数组。
  | {
    // 表示请求成功。
    success: true;

    // 后台筛选并排序后的待整理收藏。
    bookmarks: BookmarkRecord[];
  }
  // 第二种：读取失败，包含错误文字。
  | {
    // 表示请求失败。
    success: false;

    // 便于在侧边栏显示的错误信息。
    error: string;
  };
