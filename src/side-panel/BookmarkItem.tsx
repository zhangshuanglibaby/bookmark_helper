// 引入一条收藏记录的数据类型。
import type { BookmarkRecord } from "../shared/types";

// 定义这个组件需要接收的数据。
interface BookmarkItemProps {
  // 需要展示的单条收藏。
  bookmark: BookmarkRecord;
}

// 将时间戳转换为更容易阅读的日期文字。
/**
 * 将时间戳转换为更容易阅读的日期文字。
 * @param timestamp 时间戳
 * @returns 日期文字
 */
function formatBookmarkDate(timestamp: number | null): string {
  // 没有时间记录时，显示提示文字。
  if (timestamp === null) {
    return "暂无记录";
  }

  // 将毫秒时间戳转换为中文日期，例如“2025/3/18”。
  return new Intl.DateTimeFormat("zh-CN").format(new Date(timestamp));
}

// 从完整网址中提取网站域名。
/**
 * 从完整网址中提取网站域名。
 * @param url 完整网址
 * @returns 网站域名
 */
function getDomain(url: string): string {
  try {
    // 例如将 https://react.dev/learn 转换成 react.dev。
    return new URL(url).hostname;
  } catch {
    // 如果网址格式异常，直接显示原网址。
    return url;
  }
}

// 定义单条收藏的展示组件。
/**
 * 定义单条收藏的展示组件。
 * @param bookmark 需要展示的单条收藏
 * @returns 单条收藏的展示组件
 */
function BookmarkItem({ bookmark }: BookmarkItemProps) {
  // 提取网页所属的网站域名。
  const domain = getDomain(bookmark.url);

  // 优先显示最近访问时间。
  // 没有最近访问时间时，显示收藏时间。
  const displayTime =
    bookmark.dateLastUsed ?? bookmark.dateAdded;

  return (
    // article 表示一条独立、完整的收藏内容。
    <article>
      {/* 显示网页标题。 */}
      <h2>{bookmark.title}</h2>

      {/* 显示网站域名，例如 react.dev。 */}
      <p>{domain}</p>

      {/* 显示这条收藏所在的收藏夹路径。 */}
      <p>所在文件夹：{bookmark.folderPath || "未分类"}</p>

      {/* 显示最近访问时间或收藏时间。 */}
      <p>最近记录时间：{formatBookmarkDate(displayTime)}</p>
    </article>
  );
}

// 导出组件，供之后的长清单组件使用。
export default BookmarkItem;