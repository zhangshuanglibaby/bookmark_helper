// 引入收藏记录的数据类型。
// 后台成功时，会将 BookmarkRecord 数组返回给侧边栏。
import type { BookmarkRecord } from "./types";


// 定义侧边栏发送给后台 Service Worker 的消息类型。
export type ExtensionMessage =
    // 请求后台返回“需要整理的收藏清单”。
    | {
        type: "LOAD_ARCHAEOLOGY_LIST";
    };

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