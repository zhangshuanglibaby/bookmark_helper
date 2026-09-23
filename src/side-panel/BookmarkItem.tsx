// 引入 React 的状态功能，用来保存当前收藏的摘要结果。
import { useState } from "react";

// 引入一条收藏记录的数据类型。
import type { BookmarkRecord } from "../shared/types";

// 引入侧边栏发送给后台的消息类型，以及后台返回的摘要结果类型。
import type { ExtensionMessage， SummaryResponse } from "../shared/messages";


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

// 记录摘要目前是未请求、生成中、成功还是失败。
const [summaryStatus, setSummaryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

// 保存成功生成的摘要文字。
const [summary, setSummary] = useState("");

// 保存摘要生成失败时要显示的提示。
const [summaryError, setSummaryError] = useState("");

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

  // 请求后台为当前收藏生成或读取摘要。
  async function handleGenerateSummary(): Promise<void> {
    // 将这条收藏标记为正在处理。
    setSummaryStatus("loading");
    // 清除上一次可能留下的错误提示。
    setSummaryError("");

    // 准备发送给后台的消息。
    const message: ExtensionMessage = {
      type: "GENERATE_SUMMARY", // 告诉后台要生成摘要。
      bookmarkId: bookmark.bookmarkId, // 用收藏 ID 查找或保存缓存。
      url: bookmark.url, // 告诉后台要读取哪个网页。
    };

    // 等待后台读取网页、检查缓存并返回摘要。
    try {
      // 将消息发送给后台，并等待处理结果。
      const response: SummaryResponse = await chrome.runtime.sendMessage(message);

      // 后台报告失败时，将错误交给下面的处理代码。
      if (!response.success) {
        throw new Error(response.error);
      }

      // 保存成功返回的摘要文字。
      setSummary(response.summary);
      // 将这条收藏标记为处理成功。
      setSummaryStatus("success");
    } catch (error) {
      // 保存可显示的错误提示。
      setSummaryError(error instanceof Error ? error.message : "摘要生成失败");
      // 将这条收藏标记为处理失败。
      setSummaryStatus("error");
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

      {/* 放置这条收藏可执行操作的区域。 */}
      <div className="bookmark-actions">
        {/* 点击后请求后台在新标签页打开当前收藏。 */}
        <button type="button" onClick={handleOpenBookmark}>
          打开网页
        </button>
      </div>
    </article>
  );
}

// 导出组件，供之后的长清单组件使用。
export default BookmarkItem;