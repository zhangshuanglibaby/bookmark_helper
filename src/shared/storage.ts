/**
 * Chrome 的 chrome.storage.local 可以异步读取和保存键值数据，适合保存扩展的摘要缓存。
 */

// 引入 AI 摘要记录的数据类型。
import type { SummaryRecord } from "./types";

// 定义在 chrome.storage.local 中保存摘要缓存时使用的固定键名。
const SUMMARY_RECORDS_KEY = "summaryRecords";

// 让摘要保存操作排队，避免两条摘要同时改写整份缓存。
let summaryWriteQueue: Promise<void> = Promise.resolve();

// 定义摘要缓存的数据结构。
// 键是 bookmarkId，值是对应收藏的摘要记录。
type SummaryRecordMap = Record<string, SummaryRecord>;

// 读取全部已保存的摘要缓存。
export async function getSummaryRecords(): Promise<SummaryRecordMap> {
  // 从浏览器本地存储中读取 summaryRecords 这项数据。
  const storageData = await chrome.storage.local.get(SUMMARY_RECORDS_KEY);

  // 取出保存的摘要记录。
  const summaryRecords = storageData[SUMMARY_RECORDS_KEY];

  // 没有任何缓存时，返回空对象。
  if (!summaryRecords) {
    return {};
  }

  // 告诉 TypeScript：这里的数据是以 bookmarkId 为键的摘要记录对象。
  return summaryRecords as SummaryRecordMap;
}

// 根据收藏 ID 读取一条已缓存的摘要
/**
 * 
 * @param bookmarkId 需要查询的 Chrome 收藏 ID。
 * @returns 如果找到对应的摘要记录，则返回它；否则返回 null。
 */
export async function getSummaryRecord(
  bookmarkId: string,
): Promise<SummaryRecord | null> {
  // 先读取全部摘要缓存。
  const summaryRecords = await getSummaryRecords();

  // 找到对应收藏的摘要则返回；没有则返回 null。
  return summaryRecords[bookmarkId] ?? null;
}

// 保存或更新一条收藏的摘要缓存。
/**
 * 
 * @param summaryRecord 需要保存的摘要记录。
 * @returns 无返回值。
 */
export async function saveSummaryRecord(
  summaryRecord: SummaryRecord,
): Promise<void> {
  // 等待前一次保存结束，再开始本次读取和写入。
  const currentWrite = summaryWriteQueue.then(async () => {
    // 读取最新的全部摘要缓存。
    const summaryRecords = await getSummaryRecords();
    // 以收藏 ID 为键，加入或更新这一条摘要。
    summaryRecords[summaryRecord.bookmarkId] = summaryRecord;
    // 将更新后的缓存保存到浏览器本地。
    await chrome.storage.local.set({
      [SUMMARY_RECORDS_KEY]: summaryRecords, // 保持现有的存储键名。
    });
  });
  // 即使本次保存失败，也允许下一次保存继续排队执行。
  summaryWriteQueue = currentWrite.catch(() => { });
  // 将本次保存的成功或失败结果交给调用方。
  return currentWrite;
}