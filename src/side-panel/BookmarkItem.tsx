// 从 React 引入状态工具，记录删除过程和错误。
import { useState } from "react";

// 引入一条收藏记录的数据类型。
import type { BookmarkRecord } from "../shared/types";

// 引入侧边栏发送给后台的消息类型。
import type { ExtensionMessage, DeleteBookmarkResponse } from "../shared/messages";


// 定义这个组件需要接收的数据。
interface BookmarkItemProps {
  // 需要展示的单条收藏。
  bookmark: BookmarkRecord;
  // 删除成功后，通知上层清单移除这条收藏。
  onDeleted?: (bookmarkId: string) => void;
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
function BookmarkItem({ bookmark, onDeleted }: BookmarkItemProps) {

  // 记录当前是否正在删除，防止重复点击。
  const [isDeleting, setIsDeleting] = useState(false);

  // 保存删除失败时要显示的文字。
  const [deleteError, setDeleteError] = useState<string | null>(null);


  // 提取网页所属的网站域名。
  const domain = getDomain(bookmark.url);

  // 优先显示最近访问时间。
  // 没有最近访问时间时，显示收藏时间。
  const displayTime =
    bookmark.dateLastUsed ?? bookmark.dateAdded;

  // 用户点击“打开网页”按钮时执行这个函数。
  function handleOpenBookmark() {
    // 创建发送给后台的消息。
    const message: ExtensionMessage = {
      // 告诉后台：需要打开一条收藏。
      type: "OPEN_BOOKMARK",

      // 将当前收藏的网址交给后台。
      url: bookmark.url,
    };

    // 将消息发送给后台 Service Worker。
    chrome.runtime.sendMessage(message).catch((error) => {
      // 如果消息发送失败，在侧边栏的控制台输出错误。
      console.error("请求打开网页失败：", error);
    });
  }

  // 点击删除按钮后，直接请求后台删除当前收藏。
  async function handleDeleteBookmark(): Promise<void> {
    // 正在删除时，不重复发送请求。
    if (isDeleting) return;

    // 标记删除开始，并清除上次的错误。
    setIsDeleting(true);
    setDeleteError(null);

    // 请求后台执行 Chrome 书签删除操作。
    try {
      // 等待后台返回成功或失败的结果。
      const response = (await chrome.runtime.sendMessage({
        // 指明这是一条删除收藏的消息。
        type: "DELETE_BOOKMARK",
        // 指定当前收藏的 Chrome ID。
        bookmarkId: bookmark.bookmarkId,
      } satisfies ExtensionMessage)) as DeleteBookmarkResponse;

      // 后台报告失败时，交给下方的错误处理。
      if (!response.success) throw new Error(response.error);

      // 只有真正删除成功，才通知上层从清单移除这条收藏。
      onDeleted?.(bookmark.bookmarkId);
    } catch (error) {
      // 删除失败时保留条目，并保存错误提示。
      setDeleteError(error instanceof Error ? error.message : "删除收藏失败");
    } finally {
      // 无论成功还是失败，结束“正在删除”状态。
      setIsDeleting(false);
    }
  }


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

      {/* 删除失败时，在当前收藏条目中显示原因。 */}
      {deleteError && <p role="alert">删除失败：{deleteError}</p>}

      {/* 放置这条收藏可执行操作的区域。 */}
      <div className="bookmark-actions">
        {/* 点击后请求后台在新标签页打开当前收藏。 */}
        <button type="button" onClick={handleOpenBookmark}>
          打开网页
        </button>

        {/* 点击后直接删除；等待期间禁用按钮，避免重复请求。 */}
        <button type="button" disabled={isDeleting} onClick={handleDeleteBookmark}>
          {/* 删除期间给出简短的状态提示。 */}
          {isDeleting ? "删除中..." : "删除"}
        </button>
      </div>
    </article>
  );
}

// 导出组件，供之后的长清单组件使用。
export default BookmarkItem;
