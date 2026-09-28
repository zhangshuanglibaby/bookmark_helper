// 从 React 引入状态工具，记录删除过程和错误。
import { useState } from "react";
// 使用线性图标呈现收藏所在文件夹和删除操作。
import { Folder, Trash2 } from "lucide-react";

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

// 将最近访问时间转换为“多少天前”。
function formatRelativeVisitDate(timestamp: number | null): string {
  // 没有可用的浏览历史时，不推断用户一定从未访问。
  if (timestamp === null) return "暂无浏览记录";
  // 计算从访问时间到现在经过了多少个完整的 24 小时。
  const daysAgo = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));

  // 不满一天时显示“今天”。
  if (daysAgo === 0) return "今天";

  // 其他情况显示“多少天前”。
  return `${daysAgo}天前`;
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


  // 最近访问时间只使用浏览器记录的实际访问时间。
  // 如果为 null，就保留“没有访问记录”的含义，不拿收藏日期代替。
  const displayTime = bookmark.dateLastUsed;

  // 列表只显示路径中的最后一级文件夹，完整路径留在悬停提示中。
  const displayFolder = bookmark.folderPath.split(" / ").at(-1) || "未分类";

  // 用户点击收藏标题或网址时，在新标签页打开网页。
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
    // 第一行让 20px 网站图标与标题并排，右侧保留删除按钮。
    <article className="bookmark-row">
      {/* 使用已有的收藏网站图标，不改变原来的图标获取方式。 */}
      <img className="bookmark-row__favicon" src={bookmark.faviconUrl} alt="" width={20} height={20} />
      <div className="bookmark-row__content">
        {/* 标题和完整网址都能打开网页；超出可用宽度时显示省略号。 */}
        <h2>
          <button className="bookmark-row__open" type="button" onClick={handleOpenBookmark} title={`打开：${bookmark.title}`}>
            {bookmark.title}
          </button>
        </h2>
        <p className="bookmark-row__url">
          <button className="bookmark-row__open" type="button" onClick={handleOpenBookmark} title={`打开：${bookmark.url}`}>
            {bookmark.url}
          </button>
        </p>
        <div className="bookmark-row__meta">
          {/* 文件夹标签只显示最后一级，悬停时可查看完整路径。 */}
          <span className="bookmark-row__folder" title={bookmark.folderPath || "未分类"}>
            <Folder size={15} aria-hidden="true" />
            <span>{displayFolder}</span>
          </span>
          {/* 有访问记录显示相对天数；否则明确显示收藏日期。 */}
          {displayTime !== null ? (
            <span className="bookmark-row__time" title={`最近访问：${formatBookmarkDate(displayTime)}`}>
              {formatRelativeVisitDate(displayTime)}
            </span>
          ) : bookmark.dateAdded !== null ? (
            <span className="bookmark-row__time" title={`暂无浏览记录，收藏于 ${formatBookmarkDate(bookmark.dateAdded)}`}>
             {formatBookmarkDate(bookmark.dateAdded)}
            </span>
          ) : (
            <span className="bookmark-row__time">暂无浏览记录</span>
          )}
        </div>
        {/* 失败消息紧跟当前条目，以免误以为其他收藏删除失败。 */}
        {deleteError && <p className="bookmark-row__error" role="alert">删除失败：{deleteError}</p>}
      </div>
      {/* 右侧只保留删除按钮，保持直接删除的原有行为。 */}
      <div className="bookmark-actions">
        <button type="button" disabled={isDeleting} onClick={handleDeleteBookmark} aria-label={`删除 ${bookmark.title}`} title={isDeleting ? "删除中..." : "删除收藏"}>
          <Trash2 size={19} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

// 导出组件，供之后的长清单组件使用。
export default BookmarkItem;
