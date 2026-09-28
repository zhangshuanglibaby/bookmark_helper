/**
 * 这个文件的主要作用是：读取收藏夹
 */

// 引入我们定义好的收藏记录数据类型。
import type { BookmarkRecord } from "../shared/types";

// 引入查询浏览历史中最近访问时间的函数。
import { getLastHistoryVisit } from "./history";

// 读取 Chrome 中全部收藏夹，并转换为程序使用的收藏记录数组。
export async function readAllBookmarks(): Promise<BookmarkRecord[]> {
  /**
   * chrome.bookmarks.getTree 返回的是树结构
   * [
      {
          // Chrome 收藏夹树的根节点。
          id: "0",
          title: "",

          // 根节点下面的所有文件夹。
          children: [
          {
              // “书签栏”文件夹。
              id: "1",
              title: "书签栏",

              // 这个文件夹中的内容。
              children: [
              {
                  // 一条真正的网页收藏。
                  id: "12",
                  parentId: "1",
                  title: "React 官方网站",
                  url: "https://react.dev",

                  // 时间均为从 1970 年 1 月 1 日开始计算的毫秒数。
                  dateAdded: 1750000000000,
                  dateLastUsed: 1751000000000,
              },
              ],
          },
          ],
      },
      ];

      判断规则很简单：
      - 有 url：这是网页收藏，正是我们需要展示的对象。
      - 没有 url、有 children：这是收藏夹文件夹。
      - dateAdded 是收藏时间。
      - dateLastUsed 是最近打开该收藏的时间；它是可选字段，Chrome 114 及更高版本才提供。
   */
  // 向 Chrome 请求完整的收藏夹树。
  const bookmarkTree = await chrome.bookmarks.getTree();

  // 准备一个空数组，用来存放所有网页收藏。
  const records: BookmarkRecord[] = [];

  // 记录这次读取操作的时间，供每条记录使用。
  const updatedAt = Date.now();

  // 递归遍历收藏夹树。
  // nodes 是当前层级的节点，folderPath 是当前所在文件夹的路径。folderPath 是一个字符串数组, 例如["书签栏", "前端学习", "React"]
  function walk(
    nodes: chrome.bookmarks.BookmarkTreeNode[],
    folderPath: string[],
  ) {
    // 逐个处理当前层级中的收藏或文件夹。
    for (const node of nodes) {
      // 去除标题前后的空白字符。
      const cleanTitle = node.title.trim();
      // 有 url 的节点是网页收藏，需要加入最终结果。
      if (node.url) {
        // 获取插件内部的 favicon 服务地址。
        const faviconUrl = chrome.runtime.getURL("_favicon/");

        // 拼接当前收藏网页地址和图标尺寸参数。
        const faviconRequestUrl = `${faviconUrl}?pageUrl=${encodeURIComponent(node.url)}&size=32`;


        records.push({
          bookmarkId: node.id, // 保存 Chrome 分配给这条收藏的唯一 ID。
          parentId: node.parentId ?? "", // 保存这条收藏所在文件夹的 ID。
          folderPath: folderPath.join(" / "), // 将文件夹数组拼接为便于展示的路径文字。如：书签栏 / 前端学习 / React
          title: cleanTitle || node.url, // 标题为空时，暂时使用网址作为标题。
          url: node.url, // // 保存网页的网址。
          faviconUrl: faviconRequestUrl, // 保存当前收藏对应的 favicon 请求地址。
          dateAdded: node.dateAdded ?? null, // 保存收藏被添加的时间；Chrome 没有提供时使用 null。
          dateLastUsed: node.dateLastUsed ?? null, // 保存最近访问时间；没有记录时使用 null。
          status: "pending", // 新读取到的收藏默认处于“待处理”状态。
          processedAt: null, // 新收藏尚未被处理，因此处理时间为空。
          updatedAt, // 保存这条本地记录的更新时间。
        })
        // 网页收藏没有子文件夹，不需要继续向下遍历。
        continue;
      }
      // 没有 url 的节点是文件夹，将其名称加入路径。
      // Chrome 收藏夹根节点通常没有标题，因此空标题不会加入路径。
      const nextFolderPath = cleanTitle
        ? [...folderPath, cleanTitle]
        : folderPath;
      // 如果文件夹中还有子节点，继续递归读取。
      if (node.children) {
        walk(node.children, nextFolderPath);
      }
    }
  }
  // 从收藏夹树的最顶层开始遍历。
  walk(bookmarkTree, []);

  // 每次最多同时查询 20 条收藏，避免一次发起过多历史记录请求。
  const batchSize = 20;

  // 分批处理所有收藏。
  for (let start = 0; start < records.length; start += batchSize) {
    // 取出当前这一批收藏。
    const batch = records.slice(start, start + batchSize);

    // 等待这一批收藏的历史记录查询全部完成。
    await Promise.all(
      // 对这一批中的每条收藏查询最近访问时间。
      batch.map(async (record) => {
        // 用浏览历史中的访问时间替换原先只记录“从书签打开”的时间。
        record.dateLastUsed = await getLastHistoryVisit(record.url);
      }),
    );
  }
  // 返回全部读取到的网页收藏。
  return records;
}


// 判断一条收藏是否已经超过指定天数没有访问。
/**
 * 判断收藏是否属于长期未访问收藏。
 * @param bookmark 收藏记录
 * @param ageDays 连续未访问的天数阈值
 * @returns 是否应该进入整理清单
 */
function isOlderThan(bookmark: BookmarkRecord, ageDays: number): boolean {
  // 没有最近访问记录，表示这条收藏从未被记录为访问过。
  // 按产品规则，这类收藏直接进入整理清单。
  if (bookmark.dateLastUsed === null) {
    return true;
  }

  // 将“未访问天数”转换为毫秒。
  // 1 天等于 24 小时、60 分钟、60 秒和 1000 毫秒。
  const inactiveTimeInMilliseconds = ageDays * 24 * 60 * 60 * 1000;

  // 计算允许的最后访问时间。
  // 早于这个时间访问过，说明已经超过指定天数没有访问。
  const cutoffTime = Date.now() - inactiveTimeInMilliseconds;

  // 最近访问时间早于临界时间，说明这条收藏长期没有访问。
  return bookmark.dateLastUsed < cutoffTime;
}


// 按“长期未访问程度”从前到后排序收藏。
/**
 * 从未访问的收藏优先。
 * 有访问记录的收藏，再按照最近访问时间从早到晚排列。
 * @param firstBookmark 第一条收藏
 * @param secondBookmark 第二条收藏
 * @returns 排序结果
 */
function sortByOldestVisit(
  firstBookmark: BookmarkRecord,
  secondBookmark: BookmarkRecord,
): number {
  // 取出第一条收藏的最近访问时间。
  const firstLastUsed = firstBookmark.dateLastUsed;

  // 取出第二条收藏的最近访问时间。
  const secondLastUsed = secondBookmark.dateLastUsed;

  // 两条收藏都从未访问时，保持它们原本的相对顺序。
  if (firstLastUsed === null && secondLastUsed === null) {
    return 0;
  }

  // 第一条从未访问时，让它排在前面。
  if (firstLastUsed === null) {
    return -1;
  }

  // 第二条从未访问时，让第一条排在前面。
  if (secondLastUsed === null) {
    return 1;
  }

  // 两条都有访问记录时，最近访问时间更早的排在前面。
  return firstLastUsed - secondLastUsed;
}


// 从全部收藏中筛选出需要整理的“考古清单”。
/**
 * 
 * @param records 全部收藏记录
 * @param ageDays 指定天数
 * @returns 考古清单
 */
export function getArchaeologyBookmarks(
  records: BookmarkRecord[],
  ageDays: number = 180,
): BookmarkRecord[] {
  return (
    records
      // 已删除的收藏不应再次出现在清单中。
      .filter((bookmark) => bookmark.status !== "deleted")
      // 只保留收藏时间超过指定天数的收藏。
      .filter((bookmark) => isOlderThan(bookmark, ageDays))
      // sort 会修改原数组，因此先用展开运算符复制一份数组，再排序。
      .toSorted(sortByOldestVisit)
  )
}