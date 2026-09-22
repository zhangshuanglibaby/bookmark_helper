// 定义侧边栏发送给后台 Service Worker 的消息类型。
export type ExtensionMessage =
    // 请求后台返回“需要整理的收藏清单”。
    | {
        type: "LOAD_ARCHAEOLOGY_LIST";
    };