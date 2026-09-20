// 定义收藏在程序中的处理状态。
export type BookmarkStatus = "pending" | "kept" | "deleted";

// 定义一条收藏记录应包含的信息。
export interface BookmarkRecord {
  // Chrome 为这条收藏分配的唯一 ID。
  bookmarkId: string;
  // 这条收藏所在文件夹的 ID。
  parentId: string;
  // 收藏所在文件夹的完整路径，例如“收藏栏 / 前端学习”。
  folderPath: string;
  // 收藏网页的标题。
  title: string;
  // 收藏网页的网址。
  url: string;
  // 收藏被添加到浏览器中的时间。
  // null 表示浏览器没有提供这个时间。
  dateAdded: number | null;
  // 最近一次访问该网页的时间。
  // null 表示没有访问记录或浏览器没有提供该信息。
  dateLastUsed: number | null;
  // 用户对这条收藏的当前处理状态。
  status: BookmarkStatus;
  // 用户处理这条收藏的时间。
  // 尚未处理时为 null。
  processedAt: number | null;
  // 这条本地记录最后一次更新的时间。
  updatedAt: number;
}