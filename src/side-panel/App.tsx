// 从 React 引入状态和副作用工具。
// useState 用来保存会变化的数据。
// useEffect 用来在页面首次打开时执行读取操作。
import { useEffect, useState } from "react";
// 引入收藏记录的数据类型。
import type { BookmarkRecord } from "../shared/types";
// 引入侧边栏请求和后台响应的数据类型。
import type {
  ArchaeologyListResponse,
  ExtensionMessage,
} from "../shared/messages";

// 引入待整理收藏的长清单组件。
import ArchaeologyList from "./ArchaeologyList";


// 定义“收藏夹整理助手”的侧边栏主界面组件。
function App() {

  // 保存后台返回的待整理收藏列表。
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);

  // 保存当前是否仍在读取收藏夹。
  const [isLoading, setIsLoading] = useState(true);

  // 保存读取失败时的错误信息。
  // null 表示当前没有错误。
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 页面首次显示时，向后台 Service Worker 请求待整理收藏。
  useEffect(() => {
    // 定义一个异步函数，负责向后台发送消息。
    async function loadArchaeologyList() {
      try {
        // 先将页面状态设为“正在读取”。
        setIsLoading(true);

        // 清除之前可能出现过的错误信息。
        setErrorMessage(null);

        // 创建要发送给后台的消息。
        const message: ExtensionMessage = {
          // 请求后台返回待整理收藏清单。
          type: "LOAD_ARCHAEOLOGY_LIST",
        };

        // 将消息发送给后台，并等待后台返回结果。
        const response =
          (await chrome.runtime.sendMessage(
            message,
          )) as ArchaeologyListResponse;
        // 如果后台返回失败结果，抛出错误并交给下面的 catch 处理。
        if (!response.success) {
          throw new Error(response.error);
        }

        // 将后台返回的收藏列表保存到页面状态中。
        setBookmarks(response.bookmarks);

      } catch (error) {
        // 将未知错误转换成便于展示的文字。
        const message =
          error instanceof Error ? error.message : "读取收藏夹失败";

        // 保存错误文字，供页面显示。
        setErrorMessage(message);
      }
      finally {
        // 无论成功或失败，读取过程都已结束。
        setIsLoading(false);
      }
    }

    // 执行读取收藏夹的操作。
    loadArchaeologyList();
  }, []);

  // 后台确认删除成功后，从页面清单中移除对应收藏。
  function handleBookmarkDeleted(bookmarkId: string) {
    // 根据最新的收藏列表，过滤掉 ID 相同的那一条。
    setBookmarks((currentBookmarks) =>
      // 保留其他收藏，页面上的数量也会随之更新。
      currentBookmarks.filter((bookmark) => bookmark.bookmarkId !== bookmarkId),
    );
  }



  return (
    // main 表示页面最主要的内容区域。
    <main>
      {/* 显示侧边栏的主标题。 */}
      <h1>收藏夹整理助手</h1>

      {/* 正在读取时，显示加载提示。 */}
      {isLoading && <p>正在读取收藏夹...</p>}

      {/* 读取失败时，显示错误信息。 */}
      {errorMessage && <p>读取失败：{errorMessage}</p>}

      {/* 读取成功后，显示数量和待整理收藏长清单。 */}
      {!isLoading && !errorMessage && (
        <>
          {/* 显示当前需要整理的收藏总数量。 */}
          <p>需要整理的收藏：{bookmarks.length} 条</p>

          {/* 将全部待整理收藏传给长清单组件。 */}
          {/* 将删除成功后的页面更新函数传给清单。 */}
          <ArchaeologyList bookmarks={bookmarks} onDeleted={handleBookmarkDeleted} />
        </>
      )}
    </main>
  )
}

// 导出组件，供 sidepanel/main.tsx 使用。
export default App;