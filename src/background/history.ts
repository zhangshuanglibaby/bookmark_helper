/**
 * 查询某条收藏网址在浏览历史中的最近访问时间。无论是从书签、地址栏还是搜索结果进入这个网址，留下的历史记录都由这里读取
 */

// 查询指定网址在 Chrome 浏览历史中的最近访问时间。
export async function getLastHistoryVisit(url: string): Promise<number | null> {
  // 读取这个网址的访问记录。
  const visits = await chrome.history.getVisits({ url });

  // 从访问记录中找出时间最晚的一次。
  const lastVisitTime = visits.reduce<number | null>((latest, visit) => {
    // 浏览器没有提供访问时间时，跳过这条记录。
    if (visit.visitTime === undefined) return latest;

    // 第一次找到有效时间时，先把它作为最新时间。
    if (latest === null) return visit.visitTime;

    // 后续记录与已找到的时间比较，保留更晚的时间。
    return Math.max(latest, visit.visitTime);

  }, null)

  // 没有找到访问记录时返回 null。
  return lastVisitTime;
}