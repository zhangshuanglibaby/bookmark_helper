// 引入收藏记录的数据类型。
import type { BookmarkRecord } from "../shared/types";

// 引入“单条收藏”的展示组件。
import BookmarkItem from "./BookmarkItem";

// 定义这个清单组件需要接收的数据。
interface ArchaeologyListProps {
  // 需要展示的全部待整理收藏。
  bookmarks: BookmarkRecord[];
}

// 定义“待整理收藏长清单”组件。
function ArchaeologyList({ bookmarks }: ArchaeologyListProps) {
  // 没有待整理收藏时，显示空状态。
  if (bookmarks.length === 0) {
    return (
      <section>
        {/* 显示没有需要整理收藏时的提示。 */}
        <p>已经没有需要整理的收藏了。</p>
      </section>
    );
  }

  return (
    // section 表示页面中的“待整理收藏清单”区域。
    // className 方便我们后续为它添加长卡片和滚动样式。
    <section className="archaeology-list">
      {/* 将收藏数组逐条转换为 BookmarkItem 组件。 */}
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          // key 用于让 React 正确识别每一条不同的收藏。
          // Chrome 的 bookmarkId 对每条收藏都是唯一的。
          key={bookmark.bookmarkId}
          // 将当前这一条收藏数据传给单条收藏组件。
          bookmark={bookmark}
        />
      ))}
    </section>
  );
}

// 导出组件，供 sidepanel/App.tsx 使用。
export default ArchaeologyList;